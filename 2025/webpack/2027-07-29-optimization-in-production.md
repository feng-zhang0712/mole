# webpack 生产环境优化

## 2.4 生产环境 Source Map 策略

生产构建建议：

- 小型/内部项目：`devtool: 'source-map'`（完整、可上传到错误跟踪平台，谨慎暴露到公网）。
- 公网生产：`devtool: 'hidden-source-map'` 或 `devtool: 'nosources-source-map'`，配合 Sentry/TrackX 上传映射，避免泄露源码。
- 禁用内联 source map；确保 CI 只上传 `.map` 到错误平台，不随产物发 CDN。

```javascript
module.exports = {
  mode: 'production',
  devtool: 'hidden-source-map',
};
```

## 2.5 包体分析与依赖体检

```bash
npm i -D webpack-bundle-analyzer
```

```javascript
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })
  ]
};
```

建议：排查重复依赖、转为 ESM 版本（如 `lodash-es`）、启用按需导入、移除未使用 polyfill。

## 一、介绍

## 二、代码压缩

### 2.1 压缩 HTML

生产模式下，如果配置了 [html-webpack-plugin] 插件，webpack 自动使用该插件压缩 HTML 代码，也可以通过配置 `minify` 字段自定义压缩行为。

```javascript
// webpack.config.js

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        collapseWhitespace: true, // 移除空白符
        removeComments: true, // 移除 HTML 注释
        keepClosingSlash: false, // 移除自闭合标签的斜杠
        removeRedundantAttributes: true, // 移除冗余属性
        removeScriptTypeAttributes: true, // 移除 script 的 type 属性
        removeStyleLinkTypeAttributes: true, // 移除 style 和 link 的 type 属性
        useShortDoctype: true, // 使用短文档类型
        // ...
      },
    }),
  ],
};
```

注意，`minify` 其实是对 [html-minifier-terser] 插件的配置，这个插件在 [html-webpack-plugin] 安装时会自动安装。

[html-webpack-plugin]: https://github.com/jantimon/html-webpack-plugin
[html-minifier-terser]: https://github.com/DanielRuf/html-minifier-terser

### 2.2 压缩样式资源

样式资源的压缩，主要包括样式提取和代码压缩两个过程。

```text
CSS 文件 → Loader 处理 → 提取插件（MiniCssExtractPlugin） → 压缩插件（CssMinimizerPlugin） → 输出文件
```

这两个过程需要借助 [mini-css-extract-plugin] 和 [css-minimizer-webpack-plugin] 两个插件来完成。

首先，`mini-css-extract-plugin` 用于将样式资源提取到单独的文件中，从而减少 JavaScript bundle 体积并优化浏览器缓存。

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function processStyles(test, pre) {
  return {
    test,
    use: [
      MiniCssExtractPlugin.loader, // 提取 CSS 到单独文件
      'css-loader',
      'postcss-loader',
      pre,
    ].filter(Boolean)
  };
}

module.exports = {
  mode: 'production',
  module: {
    rules: [
      processStyles(/\.css$/),
      processStyles(/\.s[ac]ss$/i, 'sass-loader'),
    ]
  },
  plugins: [
    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css', // 输出的文件名格式
      chunkFilename: 'css/[id].[contenthash:8].css' // 异步加载的 CSS 文件名格式
    })
  ]
};
```

`css-minimizer-webpack-plugin` 执行 CSS 代码的压缩。

```javascript
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  optimization: {
    minimizer: [
      '...', // 保留其他 minimizer（如 TerserPlugin）
      // CSS 压缩
      new CssMinimizerPlugin({
        include: /node_modules/, // 只压缩 node_modules 中的 CSS
        exclude: /\.min\.css$/, // 排除已经压缩的文件
        parallel: true, // 启用并行处理
        // 缓存优化：启用缓存
        cache: true,
        cacheKeys: (defaultCacheKeys, file) => {
          defaultCacheKeys['css-minimizer'] = require('css-minimizer-webpack-plugin/package.json').version;
          return defaultCacheKeys;
        },
      }),
    ]
  }
};
```

[mini-css-extract-plugin]: https://github.com/webpack-contrib/mini-css-extract-plugin
[css-minimizer-webpack-plugin]: https://github.com/webpack-contrib/css-minimizer-webpack-plugin

### 2.3 压缩脚本资源

脚本资源的处理分为三部分：利用 Tree Shaking 移除死代码、使用 [terser-webpack-plugin] 对脚本代码进行压缩、项目中的副作用处理。

#### 2.3.1 移除死代码（Tree Shaking）

Tree Shaking 是一个术语，用于描述移除 JavaScript 中死代码的过程。这个术语来源于 ES6 模块的[静态结构]特性，通过**摇树**的动作来比喻移除无用的代码。Tree Shaking 的核心机制包含三部分内容：**静态分析**、**ES6 模块支持**和**副作用检测**。

- 静态分析，即在代码编译时（而不是运行时）确定模块的依赖关系。在传统的动态模块系统中，模块的依赖关系是在运行时确定的，构建工具无法在编译时知道哪些代码会被实际使用。
- ES6 模块支持，基于 ES6 的 `import` 和 `export` 语法进行静态分析。
- 副作用检测，识别和保留有副作用的代码，移除纯函数代码。

下面是与 Tree Shaking 有关的配置项与注意点。

[静态结构]: http://exploringjs.com/es6/ch_modules.html#static-module-structure

##### （1）配置 `package.json`

`package.json` 中的 `sideEffects` 字段用于指定哪些文件有副作用，这个属性有两种配置方式。

一种方式是使用布尔值，`true` 表示整个包都有副作用，所有代码都会被保留，该值也是默认值；`false` 表示整个包都没有副作用，未使用的代码会被删除。

```json
{
  // ...
  "sideEffects": true
}
```

另一种方式是使用配置数组，在数组中指定哪些文件有副作用，哪些没有副作用。

```json
{
  // ...
  "sideEffects": [
    "*.css", // CSS 文件有副作用
    "./src/utils.js", // 特定文件有副作用
    "!*.js" // JS 文件没有副作用（除了上面指定的）
  ] 
}
```

上面的代码表示，只有 `*.css` 和 `./src/utils.js` 模块有副作用，其他模块都没有副作用。此时，其他模块中未使用的代码就会被删除。

```json
{
  "sideEffects": ["*.css", "!*.js"]
}
```

上面代码表示，`*.css` 和 `./src/utils.js` 模块有副作用，除 `utils.js` 模块之外的所有脚本资源模块都没有副作用。

注意，该属性比 `optimization.sideEffects` 字段更精确，优先级也更高。

##### （2）配置 `webpack.config.js`

下面列出了 `webpack.config.js` 中与 Tree Shaking 有关的字段。

- `usedExports` 布尔值，是否启用导出分析，默认为 `true`，此时 webpack 会分析每个模块的导出语句，追踪这些导出是否被其他模块实际使用。如果某个导出没有被使用，webpack 会将其标记为可移除的代码。
- `sideEffects` 布尔值，是否启用副作用检测，默认为 `true`，此时 webpack 会检查每个模块是否包含副作用代码。如果模块包含副作用，webpack 会将其标记为不可移除，即使该模块的导出没有被使用。注意，如果 `package.json` 中指定了 `sideEffects`，则优先使用该配置。
- `minimize` 布尔值，是否启用代码压缩，生产模式下默认为 `true`，其他模式为 `false`。
- `mode: 'production'` 生产模式下，Tree Shaking 功能自动开启。

```js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true, // 启用导出分析，标记未使用的导出
    sideEffects: true, // 启用副作用检测（依赖 package.json: sideEffects）
    minimize: true, // 启用代码压缩
  }
};
```

##### （3）编码风格的影响

Tree Shaking 的实际效果，受模块导入和导出方式的影响。CommonJS 模块以及 ESM 的 `import()` 动态导入语法，完全不支持 Tree Shaking。另外，ESM 的默认导入和导出会影响 Tree Shaking 的效果，所以应该尽量避免这些写法。下面是一些推荐的写法。

使用 ESM 模块的普通导入和导出。

```javascript
// 支持的导出方式（具名导出）
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }

