const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'Webpack HTML Optimization Demo',
      files: {
        css: [ "styles.css" ],
        chunks: [],
      },
      minify: {
        collapseWhitespace: true, // 移除空白符
        removeComments: true, // 移除HTML注释
        keepClosingSlash: false, // 移除自闭合标签的斜杠
        removeRedundantAttributes: true, // 移除冗余属性
        removeScriptTypeAttributes: true, // 移除script的type属性
        removeStyleLinkTypeAttributes: true, // 移除style和link的type属性
        useShortDoctype: true, // 使用短文档类型
      },
      inject: true,
      hash: true,
    }),
  ]
};
