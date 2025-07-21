# Webpack

## 一、介绍

webpack 是一个用于现代 JavaScript 应用程序的静态模块打包工具。当 webpack 处理应用程序时，会在内部从一个或多个入口点构建一个 [依赖图](https://webpack.docschina.org/concepts/dependency-graph/)，然后将项目中所需的每一个模块组合成一个或多个 bundles，它们均为静态资源。

默认情况下，在开发环境中，webpack 只支持编译 **ESM** 语法；而在生产环境中，webpack 除了支持编译 ESM 语法外，还会**压错 JavaScript 代码**。

## 二、概念及相关术语

### 2.1 入口（Entry）

入口表示 webpack 应该使用从哪个文件开始，执行打包操作。入口通过 `[entry](#32-entry)` 选项来配置。入口有两种写法：单入口写法和对象写法。

```javascript
module.exports = {
  entry: './src/index.js',
};

// 等同于
module.exports = {
  entry: {
    app: './src/index.js',
  },
};
```

上面代码中，表示从 `./src/index.js` 文件开始打包。

```javascript
module.exports = {
  entry: {
    app: './src/app.js',
    main: {
      dependOn: 'app',
      import: './src/main.js',
    },
  },
};
```

上面的代码是多入口写法，表示从 `./src/app.js` 和 `./src/main.js` 两个文件开始打包。其中，`main` 依赖于 `app`，也就是说，`main` 文件会在 `app` 文件之后被加载。

### 2.2 输出（Output）

`output` 属性指定 webpack 如何输出、以及在哪里输出打包后生成的 bundle、asset 和其他内容。webpack 打包后默认生成一个 `./dist` 目录，所有打包的资源都会放在这个目录下。

```javascript
const path = require('path');

module.exports = {
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

上面的代码表示，打包好的 `bundle.js` 将被放在的 `./dist` 目录下。

注意，上面代码中，省略了无关的配置，如果不做特殊说明，以后的代码示例中，都会省略无关的配置。

如果 `entry` 中配置了多个打包入口，则应该使用 [占位符](https://webpack.docschina.org/configuration/output/#outputfilename) 来确保每个文件具有唯一的名称。

```javascript
const path = require('path');

module.exports = {
  entry: {
    app: './src/app.js',
    main: './src/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

上面的代码，分别会创建 `app.js` 和 `main.js` 两个文件，并放在 `./dist` 目录下。

此外，如果使用了 CND 和 hash 值来命名输出文件，则需要明确指定 `publicPath`，并使用占位符来确保每个文件具有唯一的名称。

```javascript
module.exports = {
  output: {
    path: '/home/proj/cdn/assets/[fullhash]',
    publicPath: 'https://cdn.example.com/assets/[fullhash]/',
  },
};
```

如果不知道最终输出文件的 `publicPath` 是地址什么，可以在运行时通过入口起点文件中的 `__webpack_public_path__` 动态设置。

```javascript
__webpack_public_path__ = myRuntimePublicPath;
```

### 2.3 Loader

#### 2.3.1 介绍

Loader 是 webpack 的核心功能之一。webpack 默认只能处理 JavaScript 和 JSON 文件。loader 让 webpack 能够处理其他类型的文件，并将它们转换为有效的模块，添加到依赖图中。比如，loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。

#### 2.3.2 优先级分类

webpack 中有四种类型的 Loader。

- pre：表示前置 Loader，须通过 `enforce` 属性配置。
- normal：表示普通 loader。
- inline：通过内联方式配置的 loader。
- post：表示后置 loader，须通过 `enforce` 属性配置。

它们执行的优先级顺序为：pre > normal > inline > post。相同优先级的 Loader 按照从右到左，从下到上的顺序执行。

#### 2.3.3 使用方式

Loader 有两种配置方式，[配置方式](https://webpack.docschina.org/concepts/loaders#configuration) 和 [内联方式](https://webpack.docschina.org/concepts/loaders#inline)，前者在 `webpack.config.js` （webpack 的配置文件）中指定所使用的 Loader，后者在每个 `import` 语句中指定所使用的 Loader。除非有特殊需求，否则，永远不要使用后者的方式来配置。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: 'raw-loader',
      }
    ],
  },
};
```

上面的代码告诉 webpack，对于所有以 `.txt` 结尾的文件，使用 `raw-loader` 进行处理。其中，`test` 用于匹配文件类型；`use` 指定在对匹配到的文件进行转换时，应该使用哪个 loader。

注意，使用正则表达式匹配文件时，不要为它添加引号。也就是说，`/\.txt$/` 与 `'/\.txt$/'` 或 `"/\.txt$/"` 不同。前者表示 webpack 匹配任何以 `.txt` 结尾的文件，后者表示 webpack 匹配具有绝对路径 `'.txt'` 的单个文件。

#### 2.3.4 内联（inline）loader

下面是一个使用内联方式配置 Loader 的例子。

```javascript
import Styles from 'style-loader!css-loader?modules!./styles.css';
```

上面代码中，`!` 用于路径中的资源分隔开，它的意思是，对于 `./styles.css` 文件，先使用 `css-loader` 处理，然后使用 `style-loader` 处理。

使用内联方式导入资源时，路径中还可以使用前缀。

- `!`：禁用所有已配置的 normal loader；
- `!!`：禁用所有已配置的 loader（pre/normal/post）；
- `-!`：禁用所有已配置的 pre 和 normal loader，但不禁用 post loaders。

选项还可以传递查询参数，例如 `?key=value&foo=bar`，或者一个 JSON 对象，例如 `?{"key":"value","foo":"bar"}`。

注意，loader 在使用之前，要通过 npm 提前安装到项目中。比如，对于上面的配置，要先执行 `npm install style-loader css-loader raw-loader` 命令安装这三个 loader。

### 2.4 插件（Plugins）

插件是 webpack 的核心功能之一，用于扩展 webpack 的能力，执行范围更广的任务。比如打包优化、资源管理、环境变量注入等。

要想使用一个插件，首先要通过 npm 安装到本地，然后通过 `require()` 或者 `import` 命令导入到配置文件中，之后把它添加到 `plugins` 数组中。多数插件可以通过选项自定义。也可以在一个配置文件中，因为不同目的而多次使用同一个插件。

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};
```

