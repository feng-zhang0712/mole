# 配置

## 一、`context`

## 二、`entry`

`entry` 属性不仅指定了 webpack 打包的入口，在多入口写法中与 `dependOn` 属性配合使用，也可以做到代码分割的效果，不过这种方式是一种简单的代码分割，更多的是使用 `splitChunks` 属性以及 `import()` 动态导入。

### 2.1 `import`

指定启动时需加载的模块。

### 2.2 `filename`

指定 webpack 打包的入口。

### 2.3 `dependOn`

当前入口所依赖的入口。它们必须在该入口被加载前被加载。`dependOn` 不能是循环引用的，否则会抛出错误。

### 2.4 `library`

为当前 entry 构建一个 library。

### 2.5 `publicPath`

当该入口的输出文件在浏览器中被引用时，为它们指定一个公共 URL 地址。

### 2.6 `runtime`

运行时 chunk 的名字。此属性会创建一个新的运行时 chunk。在 webpack 5.43.0 之后可将其设为 `false` 以避免一个新的运行时 chunk。注意，`runtime` 不能指向已存在的入口名称，且 `runtime` 和 `dependOn` 不能在同一个入口上同时使用，否则会抛出错误。

## 三、`output`（输出）

### 3.1 `path`

一个绝对路径，指定打包后文件的输出目录。

### 3.2 `filename`

指定输出的 bundle 名称，这些 bundle 将写入到 `path` 属性指定的目录下。对于单个入口起点，`filename` 可以是一个静态名称；对于多入口起点，须使用占位符，指定每个 bundle 的唯一名称。下面列出了几个常用的占位符。

- `[name]`：入口名称。比如 `filename: '[name].bundle.js'`
- `[id]`：内部 chunk id。比如 `'[id].bundle.js'`
- `[contenthash]`：由生成的内容产生的 hash。比如 `[contenthash].bundle.js`
- 结合多个替换组合。比如 `[name].[contenthash].bundle.js`
- 使用函数返回 `filename`。比如 `filename: (pathData) => pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js'`

