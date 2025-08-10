# webpack 生产环境优化

## 一、介绍

## 二、代码压缩

### 2.1 压缩 HTML

#### （1）基本使用

HTML 压缩的主要目标是减少 HTML 文件的大小，提高页面加载速度。[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 是处理 HTML 文件的核心插件，它可以生成 HTML 文件，还提供了基础的压缩功能。

下面列出了一些常见的属性。

- `template`：指定使用哪个 HTML 文件作为模板。插件会读取这个模板文件，然后将打包后的资源注入到模板中。
- `filename`：指定生成的 HTML 文件名，通常使用占位符指定。默认为 `'index.html'`。
- `inject`：控制是否自动注入打包后的资源到 HTML 中。默认为 `true`，如果指定为 `'head'`，则注入到 `<head>` 标签中。
- `title`：设置 HTML 页面的标题。这个值会替换模板中的 `<%= htmlWebpackPlugin.options.title %>`。
- `templateParameters`：对象类型。向模板传递自定义参数。可以在模板中使用这些参数。比如，`<title><%= appName %> v<%= version %></title>`。
- `chunks`：指定要注入到 HTML 中的 chunk。
- `meta`：通过键值对的形式，指定一个或多个 meta 标签。
- `minify`：详细控制 HTML 压缩的各种选项。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }), 
  ],
};
```

上面的代码，打包时 `html-webpack-plugin` 以 `./public/index.html` 为模板，生成一个新的 `index.html` 文件，并将打包后的资源注入到新生成的文件中。

#### （2）自定义压缩行为

`minify` 属性用于控制代码的压缩。生产模式下，此属性默认值为 `true`，此时，使用内置的 [html-minifier-terser](https://github.com/DanielRuf/html-minifier-terser)插件，压缩 HTML 代码。其他模式下，此属性为 `false`，表示不开启压缩。

通过自定义 `minify` 属性，可以控制更精确的压缩行为。下面是这个属性的默认值。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      minify: {
        // 默认值
        collapseWhitespace: true, // 移除空白符
        removeComments: true, // 移除HTML注释
        keepClosingSlash: false, // 移除自闭合标签的斜杠
        removeRedundantAttributes: true, // 移除冗余属性
        removeScriptTypeAttributes: true, // 移除script的type属性
        removeStyleLinkTypeAttributes: true, // 移除style和link的type属性
        useShortDoctype: true, // 使用短文档类型
      },
    }),
  ],
};
```

除了上面的默认属性，还可以考虑配置下面的几个属性。

- `minifyJS: true`：压缩内联 JavaScript。
- `minifyCSS: true`：压缩内联 CSS。
- `minifyURLs: true`：压缩 URL。
- `removeEmptyElements: true`：移除空元素。
- `removeEmptyAttributes: true`：移除空属性。
- `collapseBooleanAttributes: true`：压缩布尔属性。

#### （3）变量注入

`html-webpack-plugin` 提供了强大的变量注入功能，允许在 HTML 模板中使用各种 webpack 和插件提供的变量。这些变量可以帮助我们动态生成HTML内容，实现更灵活的模板配置。

`htmlWebpackPlugin.options` 对象包含了传递给 `HtmlWebpackPlugin` 的所有配置选项。

`htmlWebpackPlugin.files` 对象包含了 webpack 打包后的文件信息。通过这个对象，可以获取所有需要被注入的样式、脚本和 chunks 数组。

```html
<!-- 注入所有 CSS 文件 -->
<% htmlWebpackPlugin.files.css.forEach(function(cssFile) { %>
  <link href="<%= cssFile %>" rel="stylesheet">
<% }); %>

<!-- 注入所有 JS 文件 -->
<% htmlWebpackPlugin.files.js.forEach(function(jsFile) { %>
  <script src="<%= jsFile %>"></script>
<% }); %>

<!-- 遍历所有 chunks -->
<% Object.keys(htmlWebpackPlugin.files.chunks).forEach(function(chunkName) { %>
  <% var chunk = htmlWebpackPlugin.files.chunks[chunkName]; %>
  <% if (chunk.css) { %>
    <% chunk.css.forEach(function(cssFile) { %>
      <link href="<%= cssFile %>" rel="stylesheet">
    <% }); %>
  <% } %>
  <% if (chunk.js) { %>
    <% chunk.js.forEach(function(jsFile) { %>
      <script src="<%= jsFile %>"></script>
    <% }); %>
  <% } %>
<% }); %>
```

通过 `templateParameters` 属性，可以注入自定义变量到模板中。

```javascript
// webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      templateParameters: {
        // 应用信息
        appName: 'React应用',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        
        // 配置信息
        cdnUrl: process.env.CDN_URL || 'https://cdn.example.com',
        
        // 功能开关
        enableAnalytics: process.env.NODE_ENV === 'production',
        enableDebug: process.env.NODE_ENV === 'development',
        
        // 自定义函数
        formatDate: function(date) {
          return new Date(date).toLocaleDateString();
        },
        
        // 复杂对象
        config: {
          theme: 'light',
          language: 'zh-CN',
          features: ['feature1', 'feature2'],
        },
      },
    }),
  ],
};
```

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="<%= config.language %>">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= appName %> v<%= version %></title>
  
  <!-- 应用信息 -->
  <meta name="app-name" content="<%= appName %>">
  <meta name="version" content="<%= version %>">
  <meta name="environment" content="<%= environment %>">
  
  <!-- 配置信息 -->
  <meta name="cdn-url" content="<%= cdnUrl %>">

  <!-- 使用条件渲染避免不必要的代码 -->
  <% if (environment === 'production') { %>
    <!-- 生产环境特定代码 -->
    <meta name="robots" content="index, follow">
    <script src="https://analytics.example.com/tracker.js"></script>
  <% } else { %>
    <!-- 开发环境特定代码 -->
    <meta name="robots" content="noindex, nofollow">
    <script>
      console.log('开发模式已启用');
    </script>
  <% } %>
    
  <!-- 条件渲染 -->
  <% if (enableAnalytics) { %>
    <script>
      // 生产环境分析代码
      window.analytics = {
        enabled: true,
        track: function(event) {
          console.log('Analytics:', event);
        }
      };
    </script>
  <% } %>
  
  <% if (enableDebug) { %>
    <script>
      // 开发环境调试代码
      window.debug = {
        enabled: true,
        log: function(message) {
          console.log('Debug:', message);
        }
      };
    </script>
  <% } %>
  
  <!-- 主题配置 -->
  <script>
    window.appConfig = {
      theme: '<%= config.theme %>',
      language: '<%= config.language %>',
      features: <%- JSON.stringify(config.features) %>,
    };
  </script>