// 支持的导入方式（具名导入）
import { add } from './utils';

// 第三方库：优先使用支持 ESM 的包
import { debounce } from 'lodash-es';
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

#### 2.3.2 压缩代码

生产模式下，webpack 自动启用内置的 [terser-webpack-plugin] 插件压缩脚本资源，所以通常不需要进行额外配置，当然，也可以通过 `minimizer` 字段自定义脚本压缩行为。

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console.log
            drop_debugger: true, // 移除 debugger
            unused: true, // 移除未使用的变量
            dead_code: true, // 移除死代码
          },
          format: {
            comments: false, // 移除注释
          }
        },
        extractComments: false, // 不提取注释到单独文件
        // ...
      }),
    ],
  },
};
```

[terser-webpack-plugin]: https://github.com/webpack-contrib/terser-webpack-plugin

#### 2.3.3 副作用处理

可以通过下面的方式，将模块中有副作用的代码，标记为无副作用，这样 webpack 就能放心地讲这些代码移除。

##### （1）抽离成单独模块

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

##### （2）使用 `/*#__PURE__*/` 标记

可以在函数调用前插入 `/*#__PURE__*/` 标记，它的作用是告诉构建工具这个函数调用没有副作用，如果函数调用的结果未被使用，整个调用可以被移除。

```javascript
/*#__PURE__*/ add(1, 2);
/*#__PURE__*/ new MyClass();
/*#__PURE__*/ console.log('Hello');
/*#__PURE__*/ localStorage.setItem('key', 'value');
export function calculate() {
  // 如果这个函数调用无副作用且结果未使用，就可能被构建工具移除
  /*#__PURE__*/ expensiveCalculation();
  return 'result';
}
```

注意，`/*#__PURE__*/` 标记只对**函数调用**有效，不能用来标记语句。所以，下面的代码都不会被删除。

```javascript
/*#__PURE__*/ window.foo = 'bar';
/*#__PURE__*/ document.cookie = 'name=value';
/*#__PURE__*/ window.location.href;
/*#__PURE__*/ object.property;
/*#__PURE__*/ array[0];
```

##### （3）条件判断

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

## 三、代码分割

默认情况下，webpack 将代码打包到一个文件中，这就导致，浏览器加载某个页面时，整个 bundle 文件都会被加载进内存。代码分割（Code Splitting）是一种将代码分割到多个 bundle 中的技术，可以实现**按需加载**、**并行加载**和**缓存优化**，并且能够优化首屏的加载速度。

代码分割有三种实现方式：多入口、提取重复代码以及按需加载。

下面分别进行介绍。

### 3.1 多入口代码分割

如果项目有多个入口，可以配置多入口形式进行打包。如果这些入口，有共通引用的模块，为了避免这些模块被打包到每一个文件中，此时就需要进行代码分割。

```javascript
module.exports = {
  entry: {
    app: {
      import: './src/app.js',
      dependOn: 'shared', // 依赖 shared 入口
    },
    admin: {
      import: './src/admin.js',
      dependOn: 'shared', // 依赖 shared 入口
    },
    shared: ['lodash', 'react', 'react-dom']  // 共享依赖
  }
};
```

上面的代码通过指定 `dependOn` 和 `shared` 字段，将 app 和 admin 共同使用的模块打包到单独的模块中。其中，`dependOn` 用于指定通过 `entry` 中的哪个属性，来配置共享的模块，`shared` 指定多入口依赖的模块。下面是打包后的结果。

```text
asset shared.js 556 KiB [emitted] (name: shared)
asset admin.js 1.25 KiB [emitted] (name: admin)
asset app.js 1.24 KiB [emitted] (name: app)
```

上面代码中，`app` 和 `admin` 通过 `shared` 字段告诉 webpack，他们共同引用了 `lodash`、`react` 和 `react-dom` 模块，之后这三个模块就会被单独打包到一个 bundle 文件中，也就是上面控制台输出中的 `shared.js`。

### 3.2 按需加载，动态导入

使用 ES6 提供的 `import()` 方法导入模块时，webpack 会自动将导入的模块打包为单独的 chunk。

```javascript
// utils.js（ESM）
export function sum(numbers) {
  return numbers.reduce((acc, cur) => acc + cur, 0);
}

