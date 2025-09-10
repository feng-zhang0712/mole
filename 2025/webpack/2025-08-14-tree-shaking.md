# Tree Shaking

## 一、介绍

Tree Shaking 是一个术语，用于描述移除 JavaScript 中死代码的过程。这个术语来源于 ES6 模块的静态结构特性，通过**摇树**的动作来比喻移除无用的代码。

## 二、原理

Tree Shaking 的核心是**静态分析**，这意味着在代码编译时（而不是运行时）确定模块的依赖关系。在传统的动态模块系统中，模块的依赖关系是在运行时确定的，构建工具无法在编译时知道哪些代码会被实际使用。

### 2.1 ESM 的静态特性

#### （1）顶层导入和导出

ES6 模块的 `import` 和 `export` 语句必须在模块顶层使用，不能在条件语句或函数内部使用。顶层限制允许构建工具可以在编译时扫描所有 `import` 语句，这样模块的依赖关系在编译时就能完全确定。

```javascript
// foo.js
function foo() {
  export default 'bar'; // SyntaxError
}
foo()

// bar.js
if (condition) {
  import foo from './foo'; // SyntaxError
}
```

注意，动态导入的模块无法在编译时确定模块间的依赖关系，所以这部分代码无法进行 Tree Shaking。

```javascript
import('./utils.js').then(module => {
  // 运行时才知道模块内容，构建工具无法在编译时分析这个模块
});
```

#### （2） 静态路径

导入路径必须是字符串字面量，不能是变量或表达式。这个特性保证了模块路径在编译时是确定的。

```javascript
// 正确的静态路径 - 支持 Tree Shaking
import { add } from './math.js';

// 语法错误
const mathPath = './math.js';
import { add } from mathPath;
```

#### （3）编译时依赖确定

模块依赖关系在编译时确定，意味着构建工具可以在打包阶段进行深度优化。

注意，CommonJS 模块由于其动态导入的特性，所以无法在编译时确定模块间的依赖关系，导致 Tree Shaking 无法实现。

### 2.2 副作用

副作用指那些会对外部环境产生影响的代码。副作用会影响最终的代码优化效果，构建工具必须准确识别这些副作用，确保不会误删正常的代码。下面这些代码都有副作用。

```javascript
// 全局变量（函数）定义
window.foo = 'bar';

// 模块加载时的副作用
console.log('Initializing...');

// DOM 操作
document.body.appendChild(element);

// 事件监听器
addEventListener('click', handler);

// DOM 属性设置
element.setAttribute('data-loaded', 'true');

// 定时器设置
setTimeout(callback, 1000);

// API 调用
fetch('/api/data');
XMLHttpRequest.open('GET', '/api/data');

// Cookie 操作
document.cookie = 'name=value';

// 模块级变量
const moduleState = 'initialized';

// 原型链修改
Array.prototype.customMethod = function() {};

// 类属性修改
class MyClass {
  static instance = new MyClass(); // 静态属性初始化
}

// 异步函数调用
(async () => {
  await someAsyncOperation();
})();

// 立即执行函数
(function() {
  initializeApp();
})();

/* ... */
```

#### （3）副作用检测机制

1. 首先检测 `package.json` 中的 `sideEffects` 属性，这个配置会覆盖所有其他的副作用检测逻辑。

   - 如果 `sideEffects: false`，构建工具会认为整个包都没有副作用，可以安全地进行 Tree Shaking。
   - 如果 `sideEffects` 指定为数组，则根据数组的配置，匹配文件是否有副作用。

2. 检测 webpack 配置中的 `sideEffects` 属性，如果为 `true`，表示启用副作用检测，此时构建工具会查询 `package.json` 中的 `sideEffects` 配置。另外，在 `module.rules` 中可以为特定文件类型指定是否有副作用。

     ```javascript
      // webpack.config.js
      module.exports = {
        optimization: {
          sideEffects: true, // 启用副作用检测
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              sideEffects: false, // 对特定文件类型禁用副作用检测
            }
          ]
        }
      };
      ```

3. 在启发式检测阶段，根据构建工具的内置规则，检测代码中是否有副作用。比如，上面分析的这些有副作用的代码，都会被显示或隐式地认为是有副作用的。
4. 某些特殊情况下，还会进行运行时检查。比如下面的代码。

      ```javascript
      if (process.env.FEATURE_FLAG) {
        initializeFeature();
      }
      ```

