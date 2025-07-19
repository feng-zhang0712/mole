# Webpack

## 一、介绍

webpack 是一个用于现代 JavaScript 应用程序的 静态模块打包工具。当 webpack 处理应用程序时，它会在内部从一个或多个入口点构建一个 [依赖图](https://webpack.docschina.org/concepts/dependency-graph/)，然后将你项目中所需的每一个模块组合成一个或多个 bundles，它们均为静态资源。

如果不做特殊配制，在生产环境下，webpack 只支持编译 ESM 语法；而在生产环境下，webpack 除了支持编译 ESM 语法外，还会压错 JavaScript 代码。

## 二、核心概念

### 2.1 入口（entry）

入口表示 webpack 应该使用哪个模块，来开始构建其内部依赖图。入口有两种写法：单入口写法和对象写法。

```javascript
module.exports = {
  entry: './path/to/my/entry/file.js',
};

// 等同于
module.exports = {
  entry: {
    main: './path/to/my/entry/file.js',
  },
};
```

对象写法可以定义多个入口点，每个入口使用一个配置对象来对入口进行描述。下面列出了描述对象中的属性。

- `import`：启动时需加载的模块。
- `filename`：指定要输出的文件名称。
- `dependOn`：当前入口所依赖的入口。它们必须在该入口被加载前被加载。`dependOn` 不能是循环引用的，否则会抛出错误。
- `library`：为当前 entry 构建一个 library。
- `publicPath`: 当该入口的输出文件在浏览器中被引用时，为它们指定一个公共 URL 地址。
- `runtime`: 运行时 chunk 的名字。此属性会创建一个新的运行时 chunk。在 webpack 5.43.0 之后可将其设为 `false` 以避免一个新的运行时 chunk。注意，`runtime` 不能指向已存在的入口名称，且 `runtime` 和 `dependOn` 不能在同一个入口上同时使用，否则会抛出错误。

```javascript
module.exports = {
  entry: {
    a: './src/a.js',
    b: {
      dependOn: 'a',
      import: './src/b.js',
    },
  },
};
```

### 2.2 输出（output）

`output` 属性指定 webpack 如何输出、以及在哪里输出打包后生成的 bundle、asset 和其他内容。`output` 配置对象中，有一些常用的配置项。

- 





webpack 打包后默认生成一个 `./dist` 文件夹，所有打包的资源都会被放在这个文件夹下。

```javascript
const path = require('path');

module.exports = {
  // ...
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

上面的代码，会将打包好的 `bundle.js` 放在默认的 `./dist` 目录下。

如果 `entry` 中配置了多个打包入口，则应该使用 [占位符](https://webpack.docschina.org/configuration/output/#outputfilename) 来确保每个文件具有唯一的名称。

```javascript
const path = require('path');

module.exports = {
  entry: {
    app: './src/app.js',
    search: './src/search.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

上面的代码，分别会创建 `app.js` 和 `search.js` 两个文件，并放在 `./dist` 目录下。

此外，如果使用了 CND 和 hash 值来命名输出文件，则需要明确指定 `publicPath`，并使用占位符来确保每个文件具有唯一的名称。

```javascript
module.exports = {
  //...
  output: {
    path: '/home/proj/cdn/assets/[fullhash]',
    publicPath: 'https://cdn.example.com/assets/[fullhash]/',
  },
};
```

不知道最终输出文件的 `publicPath` 是地址什么，可以在运行时通过入口起点文件中的 `__webpack_public_path__` 动态设置。

```javascript
__webpack_public_path__ = myRuntimePublicPath;
```

### 2.3 loader

#### 2.3.1 含义

webpack 默认只能处理 JavaScript 和 JSON 文件。loader 让 webpack 能够处理其他类型的文件，并将它们转换为有效的模块，添加到依赖图中。比如，loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。

loader 是 webpack 的核心配置项之一。

#### 2.3.2 分类



#### 2.3.3 配置方式

loader 有两种配置方式，[配置方式](https://webpack.docschina.org/concepts/loaders#configuration) 和 [内联方式](https://webpack.docschina.org/concepts/loaders#inline)，前者在 webpack.config.js 文件中指定 loader，后者在每个 `import` 语句中显式指定 loader。除非有特殊需求，否则，永远不要使用后者的方式来配置。此外，loader 有两个重要的属性。

- `test`：用于匹配文件类型；
- `use`：指定在对匹配到的文件进行转换时，应该使用哪个 loader。

```javascript
// webpack.config.js

module.exports = {
  // ...
  module: {
    rules: [{
      test: /\.txt$/,
      use: 'raw-loader',
    }],
  },
};
```

上面的代码告诉 webpack，对于所有以 `.txt` 结尾的文件，使用 `raw-loader` 进行处理。

注意，使用正则表达式匹配文件时，你不要为它添加引号。也就是说，`/\.txt$/` 与 `'/\.txt$/'` 或 `"/\.txt$/"` 不同。前者指示 webpack 匹配任何以 `.txt` 结尾的文件，后者指示 webpack 匹配具有绝对路径 `'.txt'` 的单个文件。

`use` 属性除了可以指定单个 loader 外，还可以指定多个 loader，它们可以链式调用，且按照**从右到左**、**从下往上**的顺序执行。

```javascript
module.exports = {
  // ...
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

上面的代码，匹配到 `.css` 文件时，首先使用 `sass-loader` 处理，之后将处理后的结果交给 `css-loader` 处理，最后，上一步的处理结果又交由 `style-loader` 处理。

`use` 属性中除了直接指定 loader 的名称，还可以指定一个配置对象，来传递额外的选项。

```javascript
module.exports = {
  // ...
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

下面是一个使用内联方式配置 loader 的例子。

```javascript
import Styles from 'style-loader!css-loader?modules!./styles.css';
```

上面代码中，`!` 用于路径中的资源分隔开，它的意思是，对于 `./styles.css` 文件，先使用 `css-loader` 处理，然后使用 `style-loader` 处理。

使用内联方式导入资源时，路径中还可以使用前缀。

- `!`：禁用所有已配置的 normal loader；
- `!!`：禁用所有已配置的 loader（preLoader/loader/postLoader）；
- `!-`：禁用所有已配置的 preLoader 和 loader，但不禁用 postLoaders。

选项可以传递查询参数，例如 `?key=value&foo=bar`，或者一个 JSON 对象，例如 `?{"key":"value","foo":"bar"}`。

注意，loader 在使用之前，要通过 npm 提前安装到项目中。比如，对于上面的配置，要先执行 `npm install style-loader css-loader raw-loader` 命令安装这三个 loader。

### 2.4 插件（plugin）

插件是 webpack 的核心配置项之一，用于扩展 webpack 的能力，执行范围更广的任务。比如打包优化、资源管理、环境变量注入等。

想要使用一个插件，你需要通过 `require()` 或者 `import` 命令导入，然后把它添加到 `plugins` 数组中。多数插件可以通过选项自定义。也可以在一个配置文件中因为不同目的而多次使用同一个插件，这时需要通过使用 `new` 命令来创建一个插件实例。

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

注意，跟 loader 一样，多数插件在使用之前也需要通过 npm 安装到项目中。

### 2.5 模式（mode）

模式（`mode`）用来配置 webpack 运行的环境，它有三个可选值。

- `development`：开发环境，会启用一些有助于开发的功能，比如代码调试、热更新等。
- `production`：生产环境，会启用一些有助于代码优化的功能，比如代码压缩、去除无用代码等。
- `none`：不启用任何优化功能。

```javascript
module.exports = {
  mode: 'development',
};
```

## 开发模式

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

### 处理 HTML 资源

### 处理样式资源

### 处理 JavaScript 资源

### 处理其他资源

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
  // ...
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




















