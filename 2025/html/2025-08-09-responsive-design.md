# 响应式设计

## 一、简介

响应式 Web 设计，指网页内容会随着访问它的视口及设备的不同而呈现不同的样式，这对于提升户用体验、SEO 优化以及降低项目的维护成本，都有重要意义。

## 二、基础配置

### 2.1 `<meta>` 标签的视口配置

视口的 `meta` 标签，是网页与移动浏览器的接口。网页通过这个标签告诉移动浏览器，它希望浏览器如何渲染当前页面。视口的 `meta` 标签主要使用以下几个属性控制页面在移动端的行为。

- `width`：用于设置页面的宽度。
- `height`：用于设置页面的高度，通常设置了 `width` 就不会再设置 `height`。
- `initial-scale`：设置页面的初始缩放比例。
- `user-scalable`：一个布尔值，用于设置页面是否可以缩放。
- `minimum-scale`：设置页面的最小缩放比例，只有在 `user-scalable=true` 时，此属性才会生效。
- `maximum-scale`：设置页面的最大缩放比例，只有在 `user-scalable=true` 时，此属性才会生效。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=0.5, maximum-scale=3" /> 
```

上面的代码表示，在移动设备上，页面的宽度为设备宽度，页面初始的缩放比例为 1，允许用户进行缩放操作，且最小和最大缩放比例分别为 0.5 和 3。

### 2.2 页面结构

- [ ] 使用语义化 HTML5 标签 (header, nav, main, aside, footer)
- [ ] 确保内容的逻辑顺序合理
- [ ] 添加适当的 ARIA 标签和角色
- [ ] 设置正确的文档语言属性
- [ ] 使用合适的标题层级 (h1-h6)

#### 2.1 H5 页面结构新特性

（1）`doctype` 设置浏览器文档类型。

```html
<!DOCTYPE html>
```

（2）`lang 属性`：用于指定文档使用的语言。
  
```html
<html lang="en">
```

（3）`charset`：`charset` 属性用于指定字符编码。除非有特殊需要，否则 `charset` 的属性值一般都是 `utf-8`。

```html
<meta charset="utf-8">
```

#### 2.2 H5 结构化元素

（1）`<main>`：用于表示页面的主内容区。通常，每个页面的主内容区只能有一个，而且不能作为 `article`、`aside`、`header`、`footer`、`nav` 或 `header` 等其他 H5 语义元素的后代。

（2）`<section>`：用于定义文档或应用中一个通用的区块。比如，某块内容包含自然标题（h1 ~ h6），就可以使用 `<section>` 标签作为容器。

（3）`<nav>`：用于包装主导航链接。

（4）`<article>`：用于包含一个独立的内容块。比如，有博客正文和新闻报道就可以放在 `<article>` 中。

（5）`<aside>`：用于包含与其旁边内容不相关的内容。常用于侧边栏、突出引用、广告和导航元素。

（6）`<figure>` 和 `<figcaption>`：`<figure>` 常用于包含注解、图示、照片和代码等。`<figcaption>` 可作为 `<figure>` 的嵌套元素使用。

```html
<figure class="MoneyShot"> 
  <img class="MoneyShotImg" src="img/scones.jpg" alt="Incredible scones" /> 
  <figcaption class="ImageCaption">
    Incredible scones, picture from Wikipedia
  </figcaption> 
</figure> 
```

（7）`<detail>` 和 `<summary>`：这两个元素经常成对出现，比如，我们经常使用的“展开/收起”部件，就可以用它们来实现。

```html
<details> 
  <summary>I ate 15 scones in one day</summary> 
  <p>Of course I didn't. It would probably kill me if I did. What a way to go. Mmmmmm, scones!</p> 
</details>
```

在不添加任何样式的请款下，上面代码的（展开）效果如下。

![details and summary tag]({{ site.baseurl }}/assets/images/css/detail-and-summary.png)

（8）`<header>`：常用在站点页头作为“报头”。它可以在一个页面中出现多次（比如，页面中每个 `<section>` 中都可以有一个 `<header>`）。

（9）`<footer>`：常用于在相应区块中包含与区块相关的内容，可以包含指向其他文档的链接，或者版权声明。`<footer>` 同样可以在页面中出现多次。

（10）`<address>`：用于标记联系人信息，比如地址信息。

（11）`<h1>` ~ `<h6>`：h1 到 h6 元素不能用于标记副标题、字幕、广告语，除非想把它们用作新区块或子区块的标题。

#### 2.3 H5 文本级元素

（1）`<b>`：表示只为引人注意而标记的文本，不传达更多的重要性信息，也不用于表达其他的愿望或情绪。比如，不用于文章摘要中的关键词、评测当中的产品名、交互式文本程序中的可执行命令，等等。

（2）`<em>`：表示内容中需要强调的部分。

（3）`<i>`：表示一段文本，用于表示另一种愿望或情绪，或者以突出不同文本形式的方式表达偏离正文的意思。

#### 2.4 新的媒体元素

（1）`<video>`：用于在页面中嵌入视频，`<video>` 标签必须成对使用。如果浏览器不支持此标签，可以在其中潜入一段文字，用于提示。

```html
<video src="myVideo.mp4" width="640" height="480">
  What, do you mean you don't understand HTML5?
</video> 
```

对于某些旧版本浏览器，可以使用 `<source>` 标签以提供后备资源。比如，除了提供 MP4 版本的视频，如果想某些低版本浏览器也能看到视频，可以添加一个 Flash源 作为后备。或者，如果用户浏览器没有任何播放条件，还可以提供一个下载视频的链接。

```html
<video width="640" height="480" controls preload="auto" loop poster="myVideoPoster.png">
  <source src="video/myVideo.mp4" type="video/mp4"> 
  <object
    width="640"
    height="480"
    type="application/x-shockwaveflash"
    data="myFlashVideo.SWF"
  >
    <param name="movie" value="myFlashVideo.swf" /> 
    <param name="flashvars" value="controlbar=over&amp;image=myVideoPoster.jpg&amp;file=myVideo.mp4" /> 
    <img
      src="myVideoPoster.png"
      width="640"
      height="480"
      alt="__ TITLE__"
      title="No video playback capabilities, please download the video below"
    /> 
  </object> 
  <p>
    <b>Download Video:</b> MP4 Format: <a href="myVideo.mp4">"MP4"</a> 
  </p> 
</video>
```

通常，很难对不同的视频播放画面做响应式设计，多数情况下，影片的播放比例并不相同。[这里](http://embedresponsively.com/) 有一个网站，你可以把视频的 url 地址粘贴进去，就会得到一段响应式代码，从而使得在网页缩放时，视频依然会保持应有的比例。

（2）`<audio>`：`<audio>` 用于在页面中嵌入音频，其用法与 `<video>` 类似。

#### 2.5 其他特性

（1）`<a>` 标签中可以放多个元素。

```html
<a href="index.html"> 
  <h2>The home page</h2> 
  <p>This paragraph also links to the home page</p> 
  <img src="home-image.png" alt="home-slice" /> 