// index.js（动态导入，按需加载）
import('./utils.js').then(m => {
  console.log(m.sum([1, 2, 3]));
});
```

上面代码中，`utils` 模块会被单独打包到一个 chunk 中，但是打包后的文件名称是一串数字 `413.js`。

```text
asset main.js 3.03 KiB [emitted] [minimized] (name: main)
asset 413.js 126 bytes [emitted] [minimized]
```

另外，还可以使用 webpack 提供的魔法注释功能，对导出的模块重命名。

```javascript
// index.js
import(/* webpackChunkName: "utils" */'./utils.js').then(m => {
  console.log(m.default.sum([1, 2, 3]));
});
```

再次打包后的结果如下。

```text
asset main.js 3.03 KiB [emitted] [minimized] (name: main)
asset utils.js 126 bytes [emitted] [minimized] (name: utils)
```

### 3.3 配置 `splitChunks`

webpack 配置文件中的 [splitChunks] 属性，是一个用于配置代码分割的选项，通过这个属性，可以对代码分割的行为进行更详细地配置。

下面是 `splitChunks` 选项中，几个常见的配置项。

- `chunks`：指定哪些模块会被分割。有三个选项：
  - `async`：默认值，只分割异步加载的模块。比如，通过 `import()` 动态导入的模块。
  - `initial`：只分割初始加载的模块。比如，页面初始加载时导入的块，通常有助于优化初始加载时间。
  - `all`：同时支持异步模块和初始模块。
- `minSize`：指定打包阈值。如果模块的大小，大于指定的值，则会被单独打包到一个 bundle 文件中。较高的值可以减少 HTTP 请求数量，但会增大初始下载大小；较低的值可以实现更惊喜的缓存，但是会增加 HTTP 请求数量。
- `minRemainingSize`：指定代码分割过程中，从块中分割出来的 bundle 最小是多大。比如，如果设置为 `1000`，则分割后产生的块（chunk）必须大于 1kb。
- `minChunks`：指定当一个模块至少被引用（共享）多少次时，才可以进行分割。比如，如果设置为 `1`，则表示哪怕某个模块被引用了一次，也要被单独分割。
- `maxAsyncRequests`：指定一个模块被加载时，可以被按需（动态）加载请求的最大并行请求数。
- `maxInitialRequests`：指定入口文件初始化时，可以执行的最大并行请求数。
- `enforceSizeThreshold`：指定强制进行代码分割的阈值。设置此选项后，`minRemainingSize`、`maxAsyncRequests` 和 `maxInitialRequests` 将被忽略。
- `cacheGroups`：对模块如何被分组到单独的代码块，进行细粒度的控制。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all', // 对所有类型的 chunk 进行分割
    },
  },
};
```

项目开发中，一般只需要设置 `chunks` 为 `'all'` 即可，对于其他配置项，需要根据项目的实际情况配置。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      // ...
      minSize: 20000, // 分割后的最小体积（20KB）
      minRemainingSize: 0, // 分割后剩余的最小体积
      minChunks: 1, // 至少被引用 1 次才分割
      maxAsyncRequests: 30, // 异步加载的最大并行请求数
      maxInitialRequests: 30, // 初始加载的最大并行请求数
      enforceSizeThreshold: 50000, // 强制分割阈值（50KB）
    },
  },
};
```

缓存组（cacheGroups）定义了“哪些模块被归为同一组并产出为同一个 chunk”。当模块满足某个缓存组的匹配规则后，会被放入该组，最终该组会被独立打成一个可缓存的 bundle。

下面是缓存组中模块的处理流程。

1. 遍历所有待分割模块，依次尝试命中各个缓存组的匹配条件（如 `test`、`include`、`exclude` 和 `chunks` 等）。
2. 若命中多个缓存组，按 `priority` 选择优先级更高的组。
3. 组内还需满足 `minSize`、`minChunks`、`maxAsyncRequests` 和 `maxInitialRequests` 等全局/组内阈值。
4. 最终为该组产出一个独立 chunk，名称由 `name`（可为字符串或函数）决定。

下面是缓存组的配置方式。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      // ...
      cacheGroups: {
        // 第三方库分组
        vendor: {
          test: /[\\/]node_modules[\\/]/, // 匹配规则
          // name: 'vendors', // chunk 名称
          // 或者，使用函数生成名称
          name(module, chunks, cacheGroupKey) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
          priority: 10, // 优先级（数字越大优先级越高）
          chunks: 'all', // 适用的 chunk 类型
          filename: '[name].[contenthash:8].js', // 使用内容哈希实现长期缓存
          enforce: true, // 忽略全局阈值（如 `minSize`），强制生成该组的 chunk
          include: /[\\/]node_modules[\\/]/, // 包含规则
          exclude: /[\\/]node_modules[\\/]lodash[\\/]/, // 排除规则
          minSize: 30000, // 最小体积
          minChunks: 1, // 最小引用次数
          maxAsyncRequests: 5, // 最大异步请求数
          maxInitialRequests: 3, // 最大初始请求数
        },
        
        // 公共代码分组
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          reuseExistingChunk: true, // 重用已存在的 chunk
        },
        
        // 特定库分组
        lodash: {
          test: /[\\/]node_modules[\\/]lodash[\\/]/,
          name: 'lodash',
          priority: 20,
          chunks: 'all',
        },
      }
    },
  },
};
```

