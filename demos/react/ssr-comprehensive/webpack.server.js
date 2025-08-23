import path from 'path';
import { fileURLToPath } from 'url';
import nodeExternals from 'webpack-node-externals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDevelopment = process.env.NODE_ENV !== 'production';

export default {
  name: 'server',
  target: 'node',
  mode: isDevelopment ? 'development' : 'production',
  
  entry: './server/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: false, // 不清理，避免删除客户端构建文件
    module: true
  },
  
  experiments: {
    outputModule: true
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
              ['@babel/preset-env', { 
                targets: { node: 'current' },
                modules: false // 保持ES模块
              }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.css$/,
        loader: 'ignore-loader' // 服务端忽略CSS
      }
    ]
  },
  
  // 排除node_modules中的模块，避免打包到服务端代码中
  externals: [
    nodeExternals({
      allowlist: [/\.css$/] // 允许CSS文件被处理
    })
  ],
  
  devtool: isDevelopment ? 'eval-source-map' : 'source-map'
};