</a> 
```

（2）WCAG 和 WAI-ARIA

WCAG 和 WAI-ARIA 提供了与无障碍交互相关的标准。

## 二、布局

布局的传统解决方案，基于盒状模型，依赖 `display` + `position` + `float` 等属性。而现代的布局方案，更多的是使用 Flex 和 Grid 布局。下面依次对他们进行介绍。

### 2.1 盒模型

CSS 盒模型指一个元素在页面上所占据的空间。由四部分组成：`content`、`padding`、`border` 和 `margin`。盒模型主要分为两种：标准盒模型和替代盒模型。

- 标准盒模型（content-box）：此模型元素的 `width` 和 `height`，只包含内容的宽高，不包含 `padding` 和 `border`。 此时 `padding`、`border` 和 `margin` 都在这个盒子的外部。
- 替代盒模型（border-box）：也叫 IE 盒子模型，此模型元素的 `width` 和 `height`，包含 `content`、`padding` 和 `border`。此时 `padding` 和 `border` 都在盒子内部。

可以通过 `box-sizing` 属性，指定元素使用哪种盒模型。

```css
box-sizing: content-box (默认) | border-box;
```

### 2.2 布局属性

先介绍几个跟布局相关的属性，他们是：`display`、`position` 和 `z-index`。

#### （1）display

`display` 属性设置元素是否被视为块级或行级盒子以及用于子元素的布局。其语法格式如下（以下只列出了 display 属性的几个常用取值）。

```css
display: flex | grid | none | block | inline | inline-block | table;
```

注意区分 `display: none`、`visibility: hidden` 及 `opacity: 0` 之间的区别。

- `display: none`：用于将元素完全从页面中移除，包括占用的空间。
- `visibility: hidden`：用于隐藏元素，但元素占用的空间会保留，且该元素仍会影响页面布局。
- `opacity: 0`：元素依然参与正常布局，且依然“可见”，只是该元素变为透明样式，但用户依然可以与其交互  ·。

#### （2）position

`position` 属性用于指定一个元素在页面的定位方式。其语法格式如下。

```css
position: static (默认) | relative | absolute | fixed | sticky;
```

- `static`：默认值，表示元素按照正常的文档流进行布局。使用 `static` 定位的元素不会被定位偏移（此时，`top`、`right`、`bottom` 和 `left` 属性无效）。
- `relative`：定位的元素相对于其正常位置进行偏移。使用 `relative` 定位的元素仍然占据原来的空间，但可以通过 `top`、`right`、`bottom` 和 `left` 属性进行偏移。适用于需要微调元素位置的场景。
- `absolute`：定位的元素脱离正常文档流，不再占据空间。使用 `absolute` 定位的元素相对于最近的非 `static` 的祖先元素进行定位。如果没有这样的祖先元素，则相对于网页的根元素 `<html>` 进行定位。适用于需要精确定位的场景。
- `fixed`：定位的元素脱离正常文档流，不再占据空间。使用 `fixed` 定位的元素相对于 视口（浏览器窗口）进行定位，即使页面滚动，其位置也不会改变。适用于需要固定位置的元素，如导航栏、工具栏等。
- `sticky`：定位的元素根据用户的滚动位置进行切换，介于 `relative` 和 `fixed` 之间。使用 `sticky` 定位的元素在跨越特定阈值（即 `top`、`right`、`bottom` 和 `left` 设置的值）之前表现为 `relative` 定位，跨越阈值后表现为 `fixed` 定位。适用于需要在滚动时固定位置的元素，如表头、侧边栏等。

  ```css
  #toolbar {
    top: 20px;
    position: sticky;
  }
  ```

  上面代码中，页面向下滚动时，`#toolbar` 的父元素开始脱离视口，一旦视口的顶部与 `#toolbar` 的距离小于 20px（门槛值），`#toolbar` 就自动变为 `fixed` 定位，保持与视口顶部 20px 的距离。页面继续向下滚动，父元素彻底离开视口（即整个父元素完全不可见），`#toolbar` 恢复成 `relative` 定位。

#### （3）z-index

`z-index` 属性用于控制重叠元素的层叠顺序。该属性只有在 `position` 属性值为 `relative`、`absolute`、`fixed` 或 `sticky` 时才有效。`z-index` 的值可以是正整数、负整数或零，值越大，元素的层级越高。

 <!-- Float 布局/清除浮动 -->

### 2.3 Flex 布局

Flex 是 Flexible Box 的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。任何一个容器都可以指定为 Flex 布局。

```css
.box{
  display: flex;
}

/* 也可以为行内元素开启 Flex 布局 */
.box{
  display: inline-flex;
}
```

注意，设为 Flex 布局以后，子元素的 `float`、`clear` 和 `vertical-align` 属性将失效。

#### 2.3.1 基本概念

采用 Flex 布局的元素，称为 Flex **容器**（container）。它的所有子元素自动成为容器成员，称为 Flex **项目**（item）。

容器默认存在两根轴：水平的**主轴**（main axis）和垂直的**交叉轴**（cross axis）。主轴的开始位置（与边框的交叉点）叫做 **main start**，结束位置叫做 **main end**；交叉轴的开始位置叫做 **cross start**，结束位置叫做 **cross end**。

**项目默认沿主轴排列**。单个项目占据的主轴空间叫做 **main size**，占据的交叉轴空间叫做 **cross size**。

#### 2.3.2 容器的属性

作用在容器上的属性有 6 个：`flex-direction`、`flex-wrap`、`flex-flow`、`justify-content`、`align-items` 和 `align-content`。下面，依次对他们进行讲解。

##### （1）flex-direction

`flex-direction` 用于决定主轴的方向（即项目的排列方向）。

```css
.box {
  flex-direction: row | row-reverse | column | column-reverse;
}
```