上面代码中，`html-webpack-plugin` 为应用程序生成一个 HTML 文件，并自动将生成的所有 bundle 注入到此文件中。

本质上，插件是一个具有 [apply](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply) 方法的 JavaScript 对象。apply 方法会被 webpack compiler 调用，并且在 **整个** 编译生命周期都可以访问 compiler 对象。关于 webpack 的生命周期，以及如何编写插件，我们会在稍后的章节讨论。

注意，插件在使用时，要通过 `new` 命令执行，因为本质上，插件就是一个构造函数。

### 2.5 模式（Mode）

模式（Mode）指的是 webpack 运行的环境。开发模式下，webpack 能够提供更好的开发体验，比如热更新、源映射等；而生产模式下，webpack 会自动启用一些优化功能，比如代码压缩、去除无用代码等。

可以通过 `[mode](#36-mode模式)` 选项来配置具体使用哪种模式。

### 2.6 代码分割（Code Splitting）

代码分割（Code Splitting）是 webpack 的一项高级功能，允许开发者将应用程序的代码分割成多个更小且独立的 bundle，这些 bundle 可以在运行时**按需加载**或**并行加载**。

这种技术的主要目标是优化 web 应用的加载性能、减少初始加载时间、减少网络传输的数据量，提升用户体验，尤其在移动端或网络条件较差的环境下效果显著。

要开启代码分割，需要配置 `optimization.splitChunks` 选项，也可以使用 ESM 的 `import()` 动态导入。

#### 2.6.1 `optimization.splitChunks`

配置 `optimization.splitChunks` 选项，以开启代码分割功能，并在更多细节上，指定 webpack 打包时如何进行分割代码。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

