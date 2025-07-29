# webpack 生产环境优化

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

## 预加载/预获取

使用预加载（Preload）或者预获取（Prefetch），可以在不阻塞浏览器渲染的前提下，提前下载某些资源，以确保他们尽早可用。

- `preload`：表示当前页面很快会用到的资源，优先级比 `prefetch` 高。
- `prefetch`：表示下次导航时可能会用到的资源，浏览器会在空闲时下载对应的资源，优先级较低。

此外，页面关闭后，`preload` 标记的资源会停止下载，而 `prefetch` 标记的资源会继续下载。

注意，不管是 `preload` 还是 `prefetch`，他们都只会提前下载资源，并不会执行。

webpack 中配置 `preload` 和 `prefetch` 有两种方式，使用魔法注释或者 `preload-webpack-plugin`。

下面分别进行介绍。

### 使用魔法注释

### 使用 `preload-webpack-plugin`


<!-- - webpack/nodejs 更新到最新版
- 配置 Loader 时，设置 oneOf/include/exclude
- 配置 `resolve` 选项，优化解析性能，
  - 比如 `modules` `extensions` `mainFiles` `descriptionFiles`
  - 如果不使用 systemlinks，设置 `symlinks: false`
- 使用体积更小的 library
- 配置 splitChunks
- 移除未引用的代码
- HMR
- 配置 `cache`，持久化缓存
- 优化自定的 Loader/Plugin -->
<!-- - 使用 DllPlugin 为梗概不频繁的代码，生成单独的编译结果 -->

<!-- - 开启 Source Map
- 开启 Tree Shaking（删除无用代码，webpack5 默认开启）
- 代码分割：配置 entry/splitChunks/import() 动态导入
  - 提取公共模块：如果项目中有多个入口，而多个入口有引用了相同的模块，如果不做代码分割，被引用的模块会被打包打包到每个 bundle 中，这时，就可以使用 Splitting 功能来将这些公共模块提取出来，打包成一个单独的文件，从而减少每个 bundle 的体积。
  - 按需加载/动态导入 `import()`，如果需要还可以采用魔法注释形式，比如 preload/prefetch
- oneOf/include/exclude
- 压缩图片：如果项目中使用了大量图片，对其进行压缩可以减小打包后的体积。 [image-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/image-minimizer-webpack-plugin)
- @babel/plugin-transform-runtime 辅助代码
- 使用 core-js 对 javascript 进行兼容性处理
- network cache
- 开启 PWA（须安装 workbox-webpack-plugin 及其他配置，参考 https://webpack.docschina.org/guides/progressive-web-application/#adding-workbox）
- 压缩 css 代码：`css-minimizer-webpack-plugin`
- 压缩 js 代码（默认会压缩，但如果使用了 `css-minimizer-webpack-plugin`，要单独配置这个插件所能压缩 js）：`terser-webpack-plugin`
- ESLint 代码检查（eslint、eslint-loader）
- `autoprefixer` + `postcss-loader`：配置低版本浏览器/特定内核浏览器 css 语法支持，要配置 `browserslist` 选项
- 配置 optimization -->



## 参考

- [MDN](https://developer.mozilla.org/)