</head>
<body>
  <div style="display: none;">
    <p>应用名称: <%= appName %></p>
    <p>版本: <%= version %></p>
    <p>环境: <%= environment %></p>
  </div>
</body>
</html>
```

#### （4）模板优化

这部分内容，在 [模板优化](/2025/react/2025-08-04-optimization.md) 有详细介绍。

[示例代码](/examples/webpack/demos/html-optimization/)

### 2.1 压缩脚本资源

#### （1）介绍

Tree Shaking 是一个术语，用于描述移除 JavaScript 上下文中的**死代码**。这个术语来源于 ES6 模块的静态结构特性，通过**摇树**的动作来比喻移除无用的代码。

Tree Shaking 在执行过程中，会依次经历静态分析、依赖图构建、标记阶段、清除阶段和副作用检查五个阶段。

Tree Shaking 依赖于 ES6 模块的三个静态结构特性。

1. 静态导入/导出：`import` 和 `export` 语句必须在模块的顶层，不能在条件语句或函数内部。
2. 静态分析：打包工具可以在编译时确定哪些代码被使用，哪些没有被使用。
3. 副作用分析：识别代码的副作用，确保不会误删有副作用的代码

```javascript
// utils.js
export function add(a, b) {
  return a + b;
}

export { add };

// index.js
import { add } from './utils';
import debounce from 'lodash/debounce';
import { debounce } from 'lodash-es'; // 或者，使用支持 Tree Shaking 的版本
```

通过上面的方式导出和导入的模块，都支持 Tree Shaking。

Tree Shaking 的实现，需要借助 `terser-webpack-plugin` 插件，webpack 内置了此插件。

#### （2）原理

Tree Shaking 执行的过程，分为两个阶段。

第一阶段：**标记阶段**。

webpack 分析模块依赖，标记哪些导出被使用，哪些未被使用。同时分析哪些模块有副作用，哪些没有副作用。这一阶段主要依赖于三个属性配置。

- `optimization.usedExports`：告诉 webpack **是否启用标记**，以标记哪些导出被使用了，哪些没有被使用。在打包后的代码中，未使用的导出会被标记为 `/* unused harmony export */`。这个是布尔值，默认值为 `true`。
- `optimization.sideEffects`：这是一个全局属性，告诉 webpack 是否假设所有模块都没有副作用。这个是布尔值，默认值为 `true`。
- `package.json` 中的 `sideEffects`：告诉 webpack 哪些文件有副作用，哪些没有。这个属性要比 `optimization.sideEffects` 更精确，是最精确的副作用控制方式。这个属性有多种配置方式，默认值为 `true`。

  下面是这个属性的取值。

  - `"sideEffects": true`：整个包都有副作用，所有代码都会被保留。
  - `"sideEffects": false`：整个包都没有副作用，未使用的代码会被删除。
  - `"sideEffects": ["*.css", "./src/utils.js"]`：只有 css 和 `utils.js` 文件有副作用，其他文件的未使用代码会被删除。
  - `"sideEffects": ["*.css", "!*.css"]`：所有 css 文件都有副作用，但是 `!*.css` 文件没有副作用，这个文件中的没有使用的代码会被删除。

上面的三个属性，按照优先级排序是，`package.json` 中的 `sideEffects` 属性 > `optimization.sideEffects` > `optimization.usedExports`。

第二阶段：**清除阶段**。

webpack 会删除标记的未使用代码，这是 Tree Shaking 真正生效的关键步骤。这一阶段主要依赖于两个属性配置。

- `optimization.minimize`：布尔值。控制是否启用代码压缩。生产模式下为`true`，其他模式为 `false`。
- `optimization.minimizer`：数组。指定用于代码压缩的插件。生产模式下默认为 `[new TerserPlugin()]`（即 `terser-webpack-plugin` 这个插件）。

从上面两个阶段可以看出，在生产模式下，即在 `webpack.config.js` 中开启 `mode: 'production'` 的情况下，webpack 会自动开启 Tree Shaking。

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: "production",
  optimization: {
    usedExports: true, // 默认为 `true`
    sideEffects: true, // 默认为 `true`
    minimize: true, // 默认为 `true`
    minimizer: [
      new TerserPlugin(), // 默认使用 `terser-webpack-plugin` 压缩代码
    ],
  },
}
```

<!-- TODO：AST -->

注意，代码分析过程，与抽象语法树（AST）有关。

#### （3）使用限制

并不是所有的模块和第三方库都支持 Tree Shaking，在使用时有一些限制。

首先，`ESM` 中的默认导入、默认导出和 `import()` 动态导入，以及`CommonJS` 模块，都不支持或者仅有限支持 Tree Shaking。所以，应该尽量避免下面的写法。

```javascript
// 完全不支持 Tree Shaking
const utils = require('./utils');
import * as utils from './utils';
import('./utils').then(module => {
  console.log(module.add(1, 2));
});

// 可能影响 Tree Shaking
import utils from './utils';
export default { add };
```

上面的写法中，要特别注意 `import()` 动态导入的模块，对于动态导入的模块，webpack 无法在编译时确定哪些导出会被使用，所以会保留模块中的所有导出，即使模块中有死代码，这些代码也会被保留。

