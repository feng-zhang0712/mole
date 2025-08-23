const path = require('path');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'assets/[hash][ext][query]',
    clean: true
  },
  module: {
    rules: [
      // 图片资源
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        oneOf: [
          {
            resourceQuery: /inline/, // import xxx from './xx.png?inline'
            type: 'asset/inline'
          },
          {
            resourceQuery: /resource/, // import xxx from './xx.png?resource'
            type: 'asset/resource',
            generator: {
              filename: 'images/[hash][ext][query]'
            }
          },
          {
            type: 'asset',
            parser: {
              dataUrlCondition: {
                maxSize: 4 * 1024
              }
            },
            generator: {
              filename: 'images/[hash][ext][query]'
            }
          }
        ]
      },
      // SVG资源
      {
        test: /\.svg$/i,
        type: 'asset/source',
        generator: {
          dataUrl: content => {
            content = content.toString();
            return svgToMiniDataURI(content);
          }
        }
      },
      // 字体资源
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      },
      // 文本资源
      {
        test: /\.txt$/i,
        type: 'asset/source'
      }
    ]
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 250 * 1024,
    maxEntrypointSize: 250 * 1024
  }
};