上面的代码表示，对于所有模块，都开启代码分割。`splitChunks` 对象中，还有很多其他配置项，[下面](#optimizationsplitchunks) 列出了更详细的信息。

#### 2.6.2 动态导入（Dynamic Imports）

使用 ES6 模块的动态导入语法 `import()`，可以实现对模块的**按需加载**和**条件加载**。

```javascript
import('./myModule.js').then(myModule => {
  console.log(myModule.default);
});

// 或者使用 async/await
const myModule = await import('./myModule.js');
console.log(myModule.default);
```

通过动态导入，能够减少初始加载的代码量。在 React 中，还可以配合 `React.lazy()` 和 `React.Suspense`，实现组件级别的按需加载。

此外，`import()` 还支持使用魔法注释，为模块重命名或添加预取/预加载提示。

```javascript
import(/* webpackChunkName: "my-chunk-name" */ './myModule.js').then(myModule =>
  console.log(myModule.default)
);
```

上面代码中，`webpackChunkName` 用于指定生成的 chunk 的名称。否则，webpack 生成的可能会是类似 `0.js` 的名称。可以通过指定 `output.chunkFilename` 来控制 chunk 的输出文件名。

- `webpackPreload`：表示以 `<link rel="preload">` 的方式预加载模块。
- `webpackPrefetch`：表示以 `<link rel="prefetch">` 的方式预加载模块。

### 2.7 Tree Shaking

Tree Shaking 是一个术语，用于描述移除 JavaScript 上下文中的死代码（不会被执行的代码）。Tree Shaking 依赖于 ESM 语法。webpack 5 版本中，默认开启了 Tree Shaking 功能。

### 2.8 PWA（Progressive Web Application）

## 三、配置

### 3.1 `context`

### 3.2 `entry`

对象写法可以定义多个入口点，每个入口使用一个配置对象来对入口进行描述。下面列出了描述对象中的属性。

- `import`：启动时需加载的模块。
- `filename`：指定要输出的文件名称。
- `dependOn`：当前入口所依赖的入口。它们必须在该入口被加载前被加载。`dependOn` 不能是循环引用的，否则会抛出错误。
- `library`：为当前 entry 构建一个 library。
- `publicPath`: 当该入口的输出文件在浏览器中被引用时，为它们指定一个公共 URL 地址。
- `runtime`: 运行时 chunk 的名字。此属性会创建一个新的运行时 chunk。在 webpack 5.43.0 之后可将其设为 `false` 以避免一个新的运行时 chunk。注意，`runtime` 不能指向已存在的入口名称，且 `runtime` 和 `dependOn` 不能在同一个入口上同时使用，否则会抛出错误。

### 3.3 `output`（输出）

（1）`output.path`

一个绝对路径，指定打包输出的目录。

（2）`output.filename`

指定输出的 bundle 名称，这些 bundle 将写入到 `path` 属性指定的目录下。对于单个入口起点，`filename` 可以是一个静态名称；对于多入口起点，须使用占位符，指定每个 bundle 的唯一名称。下面列出了几个常用的占位符。

- `[name]`：入口名称。比如 `filename: '[name].bundle.js'`
- `[id]`：内部 chunk id。比如 `'[id].bundle.js'`
- `[contenthash]`：由生成的内容产生的 hash。比如 `[contenthash].bundle.js`
- 结合多个替换组合。比如 `[name].[contenthash].bundle.js`
- 使用函数返回 `filename`。比如 `filename: (pathData) => pathData.chunk.name === 'main' ? '[name].js' : '[name]/[name].js'`

注意，此选项不会影响那些「按需加载 chunk」的输出文件。它只影响最初加载的输出文件。对于按需加载的 chunk 文件，应使用 [output.chunkFilename](https://webpack.docschina.org/configuration/output/#outputchunkfilename) 选项来控制输出。通过 loader 创建的文件也不受影响。

此外，虽然此选项被称为文件名，但是可以使用像 `'js/[name]/bundle.js'` 这样的文件夹结构。

（3）`output.assetModuleFilename`

指定图片、字体等通过 `type: 'asset'` 模块类型打包后的输出文件名。

（4）`output.chunkFilename`

用于指定打包输出的其他 chunk 文件的名称。比如，此属性可以配置 webpack 的魔法注释一起使用。

（5）`output.publicPath`

（6）`output.clean`

用于在每次重新打包之前，清空输出目录。

### 3.4 `module`

#### 3.4.1 `module.rules`

##### （1）`module.rules.test`

##### （2）`module.rules.loader`

##### （3）`module.rules.use`

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

##### （4）`module.rules.type`

##### （5）`module.rules.include`

`include` 用于指定匹配所生效的模块或目录。该属性对应的值可以是四种类型。

- 字符串：目录或文件绝对路径，表示匹配输入必须以提供的字符串开始。
- 数组：至少一个匹配条件。
- 正则表达式：`test` 输入值。
- 函数：调用输入的函数，必须返回一个 `true` 以匹配。
- 对象：匹配所有属性。每个属性都有一个定义行为。

##### （6）`module.rules.exclude`

`exclude` 用于排除所有符合条件的模块或目录。该属性使用方式与 `module.rules.include` 一样。

注意，`include` 或者 `exclude` 不能同时使用，否则会报错。

##### （7）`module.rules.oneOf`

`oneOf` 用于匹配数组中，第一个满足条件的规则。

##### （8）`module.rules.generator`

##### （9）`module.rules.sideEffects`

##### （10）`module.rules.enforce`

`enforce` 属性用于配置 loader 类型，可能的值为 `pre` 或者 `post`。

其中，`pre` 优先级要高于 `post`，如果没有配置此属性，则默认为 normal loader。关于 webpack 中 loader 的优先级，可以参考 [Loader](#23-loader) 部分。

### 3.5 `plugins`（插件）

### 3.6 `mode`（模式）

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

### 3.7 `resolve`

#### 3.7.1 `resolve.extensions`

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

### 3.8 `optimization`

#### `optimization.splitChunks`

`splitChunks` 用于指定代码分割（Code Splitting）时具体的配置项。

##### （1）`chunks`

对所有模块都进行分割。实际开发中，一般只需指定此配置，其他配置使用默认值就可以了。

##### （2）`minSize`

分割代码最小的体积

##### （3）`minRemainingSize`

类似于 minsize，最后确保提取的文件大小不能为 0

##### （4）`minChunks`

至少被引用的次数，满足条件才会代码分割

##### （5）`maxAsyncRequests`

按需加载时，并行加载的文件的最大数量

##### （6）`maxInitialRequests`

入口js文件最大请求数量

##### （7）`enforceSizeThreshold`

超过50kb一定会单独打包。此时会忽略 minRemainingSize maxAsyncRequests  maxInitialRequests

##### （8）`cacheGroups`

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

#### `optimization.runtimeChunk`

### 3.9 `devServer`

### 3.10 `cache`

### 3.11 `devtool`

### 3.12 `target`

### 3.13 `watch`

### 3.14 `watchOptions`

### 3.15 `externals`

### 3.16 `externalsType`

### 3.17 `performance`

### 3.18 `node`

### 3.19 `stats`

## 四、资源处理

开发环境是指在本地开发应用程序时使用的环境。开发环境下，要达到下面的目的。

- 文件支持：编译代码，使浏览能够识别各种类型的文件。
- 源映射（Source Maps）：开发模式下，webpack 会生成详细的源映射文件（如 `inline-source-map`），帮助开发者在浏览器开发者工具中直接看到原始代码的位置，从而快速定位错误。
- 热模块替换（Hot Module Replacement, HMR）： 通过支持HMR，开发者可以在不刷新整个页面的情况下实时更新代码，提高开发效率。
- 快速构建： 为了缩短构建时间，开发模式通常禁用代码压缩和优化，如不使用 TerserPlugin 进行 minification，确保构建过程快速，适合频繁的开发迭代。
- 代码质量检查：通过集成 ESLint，确保代码质量和一致性，避免常见的编程错误。

<!-- - 代码未压缩，便于调试和阅读。
- 启用开发服务器，便于快速启动和调试。
- 启用性能分析，便于优化代码性能。
- 启用代码分割，便于优化代码加载速度。
- 启用 tree shaking，便于去除无用代码。-->

### 4.1 处理 HTML 资源

开发环境下对 HTML 资源的处理，主要借助于 [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin)，它可以自动生成 HTML 入口文件，并将打包后的 bundle 资源自动注入到 HTML 文件中。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  "postcss-preset-env"
                ],
              },
            },
          },
          "sass-loader"
        ],
      },
    ],
  }
};
```

要想配置生效，还需要在 `package.json` 文件中，配置 `browserslist` 选项。

另外，在生产模式下，HTML 资源会被自动压缩。

### 4.2 处理样式资源

#### 基本配置

#### 兼容性处理

生产模式下，需要对样式资源做兼容性处理，主要是通过  和 [postcss](https://github.com/postcss/postcss) 和 [postcss-loader](https://webpack.docschina.org/loaders/postcss-loader/) 实现。

#### 提取 CSS 为单独文件

通过上面的配置，样式资源会以 `<style>` 标签的形式，注入到 HTML 文件中。在网络条件较差的情况下，这可能会导致闪屏现象，因此，通常会将样式资源提取为单独的 CSS 文件，然后通过 `<link>` 标签引入。这部分功能的实现，要借助于 [MiniCssExtractPlugin](https://webpack.docschina.org/plugins/mini-css-extract-plugin) 插件。

注意，生产模式下，不应该再使用 `style-loader`，而是将对应的使用 `style-loader` 的位置，替换为 `MiniCssExtractPlugin.loader`。

#### 压缩样式资源

生产环境下，为了减小打包后样式资源体积，需要对其进行压缩，通过 [CssMinimizerWebpackPlugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin) 插件来实现。

### 4.3 处理 JavaScript 资源

对于 javascript 资源，webpack 只能处理 ESM 语法，除此之外，还需要使用 [Babel](https://babel.dev/) 进行 javascript 兼容性处理以及配置 [ESLint](https://eslint.org/)。

ESLint 用于在开发环境中，执行代码检查。使用 ESLint 有助于我们的项目保持一致的代码风格，以及避免常见的编程错误。

Babel 用于将现代 JavaScript 代码转换为兼容性更好的版本，以便在旧版本的浏览器中运行。Babel 可以通过配置文件来指定转换规则。关于 Babel 的配置，可以参考 [https://webpack.docschina.org/loaders/babel-loader/](https://webpack.docschina.org/loaders/babel-loader/)。

另外，在生产模式下，javascript 资源会被自动压缩。

### 4.4 处理其他资源

#### 资源模块

在 webpack 5 之前，对各种资源文件（字体，图标等）的处理，通常依赖于 [raw-loader](https://v4.webpack.js.org/loaders/raw-loader/)、[url-loader](https://v4.webpack.js.org/loaders/url-loader/) 和 [file-loader](https://v4.webpack.js.org/loaders/file-loader/)。webpack 5 中，引入了**资源模块**的概念，这使得对各种资源文件的处理，无需配置额外 loader。

资源模块类型，通过添加 4 种新的模块类型，来替换所有这些 loader。

- `asset/source`：导出资源的源代码（替代 raw-loader）。
- `asset/resource`：发送一个单独的文件并导出 URL（替代 file-loader）。
- `asset/inline`：导出一个资源的 data URI（替代 url-loader）。
- `asset`：在导出一个 data URI 和发送一个单独的文件之间自动选择（之前通过使用 url-loader，并且配置资源体积限制实现）。

比如，通过指定 `type: 'asset'`，让 webpack 在 `resource` 和 `inline` 之间进行选择。

```css
.box {
  background-image: url('./image.png');
}
```

上面代码中，在 `index.css` 文件中，使用 `url()` 函数来引用图片资源。然后配置 `webpack.config.js`。

```javascript
module.exports = {
  // ...
  module: {
    rules: [
      {
       test: /\.(png|jpe?g|gif|webp|svg)$/, 
       type: 'asset',
      }
    ]
  },
};
```

上面的代码表示，对于小于 8kb 的图片资源，会被视为 `inline` 模块类型，此时，图片会被作为一个 Base64 编码的字符串注入到 `url()` 函数中；否则会被视为 `resource` 模块类型，被输出到指定的目录中。

在这里要说一句，之所以要将某些文件转为 Base64 格式，是因为 Base64 编码的字符串可以直接嵌入到 HTML 或 CSS 中，能够减少 HTTP 请求的数量，从而提高页面加载速度。不过，并不是所有资源都适合转为 Base64 格式。通常来说，较小的资源（如小图标、字体等）适合转为 Base64 格式，而较大的资源（如大图片、视频等）则不适合，因为 Base64 编码会增加资源的体积，导致加载速度变慢。

除此之外，还可以通过配置 [Rule.parser.dataUrlCondition.maxSize](https://webpack.docschina.org/configuration/module/#ruleparserdataurlcondition) 属性，来控制资源模块的大小限制。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/, 
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
      },
    ],
  },
};
```

