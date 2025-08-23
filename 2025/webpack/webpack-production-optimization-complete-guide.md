# webpack 生产环境代码优化完整指南

## 一、概述

webpack生产环境优化是一个系统工程，需要从多个维度进行优化。本文档将详细介绍所有可用的优化措施，帮助开发者构建高性能的生产环境应用。

## 二、代码压缩优化

### 2.1 JavaScript 代码压缩

#### 2.1.1 TerserPlugin 配置优化

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // 压缩选项
          compress: {
            // 删除未使用的变量和函数
            unused: true,
            // 删除死代码
            dead_code: true,
            // 删除console.log
            drop_console: true,
            // 删除debugger
            drop_debugger: true,
            // 删除注释
            comments: false,
            // 简化表达式
            collapse_vars: true,
            // 合并变量
            merge_vars: true,
            // 删除不可达代码
            passes: 2,
            // 优化条件表达式
            conditionals: true,
            // 优化布尔表达式
            booleans: true,
            // 优化循环
            loops: true,
            // 优化函数
            functions: true,
            // 优化对象属性
            properties: true,
            // 优化数组
            sequences: true,
            // 优化字符串
            strings: true,
            // 优化数字
            numbers: true,
            // 优化正则表达式
            regexp: true,
            // 优化全局变量
            global_defs: {
              '@alert': 'console.log'
            }
          },
          // 混淆选项
          mangle: {
            // 混淆变量名
            toplevel: true,
            // 混淆属性名
            properties: {
              regex: /^_/
            }
          },
          // 输出选项
          format: {
            // 删除注释
            comments: false,
            // 美化输出（开发时使用）
            beautify: false
          },
          // 并行处理
          parallel: true,
          // 缓存
          cache: true,
          // 源码映射
          sourceMap: false
        },
        // 提取许可证注释
        extractComments: false
      })
    ]
  }
};
```

#### 2.1.2 自定义压缩器

```javascript
// 使用 esbuild 压缩器（更快）
const { ESBuildMinifyPlugin } = require('esbuild-loader');

module.exports = {
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015',
        css: true
      })
    ]
  }
};
```

### 2.2 CSS 代码压缩

#### 2.2.1 CssMinimizerPlugin

```javascript
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              // 删除注释
              discardComments: { removeAll: true },
              // 删除空规则
              discardEmpty: true,
              // 合并重复规则
              mergeRules: true,
              // 优化选择器
              optimizeSelectors: true,
              // 删除未使用的规则
              removeEmpty: true,
              // 删除重复规则
              removeDuplicates: true,
              // 删除过时的浏览器前缀
              removeVendorPrefixes: true,
              // 优化字体权重
              normalizeWhitespace: true,
              // 优化颜色值
              colormin: true,
              // 优化长度值
              minifySelectors: true
            }
          ]
        }
      })
    ]
  }
};
```

#### 2.2.2 PurgeCSS 删除未使用的CSS

```javascript
const PurgeCSSPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');
const path = require('path');

module.exports = {
  plugins: [
    new PurgeCSSPlugin({
      paths: glob.sync(`${path.join(__dirname, 'src')}/**/*`, { nodir: true }),
      // 安全列表
      safelist: {
        standard: ['html', 'body'],
        deep: [/^ant-/],
        greedy: [/^ant-/]
      },
      // 默认提取器
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    })
  ]
};
```

### 2.3 HTML 代码压缩

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        // 删除注释
        removeComments: true,
        // 删除空白
        collapseWhitespace: true,
        // 删除属性引号
        removeAttributeQuotes: true,
        // 删除空属性
        removeEmptyAttributes: true,
        // 删除可选标签
        removeOptionalTags: true,
        // 删除冗余属性
        removeRedundantAttributes: true,
        // 删除脚本类型
        removeScriptTypeAttributes: true,
        // 删除样式类型
        removeStyleLinkTypeAttributes: true,
        // 使用短文档类型
        useShortDoctype: true,
        // 保持换行
        keepClosingSlash: true,
        // 最小化内联CSS
        minifyCSS: true,
        // 最小化内联JS
        minifyJS: true
      }
    })
  ]
};
```

## 三、Tree Shaking 优化

### 3.1 基础配置

```javascript
module.exports = {
  mode: 'production',
  optimization: {
    // 标记未使用的导出
    usedExports: true,
    // 假设模块没有副作用
    sideEffects: false,
    // 启用压缩
    minimize: true
  }
};
```