如果缓存组未指定，则使用下面的 `defaultVendors` 和 `default` 两个分组。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
  },
};
```

注意，`splitChunks` 是对 `SplitChunksPlugin` 插件的配置，webpack 内置了这个插件，在使用时不必单独下载。

[splitChunks]: https://webpack.docschina.org/plugins/split-chunks-plugin#optimizationsplitchunks

## 四、资源优化

Webpack 5 引入了资源模块（Asset Modules）类型，无需配置额外的 Loader 就能处理资源文件。资源模块主要包含四种类型。

- `asset/source`：导出源代码字符串，适合 SVG 源或文本（替代 `raw-loader`）。
- `asset/resource`：输出独立文件并导出 URL，适合大多数图片、字体（替代 `file-loader`）。
- `asset/inline`：导出资源的 data URI（替代 `url-loader`）。
- `asset`：在导出单独文件和 data URI 之间自动选择，需要配置 `parser.dataUrlCondition.maxSize` 属性。

通过自定义输出文件名，实现更好的资源组织和缓存控制。

```javascript
module.exports = {
  // 全局资源输出命名（可被各规则的 generator 覆盖）
  output: { assetModuleFilename: 'assets/[name].[contenthash:8][ext]' },
  module: {
    rules: [
      {
        // 自动选择：小图内联，大图发文件
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
        generator: {
          filename: 'images/[name].[contenthash:8][ext]',
        }
      },
      {
        // 字体始终发文件
        test: /\.(woff2?|ttf|otf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[contenthash:8][ext]',
        }
      },
      {
        // 媒体资源
        test: /\.(mp4|webm|mp3|ogg|wav)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 2 * 1024,
          },
        },
        generator: {
          filename: 'media/[name].[contenthash:8][ext]',
        }
      }
    ]
  }
};
```

### 4.1 图片优化

```bash
npm i -D image-minimizer-webpack-plugin imagemin imagemin-gifsicle imagemin-mozjpeg imagemin-pngquant imagemin-svgo
```

```js
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ['gifsicle', { interlaced: true }],
            ['mozjpeg', { quality: 75, progressive: true }],
            ['pngquant', { quality: [0.6, 0.8] }],
            ['svgo', { plugins: ['preset-default'] }]
          ]
        }
      }
    })
  ]
};
```

### 4.2 SVG 优化

SVG 既可当图片也可作为代码参与 Tree Shaking。

```javascript
module.exports = {
  module: {
    rules: [
      {
        // 当作 URL 资源（缓存友好）
        test: /\.svg$/i,
        type: 'asset',
        parser: { dataUrlCondition: { maxSize: 2 * 1024 } },
        generator: { filename: 'images/[name].[contenthash:8][ext]' }
      },

      // 当作源码字符串，方便可后续处理
      { test: /\.svg$/i, type: 'asset/source' }
    ]
  }
};
```

### 4.3 字体优化

- 输出独立文件 + `contenthash`；优先 `woff2`，必要时提供回退格式（ttf/otf）。
- CSS 中使用 `font-display: swap;` 避免文本闪烁阻塞。
- 关键字体 `<link rel="preload" as="font" type="font/woff2" crossorigin>`。
- 大型中文字库请在构建前做子集化（subset）；按需动态加载特定字重/字形。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff2?|ttf|otf|eot)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[contenthash:8][ext]'
        }
      }
    ]
  }
};
```

### 4.4 媒体资源，设置策略与阈值

- 小资源内联（极少数场景）；常规走独立文件，避免 JS 体积膨胀。
- 视频封面（poster）与 `preload/controls` 合理配置；大媒体建议走自适应流（HLS/DASH）并交由播放层与 CDN 处理。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(mp4|webm|mp3|ogg|wav)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 2 * 1024,
          },
        },
        generator: {
          filename: 'media/[name].[contenthash:8][ext]'
        },
      }
    ]
  }
};
```

### 4.5 静态资源拷贝与 CDN 公共路径

通过 [copy-webpack-plugin] 拷贝不参与打包的静态文件（如 `favicon`、`robots.txt`）：

```js
const CopyPlugin = require('copy-webpack-plugin');
module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          noErrorOnMissing: true, 
          globOptions: {
            ignore: ['**/index.html'],
          }
        }
      ]
    })
  ],
  output: {
    publicPath: 'https://cdn.example.com/' // 切换到 CDN 域名
  }
};
```

### 4.6 预压缩与传输优化

为静态资源额外输出 gzip/brotli 文件，提升线上传输效率（由服务器按 `Accept-Encoding` 选择）。

```js
const CompressionPlugin = require('compression-webpack-plugin');
module.exports = {
  plugins: [
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg|json|txt|xml|ico|eot|ttf|otf|woff2?)$/i,
      compressionOptions: { level: 11 },
      threshold: 8 * 1024, // 超过 8KB 才生成
      minRatio: 0.8,
      deleteOriginalAssets: false
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg|json|txt|xml|ico|eot|ttf|otf|woff2?)$/i,
      threshold: 8 * 1024,
      minRatio: 0.8
    })
  ]
};
```

注意：需确保服务器正确回送 `Content-Encoding` 与缓存头；对不可压缩媒体（如 jpg/png/mp4）无需预压缩。

### 4.7 性能阈值与构建提示

```js
module.exports = {
  performance: {
    hints: 'warning',
    maxAssetSize: 500 * 1024,
    maxEntrypointSize: 1 * 1024 * 1024,
    assetFilter: (name) => !/\.(map|br|gz)$/.test(name)
  }
};
```

## 五、缓存优化

缓存优化指通过合理的缓存机制来减少重复构建、提升构建速度，并优化用户访问体验。

缓存优化主要涉及两个层面，构建缓存表示在开发过程中缓存已处理的模块，避免重复编译；浏览器缓存表示通过文件名哈希策略，让浏览器能够长期缓存未变化的资源。

缓存优化的核心原理是**内容哈希**，当文件内容发生变化时，文件名中的哈希值也会相应变化，从而触发浏览器重新下载；当文件内容未变化时，文件名保持不变，浏览器可以继续使用本地缓存。即 **"如果内容没有变化，就不要重新下载或重新构建"**。

这种机制能确保用户能够及时获取到最新的代码，同时对于未变化的资源又能被浏览器长期缓存，从而减少不必要的网络请求。

webpack 的缓存优化分为两大类。

- 浏览器缓存优化：针对最终用户，减少重复下载。
- 构建缓存优化：针对开发者，减少重复构建。

### 5.1 浏览器缓存优化

#### 5.1.1 文件名哈希

##### （1）占位符

占位符是在配置文件名、路径等时使用的特殊字符串，它们会在构建过程中被动态替换为实际的值。占位符主要用于 `output` 的 `filename`、`chunkFilename` 和 `assetModuleFilename` 等字段中。

- `[name]`：入口点的名称，即 `entry` 字段中定义的键名。
- `[id]`：chunk 的唯一标识符，数值类型，从 0 开始递增。
- `[hash]`：整个项目的构建哈希值，任何文件变化都会导致所有文件的 hash 变化，默认 20 位，可通过 `[hash:8]` 指定长度。
- `[chunkhash]`：基于 chunk 内容的哈希值，只有 chunk 内容变化时 hash 才会变化，适用于代码分割后的 chunk 文件。
- `[contenthash]`：基于文件内容的哈希值，只有文件内容变化时hash才会变化，适合作为长期缓存优化。
- `[fullhash]`：基于完整构建的哈希值，任何构建配置变化都会导致 hash 变化，适合需要完全重新构建的场景。
- `[path]`：相对于 `output.path` 的路径，能保持原有的目录结构。
- `[base]`：文件名（包含扩展名），但不包含路径信息。
- `[ext]`：文件扩展名（包含点号），通常用于资源文件。
- `[query]`：资源查询字符串，通常用于动态导入的资源。
- `[moduleid]`：模块的唯一标识符，数值类型，从 0 开始。
- `[modulehash]`：基于模块内容的哈希值，模块内容变化时 hash 变化
- `[runtime]`：运行时 chunk 的名称，需要配合 `runtimeChunk` 配置使用。

##### （2）哈希策略

文件名哈希，主要是借助三种不同的哈希策略，他们分别是：`contenthash`、`chunkhash` 和 `hash`。

`contenthash` 内容级哈希，是基于文件内容生成的哈希值，只有文件内容真正发生变化时，哈希值才会改变。是最精确的缓存策略，能够提供最大化缓存命中率，适用于生产环境。多数情况下，应该优先考虑使用该策略。

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash:8][ext]'
  }
};
```

