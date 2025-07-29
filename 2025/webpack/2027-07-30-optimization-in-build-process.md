# webpack 打包构建优化

模块热替换（HMR - hot module replacement）功能会在应用程序运行过程中，**替换、添加或删除模块，而无需重新加载整个页面**。也就是只更新页面中发生变化的部分。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面期间丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 在源代码中 CSS/JS 产生修改时，会立刻在浏览器中进行更新，这几乎相当于在浏览器 devtools 直接更改样式。
- oneOf/include/exclude
- ESLint、Babel 优化：设置 ESLint 和 Babel 的缓存功能，以及减少 Babel 打包后的文件体积。
- THread 多进程打包
- 配置 `optimization.runtimeChunk` 防止打包时文件缓存失效
- `splitChunks.cacheGroups` 配置第三方包缓存（https://www.bilibili.com/video/BV1YU4y1g745?spm_id_from=333.788.player.switch&vd_source=972e1c11a19c33d1b6cd18095c2b40b9&p=48
- 搭建开发服务器
