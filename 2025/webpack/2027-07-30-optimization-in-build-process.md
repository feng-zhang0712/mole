# webpack 打包构建优化

模块热替换（HMR - hot module replacement）功能会在应用程序运行过程中，**替换、添加或删除模块，而无需重新加载整个页面**。也就是只更新页面中发生变化的部分。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面期间丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 在源代码中 CSS/JS 产生修改时，会立刻在浏览器中进行更新，这几乎相当于在浏览器 devtools 直接更改样式。
- oneOf/include/exclude
- ESLint、Babel 优化：设置 ESLint 和 Babel 的缓存功能，以及减少 Babel 打包后的文件体积。
- THread 多进程打包
- 配置 `optimization.runtimeChunk` 防止打包时文件缓存失效
- `splitChunks.cacheGroups` [配置第三方包缓存](https://www.bilibili.com/video/BV1YU4y1g745?spm_id_from=333.788.player.switch&vd_source=972e1c11a19c33d1b6cd18095c2b40b9&p=48)
- 搭建开发服务器

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