### 3.2 package.json 配置

```json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "*.less",
    "./src/polyfills.js",
    "./src/global-styles.js"
  ]
}
```

### 3.3 代码编写最佳实践

```javascript
// ✅ 推荐：具名导入导出
import { add, subtract } from './utils';
export function add(a, b) { return a + b; }

// ❌ 避免：默认导入导出
import utils from './utils';
export default { add, subtract };

// ❌ 避免：动态导入（除非必要）
import('./utils').then(module => { ... });

// ❌ 避免：副作用代码
console.log('Side effect');
window.foo = 'bar';

// ✅ 推荐：封装副作用代码
export function initSideEffects() {
  console.log('Side effect');
  window.foo = 'bar';
}

// ✅ 推荐：使用PURE注释
/*#__PURE__*/ console.log('This will be removed');
```

## 四、代码分割优化

### 4.1 多入口分割

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    admin: './src/admin.js',
    vendor: ['react', 'react-dom', 'lodash']
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        // 公共模块
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5
        }
      }
    }
  }
};
```

### 4.2 动态导入分割

```javascript
// 使用魔法注释优化动态导入
import(
  /* webpackChunkName: "lodash" */
  /* webpackPrefetch: true */
  /* webpackPreload: true */
  'lodash'
).then(module => {
  console.log(module.default);
});

// 路由级别的代码分割
const Home = lazy(() => import(
  /* webpackChunkName: "home" */
  './pages/Home'
));

const About = lazy(() => import(
  /* webpackChunkName: "about" */
  './pages/About'
));
```

### 4.3 高级分割配置

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      // 分割策略
      chunks: 'all',
      // 最小尺寸
      minSize: 20000,
      // 最大尺寸
      maxSize: 244000,
      // 最小chunk数
      minChunks: 1,
      // 最大异步请求数
      maxAsyncRequests: 30,
      // 最大初始请求数
      maxInitialRequests: 30,
      // 强制分割阈值
      enforceSizeThreshold: 50000,
      // 缓存组
      cacheGroups: {
        // React相关
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20
        },
        // UI库
        ui: {
          test: /[\\/]node_modules[\\/](antd|element-ui|material-ui)[\\/]/,
          name: 'ui',
          chunks: 'all',
          priority: 15
        },
        // 工具库
        utils: {
          test: /[\\/]node_modules[\\/](lodash|moment|dayjs)[\\/]/,
          name: 'utils',
          chunks: 'all',
          priority: 10
        },
        // 默认第三方库
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10,
          reuseExistingChunk: true
        },
        // 默认公共模块
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};
```

## 五、资源优化

### 5.1 图片压缩

```javascript
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: [
            // GIF压缩
            ['gifsicle', { interlaced: true }],
            // JPEG压缩
            ['mozjpeg', { quality: 80 }],
            // PNG压缩
            ['optipng', { optimizationLevel: 5 }],
            // SVG压缩
            [
              'svgo',
              {
                plugins: [
                  'preset-default',
                  'prefixIds',
                  {
                    name: 'sortAttrs',
                    params: {
                      xmlnsOrder: 'alphabetical'
                    }
                  }
                ]
              }
            ]
          ]
        }
      }
    })
  ]
};
```

### 5.2 字体优化

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
};
```

### 5.3 资源内联

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.svg$/,
        type: 'asset/inline',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024 // 4KB
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // 内联小图片
      inlineSource: '.(js|css)$'
    })
  ]
};
```

## 六、缓存优化

### 6.1 文件名哈希

```javascript
module.exports = {
  output: {
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    assetModuleFilename: '[name].[hash:8][ext]'
  }
};
```

### 6.2 模块标识符优化

```javascript
module.exports = {
  optimization: {
    // 模块标识符优化
    moduleIds: 'deterministic',
    // chunk标识符优化
    chunkIds: 'deterministic'
  }
};
```

### 6.3 运行时优化

```javascript
module.exports = {
  optimization: {
    // 提取运行时
    runtimeChunk: 'single',
    // 提取manifest
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

## 七、预加载/预获取优化

### 7.1 魔法注释

```javascript
// 预加载（高优先级）
import(
  /* webpackPreload: true */
  /* webpackChunkName: "critical" */
  './critical-module'
);

// 预获取（低优先级）
import(
  /* webpackPrefetch: true */
  /* webpackChunkName: "non-critical" */
  './non-critical-module'
);