注意，此选项不会影响那些「按需加载 chunk」的输出文件。它只影响最初加载的输出文件。对于按需加载的 chunk 文件，应使用 [output.chunkFilename](https://webpack.docschina.org/configuration/output/#outputchunkfilename) 选项来控制输出。通过 loader 创建的文件也不受影响。

此外，虽然此选项被称为文件名，但是可以使用像 `'js/[name]/bundle.js'` 这样的文件夹结构。

### 3.3 `assetModuleFilename`

用于指定资源模块处理后的文件的输出目录和文件名，这是一个全局属性，优先级低于 [`module.rules.generator`](#9modulerulesgenerator)。

```javascript
module.exports = {
  output: {
   assetModuleFilename: 'media/[hash][ext][query]'
  },
};
```

上面代码中，资源模块处理后的文件，会输出为 `'media/[hash][ext][query]'`。

注意，`assetModuleFilename` 只适用于（资源模块） `type: 'asset'` 和 `type: 'asset/resource'` 类型。

### 3.4 `chunkFilename`

用于指定打包输出的其他 chunk（如动态加载的模块）文件的名称。比如，此属性可以配置 webpack 的魔法注释一起使用。

此属性默认值为 `'[id].js'`，或从 `output.filename` 中推导。适合代码分割场景，确保每个 chunk 有唯一的文件名，例如 `'[name].chunk.js'`。

```javascript
module.exports = {
  output: {
    chunkFilename: '[name].chunk.js',
  },
};
```

### 3.5 `publicPath`

指定指定输出文件的公共路径，用于浏览器中引用资源（如动态加载的 chunk）。

```javascript
module.exports = {
  output: {
    publicPath: 'https://cdn.example.com/assets/',
  },
};
```

上面代码中，资源会从该 `'https://cdn.example.com/assets/'` 加载，适合 CDN 部署。

### 3.6 `clean`

用于在每次重新打包之前，清空输出目录。

### 3.7 其他配置项

- `library`：用于配置导出的库名称，用于将打包文件作为库供其他脚本使用。
- `libraryTarget`：指定库的暴露方式，支持多种模块系统。比如：`'var' | 'module' | 'commonjs' | 'commonjs2' | 'amd' | 'umd' | ...`。
- `libraryExport`：指定库中哪个导出应该暴露。
- `hashFunction`：指定生成哈希的算法。比如 `'sha256'`。
- `hashDigest`：指定哈希的编码格式。比如，设置为 `'base64'` 会生成 base64 编码的哈希。默认值为 `'hex'`。
- `hashSalt`：指定哈希的盐值，用于增加哈希的唯一性。
- `pathinfo`：在 bundle 中添加关于模块的注释信息，方便调试。
- `devtoolModuleFilenameTemplate`：自定义源码映射（source map）中模块的名称。
- `devtoolNamespace`：指定源码映射的命名空间。
- `module`：将 JavaScript 文件输出为 ES 模块（实验性功能）。
- `crossOriginLoading`：启用跨域加载 chunk。
- `hotUpdateChunkFilename`：定义热更新 chunk 的文件名。
- `hotUpdateMainFilename`：定义热更新主文件的名称。
- `charset`：在 HTML `<script>` 标签中添加 `charset="utf-8"`。
- `iife`：为生成的代码添加 IIFE（立即执行函数表达式）包装器。
- `trustedTypes`：指定 Trusted Types 策略名称，用于安全地处理内联代码。

## 四、`module`

### 4.1 `module.rules`

#### 4.1.1 `module.rules.test`

#### 4.1.2 `module.rules.loader`

#### 4.1.3 `module.rules.use`

`use` 属性用于指定使用哪个 loader 对匹配到的文件进行处理，它可以使用字符串形式，指定单个 loader，或者使用数组，指定多个 loader。如果 `use` 属性指定的是多个 loader，那么它们会被链式调用，且按照**从右到左**、**从下往上**的顺序执行。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
};
```

上面的代码表示，每当匹配到 `.css` 结尾的文件时，首先使用 `sass-loader` 处理，之后将处理后的结果交给 `css-loader` 处理，最后，再将处理结果交给 `style-loader` 处理。

`use` 属性中除了直接指定 loader 的名称，还可以指定一个配置对象，用来传递额外的选项。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
};
```

#### 4.1.4 `module.rules.type`

#### 4.1.5 `module.rules.include`

`include` 用于指定匹配所生效的模块或目录。该属性对应的值可以是四种类型。

- 字符串：目录或文件绝对路径，表示匹配输入必须以提供的字符串开始。
- 数组：至少一个匹配条件。
- 正则表达式：`test` 输入值。
- 函数：调用输入的函数，必须返回一个 `true` 以匹配。
- 对象：匹配所有属性。每个属性都有一个定义行为。

#### 4.1.6 `module.rules.exclude`

`exclude` 用于排除所有符合条件的模块或目录。该属性使用方式与 `module.rules.include` 一样。

注意，`include` 或者 `exclude` 不能同时使用，否则会报错。

#### 4.1.7 `module.rules.oneOf`

`oneOf` 用于匹配数组中，第一个满足条件的规则。

#### 4.1.8 `module.rules.parse`

`parse` 属性用于控制资源的解析行为。其默认配置如下。

```javascript
module.exports = {
  module: {
    rules: [
      {
        parser: {
          amd: false, // 禁用 AMD
          commonjs: false, // 禁用 CommonJS
          system: false, // 禁用 SystemJS
          harmony: false, // 禁用 ES2015 Harmony import/export
          requireInclude: false, // 禁用 require.include
          requireEnsure: false, // 禁用 require.ensure
          requireContext: false, // 禁用 require.context
          browserify: false, // 禁用特殊处理的 browserify bundle
          requireJs: false, // 禁用 requirejs.*
          node: false, // 禁用 __dirname, __filename, module, require.extensions, require.main, 等。
          commonjsMagicComments: false, // 禁用对 CommonJS 的  magic comments 支持
          node: {}, // 在模块级别(module level)上重新配置 node 层(layer)
          worker: ['default from web-worker', '...'], // 自定义 WebWorker 对 JavaScript 的处理，其中 "..." 为默认值。
        },
      },
    ],
  },
};
```

这些属性中，经常使用的一项是 `parser.dataUrlCondition`（上面没有列出），`dataUrlCondition` 属性用于指定解析对应的资源时，在转为 data URI 和将文件输出到指定目录之间的阈值。这个属性经常跟 `type: asset` 或者 `type: 'asset/resource'` 一起冲用。

`dataUrlCondition` 可以是一个对象，此时只有一个 `maxSize` 属性，也可以是一个函数。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png)$/,
        type: 'asset/resources',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
    ],
  },
};
```

上面的代码表示，当模块中导入 png 格式的图片时，如果图片大小小于 4kb，则将其转为 Base64 格式，否则，将其输出的到指定的目录。

```javascript
module.exports = {
  module: {
    rules: [
      {
        parser: {
          dataUrlCondition: (source, { filename, module }) => {
            const content = source.toString();
            return content.includes('some marker');
          },
        },
      },
    ],
  },
};
```

上面是一个使用 `dataUrlCondition` 函数的例子。

#### 4.1.9 `module.rules.generator`

`generator` 属性用于自定义资源模块（如图片、字体）的生成方式，适用于（资源模块） `type: 'asset'` 和 `type: 'asset/resource'` 类型。包含五个属性。

（1） `dataUrl`

`dataUrl` 用于配置资源模块是否内联为 data URL（即直接嵌入到 JavaScript 或 CSS 文件中），而不是生成独立文件。它的值是一个对象或者函数。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: 'asset/inline',
        generator: {
          dataUrl: {
            encoding: 'base64',
            mimetype: 'image/png',
          },
        },
      },
    ],
  },
};
```

