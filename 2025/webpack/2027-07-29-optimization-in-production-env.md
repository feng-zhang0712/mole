# webpack 生产环境优化

## 减少代码体积

### 摇树优化

## 代码分割

默认情况下，webpack 将脚本代码打包到一个文件中，这就导致，浏览器加载某个页面时，整个 bundle 文件都会被加载进内存。

代码分割（code splitting）能够将代码打包到多个 bundle 中，从而实现**按需加载**和**并行加载**。合理使用代码分割，能够缩短代码加载时间。

代码分割有三种实现方式：多入口、提取重复代码以及按需加载。

下面分别进行介绍。

### 多入口

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

[示例代码](/examples/webpack/01/)

### 配置 `splitChunks`

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

[示例代码](/examples/webpack/02/)

### 按需加载，动态导入

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

[示例代码](/examples/webpack/03/)

## 预加载/预获取

使用预加载（Preload）或者预获取（Prefetch），可以在不阻塞浏览器渲染的前提下，提前下载某些资源，以确保他们尽早可用。

- `preload`：表示当前页面很快会用到的资源，优先级比 `prefetch` 高。页面关闭后，`preload` 标记的资源会停止下载
- `prefetch`：表示下次导航时可能会用到的资源，浏览器会在空闲时下载对应的资源，优先级较低。面关闭后，`prefetch` 标记的资源会继续下载。

注意，不管是 `preload` 还是 `prefetch`，他们都只会提前下载资源，并不会执行。

webpack 中配置 `preload` 和 `prefetch` 有两种方式，使用魔法注释或者使用 `preload-webpack-plugin` 插件。下面分别进行介绍。

### 使用魔法注释

### 使用 `@vue/preload-webpack-plugin`

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

[示例代码](/examples/webpack/04/)

## JavaScript Polyfill

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

[示例代码](/examples/webpack/05/)

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

[示例代码](/examples/webpack/06/)

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

## 参考

- [MDN](https://developer.mozilla.org/)
- [渐进式网络应用程序](https://zh.wikipedia.org/wiki/%E6%B8%90%E8%BF%9B%E5%BC%8F%E7%BD%91%E7%BB%9C%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F)