上面的代码表示，当图片资源大于 10kb 时，会被转为 Base64 格式，否则，会被输出到指定的目录中。

#### 指定输出目录

默认情况下，`asset/resource` 模块以 `[hash][ext][query]` 文件名发送到输出目录。目前，有两种方式来指定资源模块打包后的输出目录。

其一是通过指定 [output.assetModuleFilename](https://webpack.docschina.org/configuration/output/#outputassetmodulefilename) 配置项。

```javascript
module.exports = {
  output: {
   assetModuleFilename: 'images/[hash][ext][query]'
  },
};
```

另一种方式是通过 `Rule.generator.filename` 配置项，使用方式与 `output.assetModuleFilename` 相同，但仅适用于 `asset` 和 `asset/resource` 模块类型。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp|svg)$/, 
        type: 'asset',
        generator: {
          filename: 'static/images/[hash:10][ext][query]'
        },
      },
      {
        test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[hash][ext][query]'
        },
      },
    ],
  },
};
```

上面代码中，对于图片资源，打包后会输出到 `./dist/static/images/` 目录下，并且文件名由三部分组成：`[hash 值前 10 位].[扩展名][查询参数]`，而对于字体资源和音视频资源，打包后会输出到 `./dist/static/media/` 目录下。

### 4.5 搭建开发服务器

在开发模式下，通过配置 [devServer](https://webpack.docschina.org/configuration/dev-server/) 选项，能够快速搭建一个本地开发服务器，从而实现页面的热更新。这依赖于 [webpack-dev-server](https://github.com/webpack/webpack-dev-server) 插件。

```javascript
const path = require("path");

