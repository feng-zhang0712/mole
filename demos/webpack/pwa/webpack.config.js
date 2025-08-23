const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new WorkboxPlugin.GenerateSW({
      swDest: 'sw.js', // 限制 Service Worker 的作用域
      include: [/\.js$/, /\.css$/, /\.html$/], // 只缓存当前项目的资源
      exclude: [/\/react\//, /\/webpack\/(?!pwa)/], // 排除其他项目的路径
      // 设置缓存策略
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/haileyjaderyan\.com/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'external-images',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30天
            },
          },
        },
      ],
    }),
  ],
};