其次，有副作用的代码可能被误删，应该尽量避免在模块顶层，执行有副作用的代码。下面的代码，都属于有副作用的代码。

```javascript
// 全局变量修改
window.foo = 'bar';

// 控制台输出
console.log('Side effect');

// DOM操作
document.title = 'New Title';

// 网络请求
fetch('/api/data');

// 定时器
setTimeout(() => {}, 1000);
```

目前，有两种方式，可以将代码块（注意，这里说的是代码块，而不是模块）标记为没有副作用，然后，webpack 就可以放心地删除。

一是将有副作用的代码放入一个函数中。

```javascript
export function addSideEffect() {
  window.foo = 'bar';
  console.log('Side effect');
  document.title = 'New Title';
  fetch('/api/data');
  setTimeout(() => {}, 1000);
}
```

上面的代码，如果 `addSideEffect()` 方法没有被其他模块使用，会被 Tree Shaking 优化。

二是在代码前插入 `/*#__PURE__*/` 注释。

```javascript
// 不会被优化
/*#__PURE__*/ window.foo = 'bar';

// 会被优化
/*#__PURE__*/ console.log('Side effect');
/*#__PURE__*/ document.title = 'New Title';
/*#__PURE__*/ fetch('/api/data');
/*#__PURE__*/ setTimeout(() => {}, 1000);
```

上面代码中，除了 `window.foo`，其它方式定义的副作用代码，都会被删除。所以，应该尽量避免向全局对象中，添加属性和方法。

循环依赖的模块，可能影响优化效果。

```javascript
// foo.js
import { bar } from './bar';
export const foo = bar;

// bar.js
import { foo } from './foo';
export const bar = foo;
```

另外，某些第三方库可能也不支持。

```javascript
import _ from 'lodash';
```

#### （4）自定义配置

第一步，配置 `optimization.usedExports` 属性。

```javascript
// utils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// index.js
import { add } from './utils';
```

对于上面的代码，当 `usedExports: false` 时，webpack 不会进行标记，所有的导出（上文中的 `add` 和 `subtract`）都会被保留。当 `usedExports: true` 时，webpack 会标记 `add` 为已使用，`subtract` 被标记为未使用。这意味着，构建后的代码会包含标记信息，但这个阶段不会删除未使用的代码。在打包输出的文件中，会看到类似下面这样的注释。

```javascript
/* unused harmony export subtract */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });
```

<!-- 注意，这个属性只是告诉 webpack 是否标记代码，即使 `usedExports: true`，也不会删除未使用的代码。 -->

第二步，配置 `optimization.sideEffects` 属性。

```javascript
// utils.js
console.log('Side effect code.');
window.baz = 'Global side effect variable.';
```

对于上面的代码，当 `sideEffects: false` 时，webpack 假设所有模块都没有副作用，会尝试删除未使用的代码，包括 `console.log` 和 `window.baz`，如果这些代码确实有副作用，就会被误删。当 `sideEffects: true` 时，webpack 假设所有模块都有副作用，不会删除任何代码，即使标记为未使用。此时 Tree Shaking 不会生效。

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
  mode: 'production',
};
```

上面的代码，告诉 webpack 启用标记，并且所有代码都没有副作用。此时未使用的代码会被删除，包括有副作用的代码。

第三步，配置 `package.json` 中的 `sideEffects` 属性。

```json
// package.json
{
  "name": "my-package",
  "sideEffects": ["./src/polyfills.js"]
}
```

```javascript
// polyfills.js
// 这个文件有副作用
console.log('Polyfills loaded');
window.Promise = require('es6-promise').Promise;

// utils.js
// 这个文件没有副作用
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// index.js
import './polyfills.js';  // 有副作用，会被保留
import { add } from './utils.js';  // 只有 add 方法会被保留
```

对于上面的代码，`polyfills.js` 有副作用，会被保留。`utils.js` 没有副作用，只有 `add` 方法会被保留，`subtract` 方法由于没有使用，会被删除。

下面是对这三个属性的推荐配置。

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false,  // 让 package.json 控制副作用
    minimize: true,
  },
  // stats: {
  //   usedExports: true,     // 显示使用的导出
  //   providedExports: true, // 显示提供的导出
  // },
};
```

```json
// package.json
{
  // "sideEffects": false,  // 如果确定没有副作用
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.less",
    "./src/polyfills.js"
  ]
}
```

第四步，配置 `optimization` 的 `minimize` 和 `minimizer` 属性。

要使 Tree Shaking 生效，必须设置 `minimize` 为 `true`。

如果要使自定义 `terser-webpack-plugin` 的压缩行为，或者使用其他插件进行压缩，需要配置 `minimizer` 属性。

```javascript
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: true,         // 变量名混淆
          compress: {
            unused: true,       // 删除未使用的变量和函数
            dead_code: true,    // 删除死代码
            drop_console: true, // 删除 console.log
          },
        },
      }),
    ],
  },
}
```

#### （5）总结

综上所述，要想使 Tree Shaking 达到预期效果，需要做到这些。

- 使用 ES6 模块语法（`import` / `export`），避免使用 CommonJS 模块化语法。
- 配置 `mode: 'production'`。
- 配置 `optimization` 的 `usedExports: true`、`sideEffects` 以及 `package.json` 中的 `sideEffects`。
- 避免在模块顶层执行副作用操作。

如果要调试 Tree Shaking 是否生效，可以使用 `webpack-bundle-analyzer` 插件，或者 webpack 的 `stats` 输出。

```bash
# 使用 webpack-bundle-analyzer 分析打包结果
npm install -D webpack-bundle-analyzer
```

```javascript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin(),
  ],
};
```

[示例代码](/examples/webpack/demos/tree-shaking/)

### 2.2 压缩样式资源

CSS 样式资源的压缩，主要借助两个插件。