module.exports = {
  devServer: {
    static: {
      directory: path.resolve(__dirname),
    },
    host: 'localhost',
    port: 8080
  },
  mode: "development"
};
```

上面的代码中，`static.directory` 指定了静态资源的目录，并且配置了服务器的主机名和端口号。之后使用 `npx webpack server` 命令启动服务器。当访问 `http://localhost:8080` 时，就会显示当前目录下 `index.html` 文件的内容。如果以后对项目中文件作了修改，都不用再重新打包，dev server 服务器会自动检测到文件的变化，并刷新浏览器页面。

注意，配置了 `devServer` 选项后，打包后的资源会被保存在内存中，而不是之前配置的 `output.path` 目录下。另外，生产模式下，无需配置 `devServer` 选项。

## 五、优化

<!-- 提升开发体验 -->

优化线上代码性能
提升打包构建体验
<!-- 减少代码体积 -->
<!-- 优化代码运行性能 -->

### 生产环境优化

- 开启 Source Map
- 开启 Tree Shaking
- 配置 Code Splitting
  - 提取公共模块：如果项目中有多个入口，而多个入口有引用了相同的模块，如果不做代码分割，被引用的模块会被打包打包到每个 bundle 中，这时，就可以使用 Splitting 功能来将这些公共模块提取出来，打包成一个单独的文件，从而减少每个 bundle 的体积。
  - 按需加载/动态导入 `import()`，如果需要还可以采用魔法注释形式，比如 preload/prefetch
