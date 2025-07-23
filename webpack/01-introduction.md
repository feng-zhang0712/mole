# 介绍

webpack 是一个用于现代 JavaScript 应用程序的静态模块打包工具。当 webpack 处理应用程序时，会在内部从一个或多个入口点构建一个 [依赖图](https://webpack.docschina.org/concepts/dependency-graph/)，然后将项目中所需的每一个模块组合成一个或多个 bundles，它们均为静态资源。

默认情况下，在开发环境中，webpack 只支持编译 **ESM** 语法；而在生产环境中，webpack 除了支持编译 ESM 语法外，还会**压错 JavaScript 代码**。
