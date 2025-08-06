const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: { clean: true },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Webpack HTML Optimization Demo',
      hash: true,
      minify: {
        // 默认值
        collapseWhitespace: true, // 移除空白符
        removeComments: true, // 移除HTML注释
        keepClosingSlash: false, // 移除自闭合标签的斜杠
        removeRedundantAttributes: true, // 移除冗余属性
        removeScriptTypeAttributes: true, // 移除script的type属性
        removeStyleLinkTypeAttributes: true, // 移除style和link的type属性
        useShortDoctype: true, // 使用短文档类型

        // 配置其他选项
        minifyJS: true, // 压缩内联 JavaScript。
        minifyCSS: true, // 压缩内联 CSS。
        minifyURLs: true, // 压缩 URL。
        removeEmptyElements: true, //  移除空属性。
        removeEmptyAttributes: true, // 移除空元素。
        collapseBooleanAttributes: true, // 压缩布尔属性。
      },
    }),
  ]
};