另外，如果构建工具在分析阶段遇到条件判断或者 `/*#__PURE__*/` 标记等场景，会单独进行处理。上面这些规则之间并不冲突，而是互补的关系。

### 2.3 静态分析的工作原理

## 三、Tree Shaking 执行过程

## 四、配置 webpack

### 4.1 `package.json`

`package.json` 中的 `sideEffects` 属性用于指定哪些文件有副作用，这个属性有两种配置方式。

一种方式是使用布尔值，`true` 表示整个包都有副作用，所有代码都会被保留，该值也是默认值；`false` 表示整个包都没有副作用，未使用的代码会被删除。

```json
{
  "sideEffects": true
}
```

另一种方式是使用配置数组，通过在数组中指定哪些文件有副作用，哪些没有副作用。

```json
{
  "sideEffects": [
    "*.css",
    "./src/utils.js",
  ]
}
```

上面的代码表示，只有 `*.css` 和 `./src/utils.js` 模块有副作用，其他模块都没有副作用。此时，其他模块中未使用的代码就会被删除。

```json
{
  "sideEffects": ["*.css", "!*.js"]
}
```

上面代码表示，`*.css` 模块有副作用，`*.js` 模块文件没有副作用。此时，所有 `*.js` 模块文件和其他未列出的文件，都被认为是没有副作用。

注意，该属性要比 `optimization.sideEffects` 更精确，优先级也更高。

### 4.2 `optimization`

#### （1）`usedExports`

`usedExports` 布尔值，表示是否启用导出分析，默认值为 `true`。

webpack 会分析每个模块的导出语句，追踪这些导出是否被其他模块实际使用。如果某个导出没有被使用，webpack 会将其标记为可移除的代码，这个过程基于静态分析实现。

注意，`usedExports` 只是标记哪些导出被使用，它本身不会移除代码。

#### （2）`sideEffects`

`sideEffects` 布尔值，控制 webpack 是否启用副作用检测功能，默认值为 `true`。

webpack 会检查每个模块是否包含副作用代码，如全局变量修改、DOM 操作、API 调用等。如果模块包含副作用，webpack 会将其标记为不可移除，即使该模块的导出没有被使用。

注意，如果 `package.json` 中指定了 `sideEffects`，则优先使用 `package.json` 中的配置。

#### （3）`minimize`

`minimize` 布尔值，控制是否启用代码压缩。生产模式下默认为 `true`，其他模式为 `false`。

#### （4）`minimizer`

`minimizer` 指定用于代码压缩的插件。生产模式下默认使用 `terser-webpack-plugin` 插件压缩代码。

## 五、编码指导

### 5.1 模块导入和导出

Tree Shaking 的具体效果，受编码风格的影响，下面列出了影响 Tree Shaking 效果的编码风格。

#### （1）完全不支持的情况

`CommonJS` 模块和 ESM 模块的`import()` 动态导入，都属于运行时导入，无法在编译时确定模块的依赖关系，因此这两种方式完全不支持 Tree Shaking。所以，应该尽量避免下面的写法。

```javascript
const utils = require('./utils');
const { add } = require('./utils');

const utils = await import('./utils.js');
import('./utils').then(module => {
  // 完全不支持
});

if (condition) {
  const { add } = await import('./utils.js');
}
```

#### （2）部分支持的情况（支持效果差）

ESM 模块的默认导入和导出对 Tree Shaking 的支持有限，因此会影响优化效果。

```javascript
export default add;
export default { add };

import utils from './utils';
import * as utils from './utils';

import _ from 'lodash';
```

循环依赖的模块，可能影响优化效果。

```javascript
// foo.js
import { bar } from './bar';
export const foo = bar;

// bar.js
import { foo } from './foo';
export const bar = foo;
```

#### （3）推荐的做法

好的做法是使用 ESM 模块的普通导入和导出。因此，下面的写法都是建议的。

```javascript
// 支持的导出方式
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

export { add, subtract };

// 支持的导入方法
import { add } from './utils';

// 支持的第三方库导入方法
import debounce from 'lodash/debounce';
import { debounce } from 'lodash-es'; // 使用支持 Tree Shaking 的版本
```

下面是动态导入的替代方案。