`chunkhash` 块级哈希，是基于每个 chunk 的内容生成的哈希值，只有 chunk 内容发生变化时，该 chunk 的哈希值才会改变。适用于代码分割后的 chunk 缓存优化。优点是不同 chunk 可以独立缓存，互不影响。

```javascript
module.exports = {
  output: {
    filename: '[name].[chunkhash:8].js',
    chunkFilename: '[name].[chunkhash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[chunkhash:8][ext]'
  }
};
```

`hash` 是一个项目级哈希，是基于整个项目构建生成的哈希值，要项目中有任何文件发生变化，所有文件的哈希值都会改变，适用于需要强制刷新所有资源的场景。它的缺点是单个文件变化会导致所有文件缓存失效，结果就导致浏览器缓存实效，所以应该谨慎使用这个占位符。

```javascript
module.exports = {
  output: {
    filename: '[name].[hash:8].js',
    chunkFilename: '[name].[hash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]'
  }
};
```

##### （3）哈希长度配置

哈希长度直接影响文件名的可读性和唯一性，平时使用的哈希长度，一般为4、8 和 16 位。

- 4 位哈希文件短，唯一性较低，适合小型资源。
- 8 位哈希平衡可读性和唯一性，适合大多数场景。
- 16 位哈希唯一性高，但文件名长，适合大型 chunk 资源。

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js', // 8 位哈希：平衡可读性和唯一性
    chunkFilename: '[name].[contenthash:16].chunk.js', // 16 位哈希：更高的唯一性，但文件名更长
    assetModuleFilename: 'assets/[name].[contenthash:4][ext]' // 4 位哈希：文件名更短，但唯一性较低
  }
};
```

##### （4）使用场景

webpack 打包输出各种资源时，几乎任何需要配置资源名称或者路径的地方，都需要指定 hash。除了上面提到的 `output` 配置项，只要时配置资源输出的字段，都应该考虑使用合适的 hash 占位符。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[contenthash:8][ext]'
        }
      }
    ]
  }
};
```

