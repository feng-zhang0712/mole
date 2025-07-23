# 资源处理

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

## 一、处理 HTML 资源

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

## 二、处理样式资源

<!-- #### 基本配置 -->

<!-- #### 兼容性处理 -->

生产模式下，需要对样式资源做兼容性处理，主要是通过  和 [postcss](https://github.com/postcss/postcss) 和 [postcss-loader](https://webpack.docschina.org/loaders/postcss-loader/) 实现。

<!-- #### 提取 CSS 为单独文件 -->

通过上面的配置，样式资源会以 `<style>` 标签的形式，注入到 HTML 文件中。在网络条件较差的情况下，这可能会导致闪屏现象，因此，通常会将样式资源提取为单独的 CSS 文件，然后通过 `<link>` 标签引入。这部分功能的实现，要借助于 [MiniCssExtractPlugin](https://webpack.docschina.org/plugins/mini-css-extract-plugin) 插件。

注意，生产模式下，不应该再使用 `style-loader`，而是将对应的使用 `style-loader` 的位置，替换为 `MiniCssExtractPlugin.loader`。

<!-- #### 压缩样式资源 -->

生产环境下，为了减小打包后样式资源体积，需要对其进行压缩，通过 [CssMinimizerWebpackPlugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin) 插件来实现。

## 三、处理 JavaScript 资源

对于 javascript 资源，webpack 只能处理 ESM 语法，除此之外，还需要使用 [Babel](https://babel.dev/) 进行 javascript 兼容性处理以及配置 [ESLint](https://eslint.org/)。

ESLint 用于在开发环境中，执行代码检查。使用 ESLint 有助于我们的项目保持一致的代码风格，以及避免常见的编程错误。

Babel 用于将现代 JavaScript 代码转换为兼容性更好的版本，以便在旧版本的浏览器中运行。Babel 可以通过配置文件来指定转换规则。关于 Babel 的配置，可以参考 [https://webpack.docschina.org/loaders/babel-loader/](https://webpack.docschina.org/loaders/babel-loader/)。

另外，在生产模式下，javascript 资源会被自动压缩。

## 四、资源模块

webpack 5 之前，对各种资源文件（字体，图标等）的处理，通常依赖于 Loader。

- [`raw-loader`](https://v4.webpack.js.org/loaders/raw-loader/)：将文件导入为字符串。
- [`file-loader`](https://v4.webpack.js.org/loaders/file-loader/)：将文件发送到输出目录。
- [`url-loader`](https://v4.webpack.js.org/loaders/url-loader/)：将文件作为 data URI 内联到 bundle 中。

webpack 5 中，引入了**资源模块**的概念，这使得对各种资源文件的处理，不用依赖于这些 Loader。

在资源模块中，包含四种模块类型。

- `asset/source`：导出资源的源代码（替代 `raw-loader`）。
- `asset/resource`：发送文件并导出 URL（替代 `file-loader`）。
- `asset/inline`：导出资源的 data URI（替代 `url-loader`）。
- `asset`：在导出 data URI 和发送文件之间自动选择（之前通过使用 `url-loader`，并且配置资源体积限制实现）。

Base64 是一种文件编码规则，通过将体积较小的文件转为 Base64 字符串，并将其嵌入到代码中，可以减少网络请求次数。这时，就可以通过配置 `type` 属性来实现。

```css
.box {
  background-image: url('./img.png');
}
```

上面代码中，在样式文件中，为 `.box` 添加了一张背景图片。

```javascript
module.exports = {
  module: {
    rules: [{
        test: /\.(png|jpe?g|gif|webp|svg)$/, 
        type: 'asset/inline',
      }
    ]
  },
};  
```

上面代码中，`type` 属性指定为 `asset/inline`，这样，当遇到图片资源时，它们会被导入为 Base64 格式的字符串，输出到指定位置（这里是 `url` 函数中）。

此外，`type: 'asset'` 属性一般会跟 `dataUrlCondition` 一起使用，关于他们之间的配合，请参考 [`module.rules.parse`](#8modulerulesparse) 部分。

注意，并不是所有的资源都适合转为 Base64 字符串，因为转码后的内容通常要比源文件大。

对于设置了 `type: 'asset'` 或者 `type: 'asset/resource'` 的资源，通常在打包后需要将其输出到指定的目录中，关于这部分内容，请参考 [`output.assetModuleFilename`](#333-assetmodulefilename) 和 [`module.rules.generator`](#9modulerulesgenerator)。