- `mini-css-extract-plugin`：将 CSS 从 JavaScript bundle 中提取出来，生成独立的 CSS 文件，避 免CSS 被打包到 JS 中，减少 JS 文件体积，提高 CSS 的缓存效率。
- `css-minimizer-webpack-plugin`：这个插件使用 [cssnano](https://cssnano.github.io/cssnano/)压缩 CSS 代码。

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

function precessStyles(test, pre) {
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
      precessStyles(/\.css$/),
      precessStyles(/\.s[ac]ss$/i, 'sass-loader'),
      precessStyles(/\.less$/i, 'less-loader'),
    ]
  },
  plugins: [
    // 提取 CSS 到单独文件
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css', // 输出文件名格式
      chunkFilename: 'css/[id].[contenthash:8].css' // 异步加载的 CSS 文件名格式
    })
  ],
  optimization: {
    minimizer: [
      '...', // 保留其他 minimizer（如 TerserPlugin）
      // CSS 压缩
      new CssMinimizerPlugin(),
    ]
  }
};
```

问题一、CSS 加载顺序不正确，导致样式覆盖。

```javascript
new MiniCssExtractPlugin({
  insert: (linkTag) => {
    // 确保 CSS 按正确顺序插入
    const target = document.querySelector('#css-container');
    target.appendChild(linkTag);
  }
})
```

问题二、使用 MiniCssExtractPlugin 后，开发环境热更新失效。

```javascript
const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  }
};
```

[示例代码](/demos/src/webpack/style-compress/)

## 三、代码分割

默认情况下，webpack 将脚本代码打包到一个文件中，这就导致，浏览器加载某个页面时，整个 bundle 文件都会被加载进内存。

代码分割（code splitting）能够将代码打包到多个 bundle 中，从而实现**按需加载**和**并行加载**。合理使用代码分割，能够缩短代码加载时间。

代码分割有三种实现方式：多入口、提取重复代码以及按需加载。

下面分别进行介绍。

### 3.1 多入口

如果项目有多个入口，可以配置多入口形式进行打包。如果这些入口，有共通引用的模块，为了避免共通引用的模块被打包到每个文件，需要配置 `dependOn` 和 `shared` 属性，将共同引用的模块，单独打包到一个文件。

- `dependOn`：指定通过 `entry` 中的哪个属性，来配置共享的模块。
- `shared`：指定多入口依赖的模块。

```javascript
module.exports = {
  entry: {
    app: {
      import: './src/app.js',
      dependOn: 'shared',
    },
    main: {
      import: './src/main.js',
      dependOn: 'shared',
    },
    shared: ['lodash']
  },
};
```

下面是 webpack 打包后的结果。

```text
asset shared.js 556 KiB [emitted] (name: shared)
asset main.js 1.25 KiB [emitted] (name: main)
asset app.js 1.24 KiB [emitted] (name: app)
```

上面代码中，`app` 和 `main` 通过 `shared` 字段告诉 webpack，他们共同引用了 `lodash` 模块，这样，`lodash` 就会被单独打包到一个 bundle 文件中，也就是上面控制台输出中的 `shared.js`。

### 3.2 配置 `splitChunks`

`optimization.splitChunks` 属性，是一个用于配置代码分割的选项，通过这个属性，可以对代码分割的行为进行更详细地配置。

下面是 `splitChunks` 选项中，几个常见的配置项。

- `chunks`：指定哪些模块会被分割。有三个选项：
  - `async`：默认值，只分割按需加载的模块。比如，通过 `import()` 动态导入的模块。
  - `initial`：只分割初始模块。比如，页面初始加载时导入的块，通常有助于优化初始加载时间。
  - `all`：同时支持异步模块和初始模块。能够提供最大程度的代码共享和优化，减少打包后的项目体积。
- `minSize`：指定打包阈值。如果模块的大小，大于指定的值，则会被单独打包到一个 bundle 文件中。较高的值可以减少 HTTP 请求数量，但会增大初始下载大小；较低的值可以实现更惊喜的缓存，但是会增加 HTTP 请求数量。
- `minRemainingSize`：指定代码分割过程中，从块中分割出来的 bundle 最小是多大。比如，如果设置为 `1000`，则分割后产生的块（chunk）必须大于 1kb。
- `minChunks`：指定当一个模块至少被引用（共享）多少次时，才可以进行分割。比如，如果设置为 `1`，则表示哪怕某个模块被引用了一次，也要被单独分割。
- `maxAsyncRequests`：指定一个模块被加载时，可以被按需（动态）加载请求的最大并行请求数。
- `maxInitialRequests`：指定入口文件初始化时，可以执行的最大并行请求数。
- `enforceSizeThreshold`：指定强制进行代码分割的阈值。设置此选项后，`minRemainingSize`、`maxAsyncRequests` 和 `maxInitialRequests` 将被忽略。
- `cacheGroups`：对模块如何被分组到单独的代码块，进行细粒度的控制。

下面的配置对象，是 `splitChunks` 选项的默认配置。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'async',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

对于上面的配置，项目开发中，一般会设置 `chunks` 为 `'all'`，对于其他选项，需要根据项目的实际情况配置。当然，如果不知道如何配置，使用默认值也是一个不错的选择。

注意，`splitChunks` 选项基于 `SplitChunksPlugin` 插件实现，webpack 内置了这个插件，在使用时不必单独下载。

你可以参考 [官网](https://webpack.docschina.org/plugins/split-chunks-plugin#optimizationsplitchunks)，来获取 `splitChunks` 的更多配置信息。

### 3.3 按需加载，动态导入

使用 ES6 提供的 `import()` 方法导入模块时，webpack 会自动将导入的模块打包为单独的 chunk。

```javascript
// utils.js
function sum(numbers) {
  return numbers.reduce(
    (acc, cur) => acc + cur,
    0,
  );
}

module.exports = {
  sum,
};