![flex-direction 属性](https://www.ruanyifeng.com/blogimg/asset/2015/bg2015071005.png)

- `row`（默认值）：主轴为水平方向，起点在左端。
- `row-reverse`：主轴为水平方向，起点在右端。
- `column`：主轴为垂直方向，起点在上沿。
- `column-reverse`：主轴为垂直方向，起点在下沿。

##### （2）flex-wrap

`flex-wrap` 默认情况下，项目都排在一条线（又称"轴线"）上。`flex-wrap` 属性定义，如果一条轴线排不下，如何换行。

```css
.box{
  flex-wrap: nowrap | wrap | wrap-reverse;
}
```

- `nowrap`（默认）：不换行。
- `wrap`：换行，第一行在上方。
- `wrap-reverse`：换行，第一行在下方。

##### （3）flex-flow

`flex-flow`：`flex-direction` 属性和 `flex-wrap` 属性的简写形式，默认值为 `row nowrap`。

```css
.box {
  flex-flow: <flex-direction> || <flex-wrap>;
}
```

##### （4）justify-content

`justify-content`：定义项目在主轴上的对齐方式。

```css
.box {
  justify-content: flex-start | flex-end | center | space-between | space-around;
}
```

![justify-content 属性](https://www.ruanyifeng.com/blogimg/asset/2015/bg2015071010.png)

它可能取5个值，具体对齐方式与轴的方向有关。下面假设主轴为从左到右。

- `flex-start`（默认值）：左对齐。
- `flex-end`：右对齐。
- `center`： 居中。
- `space-between`：两端对齐，项目之间的间隔都相等。
- `space-around`：每个项目两侧的间隔相等。所以，项目之间的间隔比项目与边框的间隔大一倍。

##### （5）align-items

`align-items`：定义项目在交叉轴上的对齐方式。

```css
.box {
  align-items: flex-start | flex-end | center | baseline | stretch;
}
```

![align-items 属性](https://www.ruanyifeng.com/blogimg/asset/2015/bg2015071011.png)

它可能取5个值。具体的对齐方式与交叉轴的方向有关，下面假设交叉轴从上到下。

- `flex-start`：交叉轴的起点对齐。
- `flex-end`：交叉轴的终点对齐。
- `center`：交叉轴的中点对齐。
- `baseline`: 项目的第一行文字的基线对齐。
- `stretch`（默认值）：如果项目未设置高度或设为 `auto`，将占满整个容器的高度。

##### （6）align-content

align-content：定义多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

```css
.box {
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

![align-content 属性](https://www.ruanyifeng.com/blogimg/asset/2015/bg2015071012.png)

- `flex-start`：与交叉轴的起点对齐。
- `flex-end`：与交叉轴的终点对齐。
- `center`：与交叉轴的中点对齐。
- `space-between`：与交叉轴两端对齐，轴线之间的间隔平均分布。
- `space-around`：每根轴线两侧的间隔都相等。所以，轴线之间的间隔比轴线与边框的间隔大一倍。
- `stretch`（默认值）：轴线占满整个交叉轴。

#### 2.3.3 项目的属性

作用在项目上的属性有 6 个：`order`、`flex-grow`、`flex-shrink`、`flex-basis`、`flex` 和 `align-self`。下面，依次对他们进行讲解。

##### （1）order

`order` 定义项目的排列顺序。数值越小，排列越靠前，默认为 0。

```css
.item {
  order: <integer>;
}
```

##### （2）flex-grow

`flex-grow` 定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大。

```css
.item {
  flex-grow: <number>; /* default 0 */
}
```

如果所有项目的 `flex-grow` 属性都为 1，则它们将等分剩余空间（如果有的话）。如果一个项目的 `flex-grow` 属性为 2，其他项目都为 1，则前者占据的剩余空间将比其他项多一倍。

##### （3）flex-shrink

`flex-shrink` 定义项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小。

```css
.item {
  flex-shrink: <number>; /* default 1 */
}
```

如果所有项目的 `flex-shrink` 属性都为 1，当空间不足时，都将等比例缩小。如果一个项目的 `flex-shrink` 属性为 0，其他项目都为 1，则空间不足时，前者不缩小。负值对该属性无效。

##### （4）flex-basis

`flex-basis` 定义在分配多余空间之前，项目占据的主轴空间（main size）。浏览器根据这个属性，计算主轴是否有多余空间。它的默认值为 `auto`，即项目的本来大小。

```css
.item {
  flex-basis: <length> | auto; /* default auto */
}
```

它可以设为跟 `width` 或 `height` 属性一样的值（比如 350px），则项目将占据固定空间。

##### （5）flex

`flex` 属性是 `flex-grow`, `flex-shrink` 和 `flex-basis` 的简写，默认值为 `0 1 auto`。后两个属性可选。

该属性有两个快捷值：`auto` (`1 1 auto`) 和 `none` (`0 0 auto`)。建议优先使用这个属性，而不是单独写三个分离的属性，因为浏览器会推算相关值。

##### （6）align-self

`align-self` 属性允许单个项目有与其他项目有不一样的对齐方式，可覆盖 `align-items` 属性。默认值为 `auto`，表示继承父元素的 `align-items` 属性，如果没有父元素，则等同于 `stretch`。

```css
.item {
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

![align-self 属性](https://www.ruanyifeng.com/blogimg/asset/2015/bg2015071016.png)

该属性可能取 6 个值，除了 `auto`，其他都与 `align-items` 属性完全一致。

### 2.4 Grid 布局

网格布局（Grid）将网页划分成一个个网格，可以任意组合不同的网格，做出各种各样的布局。

Flex 布局是轴线布局，只能指定"项目"针对轴线的位置，可以看作是**一维布局**。Grid 布局则是将容器划分成"**行**"和"**列**"，产生单元格，然后指定"项目所在"的单元格，可以看作是**二维布局**。

#### 2.4.1 基本概念

（1）采用网格布局的区域，称为**容器**（container）。容器内部采用网格定位的子元素，称为**项目**（item）。

注意：项目只能是容器的**顶层子元素**，不包含项目的子元素。Grid 布局只对项目生效。

（2）容器里面的水平区域称为"**行**"（row），垂直区域称为"**列**"（column）。

![Grid 布局的行和列](https://cdn.beekka.com/blogimg/asset/201903/1_bg2019032502.png)

（3）行和列的交叉区域，称为"**单元格**"（cell）。正常情况下，`n` 行和 `m` 列会产生 `n x m` 个单元格。比如，3 行 3 列会产生 9 个单元格。

（4）划分网格的线，称为"**网格线**"（grid line）。水平网格线划分出行，垂直网格线划分出列。

正常情况下，`n` 行有 `n + 1` 根水平网格线，`m` 列有 `m + 1` 根垂直网格线，比如三行就有四根水平网格线。

![Grid 布局的网格线](https://cdn.beekka.com/blogimg/asset/201903/1_bg2019032503.png)

上图是一个 4 x 4 的网格，共有 5 根水平网格线和 5 根垂直网格线。

#### 2.4.2 容器属性

##### （1）display

`display: grid` 指定一个容器采用网格布局。

```css
div {
  display: grid;
}
```

![display: grid 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032504.png)

上图是 `display: grid` 的[效果](https://jsbin.com/guvivum/edit?html,css,output)。

默认情况下，容器元素都是块级元素，但也可以设成行内元素。

```css
div {
  display: inline-grid;
}
```

![display: inline-grid 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032505.png)

上图是 `display: inline-grid` 的[效果](https://jsbin.com/qatitav/edit?html,css,output)。

注意，设为网格布局以后，容器子元素（项目）的 `float`、`display: inline-block`、`display: table-cell`、`vertical-align` 和 `column-*` 等设置都将失效。

##### （2）`grid-template-columns` 属性、`grid-template-rows` 属性

`grid-template-columns` 属性定义每列的列宽，`grid-template-rows` 属性定义每行的行高。

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
}
```

[上面代码](https://jsbin.com/qiginur/edit?css,output)指定了一个三行三列的网格，列宽和行高都是 100px。

![grid-template-rows 属性，grid-template-columns 属性](https://cdn.beekka.com/blogimg/asset/201903/bg2019032506.png)

除了使用**绝对单位**，也可以使用**百分比**。

```css
.container {
  display: grid;
  grid-template-columns: 33.33% 33.33% 33.33%;
  grid-template-rows: 33.33% 33.33% 33.33%;
}
```

- `repeat()`：函数用于重复一组值。上面的代码用 `repeat()` 改写如下。

  ```css
  .container {
    display: grid;
    grid-template-columns: repeat(3, 33.33%);
    grid-template-rows: repeat(3, 33.33%);
  }
  ```

  `repeat()` 接受两个参数，第一个参数是重复的次数（上例是 3），第二个参数是所要重复的值。`repeat()` 也可以重复某种模式。

  ```css
  grid-template-columns: repeat(2, 100px 20px 80px);
  ```

  上面代码定义了 6 列，第一列和第四列的宽度为 100px，第二列和第五列为 20px，第三列和第六列为 80px。

  ![repeat() 重复某种模式](https://cdn.beekka.com/blogimg/asset/201903/bg2019032507.png)

- `auto-fill` 关键字：表示自动填充。有时，单元格的大小是固定的，但是容器的大小不确定。如果希望每行（或每列）容纳尽可能多的单元格，这时可以使用 `auto-fill`。

  ```css
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
  }
  ```

  [上面代码](https://jsbin.com/himoku/edit?css,output)表示每列宽度 100px，然后自动填充，直到容器不能放置更多的列。

  ![auto-fill](https://cdn.beekka.com/blogimg/asset/201903/bg2019032508.png)

  除了 `auto-fill`，还有一个关键字 `auto-fit`，两者的行为基本是相同的。只有当容器足够宽，可以在一行容纳所有单元格，并且单元格宽度不固定的时候，才会有行为差异：`auto-fill` 会用空格子填满剩余宽度，`auto-fit` 则会尽量扩大单元格的宽度。

- `fr`（fraction 的缩写，意为"片段"）关键字：用于表示比例关系。如果两列的宽度分别为 1fr 和 2fr，就表示后者是前者的两倍。

  ```css
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  ```

  [上面代码](https://jsbin.com/hadexek/edit?html,css,output)表示两个相同宽度的列。

  ![fr 表示的相同宽度的列](https://cdn.beekka.com/blogimg/asset/201903/1_bg2019032509.png)

  `fr` 可以与绝对长度的单位结合使用。

  ```css
  .container {
    display: grid;
    grid-template-columns: 150px 1fr 2fr;
  }
  ```

  上面代码表示，第一列的宽度为 150px，第二列的宽度是第三列的一半。

  ![fr 与绝对长度的单位结合使用](https://cdn.beekka.com/blogimg/asset/201903/bg2019032510.png)

- `minmax()`：此函数用于产生一个长度范围，表示长度就在这个范围之中。它接受两个参数，分别为最小值和最大值。

  ```css
  grid-template-columns: 1fr 1fr minmax(100px, 1fr);
  ```

  上面代码中，`minmax(100px, 1fr)` 表示列宽不小于 100px，不大于 1fr。

- `auto` 关键字：表示由浏览器自己决定长度。

  ```css
  grid-template-columns: 100px auto 100px;
  ```

  上面代码中，第二列的宽度，基本上等于该列单元格的最大宽度，除非单元格内容设置了 `min-width`，且这个值大于最大宽度。

- 网格线的名称：`grid-template-columns` 属性和 `grid-template-rows` 属性里面，还可以使用方括号，指定每根网格线的名字，方便以后的引用。

  ```css
  .container {
    display: grid;
    grid-template-columns: [c1] 100px [c2] 100px [c3] auto [c4];
    grid-template-rows: [r1] 100px [r2] 100px [r3] auto [r4];
  }
  ```

  上面代码指定网格布局为 3 行 x 3 列，因此有 4 根垂直网格线和 4 根水平网格线。方括号里面依次是这八根线的名字。

  网格布局允许同一根线有多个名字，比如 `[fifth-line row-5]`。

- 布局实例

  `grid-template-columns` 属性对于网页布局非常有用。两栏式布局只需要一行代码。

  ```css
  .wrapper {
    display: grid;
    grid-template-columns: 70% 30%;
  }
  ```

  上面代码将左边栏设为 70%，右边栏设为 30%。传统的十二网格布局，写起来也很容易。

  ```css
  grid-template-columns: repeat(12, 1fr);
  ```

##### （3）`grid-row-gap` 属性、`grid-column-gap` 属性、`grid-gap` 属性

`grid-row-gap` 属性设置行与行的间隔（行间距），`grid-column-gap` 属性设置列与列的间隔（列间距）。

```css
.container {
  grid-row-gap: 20px;
  grid-column-gap: 20px;
}
```

[上面代码](https://jsbin.com/mezufab/edit?css,output)中，`grid-row-gap` 用于设置行间距，grid-column-gap 用于设置列间距。

![grid-row-gap 属性、grid-column-gap 属性](https://cdn.beekka.com/blogimg/asset/201903/bg2019032511.png)

`grid-gap` 属性是 `grid-column-gap` 和 `grid-row-gap` 的合并简写形式，语法如下。

```css
grid-gap: <grid-row-gap> <grid-column-gap>;
```

因此，上面一段 CSS 代码等同于下面的代码。

```css
.container {
  grid-gap: 20px 20px;
}
```

如果 `grid-gap` 省略了第二个值，浏览器认为第二个值等于第一个值。

注意，根据最新标准，上面三个属性名的 `grid-` 前缀已经删除，`grid-column-gap` 和 `grid-row-gap` 写成 column-gap 和 `row-gap`，`grid-gap` 写成 `gap`。

##### （4）`grid-template-areas` 属性

网格布局允许指定"**区域**"（area），一个区域由单个或多个单元格组成。`grid-template-areas` 属性用于定义区域。

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-template-areas: 'a b c'
                       'd e f'
                       'g h i';
}
```

上面代码先划分出 9 个单元格，然后将其定名为 `a` 到 `i` 的九个区域，分别对应这九个单元格。

多个单元格合并成一个区域的写法如下。

```css
grid-template-areas: 'a a a'
                     'b b b'
                     'c c c';
```

上面代码将9个单元格分成 `a`、`b`、`c` 三个区域。

下面是一个布局实例。

```css
grid-template-areas: "header header header"
                     "main main sidebar"
                     "footer footer footer";
```

上面代码中，顶部是页眉区域 `header`，底部是页脚区域 `footer`，中间部分则为 `main` 和 `sidebar`。

如果某些区域不需要利用，则使用"点"（`.`）表示。

```css
grid-template-areas: 'a . c'
                     'd . f'
                     'g . i';
```

上面代码中，中间一列为点，表示没有用到该单元格，或者该单元格不属于任何区域。

注意，区域的命名会影响到网格线。每个区域的起始网格线，会自动命名为区域名 `-start`，终止网格线自动命名为区域名 `-end`。比如，区域名为 `header`，则起始位置的水平网格线和垂直网格线叫做 `header-start`，终止位置的水平网格线和垂直网格线叫做 `header-end`。

##### （5）`grid-auto-flow` 属性

划分网格以后，容器的子元素会按照顺序，自动放置在每一个网格。默认的放置顺序是"先行后列"，即先填满第一行，再开始放入第二行，即下图数字的顺序。

![子元素排列顺序](https://cdn.beekka.com/blogimg/asset/201903/bg2019032506.png)

这个顺序由 `grid-auto-flow` 属性决定，默认值是 `row`，即"**先行后列**"。也可以将它设成 `column`，变成"**先列后行**"。

```css
grid-auto-flow: column;
```

[上面代码](https://jsbin.com/xutokec/edit?css,output)设置了 `column` 以后，放置顺序就变成了下图。

![按照 column 方式排列](https://cdn.beekka.com/blogimg/asset/201903/bg2019032512.png)

`grid-auto-flow` 属性除了设置成 `row` 和 `column`，还可以设成 `row dense` 和 `column dense`。这两个值主要用于，某些项目指定位置以后，剩下的项目怎么自动放置。

[下面的例子](https://jsbin.com/wapejok/edit?css,output)让 1 号项目和 2 号项目各占据两个单元格，然后在默认的 grid-auto-flow: row 情况下，会产生下面这样的布局。

![grid-auto-flow: row 时，元素的排列方式](https://cdn.beekka.com/blogimg/asset/201903/bg2019032513.png)

上图中，1 号项目后面的位置是空的，这是因为 3 号项目默认跟着 2 号项目，所以会排在 2 号项目后面。

现在修改设置，设为 `row dense`，表示"先行后列"，并且尽可能紧密填满，尽量不出现空格。

```css
grid-auto-flow: row dense;
```

[上面代码](https://jsbin.com/helewuy/edit?css,output)的效果如下。

![grid-auto-flow: row dense 时，元素的排列方式](https://cdn.beekka.com/blogimg/asset/201903/bg2019032514.png)

上图会先填满第一行，再填满第二行，所以 3 号项目会紧跟在 1 号项目的后面。8 号项目和 9 号项目就会排到第四行。

如果将设置改为 `column dense`，表示"先列后行"，并且尽量填满空格。

```css
grid-auto-flow: column dense;
```

[上面代码](https://jsbin.com/pupoduc/1/edit?html,css,output)的效果如下。

![grid-auto-flow: column dense 时，元素的排列方式](https://cdn.beekka.com/blogimg/asset/201903/bg2019032515.png)

上图会先填满第一列，再填满第 2 列，所以 3 号项目在第一列，4 号项目在第二列。8 号项目和 9 号项目被挤到了第四列。

##### （6）`justify-items` 属性、`align-items` 属性、`place-items` 属性

`justify-items` 属性设置单元格内容的**水平位置**（左中右），`align-items` 属性设置单元格内容的**垂直位置**（上中下）。

```css
.container {
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```

这两个属性的写法完全相同，都可以取下面这些值。

- `start`：对齐单元格的起始边缘。
- `end`：对齐单元格的结束边缘。
- `center`：单元格内部居中。
- `stretch`：拉伸，占满单元格的整个宽度（默认值）。

```css
.container {
  justify-items: start;
}
```

[上面代码](https://jsbin.com/gijeqej/edit?css,output)表示，单元格的内容左对齐，效果如下图。

![justify-items: start 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032516.png)

```css
.container {
  align-items: start;
}
```

[上面代码](https://jsbin.com/tecawur/edit?css,output)表示，单元格的内容头部对齐，效果如下图。

![align-items: start 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032517.png)

`place-items` 属性是 `align-items` 属性和 `justify-items` 属性的合并简写形式。

```css
place-items: <align-items> <justify-items>;
```

如果省略第二个值，则浏览器认为与第一个值相等。

##### （7）`justify-content` 属性、`align-content` 属性、`place-content` 属性

`justify-content` 属性是整个内容区域在容器里面的**水平位置**（左中右），`align-content` 属性是整个内容区域的**垂直位置**（上中下）。

```css
.container {
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;  
}
```

这两个属性的写法完全相同，都可以取下面这些值。（下面的图都以 `justify-content` 属性为例，`align-content` 属性的图完全一样，只是将水平方向改成垂直方向。）

- `start` - 对齐容器的起始边框。

  ![justify-content: start 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032519.png)

- `end` - 对齐容器的结束边框。

  ![justify-content: end 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032518.png)

- `center` - 容器内部居中。

  ![justify-content: center 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032520.png)

- `stretch` - 项目大小没有指定时，拉伸占据整个网格容器。

  ![justify-content: stretch 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032521.png)

- `space-around` - 每个项目两侧的间隔相等。所以，项目之间的间隔比项目与容器边框的间隔大一倍。

  ![justify-content: space-around 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032522.png)

- `space-between` - 项目与项目的间隔相等，项目与容器边框之间没有间隔。

  ![justify-content: space-between 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032523.png)

- `space-evenly` - 项目与项目的间隔相等，项目与容器边框之间也是同样长度的间隔。

  ![justify-content: space-evenly 的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032524.png)

`place-content` 属性是 `align-content` 属性和 `justify-content` 属性的合并简写形式。

```css
place-content: <align-content> <justify-content>
```

如果省略第二个值，浏览器就会假定第二个值等于第一个值。

##### （8）`grid-auto-columns` 属性、`grid-auto-rows` 属性

有时候，一些项目的指定位置，在现有网格的外部。比如网格只有3列，但是某一个项目指定在第5行。这时，浏览器会自动生成多余的网格，以便放置项目。

`grid-auto-columns` 属性和 `grid-auto-rows` 属性用来设置，浏览器自动创建的多余网格的列宽和行高。它们的写法与 `grid-template-columns` 和 `grid-template-rows` 完全相同。如果不指定这两个属性，浏览器完全根据单元格内容的大小，决定新增网格的列宽和行高。

[下面的例子](https://jsbin.com/sayuric/edit?css,output)里面，划分好的网格是 3 行 x 3 列，但是，8 号项目指定在第 4 行，9 号项目指定在第 5 行。

```css
.container {
  display: grid;
  grid-template-columns: 100px 100px 100px;
  grid-template-rows: 100px 100px 100px;
  grid-auto-rows: 50px; 
}
```

上面代码指定新增的行高统一为 50px（原始的行高为 100px）。

![grid-auto-columns 属性、grid-auto-rows 属性](https://cdn.beekka.com/blogimg/asset/201903/bg2019032525.png)

##### （9）`grid-template` 属性、`grid` 属性

`grid-template` 属性是 `grid-template-columns`、`grid-template-rows` 和 `grid-template-areas` 这三个属性的合并简写形式。

grid 属性是 `grid-template-rows`、`grid-template-columns`、`grid-template-areas`、`grid-auto-rows`、`grid-auto-columns`、`grid-auto-flow` 这六个属性的合并简写形式。

从易读易写的角度考虑，还是建议不要合并属性，所以这里就不详细介绍这两个属性了。

#### 2.4.3 项目属性

##### （1）`grid-column-start` 属性、`grid-column-end` 属性、`grid-row-start` 属性、`grid-row-end` 属性、`grid-column` 属性、`grid-row` 属性

项目的位置是可以指定的，具体方法就是指定项目的四个边框，分别定位在哪根网格线。

- `grid-column-start`：左边框所在的垂直网格线
- `grid-column-end`：右边框所在的垂直网格线
- `grid-row-start`：上边框所在的水平网格线
- `grid-row-end`：下边框所在的水平网格线

```css
.item-1 {
  grid-column-start: 2;
  grid-column-end: 4;
}
```

[上面代码](https://jsbin.com/yukobuf/edit?css,output)指定，1 号项目的左边框是第二根垂直网格线，右边框是第四根垂直网格线。

![grid-column-start: 2且grid-column-end: 4时的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032526.png)

上图中，只指定了 1 号项目的左右边框，没有指定上下边框，所以会采用默认位置，即上边框是第一根水平网格线，下边框是第二根水平网格线。

除了 1 号项目以外，其他项目都没有指定位置，由浏览器自动布局，这时它们的位置由容器的 `grid-auto-flow` 属性决定，这个属性的默认值是 `row`，因此会"先行后列"进行排列。读者可以把这个属性的值分别改成 `column`、`row dense` 和 `column dense`，看看其他项目的位置发生了怎样的变化。

[下面的例子](https://jsbin.com/nagobey/edit?html,css,output)是指定四个边框位置的效果。

```css
.item-1 {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: 4;
}
```

![grid-column-start: 1 且 grid-column-end: 3 且 grid-row-start: 2 且 grid-row-end: 4时的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032527.png)

这四个属性的值，除了指定为第几个网格线，还可以指定为网格线的名字。

```css
.item-1 {
  grid-column-start: header-start;
  grid-column-end: header-end;
}
```

上面代码中，左边框和右边框的位置，都指定为网格线的名字。

这四个属性的值还可以使用 `span` 关键字，表示"**跨越**"，即左右边框（上下边框）之间跨越多少个网格。

```css
.item-1 {
  grid-column-start: span 2;
}
```

[上面代码](https://jsbin.com/hehumay/edit?html,css,output)表示，1 号项目的左边框距离右边框跨越 2 个网格。

![`grid-column-start: span 2` 时的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032528.png)

这与[下面的代码](https://jsbin.com/mujihib/edit?html,css,output)效果完全一样。

```css
.item-1 {
  grid-column-end: span 2;
}
```

`grid-column` 属性是 `grid-column-start` 和 `grid-column-end` 的合并简写形式，`grid-row` 属性是 `grid-row-start` 属性和 `grid-row-end` 的合并简写形式。

```css
.item {
  grid-column: <start-line> / <end-line>;
  grid-row: <start-line> / <end-line>;
}
```

下面是一个例子。

```css
.item-1 {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}

/* 等同于 */
.item-1 {
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
}
```

上面代码中，项目 item-1 占据第一行，从第一根列线到第三根列线。

这两个属性之中，也可以使用 span 关键字，表示跨越多少个网格。

```css
.item-1 {
  background: #b03532;
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

/* 等同于 */
.item-1 {
  background: #b03532;
  grid-column: 1 / span 2;
  grid-row: 1 / span 2;
}
```

[上面代码](https://jsbin.com/volugow/edit?html,css,output)中，项目 `item-1` 占据的区域，包括第一行 + 第二行、第一列 + 第二列。

![grid-column: 1 / 3 且 grid-row: 1 / 3 时 item-1 占据的区域](https://cdn.beekka.com/blogimg/asset/201903/bg2019032529.png)

斜杠以及后面的部分可以省略，默认跨越一个网格。

```css
.item-1 {
  grid-column: 1;
  grid-row: 1;
}
```

上面代码中，项目 `item-1` 占据左上角第一个网格。

##### （2）`grid-area` 属性

`grid-area` 属性指定项目放在哪一个区域。

```css
.item-1 {
  grid-area: e;
}
```

上面代码中，1 号项目位于 `e` 区域，效果如下图。

![grid-area: e 时的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032530.png)

`grid-area` 属性还可用作 `grid-row-start`、`grid-column-start`、`grid-row-end`、`grid-column-end` 的合并简写形式，直接指定项目的位置。

```css
.item {
  grid-area: <row-start> / <column-start> / <row-end> / <column-end>;
}
```

下面是一个[例子](https://jsbin.com/duyafez/edit?css,output)。

```css
.item-1 {
  grid-area: 1 / 1 / 3 / 3;
}
```

（3）`justify-self` 属性、`align-self` 属性、`place-self` 属性

- `justify-self` 属性设置单元格内容的水平位置（左中右），跟 `justify-items` 属性的用法完全一致，但只作用于单个项目。
- `align-self` 属性设置单元格内容的垂直位置（上中下），跟 `align-items` 属性的用法完全一致，也是只作用于单个项目。

```css
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
}
```

这两个属性都可以取下面四个值。

- `start`：对齐单元格的起始边缘。
- `end`：对齐单元格的结束边缘。
- `center`：单元格内部居中。
- `stretch`：拉伸，占满单元格的整个宽度（默认值）。

下面是 `justify-self: start` 的例子。

```css
.item-1  {
  justify-self: start;
}
```

![justify-self: start 时的效果](https://cdn.beekka.com/blogimg/asset/201903/bg2019032532.png)

`place-self` 属性是 `align-self` 属性和 `justify-self` 属性的合并简写形式。

```css
place-self: <align-self> <justify-self>;
```

如果省略第二个值，`place-self` 属性会认为这两个值相等。

## 三、媒体查询（Media Queries）

- [ ] 屏幕尺寸查询 (width, height)
- [ ] 设备方向查询 (orientation)
- [ ] 像素密度查询 (resolution, -webkit-device-pixel-ratio)
- [ ] 颜色和对比度查询 (prefers-color-scheme)
- [ ] 动画偏好查询 (prefers-reduced-motion)
- [ ] 悬停能力查询 (hover, pointer)

**媒体查询**（Media Queries）是响应式设计的核心技术，使网页能够适应不同的设备和屏幕尺寸。即根据设备的特性（如屏幕宽度、高度、分辨率等）应用不同的样式。

媒体查询中常用的媒体特性如下。

- `width`：视口的宽度。
- `height`：视口的高度。
- `device-width`：设备屏幕的宽度。
- `device-height`：设备屏幕的高度。
- `resolution`：设备屏幕的分辨率，通常以 `dpi`（每英寸点数）或 `dppx`（每像素点数）表示。
- `orientation`：设备的方向，可以是 `portrait` 或 `landscape`。
- `aspect-ratio`：视口的宽高比。不如，16∶9 的宽屏显示器可以写成 `aspect-ratio: 16/9`。
- `color`：设备的颜色位深。
- `color-index`：设备颜色查找表中的条目数，值必须是数值，且不能为负。
- `monochrome`：单色帧缓冲中表示每个像素的位数，值必须是数值（整数），比如 `monochrome: 2`，且不能为负。
- `scan`：针对电视的逐行扫描（progressive）和隔行扫描（interlace）。例如 720p HD TV（720p 中的 `p` 表示 progressive，即逐行）可以使用 `scan: progressive` 来判断； 而 1080i HD TV（1080i 中的 `i` 表示 interlace，即隔行）可以使用 `scan: interlace` 来判断。
- `grid`：设备基于栅格还是位图。

上面列表中的特性，除 `grid` 外，都可以加上 `min-` 或 `max-` 前缀以指定范围。

#### （1）媒体查询的语法

下面是一个最简单的媒体查询语法结构。

```css
@media media-type and (media-feature) {
  /* CSS规则 */
}
```

- `media-type`：指定设备类型，如 `screen`、`print` 等。可以省略，表示适用于所有类型（此时 `media-type: all`）。
- `media-feature`：指定的媒体特性，如 `max-width`、`min-width` 等。

也可以在 `<link>` 标签的 `media` 属性中指定设备类型。

```html
<link rel="style sheet" type="text/css" media="screen" href="style.css"> 
```

#### （2）组合媒体查询

多个媒体查询组合，使用逗号（`,`）分隔不同的查询条件。表示如果任意一个条件为真则应用样式。还可以使用逻辑运算符 `and`、`or`、`not` 组合多个条件。

```css
/* 适用于屏幕最大宽度为600px或屏幕高度为 800px 的设备 */
@media screen and (max-width: 600px), screen and (max-height: 800px) {
  body {
    background-color: lightblue;
  }
}

/* 适用于屏幕宽度在 600px 到 1200px 之间且横向模式的设备 */
@media screen and (min-width: 600px) and (max-width: 1200px) and (orientation: landscape) {
  body {
    background-color: lightgreen;
  }
}
```

可以在使用 `@import` 导入 CSS 时使用媒体查询，有条件地向当前样式表中加载其他样式表。

```css
@import url("phone.css") screen and (max-width:360px); 
```

上面的代码表示，`phone.css` 样式表生效的条件是：设备类型必须是屏幕设备，且视口不超过 360px。

注意，在针对所有设备的媒体查询中，可以使用简写语法，即省略关键字 `all`（以及紧随其后的 `and`）。换句话说，如果不指定关键字，则关键字就是 `all`。

断点策略
- [ ] 定义标准断点尺寸
  - [ ] 超小屏 (xs): 0-575px
  - [ ] 小屏 (sm): 576-767px  
  - [ ] 中屏 (md): 768-991px
  - [ ] 大屏 (lg): 992-1199px
  - [ ] 超大屏 (xl): 1200px+
- [ ] 采用移动优先策略 (Mobile First)
- [ ] 使用 min-width 媒体查询
- [ ] 避免过多断点，保持简洁


- [ ] 使用逻辑断点而非设备特定断点
- [ ] 避免过多嵌套的媒体查询
- [ ] 合理组织媒体查询顺序
- [ ] 考虑打印样式 (@media print)

## 四、单位系统

- [ ] 使用相对单位替代固定像素
  - [ ] rem/em 用于字体和间距
  - [ ] % 用于宽度和高度
  - [ ] vw/vh 用于视口相关尺寸
  - [ ] fr 用于 Grid 布局
- [ ] 建立一致的间距系统
- [ ] 设置合理的根字体大小

## 五、响应式资源

- [ ] 使用 srcset 属性提供多种分辨率
- [ ] 配置 sizes 属性指定显示尺寸
- [ ] 实现 picture 元素的艺术方向
- [ ] 设置合适的图片格式 (WebP, AVIF)
- [ ] 添加 loading="lazy" 懒加载
- [ ] 提供 alt 文本和占位符

### 5.1 响应式图片

<!-- ### 3.5.1 `srcset` 属性 -->

`srcset` 属性用来指定多张图像，适应**不同像素密度**的屏幕。它的值是一个逗号分隔的字符串，每个部分都是一张图像的 URL，后面接一个空格，然后是像素密度的描述符。请看下面的例子。

```css
<img srcset="foo-320w.jpg,
             foo-480w.jpg 1.5x,
             foo-640w.jpg 2x"
     src="foo-640w.jpg">
```

上面代码中，`srcset` 属性给出了三个图像 URL，适应三种不同的像素密度。

浏览器会根据当前设备的像素密度，选择需要加载的图像。如果 `srcset` 属性都不满足条件，那么就加载 `src` 属性指定的默认图像。

<!-- ### 3.5.2 `srcset` 属性、`sizes` 属性 -->

`sizes` 属性与 `srcset` 属性配合使用，可以实现根据不同的设备宽度应用不同尺寸的图像。其实现步骤如下。

1. `srcset` 属性列出所有可用的图像。

  ```css
  <img srcset="foo-160.jpg 160w,
              foo-320.jpg 320w,
              foo-640.jpg 640w,
              foo-1280.jpg 1280w"
      src="foo-1280.jpg">
  ```

  上面代码中，`srcset` 属性列出四张可用的图像，每张图像的 URL 后面是一个空格，再加上宽度描述符。**宽度描述符就是图像原始的宽度，加上字符 `w`**。上例的四种图片的原始宽度分别为 160px、320px、640px 和 1280px。
2. `sizes` 属性列出不同设备的图像显示宽度。

  `sizes` 属性的值是一个逗号分隔的字符串，除了最后一部分，前面每个部分都是一个放在括号里面的媒体查询表达式，后面是一个空格，再加上图像的显示宽度。

  ```css
  <img sizes="(max-width: 440px) 100vw,
              (max-width: 900px) 33vw,
              254px"
      srcset="foo-160.jpg 160w,
              foo-320.jpg 320w,
              foo-640.jpg 640w,
              foo-1280.jpg 1280w"
      src="foo-1280.jpg">
  ```

  上面代码中，`sizes` 属性给出了三种屏幕条件，以及对应的图像显示宽度。宽度不超过 440px 的设备，图像显示宽度为 100%；宽度 441px 到 900px 的设备，图像显示宽度为 33%；宽度 900px 以上的设备，图像显示宽度为 254px。
3. 浏览器根据当前设备的宽度，从 `sizes` 属性获得图像的显示宽度，然后从 `srcset` 属性找出最接近该宽度的图像，进行加载。

  假定当前设备的屏幕宽度是 480px，浏览器从 `sizes` 属性查询得到，图片的显示宽度是 33vw（即 33%），等于 160px。`srcset` 属性里面，正好有宽度等于 160px 的图片，于是加载 `foo-160.jpg`。

  注意，`sizes` 属性必须与 `srcset` 属性搭配使用。单独使用 `sizes` 属性是无效的。

<!-- ### 3.5.3 `<picture>` 标签、`<source>` 标签 -->

使用 `<picture>` 标签和 `<source>` 标签，可以实现对不同尺寸及不同像素密度屏幕的适配。<picture> 标签是一个容器标签，内部使用 <source> 和 <img>，指定不同情况下加载的图像。

```css
<picture>
  <source media="(max-width: 500px)" srcset="cat-vertical.jpg">
  <source media="(min-width: 501px)" srcset="cat-horizontal.jpg">
  <img src="cat.jpg" alt="cat">
</picture>
```

上面代码中，`<picture>` 标签内部有两个 `<source>` 标签和一个 `<img>` 标签。

`<source>` 标签的 `media` 属性给出媒体查询表达式，`srcset` 属性就是 `<img>` 标签的 `srcset` 属性，给出加载的图像文件。`sizes` 属性其实这里也可以用，但由于有了 `media` 属性，就没有必要了。浏览器**按照** `<source>` **标签出现的顺序**，依次判断当前设备是否满足 `media` 属性的媒体查询表达式，如果满足就加载 `srcset` 属性指定的图片文件，并且不再执行后面的 `<source>` 标签和 `<img>` 标签。

`<img>` 标签是默认情况下加载的图像，用来满足上面所有 `<source>` 都不匹配的情况。

上面例子中，设备宽度如果不超过 500px，就加载竖屏的图像，否则加载横屏的图像。

下面给出一个例子，同时考虑屏幕尺寸和像素密度的适配。

```css
<picture>
  <source srcset="homepage-person@desktop.png,
                  homepage-person@desktop-2x.png 2x"       
          media="(min-width: 990px)">
  <source srcset="homepage-person@tablet.png,
                  homepage-person@tablet-2x.png 2x" 
          media="(min-width: 750px)">
  <img srcset="homepage-person@mobile.png,
               homepage-person@mobile-2x.png 2x" 
       alt="Shopify Merchant, Corrine Anestopoulos">
</picture>
```

上面代码中，`<source>` 标签的 `media` 属性给出屏幕尺寸的适配条件，每个条件都用 `srcset` 属性，再给出两种像素密度的图像 URL。

<!-- ### 3.5.4 `<source>` 标签的 `type` 属性 -->

除了响应式图像，`<picture>` 标签还可以用来选择不同格式的图像。比如，如果当前浏览器支持 Webp 格式，就加载这种格式的图像，否则加载 PNG 图像。

```css
<picture>
  <source type="image/svg+xml" srcset="logo.xml">
  <source type="image/webp" srcset="logo.webp"> 
  <img src="logo.png" alt="ACME Corp">
</picture>
```

上面代码中，`<source>` 标签的 `type` 属性给出图像的 MIME 类型，`srcset` 是对应的图像 URL。

浏览器按照 `<source>` 标签出现的顺序，依次检查是否支持 `type` 属性指定的图像格式，如果支持就加载图像，并且不再检查后面的 `<source>` 标签了。上面例子中，图像加载优先顺序依次为 svg 格式、webp 格式和 png 格式。

### 5.2 响应式视频

- [ ] 使用 CSS 实现视频容器比例
- [ ] 配置 video 元素的响应式属性
- [ ] 处理不同设备的自动播放策略
- [ ] 提供视频封面图 (poster)
- [ ] 考虑带宽限制，提供多种质量选项

### 5.3 响应式字体

- [ ] 建立字体大小层级系统
- [ ] 使用相对单位 (rem, em)
- [ ] 实现流体字体 (clamp, calc)
- [ ] 考虑不同屏幕的阅读距离
- [ ] 设置合适的行高和字间距

## 六、CSS3 新特性

这部分并不会讨论 CSS3 中所有的新特性，而只是讨论跟响应式设计有关的新特性。

### 5.1 CSS 响应式多列布局

以下示例，以下面的代码布局为例进行讲解。

```html
<main> 
  <p>lloremipsimLoremipsum dolor sit amet, consectetur ... </p> 
  <p>lloremipsimLoremipsum dolor sit amet, consectetur ... </p> 
</main>
```

（1）使用 CSS 多列布局可以通过几种方式让文本分成多列显示。比如，可以给每列设定固定的列宽。

```css
main { 
  column-width: 12em; 
}
```

上面的代码表示，设置没列的宽度为 12em，改变视口宽度时，列宽不变，列数动态改变。

（2）固定列数，可变宽度。

```css
main { 
  column-count: 4; 
}
```

上面的代码表示，当页面缩放时，列数固定，宽度可变。

（3）添加列间距和分隔线。

```css
main { 
  column-gap: 2em; 
  column-rule: thin dotted #999; 
  column-width: 12em; 
}
```

上面的代码，用于给列间添加间距和分隔线。

### 5.2 断字

（1）容器中的文字默认一行显示，如果文字太长，超出了容器的长度，就会显示在容器外面。可以使用下面的方式，对文字进行**换行**处理。

```css
word-wrap: break-word;
```

（2）可以对文字**截短**处理，并且使得超出容器宽度的部分，显示为 `...`。

```css
p { 
 width: 520px; 
 overflow: hidden; 
 text-overflow: ellipsis; 
 white-space: no-wrap; 
} 
```

最后的 `white-space: nowrap` 声明是为了确保长出来的文本不会折行显示在外部元素中。

### 5.3 在 CSS 中创建分支

在响应式设计，经常会碰到某些设备不支持什么特性或技术的情况。此时，往往需要在 CSS 中创建一个分支。如果浏览器支持某特性，就应用一段代码；如果不支持，则应用另一段代码。这点类似于 JavaScript 中 `if...else` 语句。

在 CSS 中创建分支有两种手段。一是完全基于 CSS，但支持的浏览器却不多； 二是借助 JavaScript 库，获得广泛兼容性。

（1）特性查询

CSS 原生的分支语法就是特性查询，比如下面的代码。

```css
@supports (display: flex) { 
  .item { 
    display: inline-flex; 
  } 
}

@supports not (display: flex) { 
  .item { 
    display: inline-block; 
  } 
} 
```

上面的代码表示，如果浏览器支持 `display: flex`，就对 `.item` 选择器设置一种样式；否则，则设置为另一种样式。

（2）组合条件

假设我们只想在浏览器支持 flexbox 和 `pointer: coarse` 时应用某些规则，可以使用下面的代码。

```css
@supports ((display: flex) and (pointer: coarse)) { 
  .item { 
    display: inline-flex; 
  } 
} 
```

上面的代码，使用 `and` 关键字，其他支持的关键字还有 `or`。比如，除了前面两个条件满足之外，如果浏览器支持 3D 变形也想应用样式，那么可以使用下面的代码。

```css
@supports ((display: flex) and (pointer: coarse)) or (transform: translate3d(0, 0, 0)) { 
  .item { 
    display: inline-flex; 
  } 
} 
```

注意，某些低版本及 IE 浏览器，并不支持 `@support` 关键字。

（3）在 `@supports` 得到广泛支持以前，还可以使用 Modernizr 这个 JavaScript 工具在 CSS 中实现分支。

### 5.4 新的 CSS3 选择器

（1）属性选择器，用于对某些元素的属性进行选择。

```css
img[alt] { 
  border: 3px dashed #e15f5f; 
} 
```

上面的代码，表示选中任何包含 `alt` 属性的 `<img>` 元素。

```css
img[alt="sausages"] { 
  /* 样式 */ 
}
```

上面的代码，只会选择 `alt` 属性值为 `sausages` 的 `<img>`元素。即同时指定了属性的值，进一步缩小了搜索范围。

CSS3 支持依据属性选择器包含的子字符串来选择元素。这时分为三种情况：

- 以 xxx 开头。
- 包含 xxx。
- 以 xxx 结尾。

（2）选中属性值以某字符串开头的元素。

```html
<img src="img/ace-film.jpg" alt="film-ace"> 
<img src="img/rubbish-film.jpg" alt="film-rubbish"> 
```

```css
img[alt^="film"] { 
  /* 样式 */ 
} 
```

上面的代码，使用 `^` 符号，匹配 `alt` 属性值中以 `film` 字符串开头的情况。即此时会选中 `<img>` 表情中，`alt` 属性以 `film` 开头的元素（在这里会同时选中上边的两个 `<img>` 标签）。

（2）选中属性值包含某字符串的元素。

```html
<p data-ingredients="scones cream jam">Will I get selected?</p>
```

```css
[data-ingredients*="cream"] { 
  color: red; 
} 
```

上面的属性选择器，使用 `*` 符号，匹配 `data-ingredients` 属性值中包含 `cream` 字符串的情况。此时 `<p>` 标签会被选中。

（3）选中属性值以某字符串结尾的元素。

```html
<p data-ingredients="scones cream jam">Will I get selected?</p> 
<p data-ingredients="toast jam butter">Will I get selected?</p> 
<p data-ingredients="jam toast butter">Will I get selected?</p> 
```

```css
[data-ingredients$="jam"] { 
  color: red; 
} 
```

上面的属性选择器，使用 `$` 符号，匹配 `data-ingredients` 属性值中以 `jam` 字符串结尾的情况。此时，第一个 `<p>` 标签会被选中。

### 5.5 伪类选择器

- `:last-child`：用于选择某个父元素中的最后一个子元素。
- `:nth-child(n)`：
- `:nth-last-child(n)`：
- `:nth-of-type(n)`：
- `:nth-last-of-type(n)`：
- `:not`：
- `:empty`：
- `:first-line`：
- `:has`：

### 5.6 `calc()` 函数

### 5.7 CSS3 的新颜色格式及透明度

（1）可以使用 `rgb()` 或 `rgba()` 函数定义颜色，前者接收三个参数（取值为 0 ~ 255），分别表示红、绿、蓝三原色分量的值，后者除了这三个参数，还可以接受一个 alpha 透明度数值，取值为 0 ~ 1。

（2）CSS3 还支持HSL（Hue Saturation Lightness，色相、饱和度、亮度）颜色系统。

## 七、交互和用户体验

### 触摸友好设计

- [ ] 设置最小触摸目标尺寸 (44x44px)
- [ ] 增加触摸元素间距
- [ ] 优化滑动和手势操作
- [ ] 处理触摸反馈效果
- [ ] 避免悬停依赖的交互

### 导航设计

- [ ] 实现响应式导航菜单
- [ ] 设计移动端汉堡菜单
- [ ] 确保导航的可访问性
- [ ] 优化导航层级结构
- [ ] 提供面包屑导航

## 参考

- [MDN](https://developer.mozilla.org/zh-CN/)
- [响应式 Web 设计：HTML5和CSS实战，Ben Frain](https://benfrain.com/)
- [Flex 布局教程， 阮一峰](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
- [CSS Grid 网格布局教程， 阮一峰](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)
- [响应式图像教程， 阮一峰](https://www.ruanyifeng.com/blog/2019/06/responsive-images.html)