- oneOf/include/exclude
- 压缩图片：如果项目中使用了大量图片，对其进行压缩可以减小打包后的体积。 [image-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/image-minimizer-webpack-plugin)
- @babel/plugin-transform-runtime 辅助代码
- 使用 core-js 对 javascript 进行兼容性处理
- network cache
- 开启 PWA

### 优化打包体验

模块热替换（HMR - hot module replacement）功能会在应用程序运行过程中，**替换、添加或删除模块，而无需重新加载整个页面**。也就是只更新页面中发生变化的部分。主要是通过以下几种方式，来显著加快开发速度：

- 保留在完全重新加载页面期间丢失的应用程序状态。
- 只更新变更内容，以节省宝贵的开发时间。
- 在源代码中 CSS/JS 产生修改时，会立刻在浏览器中进行更新，这几乎相当于在浏览器 devtools 直接更改样式。

要开启 HMR 功能，只需要在 `devServer` 选项中设置 `hot: true`。

```javascript
module.exports = {
  devServer: {
    hot: true // HMR 默认开启
  }
};
```

要在 `.js` 文件中启用 HMR 功能，需要在入口文件中添加以下代码。

```javascript
if (module.hot) {
  module.hot.accept('./library.js', function () {
    // 对更新过的 library 模块做些事情...
  });
}

// or
if (import.meta.webpackHot) {
  import.meta.webpackHot.accept('./library.js', function () {
    // Do something with the updated library module…
  });
}
```