// index.js
import('./utils.js').then(m => {
  console.log(m.default.sum([1, 2, 3]));
});
```

上面代码中，`utils` 模块会被单独打包到一个 chunk 中，但是打包后的文件名称是一串数字 `413.js`。

```text
asset main.js 3.03 KiB [emitted] [minimized] (name: main)
asset 413.js 126 bytes [emitted] [minimized]
```

我们可以在使用 `import()` 中使用 webpack 提供的魔法注释，来为打包后的文件重命名。

```javascript
// index.js
import(/* webpackChunkName: "utils" */'./utils.js').then(m => {
  console.log(m.default.sum([1, 2, 3]));
});
```

修改后，打包输出的结果如下。

```text
asset main.js 3.03 KiB [emitted] [minimized] (name: main)
asset utils.js 126 bytes [emitted] [minimized] (name: utils)
```

除了 `webpackChunkName`，webpack 还支持其他的魔法注释，都可以作为优化手段。

- `webpackMode`：控制导入模块的加载策略。可选值为：`eager`、`weak`、`lazy` 和 `lazy-once`。
- `webpackPreload`：布尔值，提示浏览器在后台预加载模块。
- `webpackPrefetch`：布尔值，提示浏览器预取模块以供将来使用。

[示例代码](/examples/webpack/demos/code-splitting/)

## 四、资源优化

### 4.1 图片压缩

`image-minimizer-webpack-plugin` 可以实现对项目中导入的静态图片资源进行压缩。

图片压缩分为无损压缩和有损压缩，不同的压缩方案，需要安装不同的插件。对于无损压缩，需要执行下面的指令。

```bash
npm i -D imagemin-gifsicle imagemin-jpegtran imagemin-optipng imagemin-svgo
```

对于有损压缩，只需将 `imagemin-jpegtran` 替换为 `imagemin-mozjpeg` 即可。

```javascript
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            ["gifsicle", { interlaced: true }],
            ["jpegtran", { progressive: true }],
            ["optipng", { optimizationLevel: 5 }],
            [
              "svgo",
              {
                plugins: [
                  "preset-default",
                  "prefixIds",
                  {
                    name: "sortAttrs",
                    params: {
                      xmlnsOrder: "alphabetical",
                    },
                  },
                ],
              },
            ],
          ],
        },
      },
    }),
  ],
  mode: "production",
};
```

使用 `image-webpack-loader` 优化图片资源。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192, // 小于8kb的图片转为base64
              name: 'images/[name].[hash:8].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
    ],
  },
};
```

[示例代码](/examples/webpack/demos/image-optimization/)

### 4.2 字体优化

### 4.3 资源内联

Webpack 5 引入了资源模块（asset module）类型，无需配置额外的 loader 就能处理资源文件。资源模块主要包含四种类型。

- `asset/source`：导出资源的源代码（替代 raw-loader）。
- `asset/resource`：发送单独的文件并导出 URL（替代 file-loader）。
- `asset/inline`：导出资源的 data URI（替代 url-loader）。
- `asset`：在导出单独文件和 data URI 之间自动选择（替代 url-loader 配置资源体积限制）。

下面是对于每一种资源模块的具体优化措施。

#### （1）`asset/resource`

通过自定义输出文件名，实现更好的资源组织和缓存控制。

```javascript
module.exports = {
  output: {
    assetModuleFilename: 'images/[hash][ext][query]'
  },
  module: {
    rules: [
      {
        test: /\.png/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[hash][ext][query]'
        }
      },
      // 优化资源 URL 的生成方式
      {
        test: /\.svg/,
        type: 'asset/resource'
      }
    ]
  }
};
```

URL资源优化，优化资源URL的生成方式。

```javascript
module.exports = {
  target: 'web', // 或 'node'
  module: {
    rules: [
      {
        test: /\.svg/,
        type: 'asset/resource'
      }
    ]
  }
};

// 使用方式
const logo = new URL('./logo.svg', import.meta.url);
```

禁用资源发送，在特定场景（如 SSR）下优化构建输出。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.png$/i,
        type: 'asset/resource',
        generator: {
          emit: false // 禁止输出文件
        }
      }
    ]
  }
};
```

#### （2）`asset/inline`

自定义Data URI生成器，优化内联资源的编码方式。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.svg/,
        type: 'asset/inline',
        generator: {
          dataUrl: content => {
            content = content.toString();
            return svgToMiniDataURI(content); // 使用更高效的编码
          }
        }
      }
    ]
  }
};
```

#### （3）`asset`

控制资源内联阈值，平衡请求数和包体积，优化资源大小。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4kb以下转为内联
          }
        }
      }
    ]
  }
};
```

资源模块与其他loader结合，实现更复杂的资源处理流程。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/i,
        type: 'asset',
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              }
            }
          }
        ]
      }
    ]
  }
};
```

#### （4）资源类型优化

根据资源特点选择最佳处理方式。

