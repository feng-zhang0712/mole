import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  name: 'client',
  target: 'web',
  mode: isDevelopment ? 'development' : 'production',
  
  entry: {
    client: './src/client.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist/public'),
    filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
    chunkFilename: isDevelopment ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
    publicPath: '/static/',
    clean: true
  },
  
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: false, // 我们会手动注入，因为SSR需要自定义HTML
      minify: !isDevelopment
    }),
    
    ...(isDevelopment ? [] : [
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[contenthash].chunk.css'
      })
    ])
  ],
  
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          minChunks: 2,
          chunks: 'all',
          name: 'common',
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  },
  
  devtool: isDevelopment ? 'eval-source-map' : 'source-map'
};