[Hot Module Replacement](https://webpack.docschina.org/api/hot-module-replacement)

注意，HMR 功能只在开发模式下有效。

<!-- - HMR（热模块替换） -->
- oneOf/include/exclude
- ESLint、Babel 优化：设置 ESLint 和 Babel 的缓存功能，以及减少 Babel 打包后的文件体积。
- THread 多进程打包
- 配置 `optimization.runtimeChunk` 防止打包时文件缓存失效

## 六、自定义 Loader

### 6.1 介绍

loader 本质上是导出为函数的 JavaScript 模块。

```javascript
// my-first-loader.js

module.exports = function(content, map, meta) {
  console.log(content);
  return content;
}
```

它的使用方式跟其它 loader 一样，只需在 webpack 配置文件中导入就可以。

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/i,
        loader: './my-first-loader',
      },
    ],
  }
};
```

上面代码中，当匹配到 `.js` 结尾的文件，就会执行我们定义的 loader 函数，她接受三个参数。

- `content`：当前匹配到的源文件的内容。
- `map`：跟 source map 有关的数据。
- `meta`：其他 loader 传递过来的数据。

注意，loader 函数执行完后，要将处理的内容返回给 webpack。

### 6.2 Loader Interface

[Loader Interface](https://webpack.docschina.org/api/loaders/) 是 webpack 提供的、用于操作 Loader 的 API 接口，要想自定义 Loader，必须对它有所了解。

Loader Interface 中，规定了四种类型的 loader：**同步 Loader**、**异步 Loader**、**Raw Loader** 和 **Pitching Loader**。下面分别对他们进行介绍。

#### 6.2.1 分类

（1）同步 Loader

同步 Loader 执行的同步操作，对于转换后的内容，可以使用 `this.callback` 或者 `return` 返回。推荐的做法是使用前者，应为它可以传递更多参数。

```javascript
// 方式一：使用 this.callback
module.exports = function (content, map, meta) {
  this.callback(
    null, // 函数执行过程中，抛出的错误
    someSyncOperation(content),
    map,
    meta,
  );
};

// 方式二：直接返回处理结果
module.exports = function (content, map, meta) {
  return someSyncOperation(content);
};
```

（2）异步 Loader

异步 Loader 允许执行异步操作。对于异步 loader，使用 `this.async` 来获取 callback 函数。

```javascript
module.exports = function (content, map, meta) {
  const callback = this.async();
  someAsyncOperation(content, function (err, result) {
    if (err) return callback(err);
    callback(null, result, map, meta);
  });
};
```

（3）Raw Loader

默认情况下，资源文件会被转化为 UTF-8 字符串，然后传给 loader。通过设置 `raw` 为 `true`，loader 可以接收原始的 Buffer。每一个 loader 都可以用 String 或者 Buffer 的形式传递它的处理结果。complier 将会把它们在 loader 之间相互转换。

```javascript
module.exports = function (content) {
  assert(content instanceof Buffer);
  return someSyncOperation(content); // 返回值也可以是一个 `Buffer`
};