```javascript
module.exports = {
  module: {
    rules: [
      {
        // 小图标使用inline
        test: /\.(png|jpg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024
          }
        }
      },
      {
        // 大图片使用resource
        test: /\.(png|jpg|gif)$/i,
        type: 'asset/resource',
        resourceQuery: /size=large/
      },
      {
        // SVG使用source
        test: /\.svg$/i,
        type: 'asset/source'
      }
    ]
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

##### （1）`deterministic` 模式（推荐）

`deterministic` 模式基于模块的路径和内容生成稳定的 ID，相同的模块在每次构建中都会获得相同的 ID，即使模块顺序发生变化，ID 也能保持稳定。这是webpack 的默认配置，推荐在生产环境中使用。

```javascript
module.exports = {
  optimization: {
    moduleIds: 'deterministic', // // 基于模块路径生成稳定的模块 ID
    chunkIds: 'deterministic', // 基于 chunk 内容生成稳定的 chunk ID
    moduleIds: 'deterministic', // 确保模块顺序稳定
    chunkIds: 'deterministic' // 确保 chunk 顺序稳定
  }
};
```

##### （2）`named` 模式

`named` 模式使用模块名称作为 ID，适合开发环境，便于调试和问题定位。

```javascript
module.exports = {
  optimization: {
    moduleIds: 'named', // 使用模块名称作为 ID，便于调试
    chunkIds: 'named' // 使用 chunk 名称作为 ID
  }
};
```

##### （3）`natural` 模式

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

使用预加载（Preload）或者预获取（Prefetch），可以在不阻塞浏览器渲染的前提下，提前下载某些资源，以确保他们尽早可用。

- `preload`：表示当前页面很快会用到的资源，优先级比 `prefetch` 高。页面关闭后，`preload` 标记的资源会停止下载
- `prefetch`：表示下次导航时可能会用到的资源，浏览器会在空闲时下载对应的资源，优先级较低。面关闭后，`prefetch` 标记的资源会继续下载。

注意，不管是 `preload` 还是 `prefetch`，他们都只会提前下载资源，并不会执行。

webpack 中配置 `preload` 和 `prefetch` 有两种方式，使用魔法注释或者使用 `preload-webpack-plugin` 插件。下面分别进行介绍。

### 4.1 使用魔法注释

### 4.2 使用 `@vue/preload-webpack-plugin`

[`@vue/preload-webpack-plugin`](https://github.com/vuejs/preload-webpack-plugin) 插件将不同的模块，通过 `<link rel='preload' href='...'>` 或者 `<link rel='prefetch' href='...'>` 的形式，注入到页面的 `<head>` 标签中。

它的使用也很简单，只有几个属性。

- `rel`：指定加载策略，值为 `preload` 或者 `prefetch`。
- `as`：指定通过 `<link>` 标签导入时，`as` 属性的值。可以是字符串，比如 `script`，或者是函数形式。
- `fileBlacklist`：相当于黑名单，指定哪些模块不会被处理。这是个数组类型，在其中可以使用正则表达式进行匹配。
- `include`：指定哪些模块会被处理。类型为 string 或者 object。
  - 指定为字符串时：可选值为 `asyncChunks`、`initial` 或者 `all`，默认为 `asyncChunks`，即只有通过异步方式导入的模块才会被处理。
  - 指定为对象时，有三个属性：`type`、`chunks` 和 `entries`。

```javascript
// index.js
import(
  /* webpackChunkName: "utils" */
  './utils').then(module => {
  console.log(module.default.sum([1, 2, 3]));
});

setTimeout(() => {
  import(
    /* webpackChunkName: "lodash" */
    'lodash').then(module => {
    console.log(module.default.random(1, 100));
  });
}, 5000);
```

上面代码中，通过异步方式导入了 `utils` 和 `lodash` 模块。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadWebpackPlugin = require("@vue/preload-webpack-plugin");

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
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

上面代码中，`rel: 'preload'` 表示对于所有通过异步方式导入的模块，使用 `<link rel='preload'>` 的形式导入。最终打包后的效果如下。

```html
<head>
  <!-- ... -->
  <link href="lodash.js" rel="preload" as="script"></link>
  <link href="utils.js" rel="preload" as="script"></link>