```javascript
// 使用条件渲染而不是条件导入
const utils = {
  add: () => import('./utils.js').then(m => m.add),
  subtract: () => import('./utils.js').then(m => m.subtract)
};

// 动态导入仅用于代码分割
const LazyComponent = () => import('./components/LazyComponent.js');
```

对于循环依赖的模块，有两种处理方式。

第一种方式是重构代码，将共享的代码单独处理。

```javascript
// shared.js
export function shared () {
  // 共享的逻辑
};

// foo.js
import { shared } from './shared';
export const foo = shared() + /* ... */;

// bar.js
import { shared } from './shared';
export const bar = shared() + /* ... */;
```

第二种方式是使用依赖注入。

```javascript
// shared.js
export const shared = {
  foo: null,
  bar: null
}

// foo.js
import { shared } from './shared';
export const foo = shared.bar;

// bar.js
import { shared } from './shared';
export const bar = shared.foo;

// 在应用启动时注入依赖
shared.foo = foo;
shared.bar = bar;
```

### 5.2 副作用处理

副作用是无处不在的，隐式副作用、条件副作用、异步副作用、第三方库中的副作用...。因此，对副作用的识别是复杂的，但构建工具必须准确识别副作用，确保不会误删正常的代码。

目前，有多种方式，将代码块标记为没有副作用。

#### （1）抽离成单独模块

可以将有副作用的代码放入一个单独模块的方法中。

```javascript
// sideEffects.js
export function sideEffectBusiness() {
  window.foo = 'bar';
  console.log('Side effect');
  setTimeout(() => {}, 1000);
  fetch('/api/data');
}

// index.js
import './sideEffects.js';
```

上面的代码，如果 `sideEffectBusiness()` 方法没有被其他模块使用，就会被 Tree Shaking 优化。

#### （2）条件判断

```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  mode: "production",
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.ENABLE_LOGGING': JSON.stringify(process.env.ENABLE_LOGGING || 'false'),
    }),
  ],
}

// sideEffects.js
export function sideEffectBusiness() {
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/data');
  }

  if (process.env.ENABLE_LOGGING === 'true') {
    window.foo = 'bar';
  }
}

// index.js
import { sideEffectBusiness } from './sideEffects.js';
sideEffectBusiness();
```

上面的代码，在生产环境下使用 `ENABLE_LOGGING=true webpack build --config ./webpack.config.js` 命令打包时，两者都会被保留。如果把 `ENABLE_LOGGING=true` 参数去掉，只有 `fetch('/api/data')` 会被保留。

#### （3）使用 `/*#__PURE__*/` 标记

可以在函数调用前插入 `/*#__PURE__*/` 标记，它的作用是告诉构建工具这个函数调用没有副作用，如果函数调用的结果未被使用，整个调用可以被移除。

```javascript
/*#__PURE__*/ add(1, 2);
/*#__PURE__*/ new MyClass();
/*#__PURE__*/ console.log('Hello');
/*#__PURE__*/ localStorage.setItem('key', 'value');
```

上面的代码在打包时都会被移除。但是，下面的代码都不会被删除。

```javascript
/*#__PURE__*/ window.foo = 'bar';
/*#__PURE__*/ document.cookie = 'name=value';
/*#__PURE__*/ window.location.href;
/*#__PURE__*/ object.property;
/*#__PURE__*/ array[0];
```

之所以上面的代码会被保留，是因为 `/*#__PURE__*/` 只标记**函数调用**，不标记语句。所以，`/*#__PURE__*/` 标记只能用在函数调用场景。

```javascript
export function calculate() {
  // 如果这个函数调用无副作用且结果未使用，就可能被构建工具移除
  /*#__PURE__*/ expensiveCalculation();
  return 'result';
}
```

注意，上面这些配置方式，跟 `package.json` 的 `sideEffects` 属性并不冲突，他们属于不同层级的处理方案，是互补的关系。

```javascript
// package.json
{
  "sideEffects": ["!./src/sideEffects.js"]
}

// sideEffects.js
/*#__PURE__*/ console.log('Hello');
```

上面的代码，即使 `sideEffects.js` 模块被标记为有副作用，`console.log('Hello')` 依然会被移除。

## 六、参考

- [webpack 官方文档](https://webpack.docschina.org/)
