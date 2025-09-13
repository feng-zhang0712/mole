const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    // 入口文件配置
    entry: {
      main: './src/index.js',
    },
    // 输出配置
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash:8].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash:8].chunk.js' : '[name].chunk.js',
      clean: true, // 清理输出目录
      publicPath: '/',
    },
    // 模块解析配置
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@i18n': path.resolve(__dirname, 'src/i18n'),
      },
    },
    // 模块处理规则
    module: {
      rules: [
        // JavaScript/JSX 文件处理
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead'],
                  },
                  modules: false, // 保持ES6模块语法
                }],
                ['@babel/preset-react', {
                  runtime: 'automatic', // 使用新的JSX转换
                }],
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
              ],
            },
          },
        },
        // CSS 文件处理
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  auto: true, // 自动检测CSS模块
                  localIdentName: isProduction
                    ? '[hash:base64:8]'
                    : '[name]__[local]--[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    ['autoprefixer', {
                      overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'],
                    }],
                  ],
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
      }),
      // 静态资源复制插件
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/index.html'], // 忽略HTML文件，由HtmlWebpackPlugin处理
            },
          },
        ],
      }),
    ],
    // 开发服务器配置
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true
    },
    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',
  };
};
