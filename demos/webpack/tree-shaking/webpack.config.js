const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  optimization: {
    usedExports: true, // 告诉 webpack 是否启用标记，以标记哪些导出被使用了，哪些没有被使用。
    sideEffects: false, // 告诉 webpack 是否假设所有模块都没有副作用，可以在 `package.json` 文件中，使用 `sideEffects` 进行更详细的配置。后者优先级更高。
    minimize: true, // 是否开启压缩。生产环境下，默认为 `true`，其他环境下为 `false`。设置为 `true` 时，Tree Shaking 才会生效。
    // minimizer: [
    //   new TerserPlugin({
    //     terserOptions: {
    //       mangle: false,         // 不混淆变量名，便于观察
    //       compress: {
    //         unused: true,        // 删除未使用的变量和函数
    //         dead_code: true,     // 删除死代码
    //         drop_console: true,  // 删除 console.log
    //       },
    //     },
    //   }),
    // ],
  },
  // 显示详细的打包信息
  stats: {
    usedExports: true,
    providedExports: true,
    modules: true,
  },
}