或者使用函数形式。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        type: 'asset/inline',
        generator: {
          dataUrl: (content, { filename, module }) => {
            return `data:image/png;base64,${content.toString('base64')}`;
          },
        },
      },
    ],
  },
};
```

（2） `emit`

`emit` 控制是否将资源模块的资源文件输出到指定目录。

这是一个布尔值属性，默认值为 `true`，表示会生成资产文件；设置为 `false` 时，webpack 不会生成这些文件，但仍会记录资产的路径，适合某些特殊场景。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.png$/i,
        type: 'asset/resource',
        generator: {
          emit: false,
        },
      },
    ],
  },
};
```

上面代码中，PNG 文件不会被写入输出目录，但其路径仍可通过其他方式引用。

（3） `filename`

`filename` 用于指定特定资源模块文件的输出目录和文件名，它的值可以是一个字符串或者函数。`filename` 的优先级，要高于全局配置 `output.assetModuleFilename`。

```javascript
module.exports = {
  output: {
    assetModuleFilename: 'images/[hash][ext][query]',
  },
  module: {
    rules: [
      {
        test: /\.png/,
        type: 'asset/resource',
      },
      {
        test: /\.html/,
        type: 'asset/resource',
        generator: {
          filename: 'static/[hash][ext]',
        },
      },
    ],
  },
};
```

上面代码中，HTML 文件的文件名模式被定义为 `'static/[hash][ext]'`，而其他资产使用全局配置。

（4） `publicPath`

`publicPath` 用于指定特定资源模块加载时的公共路径。`publicPath` 的优先级高于全局配置 `output.publicPath`。

```javascript
module.exports = {
  output: {
    publicPath: 'static/',
  },
  module: {
    rules: [
      {
        test: /\.png$/i,
        type: 'asset/resource',
        generator: {
          publicPath: 'assets/',
        },
      },
    ],
  },
};
```

上面代码中，PNG 文件会从 `'assets/'` 目录加载，而其他类型资源则从全局公共路径 `'static/'` 加载。

（5） `outputPath`

`outputPath` 用于指定资产模块的输出目录，当 `publicPath` 与文件夹结构匹配时，`outputPath` 可以调整资源在服务器上的实际存储位置。优先级高于全局配置 `output.path`。

```javascript
module.exports = {
  output: {
    publicPath: 'static/',
  },
  module: {
    rules: [
      {
        test: /\.png$/i,
        type: 'asset/resource',
        generator: {
          publicPath: 'https://cdn.example.com/assets/',
          outputPath: 'cdn-assets/',
        },
      },
    ],
  },
};
```

