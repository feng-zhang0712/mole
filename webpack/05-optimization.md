# 优化

## 一、生产环境

- 开启 Source Map
- 开启 Tree Shaking
- 代码分割：配置 entry/splitChunks/import() 动态导入
  - 提取公共模块：如果项目中有多个入口，而多个入口有引用了相同的模块，如果不做代码分割，被引用的模块会被打包打包到每个 bundle 中，这时，就可以使用 Splitting 功能来将这些公共模块提取出来，打包成一个单独的文件，从而减少每个 bundle 的体积。
  - 按需加载/动态导入 `import()`，如果需要还可以采用魔法注释形式，比如 preload/prefetch
- oneOf/include/exclude
- 压缩图片：如果项目中使用了大量图片，对其进行压缩可以减小打包后的体积。 [image-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/image-minimizer-webpack-plugin)
- @babel/plugin-transform-runtime 辅助代码
- 使用 core-js 对 javascript 进行兼容性处理
- network cache
- 开启 PWA
- 压缩 css 代码：`css-minimizer-webpack-plugin`
- 压缩 js 代码（默认会压缩，但如果使用了 `css-minimizer-webpack-plugin`，要单独配置这个插件所能压缩 js）：`terser-webpack-plugin`

## 二、打包构建

模块热替换（HMR - hot module replacement）功能会在应用程序运行过程中，**替换、添加或删除模块，而无需重新加载整个页面**。也就是只更新页面中发生变化的部分。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面期间丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 在源代码中 CSS/JS 产生修改时，会立刻在浏览器中进行更新，这几乎相当于在浏览器 devtools 直接更改样式。

要开启 HMR 功能，只需要在 `devServer` 选项中设置 `hot: true`。

```javascript
module.exports = {
  devServer: {
    hot: true // HMR 默认开启
  }
};
```

要在 `.js` 文件中启用 HMR 功能，需要在入口文件中添加以下代码。

```javascript
if (module.hot) {
  module.hot.accept('./library.js', function () {
    // 对更新过的 library 模块做些事情...
  });
}

// or
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./library.js', function () {
    // Do something with the updated library module…
  });
}
```

[Hot Module Replacement](https://webpack.docschina.org/api/hot-module-replacement)

注意，HMR 功能只在开发模式下有效。

<!-- - HMR（热模块替换） -->
- oneOf/include/exclude
- ESLint、Babel 优化：设置 ESLint 和 Babel 的缓存功能，以及减少 Babel 打包后的文件体积。
- THread 多进程打包
- 配置 `optimization.runtimeChunk` 防止打包时文件缓存失效
- `splitChunks.cacheGroups` 配置第三方包缓存（https://www.bilibili.com/video/BV1YU4y1g745?spm_id_from=333.788.player.switch&vd_source=972e1c11a19c33d1b6cd18095c2b40b9&p=48）
- 搭建开发服务器

  在开发模式下，通过配置 [devServer](https://webpack.docschina.org/configuration/dev-server/) 选项，能够快速搭建一个本地开发服务器，从而实现页面的热更新。这依赖于 [webpack-dev-server](https://github.com/webpack/webpack-dev-server) 插件。

  ```javascript
  const path = require("path");

  module.exports = {
    devServer: {
      static: {
        directory: path.resolve(__dirname),
      },
      host: 'localhost',
      port: 8080
    },
    mode: "development"
  };
  ```

上面的代码中，`static.directory` 指定了静态资源的目录，并且配置了服务器的主机名和端口号。之后使用 `npx webpack server` 命令启动服务器。当访问 `http://localhost:8080` 时，就会显示当前目录下 `index.html` 文件的内容。如果以后对项目中文件作了修改，都不用再重新打包，dev server 服务器会自动检测到文件的变化，并刷新浏览器页面。

注意，配置了 `devServer` 选项后，打包后的资源会被保存在内存中，而不是之前配置的 `output.path` 目录下。另外，生产模式下，无需配置 `devServer` 选项。