下面是使用 `mini-css-extract-plugin` 插件时，使用 `contenthash` 指定资源输出文件名格式的例子。

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[id].[contenthash:8].css'
    })
  ]
};
```

#### 5.1.2 模块标识符优化

在默认情况下，webpack 会为每个模块分配数字 ID，但这些 ID 在每次构建时可能会发生变化，最直接的后果就是缓存失效，即使模块内容未变，ID 变化也会导致缓存失效。一旦缓存实效，就意味着浏览器就没办法使用之前缓存的资源，从而导致不必要的网络请求。

模块标识符有三个可选配置项，分别是：`deterministic`、`named` 和 `natural`，下面分别对他们进行介绍。

`deterministic` 模式（推荐）基于模块的路径和内容生成稳定的 ID，相同的模块在每次构建中都会获得相同的 ID，即使模块顺序发生变化，ID 也能保持稳定。这是webpack 的默认配置，推荐在生产环境中使用。

```javascript
module.exports = {
  optimization: {
    moduleIds: 'deterministic', // 基于模块路径/内容生成稳定的模块 ID
    chunkIds: 'deterministic', // 基于 chunk 内容生成稳定的 chunk ID
  }
};
```

`named` 模式使用模块名称作为 ID，适合开发环境，便于调试和问题定位。

```javascript
module.exports = {
  optimization: {
    moduleIds: 'named', // 使用模块名称作为 ID，便于调试
    chunkIds: 'named' // 使用 chunk 名称作为 ID
  }
};
```

`natural` 模式按模块加载顺序分配 ID，模块顺序变化会导致 ID 变化。由于可能导致缓存失效，所以不推荐在生产环境中使用。

```javascript
module.exports = {
  optimization: {
    moduleIds: 'natural', // 按顺序分配数字 ID，不稳定
    chunkIds: 'natural' // 按顺序分配数字 ID，不稳定
  }
};
```

#### 5.1.3 Runtime 运行时代码优化

Runtime 代码是 webpack 生成的用于管理模块加载、依赖解析和代码分割的胶水代码。

Runtime 代码之所以需要优化，首先是因为当应用代码发生变化时，Runtime 代码被打包在业务代码中，导致整个 bundle 的 hash 发生变化，浏览器缓存失效。其次，多页面应用中，每个页面都包含相同的 Runtime 代码，造成代码重复，增加打包后的体积。最后，Runtime 代码与业务代码耦合，难以独立管理和更新，导致无法针对 Runtime 代码进行单独的优化。

通过优化 Runtime 代码，就可以解决上面这些问题。

Runtime 代码包括四个部分。

- 模块加载器（`__webpack_require__`）
- 异步模块加载器（`__webpack_require__.e`）
- 模块定义器（`__webpack_require__.d`）
- 模块标记器（`__webpack_require__.r`）

下面是一个 Runtime 文件结构示例。

```javascript
(function(modules) {
  // 模块缓存
  var installedModules = {};
  
  // webpack 的 require 函数
  function __webpack_require__(moduleId) {
    // 检查模块是否在缓存中
    if(installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    
    // 创建新模块并放入缓存
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };
    
    // 执行模块函数
    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    
    // 标记模块已加载
    module.l = true;
    
    // 返回模块的 exports
    return module.exports;
  }
  
  // 异步加载模块
  __webpack_require__.e = function(chunkId) {
    // 动态导入逻辑
  };
  
  // 模块定义
  __webpack_require__.d = function(exports, name, getter) {
    // 定义 getter 属性
  };
  
  // 模块标记
  __webpack_require__.r = function(exports) {
    // ES 模块标记
  };
  
  // 启动应用
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})([
  // 模块数组
]);
```

优化 Runtime 代码，有三种配置方式，下面分别进行介绍。

`runtimeChunk: true` 表示启用 Runtime 优化，此时，Runtime 代码会被提取到名为 `runtime.js` 的文件中，默认情况下，所有入口点共享同一个 Runtime 文件，能减少重复代码，提升缓存效率。

```javascript
module.exports = {
  optimization: {
    runtimeChunk: true // 启用 runtime 优化，将 runtime 代码提取到单独文件
  }
};
```

`runtimeChunk: 'single'` 会在所有入口点创建一个共享的 Runtime 文件，能够最大化代码复用，减少打包后的包体积，Runtime 变化时只影响一个文件，是一种不错的缓存策略。

```javascript
module.exports = {
  optimization: {
    runtimeChunk: 'single' // 所有入口点共享一个 runtime 文件
  }
};
```

上面的配置也是下面配置的别名。

```javascript
module.exports = {
  optimization: {
    runtimeChunk: {
      name: 'runtime',
    },
  },
};
```

通过指定 `name` 字段的函数回调，可以为每个入口创建独立的 Runtime 文件。这种方式适合下面的场景。

- 多入口应用。
- 微前端架构，避免不同应用间的 Runtime 冲突。
- 独立部署，需要完全隔离的运行时环境。
- 版本管理，不同模块使用不同版本的 Runtime。

```javascript
module.exports = {
  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}` // 为每个入口点创建独立的 runtime
    }
  }
};
```

另外，可以通过 `output` 配置项的 `runtimeChunkFilename` 字段，为 Runtime 文件命名。

```javascript
module.exports = {
  output: {
    runtimeChunkFilename: '[name].[hash:4].js' // 为 runtime 文件指定专门的命名规则
  },
  optimization: {
    runtimeChunk: 'single'
  }
};
```

上面代码中，Runtime 文件只保留了 4 位哈希值，原因是 Runtime 文件变化频率较低。

### 5.2 构建缓存优化

构建缓存优化是指webpack在构建过程中，通过缓存机制来避免重复执行已经完成的工作，从而显著提升构建速度的技术手段。当webpack重新构建时，如果某些模块、loader处理结果或插件输出没有发生变化，就可以直接从缓存中读取，而不需要重新计算和处理。

构建缓存优化的核心思想是"增量构建"，即只处理发生变化的部分，保持未变化部分的缓存状态。这种优化对于大型项目特别重要，因为大型项目往往包含大量的模块和依赖关系，重新构建整个项目会消耗大量时间。

#### 5.2.1 持久化缓存

webpack5 引入了持久化缓存（Persistent Caching）功能，这是构建缓存优化的重大改进。持久化缓存允许webpack将缓存信息保存到磁盘上，即使关闭开发服务器或重启构建进程，缓存信息仍然可以保留，从而在下次构建时继续使用。

持久化缓存主要通过配置 `cache` 字段实现。

```javascript
module.exports = {
  // 启用持久化缓存
  cache: {
    type: 'filesystem', // 使用文件系统缓存
    buildDependencies: {
      config: [__filename], // 配置文件变化时失效缓存
    },
    cacheDirectory: path.resolve(__dirname, '.temp_cache'), // 缓存目录
    cacheLocation: path.resolve(__dirname, '.temp_cache/cache.json'), // 缓存文件位置
    compression: 'gzip', // 缓存压缩方式
    maxAge: 172800000, // 缓存最长时间（2天）
    store: 'pack', // 缓存存储方式
    version: '1.0.0', // 缓存版本号
  },
};
```

#### 5.2.2 Loader 缓存优化

Loader 缓存是指 webpack 在 loader 处理过程中，缓存 loader 的输出结果，避免对相同输入重复执行相同的 loader 处理逻辑。这对于计算密集型或 I/O 密集型的 loader 特别重要，如 Babel、TypeScript、CSS 处理器等。

Loader 缓存可以显著提升构建性能，特别是当项目中有大量相似文件需要处理时。例如，如果项目中有100个 JavaScript 文件，每个文件都需要通过 Babel 转译，那么启用 Babel 缓存可以避免重复的转译工作。