// 预加载CSS
import(
  /* webpackPreload: true */
  /* webpackChunkName: "styles" */
  './styles.css'
);
```

### 7.2 PreloadWebpackPlugin

```javascript
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');

module.exports = {
  plugins: [
    new PreloadWebpackPlugin({
      rel: 'preload',
      as(entry) {
        if (/\.css$/.test(entry)) return 'style';
        if (/\.woff$/.test(entry)) return 'font';
        if (/\.png$/.test(entry)) return 'image';
        return 'script';
      },
      include: 'asyncChunks'
    })
  ]
};
```

## 八、模块解析优化

### 8.1 解析配置

```javascript
module.exports = {
  resolve: {
    // 解析扩展名
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    // 解析别名
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils')
    },
    // 解析模块
    modules: ['node_modules'],
    // 解析主文件
    mainFiles: ['index'],
    // 解析主字段
    mainFields: ['browser', 'module', 'main']
  }
};
```

### 8.2 外部依赖

```javascript
module.exports = {
  externals: {
    // CDN外部依赖
    'react': 'React',
    'react-dom': 'ReactDOM',
    'lodash': '_'
  }
};
```

## 九、性能监控优化

### 9.1 Bundle分析

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

### 9.2 性能提示

```javascript
module.exports = {
  performance: {
    // 性能提示阈值
    hints: 'warning',
    // 入口点大小限制
    maxEntrypointSize: 512000,
    // 资源大小限制
    maxAssetSize: 512000,
    // 忽略的资源
    assetFilter: function(assetFilename) {
      return !assetFilename.endsWith('.map');
    }
  }
};
```

## 十、环境特定优化

### 10.1 开发环境配置

```javascript
// webpack.dev.js
module.exports = {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  optimization: {
    usedExports: true,
    sideEffects: false,
    minimize: false
  },
  stats: {
    usedExports: true,
    providedExports: true,
    modules: true
  }
};
```

### 10.2 生产环境配置

```javascript
// webpack.prod.js
module.exports = {
  mode: 'production',
  devtool: false,
  optimization: {
    usedExports: true,
    sideEffects: false,
    minimize: true,
    splitChunks: {
      chunks: 'all'
    }
  },
  performance: {
    hints: 'warning'
  }
};
```

### 10.3 测试环境配置

```javascript
// webpack.test.js
module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  optimization: {
    usedExports: true,
    sideEffects: false,
    minimize: false
  }
};
```

## 十一、高级优化技巧

### 11.1 并行处理

```javascript
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: {
            parallel: true
          }
        }
      })
    ]
  }
};
```

### 11.2 缓存优化

```javascript
module.exports = {
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  }
};
```

### 11.3 模块联邦

```javascript
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app',
      remotes: {
        remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

## 十二、最佳实践总结

### 12.1 代码层面

1. **使用ES6模块语法**
2. **避免副作用代码**
3. **合理使用动态导入**
4. **优化导入路径**
5. **使用Tree Shaking友好的库**

### 12.2 配置层面

1. **启用所有压缩选项**
2. **合理配置代码分割**
3. **优化缓存策略**
4. **使用合适的devtool**
5. **配置性能监控**

### 12.3 资源层面

1. **压缩所有资源类型**
2. **使用CDN加速**
3. **优化图片格式**
4. **内联小资源**
5. **预加载关键资源**

### 12.4 监控层面

1. **定期分析bundle大小**
2. **监控加载性能**
3. **优化首屏加载**
4. **使用性能预算**
5. **持续优化**

## 十三、性能预算

```javascript
module.exports = {
  performance: {
    hints: 'error',
    maxEntrypointSize: 300000, // 300KB
    maxAssetSize: 250000, // 250KB
    assetFilter: function(assetFilename) {
      return !assetFilename.endsWith('.map');
    }
  }
};
```

## 十四、总结

webpack生产环境优化是一个持续的过程，需要从代码、配置、资源、缓存等多个维度进行优化。通过合理使用上述优化措施，可以显著提升应用的加载性能和用户体验。

关键要点：
1. **代码压缩**：使用TerserPlugin和CssMinimizerPlugin
2. **Tree Shaking**：移除未使用的代码
3. **代码分割**：按需加载，减少初始包大小
4. **资源优化**：压缩图片，优化字体
5. **缓存优化**：使用内容哈希，优化缓存策略
6. **预加载**：提前加载关键资源
7. **性能监控**：持续监控和优化

通过系统性地应用这些优化措施，可以构建出高性能的生产环境应用。 