上面代码中，PNG 文件的公共路径为 `'https://cdn.example.com/assets/'`，而在服务器上输出到 `'cdn-assets/'` 目录。

#### 4.1.10 `module.rules.sideEffects`

#### 4.1.11 `module.rules.enforce`

`enforce` 属性用于配置 loader 类型，可能的值为 `pre` 或者 `post`。

其中，`pre` 优先级要高于 `post`，如果没有配置此属性，则默认为 normal loader。关于 webpack 中 loader 的优先级，可以参考 [Loader](#23-loader) 部分。

## 五、`plugins`（插件）

## 六、`mode`（模式）

`mode` 用于指定 webpack 运行的环境，它有三个可选值。

- `development`：开发环境，项目开发阶段所使用的配置。会启用一些有助于开发的功能，比如代码调试、热更新等。
- `production`：生产环境，项目打包时使用的配置。会启用一些有助于代码优化的功能，比如代码压缩、去除无用代码等。
- `none`：不启用任何优化功能，一般不会使用此配置。

```javascript
module.exports = {
  mode: 'development',
};
```

注意，webpack 必须指定一种运行环境，否则会报错。

## 七、`resolve`

### 7.1 `resolve.extensions`

`extensions` 用于指定 webpack 解析文件时，应该匹配的模块的扩展名。webpack 会加载数组中指定的，第一个匹配到的对应扩展名的文件。

```javascript
// index.js
import myModule form './my-module';

// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', 'jsx', '.json'],
  },
};
```

上面代码中，在 `index.js` 中导入了 `./my-module` 模块，此时，webpack 会按顺序自动匹配 `my-module.ts`、`my-module.ts` 和 `my-module.ts` 模块是否存在，哪个先被匹配到，就会解析哪个模块。

此外，为了不覆盖 webpack 的默认扩展，建议使用下面的方式来配置。

```javascript
module.exports = {
  resolve: {
    extensions: ['.ts', '...'],
  },
};
```

上面代码中，`'...'` 表示默认扩展名。

配置了 `extensions` 选项后，导入模块时就不用带扩展名了。

## 八、`optimization`

### 8.1 `optimization.splitChunks`

`splitChunks` 用于指定代码分割（Code Splitting）时具体的配置项。

#### 8.1.1 `chunks`

对所有模块都进行分割。实际开发中，一般只需指定此配置，其他配置使用默认值就可以了。

#### 8.1.2 `minSize`

分割代码最小的体积

#### 8.1.3 `minRemainingSize`

类似于 minsize，最后确保提取的文件大小不能为 0

#### 8.1.4 `minChunks`

至少被引用的次数，满足条件才会代码分割

#### 8.1.5 `maxAsyncRequests`**

按需加载时，并行加载的文件的最大数量

#### 8.1.6 `maxInitialRequests`

入口js文件最大请求数量

#### 8.1.7 `enforceSizeThreshold`

超过50kb一定会单独打包。此时会忽略 minRemainingSize maxAsyncRequests  maxInitialRequests

#### 8.1.8 `cacheGroups`

那些模块需要打包到一个组

- `test`：需要打包到一期的模块
- `type`：
- `priority`：权重，越大越高
- `reuseExistingChunk`：如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块

注意，`cacheGroups.default` 中相同的属性名，会覆盖外层属性，这意味着 cacheGroups 中配置的属性优先级更高。

下面是一个 `splitChunks` 的配置情况，除了 `chunks` 属性外，其余均为默认配置项。

```javascript
module.exports = {
  //...
  optimization: {
    splitChunks: {
      chunks: 'all', // 默认为 async
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: { // 组名
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          reuseExistingChunk: true,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```

### 8.2 `optimization.runtimeChunk`

## 九、`devServer`

## 十、`cache`

## 十一、`devtool`

## 十二、`target`

## 十三、`watch`

## 十四、`watchOptions`

## 十五、`externals`

## 十六、`externalsType`

## 十七、`performance`

## 十八、`node`

## 十九、`stats`