##### （1）Babel Loader 缓存配置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              // 启用 Babel 缓存
              cacheDirectory: true, // 使用默认缓存目录
              // 或者指定自定义缓存目录
              // cacheDirectory: path.resolve(__dirname, '.babel_cache'),

              // 缓存压缩
              cacheCompression: false, // 禁用压缩以提升速度
              // 缓存标识符
              cacheIdentifier: JSON.stringify({
                babel: require('@babel/core').version,
                'babel-loader': require('babel-loader/package.json').version,
                // 包含其他影响转译的配置
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
                env: process.env.NODE_ENV, // 环境变量
                targets: '> 0.25%, not dead', // 目标浏览器
              }),
            },
          },
        ],
      },
    ],
  },
};
```

##### （2）CSS Loader 缓存配置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              // CSS 模块缓存
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
                // 启用 CSS 模块缓存
                getLocalIdent: (context, localIdentName, localName, options) => {
                  // 自定义本地标识符生成逻辑
                  const hash = crypto.createHash('md5')
                    .update(context.resourcePath + localName)
                    .digest('hex')
                    .substr(0, 8);
                  return localIdentName.replace(/\[hash:base64:5\]/, hash);
                },
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              // PostCSS 缓存配置
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                  require('cssnano'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
```

##### （3）TypeScript Loader 缓存配置

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // 启用 TypeScript 缓存
              transpileOnly: true, // 只转译，不进行类型检查
              // 缓存配置
              experimentalFileCaching: true, // 启用文件缓存
              cacheDirectory: path.resolve(__dirname, '.ts_cache'), // 缓存目录
              // 缓存标识符
              cacheIdentifier: JSON.stringify({
                typescript: require('typescript/package.json').version,
                'ts-loader': require('ts-loader/package.json').version,
                tsconfig: require('fs').readFileSync('./tsconfig.json', 'utf8'),
                env: process.env.NODE_ENV,
              }),
            },
          },
        ],
      },
    ],
  },
};
```

#### 5.2.3 插件缓存优化

插件缓存是指 webpack 插件在处理过程中，缓存插件的输出结果和中间状态，避免重复计算和处理。这对于复杂的插件特别重要，如代码分割插件、优化插件等。

插件缓存可以显著提升构建性能，特别是当插件需要处理大量数据或执行复杂计算时。通过缓存插件的输出结果，webpack 可以避免重复的插件处理工作。

##### （1）`terser-webpack-plugin` 缓存配置

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true, // 启用 Terser 缓存
        // 缓存目录
        cacheKeys: (defaultCacheKeys, file) => {
          // 自定义缓存键生成逻辑
          defaultCacheKeys['terser'] = require('terser/package.json').version;
          defaultCacheKeys['webpack'] = require('webpack/package.json').version;
          defaultCacheKeys['file'] = file;
          return defaultCacheKeys;
        },
        parallel: true, // 并行处理
        // 缓存标识符
        cacheIdentifier: JSON.stringify({
          terser: require('terser/package.json').version,
          webpack: require('webpack/package.json').version,
          env: process.env.NODE_ENV,
        }),
      }),
    ],
  },
};
```

##### （2）`mini-css-extract-plugin` 缓存配置

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[id].[contenthash:8].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              // CSS 缓存配置
              importLoaders: 1,
              modules: {
                localIdentName: '[name]__[local]___[hash:base64:5]',
              },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              // PostCSS 缓存
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                  require('cssnano'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
```

##### （3）`image-minimizer-webpack-plugin` 缓存配置

## 六、预加载/预获取

使用预加载（Preload）或者预获取（Prefetch），可以提前下载某些资源，以确保他们尽早可用。

- `preload` 表示当前页面很快会用到的资源，浏览器立即发起请求，优先级比 `prefetch` 高。页面关闭后，`preload` 标记的资源会停止下载。
- `prefetch` 表示下次导航时可能会用到的资源，浏览器会在空闲时下载对应的资源，优先级较低。页面关闭后，`prefetch` 标记的资源会继续下载。

注意，不管是 `preload` 还是 `prefetch`，他们都只会提前下载资源，并不会执行。

webpack 中配置 `preload` 和 `prefetch` 有两种方式，使用魔法注释或者使用 `preload-webpack-plugin` 插件。下面分别进行介绍。

### 6.1 使用魔法注释

通过 `import()` 配合魔法注释，让 webpack 对按需 chunk 发起预获取或预加载提示。

```js
// 预获取（空闲时下载，适合下一个页面的代码）
import(
  /* webpackPrefetch: true, webpackChunkName: "about" */
  './pages/About'
)

// 预加载（立即下载，适合当前很快就会用到的模块）
import(
  /* webpackPreload: true, webpackChunkName: "hero-chart" */
  './components/HeroChart'
)
```

`webpackPrefetch: true` 会让运行时代码在浏览器空闲时插入 `<link rel="prefetch">`，提示拉取对应 chunk。`webpackPreload: true` 则会插入 `<link rel="preload" as="script">` 并高优请求。

### 6.2 使用 `@vue/preload-webpack-plugin`

[@vue/preload-webpack-plugin] 插件将不同的模块，通过 `<link rel="preload" as="...">` 或者 `<link rel="prefetch">` 的形式，注入到页面的 `<head>` 标签中。

它的使用也很简单，只有几个属性。

- `rel`：指定加载策略，值为 `preload` 或者 `prefetch`。
- `as`：指定通过 `<link>` 标签导入时，`as` 属性的值。可以是字符串，比如 `script`，或者是函数形式。
- `fileBlacklist`：相当于黑名单，指定哪些模块不会被处理。这是个数组类型，在其中可以使用正则表达式进行匹配。
- `include`：指定哪些模块会被处理。类型为 string 或者 object。
  - 指定为字符串时：可选值为 `asyncChunks`、`initial` 或者 `all`，默认为 `asyncChunks`，即只有通过异步方式导入的模块才会被处理。
  - 指定为对象时，有三个属性：`type`、`chunks` 和 `entries`。

```javascript
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");

module.exports = {
  plugins: [
    new PreloadWebpackPlugin({
      rel: 'preload',
      as(entry) {
        if (/\.css$/.test(entry)) return 'style';
        if (/\.woff$/.test(entry)) return 'font';
        if (/\.png$/.test(entry)) return 'image';
        return 'script';
      }
    }),
  ]
};
```

上面代码中，`rel: 'preload'` 表示对于所有通过异步方式导入的模块，使用 `<link rel="preload" as="...">` 的形式导入。最终打包后的效果如下。

```html
<head>
  <link href="lodash.js" rel="preload" as="script" />
  <link href="utils.js" rel="preload" as="script" />
</head>
```

[@vue/preload-webpack-plugin]: https://github.com/vuejs/preload-webpack-plugin

## 七、模块解析优化

模块解析优化是指通过配置webpack的 `resolve` 选项，优化模块的查找、定位和加载过程，从而提升构建性能和开发体验。webpack在打包过程中需要解析大量的模块依赖关系，合理的解析配置可以显著减少模块查找时间，避免重复解析，提高整体构建效率。

### 7.1 路径别名配置

路径别名是指为常用的模块路径创建简短的别名，避免使用冗长的相对路径。当 webpack 遇到别名时，会直接替换为对应的真实路径，跳过复杂的路径解析过程。通过配置路径别名，可以减少路径计算、提高查找效率以及增强代码可读性。

路径别名通过配置 `alias` 实现。

```javascript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 使用函数动态生成别名
      '^@/(.*)$': path.resolve(__dirname, 'src/$1'), // 使用正则表达式进行更精确的匹配
      '@components': path.resolve(__dirname, 'src/components/index.js'), // 目录索引别名
      // 对象形式的详细配置
      '@components': {
        alias: path.resolve(__dirname, 'src/components'),
        onlyModule: true, // 只对模块请求生效
      },
      
      // 包级别的别名
      'lodash': 'lodash-es',
      'moment': 'moment/min/moment.min.js',
      'package-name': path.resolve(__dirname, 'node_modules/package-name/src'),
      
      // 条件别名（根据环境配置）
      ...(process.env.NODE_ENV === 'development' && {
        'react': 'react/development',
      }),

      // 函数形式的别名配置
      '@': (info) => {
        const { request } = info;
        if (request.startsWith('@/components/')) {
          return path.resolve(__dirname, 'src/components', request.slice(12));
        }
        if (request.startsWith('@/utils/')) {
          return path.resolve(__dirname, 'src/utils', request.slice(7));
        }
        return path.resolve(__dirname, 'src');
      },
    },
  },
};
```

```javascript
// 优化前：使用相对路径
import Button from '../../../components/Button/Button.jsx';