module.exports.raw = true;
```

（4）Pitching Loader

loader 总是从右到左或者从下往上被调用。有些情况下，loader 只关心 request 后面的元数据（metadata），并且忽略前一个 loader 的结果。在实际（从右到左）执行 loader 之前，会先 **从左到右** 调用 loader 上的 `pitch` 方法。

```javascript
module.exports = {
  module: {
    rules: [
      {
        use: ['a-loader', 'b-loader', 'c-loader'],
      },
    ],
  },
};
```

上面的配置，会按照下面的顺序执行。

```text
|- a-loader `pitch`
  |- b-loader `pitch`
    |- c-loader `pitch`
      |- requested module is picked up as a dependency
    |- c-loader normal execution
  |- b-loader normal execution
|- a-loader normal execution
```

也就是说，先按照从左到右的顺序执行 `a`、`b`、`c` 的 `pitch` 方法，然后按照从右到左的顺序执行 loader。

传递给 `pitch` 方法的 data，在执行阶段也会暴露在 `this.data` 之下，并且可以用于在循环时，捕获并共享前面的信息。

```javascript
module.exports = function (content) {
  return someSyncOperation(content, this.data.value);
};

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  data.value = 42;
};
```

其次，如果某个 loader 在 `pitch` 方法中给出一个结果，那么这个过程会回过身来，并跳过剩下的 loader。在我们上面的例子中，如果 `b-loader` 的 `pitch` 方法返回了一些东西，那么，他们的执行顺序又会不同。

```javascript
module.exports = function (content) {
  return someSyncOperation(content);
};

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  if (someCondition()) {
    return (
      'module.exports = require(' +
      JSON.stringify('-!' + remainingRequest) +
      ');'
    );
  }
};
```

此时的执行结果如下。

```text
|- a-loader `pitch`
  |- b-loader `pitch` returns a module
|- a-loader normal execution
```

#### 6.2.2 Loader Context

loader context 表示在 loader 函数中使用 `this` 可以访问的一些方法或属性。

- `context`：表示当前模块所在的目录路径。这个路径是模块文件的父目录的绝对路径。
- `data`：一个可由 loader 自由使用的对象，用于在 loader 链中传递自定义数据。
- `fs`：提供对 Webpack 输入文件系统的访问。
- `query`：表示传递给 loader 的配置选项（即 webpack 配置中的 options 或查询字符串）。
- `loaders`：所有 loader 组成的数组。在 pitch 阶段的时候可以写入。
- `mode`：表示 webpack 的运行模式（`'development'`、`'production'` 或 `undefined`）。
- `resource`：表示当前模块的完整文件路径（包括文件名和扩展名）。
- `async()`：用于将 loader 转换为异步模式。调用 `this.async()` 会返回一个回调函数（类似于 `this.callback`），用于异步返回结果。
- `callback(err: Error | null, content?: string | Buffer, sourceMap?: SourceMap, meta?: any)`：一个异步回调函数，用于将 loader 的处理结果返回给 Webpack。
- `emitFile(name: string, content: string | Buffer, sourceMap?: SourceMap)`：用于将文件输出到 webpack 的输出目录。
- `getOptions(schema)`：返回 loader 的配置选项。
- `utils.contextify(context: string, request: string)`：将给定的请求路径（`request`）转换为相对于指定上下文路径（`context`）的相对路径。
- `utils.absolutify(context: string, request: string)`：将给定的请求路径（`request`）转换为相对于指定上下文路径（`context`）的绝对路径。
- `utils.stringifyRequest(context: string, request: string)`：将模块请求字符串（`request`）转换为一个 JSON 格式的字符串，适用于在 JavaScript 代码中嵌入请求。
- `utils.createHash(type: string)`：创建一个指定类型的哈希对象，用于生成内容的哈希值。
- `resolve(context: string, request: string, callback: function(err: Error | null, result: string))`：用于解析模块路径，类似于 Webpack 的 `require.resolve`。

[Loader Context](https://webpack.docschina.org/api/loaders/#the-loader-context) 还有很多其他属性没有列出，可以去参考。

## 七、自定义 Plugin
