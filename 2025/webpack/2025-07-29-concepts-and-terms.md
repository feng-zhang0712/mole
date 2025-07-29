# 概念及相关术语

## 一、入口（Entry）

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

## 二、输出（Output）

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

## 三、Loader

### 3.1 介绍

Loader 是 webpack 的核心功能之一。webpack 默认只能处理 JavaScript 和 JSON 文件。loader 让 webpack 能够处理其他类型的文件，并将它们转换为有效的模块，添加到依赖图中。比如，loader 可以将文件从不同的语言（如 TypeScript）转换为 JavaScript 或将内联图像转换为 data URL。

### 3.2 优先级分类

webpack 中有四种类型的 Loader。

- pre：表示前置 Loader，须通过 `enforce` 属性配置。
- normal：表示普通 loader。
- inline：通过内联方式配置的 loader。
- post：表示后置 loader，须通过 `enforce` 属性配置。

它们执行的优先级顺序为：pre > normal > inline > post。相同优先级的 Loader 按照从右到左，从下到上的顺序执行。

### 3.3 使用方式

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

### 3.4 内联（inline）loader

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

## 四、插件（Plugins）

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

## 五、模式（Mode）

模式（Mode）指的是 webpack 运行的环境。开发模式下，webpack 能够提供更好的开发体验，比如热更新、源映射等；而生产模式下，webpack 会自动启用一些优化功能，比如代码压缩、去除无用代码等。

可以通过 `[mode](#36-mode模式)` 选项来配置具体使用哪种模式。

## 六、代码分割（Code Splitting）

代码分割（Code Splitting）是 webpack 的一项高级功能，允许开发者将应用程序的代码分割成多个更小且独立的 bundle，这些 bundle 可以在运行时**按需加载**或**并行加载**。

这种技术的主要目标是优化 web 应用的加载性能、减少初始加载时间、减少网络传输的数据量，提升用户体验，尤其在移动端或网络条件较差的环境下效果显著。

要开启代码分割，需要配置 `optimization.splitChunks` 选项，也可以使用 ESM 的 `import()` 动态导入。

### 6.1 `optimization.splitChunks`

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

### 6.2 动态导入（Dynamic Imports）

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

## 七、Source Map

## 八、Tree Shaking

Tree Shaking 是一个术语，用于描述移除 JavaScript 上下文中的死代码（不会被执行的代码）。Tree Shaking 依赖于 ESM 语法。webpack 5 版本中，默认开启了 Tree Shaking 功能。

## 九、PWA（Progressive Web Application）


## Shimming

## 模块联邦（Module Federation）

## 生命周期

## 打包流程