// 优化后：使用别名
import Button from '@components/Button/Button.jsx';
```

注意，避免创建过多的别名，这会增加 webpack 的解析开销。另外，使用绝对路径而不是相对路径，能够提高解析效率，还可以考虑配合使用 `resolve.modules` 字段。

### 7.2 文件扩展名配置

文件扩展名配置是指告诉 webpack 在导入模块时可以省略哪些文件扩展名。webpack 会按照配置的顺序依次尝试添加扩展名，直到找到匹配的文件。

文件扩展名通过配置 `extensions` 字段配置，可以按照使用频率、文件大小或者解析复杂度进行排序，靠前的扩展名会被优先解析。

```javascript
module.exports = {
  resolve: {
    extensions: [
      '.js', '.jsx', '.ts', '.tsx', '.json', // 只包含真正需要的扩展名，避免不必要的查找
    ],
  },
};
```

```javascript
// 优化前：需要写完整的扩展名
import Button from './components/Button.jsx';
import { formatDate } from './utils/dateUtils.js';
import config from './config.json';
import './styles/main.css';

// 优化后：可以省略扩展名
import Button from './components/Button';
import { formatDate } from './utils/dateUtils';
import config from './config';
import './styles/main';
```

### 7.3 模块搜索路径优化

模块搜索路径优化是指通过配置模块解析的“查找范围与顺序”，减少无效的文件系统访问与回溯，从而加速依赖解析与构建。

模块搜索路径优化的目标是更快找到目标模块、减少尝试次数、避免误引入大体积/错误版本实现。

模块搜索路径优化通过 `modules` 字段配置。

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  resolve: {
    modules: [
      // 明确指定搜索顺序，避免歧义
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'src/components'),
      path.resolve(__dirname, 'src/utils'),
      'node_modules',
      
      // 使用绝对路径，避免相对路径的复杂性
      path.resolve(__dirname, 'src'),
      
      // 考虑模块的依赖关系，合理排序
      // 被依赖的模块目录放在前面
    ],
  },
};
```

```javascript
// 优化前：webpack 只在 node_modules 中查找
import Button from 'Button'; // 可能找不到，因为不在 node_modules 中

// 优化后：webpack 会在多个目录中查找
import Button from 'Button'; // 会在 src/components 中找到
import { formatDate } from 'dateUtils'; // 会在 src/utils 中找到
```

## 八、渐进式 Web 应用

渐进式网络应用程序（Progressive Web App，PWA），能够提供对应用的离线支持，使用户在离线情况下，也可以访问应用中的内容。

```javascript
// index.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
```

```javascript
// webpack.config.js
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  plugins: [
    new GenerateSW(),
  ],
  mode: 'production'
};
```

1. 安装需要的插件 `npm i -D workbox-webpack-plugin`、`npm i serve -g`
2. 在项目入口文件中注册 serviceWorker 服务。
3. 在 `webpack.config.js` 中配置 `workbox-webpack-plugin` 插件。
4. 执行打包命令 `npx webpack`。
5. 执行 `serve dist` 命令。

按照上述步骤，现在，项目应该可以支持离线访问了。

## 九、其他优化措施

- 配置 Loader 时，设置 oneOf/include/exclude。
- ESLint、Babel 优化：设置 ESLint 和 Babel 的缓存功能，以及减少 Babel 打包后的文件体积。

## 参考

- [webpack 文档](https://webpack.docschina.org/)
- [MDN](https://developer.mozilla.org/)
- [渐进式网络应用程序](https://zh.wikipedia.org/wiki/%E6%B8%90%E8%BF%9B%E5%BC%8F%E7%BD%91%E7%BB%9C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F)