</head>
```

注意，`@vue/preload-webpack-plugin` [不支持](https://github.com/vuejs/preload-webpack-plugin/issues/22)为不同的模块，设置不同的导入策略。

[示例代码](/examples/webpack/demos/preload-prefetch/)

## 七、模块解析优化

模块解析优化是指通过配置webpack的 `resolve` 选项，优化模块的查找、定位和加载过程，从而提升构建性能和开发体验。webpack在打包过程中需要解析大量的模块依赖关系，合理的解析配置可以显著减少模块查找时间，避免重复解析，提高整体构建效率。

### 7.1 路径别名配置

路径别名是指为常用的模块路径创建简短的别名，避免使用冗长的相对路径。当 webpack 遇到别名时，会直接替换为对应的真实路径，跳过复杂的路径解析过程。通过配置路径别名，可以减少路径计算、提高查找效率以及增强代码可读性。

路径别名通过配置 `resolve.alias` 实现。

```javascript
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      // 使用函数动态生成别名
      '@': path.resolve(__dirname, 'src'),
      
      // 为特定文件创建别名
      'lodash': 'lodash-es',
      'moment': 'moment/min/moment.min.js',
      
      // 条件别名（根据环境配置）
      ...(process.env.NODE_ENV === 'development' && {
        'react': 'react/development',
      }),
      
      // 包级别的别名
      'package-name': path.resolve(__dirname, 'node_modules/package-name/src'),
      
      // 目录索引别名
      '@components': path.resolve(__dirname, 'src/components/index.js'),

      // 使用正则表达式进行更精确的匹配
      '^@/(.*)$': path.resolve(__dirname, 'src/$1'),

      // 支持函数形式的别名配置
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
      
      // 支持对象形式的详细配置
      '@components': {
        alias: path.resolve(__dirname, 'src/components'),
        onlyModule: true, // 只对模块请求生效
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

使用 `@` 作为根目录别名，这是业界常见做法，使用描述性的名称，如 `@components`、`@utils` 等。

也要避免创建过多的别名，这会增加 webpack 的解析开销。使用绝对路径而不是相对路径，提高解析效率。考虑使用`resolve.modules`配合别名使用。

### 7.2 文件扩展名配置

文件扩展名配置是指告诉 webpack 在导入模块时可以省略哪些文件扩展名。webpack 会按照配置的顺序依次尝试添加扩展名，直到找到匹配的文件。

文件扩展名通过配置 `resolve.extensions` 实现，可以按照使用频率、文件大小或者解析复杂度进行排序，靠前的扩展名会被优先解析。

```javascript
module.exports = {
  resolve: {
    extensions: [
      // 1. 只包含真正需要的扩展名，避免不必要的查找
      '.js', '.jsx', '.ts', '.tsx', '.json',
      
      // 2. 按照项目实际使用的文件类型配置
      ...(process.env.USE_TYPESCRIPT && ['.ts', '.tsx']),
      ...(process.env.USE_SCSS && ['.scss']),
      
      // 3. 避免包含需要特殊处理的文件类型
      // 不要包含 .css, .scss 等需要loader处理的文件
      
      // 4. 考虑文件大小和解析性能
      '.json', '.js', '.jsx', '.ts', '.tsx',
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

- 将最常用的扩展名放在前面
- 将编译后的文件扩展名放在前面（生产环境）
- 将源码文件扩展名放在前面（开发环境）
- 避免配置过多的扩展名，这会增加webpack的查找开销
- 根据项目实际使用的文件类型进行配置
- 考虑使用`resolve.mainFiles`配合扩展名使用
- 在生产环境中，优先使用编译后的文件扩展名

### 7.3 模块搜索路径优化（`resolve.modules`）

模块搜索路径优化是指配置 webpack 查找模块的目录路径。默认情况下，webpack 会在`node_modules` 目录中查找模块，但我们可以通过配置来优化搜索路径，提高模块查找效率。

- **减少搜索范围**：明确指定搜索路径，避免在无关目录中查找
- **提高查找速度**：优先搜索常用目录，减少查找时间
- **支持自定义模块**：将自定义模块目录添加到搜索路径中
- **优化缓存效果**：明确的路径配置有助于webpack的缓存优化

模块搜索路径优化通过 `resolve.modules` 配置项实现。

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  resolve: {
    modules: [
      // 1. 明确指定搜索顺序，避免歧义
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'src/components'),
      path.resolve(__dirname, 'src/utils'),
      'node_modules',
      
      // 2. 避免过多的搜索路径，影响性能
      // 建议控制在5-10个路径以内
      
      // 3. 使用绝对路径，避免相对路径的复杂性
      path.resolve(__dirname, 'src'),
      
      // 4. 考虑模块的依赖关系，合理排序
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

- 将最常用的路径放在前面，提高查找效率
- 避免配置过多的搜索路径，这会增加webpack的查找开销
- 使用绝对路径而不是相对路径，提高配置的可维护性
- 合理使用 `resolve.modules`，避免不必要的文件系统查找
- 考虑使用 `resolve.alias` 配合模块搜索路径使用
- 在生产环境中，优先使用编译后的目录
- 确保配置的搜索路径不会导致意外的模块被导入
- 避免将敏感目录添加到搜索路径中

### 7.4 外部依赖配置（`resolve.externals`）

外部依赖配置是指告诉 webpack 某些模块不需要打包，而是从外部获取。这些模块通常是通过 CDN 引入的第三方库，或者是宿主环境提供的全局变量。

- 减少打包体积：外部依赖不会被打包到 bundle 中。
- 提高构建速度：webpack 不需要处理外部依赖的模块。
- 利用 CDN 缓存：外部依赖可以通过 CDN 缓存，提高加载速度。
- 支持模块联邦：为微前端架构提供基础支持。

外部依赖配置通过 `resolve.externals` 实现。

```javascript
module.exports = {
  externals: {
    // 普通方式配置
    jquery: 'jQuery',
    
    // 对象形式配置
    lodash: {
      root: '_', // 全局变量名
      commonjs: 'lodash', // CommonJS模块名
      commonjs2: 'lodash', // CommonJS2模块名
      amd: 'lodash', // AMD模块名
    },

    // 函数形式配置
    function(context, request, callback) {
      // 检查请求的模块
      if (request === 'jquery') {
        // 返回外部依赖配置
        return callback(null, 'jQuery');
      }
      
      if (request === 'lodash') {
        return callback(null, '_');
      }
      
      if (request.startsWith('@angular/')) {
        // 将 Angular 相关模块配置为外部依赖
        const moduleName = request.replace('@angular/', 'ng.');
        return callback(null, moduleName);
      }
      
      // 不是外部依赖，继续正常处理
      callback();
    },
  },
};
```

```javascript
module.exports = {
  externals: [
    // 使用正则表达式匹配模块名
    /^jquery$/,
    /^lodash$/,
    /^react$/,
    /^react-dom$/,
    /^@angular\/.+$/,  // 匹配所有Angular模块
    /^@vue\/.+$/,      // 匹配所有Vue模块
  ],
  externalsType: 'umd', // 设置外部依赖的类型
};
```

- 对于简单的模块名映射，使用对象形式配置
- 对于复杂的匹配逻辑，使用函数形式配置
- 对于批量模块配置，使用正则表达式配置
- 将常用的第三方库配置为外部依赖
- 使用CDN加载外部依赖，提高加载速度
- 考虑使用HTTP/2的多路复用特性
- 确保外部依赖的CDN链接是安全的
- 考虑使用SRI（Subresource Integrity）验证外部依赖的完整性
- 在生产环境中，使用可靠的CDN服务商
- 确保外部依赖的版本与项目兼容
- 考虑不同环境下的兼容性问题
- 提供外部依赖加载失败的回退方案

## 代码兼容性处理

ES6 及其之后的诸多版本，引入了大量的新特性，比如 Promise 对象、async/await 语法、class 类的概念等。这些新语法的诞生，为 JavaScript 这门语言注入了新活力，也让开发变得轻松起来。然而，新的语法特性，也带来了新的挑战：浏览器对这些新语法的兼容性问题。特别是在一些低版本浏览器中，对新语法的兼容性并不友好，这时，就需要引入 polyfill，对新的语法特性做兼容性处理。[core-js](https://github.com/zloirock/core-js) 就是一个不错的选择。

`core-js` 是 JavaScript 标准库中最流行的 polyfill，为最新版本的 ES 及其提案提供了支持，包括从早期的 ES5 版本，到较新的技术（提案）比如，[iterator helpers](https://github.com/tc39/proposal-iterator-helpers)，和 `structuredClone` 等与 web 平台特性有关的方法。

### 手动导入

```javascript
// index.js
import 'core-js/actual/promise';

function runTask() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('Task done!');
    }, 1000);
  });
}

runTask().then((result) => {
  console.log(result);
})
```

上面代码中，使用了 ES6 新增的 Promise 对象，`'core-js/actual/promise'` 用于添加对 Promise 语法的支持。然后，执行打包操作。

```javascript
module.exports = {
  mode: 'production'
};
```

```text
asset main.js 34.6 KiB [emitted] [minimized] (name: main)
```

上面打包输出的 `main.js`，即使是不支持 Promise 语法的浏览器，也可以正常运行。

注意，在使用 `core-js` 之前，要先安装，并且要安装在 `dependencies` 下。

### 自动导入

除了手动导入，还可以借助 `@babel/preset-env`，它会自动添加项目中对 `core-js` 模块的依赖。

```json
// .babelrc
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage",
        "corejs": {
          "version": "3.44"
        }
      }
    ]
  ]
}
```

还需要在 `webpack.config.js` 中配置 `babel-loader`。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      },
    ],
  },
  mode: 'production'
};
```

注意，使用这种方式，要先执行下面的命令。

```bash
npm i -D babel-loader @babel/preset-env
```

[示例代码](/examples/webpack/demos/polyfill/)

## 渐进式 Web 应用

渐进式网络应用程序（progressive web application，简称：PWA），能够提供对应用的离线支持，使用户在离线情况下，也可以访问应用中的内容。

```javascript
// index.js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
    .register('/service-worker.js')
    .then(res => {
      console.log('Service worker 注册成功：', res);
    })
    .catch(error => {
      console.log('Service worker 注册失败：', error);
    });
  });
}

// webpack.config.js

const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new WorkboxPlugin.GenerateSW(),
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

[示例代码](/examples/webpack/demos/pwa/)

## 性能监控优化

## 其他优化措施

使用 `contenthash` 实现长期缓存。

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css',
    }),
  ],
};
```

## 参考

- [MDN](https://developer.mozilla.org/)
- [渐进式网络应用程序](https://zh.wikipedia.org/wiki/%E6%B8%90%E8%BF%9B%E5%BC%8F%E7%BD%91%E7%BB%9C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F)


# Webpack打包优化清单（按优先级排序）

## 一、核心性能优化（高优先级）

### 1. 代码分割优化
<!-- - 入口分割（多入口配置） -->
<!-- - 动态导入（import()按需加载） -->
- Vendor分离（第三方库独立打包）
<!-- - 公共模块提取（splitChunks配置） -->

### 2. 缓存优化
<!-- - 文件名哈希策略（contenthash、chunkhash、hash） -->
<!-- - 模块ID稳定性（moduleIds: 'deterministic'） -->
<!-- - Chunk ID稳定性（chunkIds: 'deterministic'） -->
<!-- - Runtime优化（runtimeChunk配置） -->

### 3. 代码压缩优化
<!-- - JavaScript代码压缩（terser-webpack-plugin） -->
<!-- - CSS代码压缩（css-minimizer-webpack-plugin） -->
<!-- - HTML代码压缩（html-webpack-plugin minify） -->
<!-- - Tree Shaking（删除无用代码） -->

## 二、资源优化（中高优先级）

### 4. 图片和媒体资源优化
<!-- - 图片压缩（image-minimizer-webpack-plugin） -->
- 图片格式优化（WebP、AVIF支持）
- 小图片内联（base64转换）
- 字体文件优化

### 5. 资源加载优化
<!-- - 资源预加载（preload） -->
<!-- - 资源预获取（prefetch） -->
- 关键资源内联
- 资源懒加载

### 6. 模块解析优化
<!-- - 路径别名配置（resolve.alias）
- 文件扩展名配置（resolve.extensions）
- 模块搜索路径优化（resolve.modules）
- 外部依赖配置（externals） -->

## 三、构建性能优化（中优先级）

### 7. 构建速度优化
- 多进程打包（thread-loader）
- 缓存配置（cache配置）
- 并行执行（parallel-webpack）
- 增量构建优化

### 8. 开发体验优化
<!-- - 热模块替换（HMR） -->
<!-- - 开发服务器优化（devServer配置） -->
- Source Map配置
<!-- - 错误提示优化 -->

## 四、高级优化（中低优先级）

### 9. 代码质量优化
- ESLint代码检查
- TypeScript类型检查
- 代码规范配置
- 依赖分析（webpack-bundle-analyzer）

### 10. 环境特定优化
- 环境变量配置（DefinePlugin）
- 条件编译
- 多环境配置
- 环境特定插件

## 五、特殊场景优化（低优先级）

### 11. 微前端优化
- 模块联邦配置
- 独立运行时
- 共享依赖管理
- 应用间通信优化

### 12. PWA和离线支持
- Service Worker配置
- 离线缓存策略
- Web App Manifest
- 推送通知支持

### 13. 国际化优化
- 多语言包分割
- 按需加载语言包
- 语言包压缩
- 动态语言切换

## 六、监控和分析（持续优化）

### 14. 性能监控
- 构建时间监控
- 包大小监控
- 加载性能分析
- 用户体验指标

### 15. 质量监控
- 代码覆盖率分析
- 依赖安全审计
- 性能回归检测
- 用户反馈收集

## 优化优先级说明

**高优先级（1-3）**: 直接影响用户体验，必须优先实施
**中高优先级（4-6）**: 显著提升性能，建议优先实施
**中优先级（7-8）**: 提升开发效率，在核心优化完成后实施
**中低优先级（9-10）**: 提升代码质量，在性能优化完成后实施
**低优先级（11-13）**: 特殊需求，根据项目具体情况决定
**持续优化（14-15）**: 建立监控体系，持续改进
