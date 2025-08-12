# 媒体查询

## 一、介绍

媒体查询（Media Queries）是响应式 Web 设计的关键部分，允许我们根据设备的特性（如屏幕宽度、高度、设备类型、分辨率等）来应用不同的样式。只要站点需要做响应式设计，媒体查询就是一个绕不开的话题。

## 二、基本语法

媒体查询的格式由四部分组成：`@media` 关键词、媒体类型、媒体特性表达式和一组 CSS 规则。

```css
@media media-type and (media-feature: value) {
  /* CSS 规则 */
}
```

上面代码中，`media-type` 就是要指定的媒体类型，`media-feature: value` 就是要匹配的具体的设备特性。

## 三、媒体类型、媒体特性和逻辑运算符

### 3.1 媒体类型

媒体类型定义了媒体查询适用的设备类型，目前，媒体查询支持的媒体类型有四种。

- `all`：默认值，表示适用于所有设备类型。
- `print`：适用于打印设备。
- `screen`：适用于所有有屏幕的设备，包括电脑显示器、平板电脑、智能手机、智能电视等。`screen` 是最常用的媒体类型。
- `speech`：适用于语音合成器，比如屏幕阅读器。

```css
@media print {
  body {
    font-size: 12pt;
  }
}
```

上面的媒体查询会匹配打印设备（`print`），上面的样式表示，当页面被打印的时将 `body` 字体设置为 `12pt`，其他场景下，该样式不会生效。

### 3.2 媒体特性

媒体特性定义了设备的具体属性，用于精确控制样式的应用条件。下面列出了一些常用的媒体特性属性。

- `width`：视口（包括纵向滚动条）的宽度。相关属性还有 `min-width` 和 `max-width`，分别表示视口的最小和最大宽度。
- `height`：视口的高度。相关属性还有 `min-height` 和 `max-height`，分别表示视口的最小和最大高度。
- `orientation`：设备的方向。`portrait` 表示纵向，`landscape` 表示横向。
  
    注意，在指定该属性时，直接指定是横向还是纵向，不要使用字符串的形式。

    ```css
    @media (orientation: landscape) {
      body {
        flex-direction: row;
      }
    }
    ```

- `resolution`：设备的分辨率。相关属性还有 `min-resolution` 和 `max-resolution`，分别表示最小和最大分辨率。支持的单位是 `dpi`, `dpcm`, `dppx`。
- `aspect-ratio`：视口的宽高比。相关属性还有 `min-aspect-ratio` 和 `max-aspect-ratio`，分别表示最小和最大宽高比。格式为 `width/height`。
- `color`：设备的颜色支持。相关属性还有 `min-color` 和 `max-color`，分别表示视口的最小和最大颜色支持。该属性值是一个数字，表示每像素的颜色位数。
- `color-index`：设备的颜色索引支持。相关属性还有 `min-color-index` 和 `max-color-index`，分别表示视口的最小和最大颜色索引支持。该值是一个数字，表示颜色表中的颜色数量。
- `hover`：设备是否支持悬停。取值为 `hover` 或者 `none`。
- `pointer`：设备的指针类型。取值为 `none` `coarse`（粗糙指针，如手指） 或者 `fine`（精细指针，如鼠标）。
- `any-hover`：设备是否支持悬停（包括辅助技术）。取值为 `hover` 或者 `none`。
- `any-pointer`：设备的指针类型（包括辅助技术）。取值为 `none` `coarse` 或者 `fine`。
- `display-mode`：应用的显示模式。取值为 `fullscreen`（全屏）、`standalone`（独立窗口）、`minimal-ui`（最小 UI）和 `browser`（浏览器）。
- `grid`：设备是否网格屏幕还是点阵屏幕。1 表示网格屏，0 表示点阵屏。

上面的属性中，除了 `width`、`height`、`orientation`、`resolution` 和 `aspect-ratio` 外，其他属性用的都很少。

注意，`device-width` 和 `device-height` 已被废弃，因此不再推荐使用。

### 3.3 逻辑运算符

逻辑运算符用于按照不同的逻辑，组合多个媒体查询，多个媒体查询使用逗号（`,`）进行分隔。注意，逗号既可以作为分隔符使用，也可以当作 `or` 使用，两者语义相同。

目前，共有四个逻辑运算符。

`and`：与操作。

```css
/* 屏幕设备且宽度大于等于 768px */
@media screen and (min-width: 768px) { }
```

`or` 或者逗号分隔符：或操作。

```css
/* 宽度小于 480px 或大于 1200px */
@media (max-width: 480px), (min-width: 1200px) { }
@media (max-width: 480px) or (min-width: 1200px) { }
```

`not`：非操作。

```css
/* 非打印设备 */
@media not print { }
```

`only`：仅操作。

```css
/* 仅屏幕设备 */
@media only screen { }
```

下面是一些逻辑运算符的例子。

```css
@media screen, print {
  body {
    line-height: 1.2;
  }
}
```

上面代码表示，在屏幕设备和打印设备上，将 `body` 设置为 1.2 倍行高。

```css
@media only screen and (min-width: 320px) and (max-width: 480px) and (resolution: 150dpi) {
  body {
    line-height: 1.4;
  }
}
```

上边代码表示，仅在屏幕设备上，当视口宽度在 320px 到 480px 之间，且设备分辨率为 150dpi 时，将 `body` 设置为 1.4 倍行高。

## 断点

比如，对于移动优先的站点，可以将 `768px`、`1024px` 和 `1200px` 等设置为断点。

```css

```

对于桌面优先的站点，可以设置 `767px`、`1023px` 等断点。

```css

```

## 四、媒体查询的多种用法

### 4.1 嵌套

```css
@media (min-width: 768px) {
  .container {
    max-width: 750px;
  }
  
  @media (min-width: 1024px) {
    .container {
      max-width: 970px;
    }
  }
}
```

### 4.2 使用 CSS 变量

```css
:root {
  --primary-color: #007bff;
  --font-size: 16px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #0056b3;
  }
}

@media (max-width: 768px) {
  :root {
    --font-size: 14px;
  }
}

body {
  color: var(--primary-color);
  font-size: var(--font-size);
}
```

### 4.3 使用 CSS 预处理器

```scss
$breakpoints: (
  mobile: 768px,
  tablet: 1024px,
  desktop: 1200px
);

@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

.container {
  width: 100%;
  
  @include respond-to(tablet) {
    width: 750px;
  }
  
  @include respond-to(desktop) {
    width: 970px;
  }
}
```

## 五、HTML 标签中的媒体查询

`<style>`、`<link>` 和 `<source>` 标签中的 `media` 属性，表示只有满足符合条件的媒体查询，对应的资源才会被加载。

## 六、媒体查询第四版中的语法改进

### 6.1 范围查询

媒体查询第四版（Media Queries Level 4）引入了数学中常见的比较操作符。

- `<=`：表示"小于等于"，用于定义上限条件。
- `>=`：表示"大于等于"，用于定义下限条件。

```css
@media (width <= 767px) {
  /* CSS 样式 */
}
```

上面的查询条件，用于匹配宽度小于等于 `767px` 的设备。

```css
@media (400px <= width <= 700px) {
  body {
    line-height: 1.4;
  }
}
```

上边代码表示，当设备宽度在 `400px` 到 `700px `之间时，将 `body` 设置为 1.4 倍行高。

```css
@media (768px <= width <= 1200px) and 
  (600px <= height <= 900px) and 
  (16/9 <= aspect-ratio <= 21/9) {
    /* CSS 样式 */
  }
```

上面的查询条件，用于匹配宽度在 `768px` 到 `1200px` 之间、高度在 `600px` 到 `900px` 之间、宽高比在 `16/9` 到 `21/9` 之间的设备。

### 6.2 新的媒体特性

`update` 检测显示器的更新频率，可选值为 `none`、`slow` 和 `fast`。

- `none`：表示显示器不支持动态更新，如某些电子墨水屏或静态显示设备。
- `slow`：表示显示器支持更新但更新频率较慢，如电子墨水屏、某些电子标牌等。
- `fast`：表示显示器支持快速更新，如传统的 LCD、OLED 屏幕等。

这个特性特别适用于需要为不同更新频率设备提供不同体验的场景。比如，对于电子墨水屏等慢速更新设备，应该避免使用动画和过渡效果，因为这些效果在这种设备上不仅无法正常显示，还可能造成视觉混乱。而对于快速更新的设备，可以充分利用动画来提升用户体验。

```css
@media (update: slow) {
  .animation { display: none; }
  .transition { transition: none; }
}

@media (update: fast) {
  .animation {
    animation: fadeIn 0.3s;
  }
}
```

上面代码表示，关闭电子墨水屏动画效果，为普通屏幕启用动画。

`overflow-block` 检测设备在块轴方向（通常是垂直方向）如何处理内容溢出的情况，可选值为 `none`、`scroll` 和 `paged`。

- `none`：表示设备不支持块轴方向的溢出处理，内容会被裁剪。
- `scroll`：表示设备支持滚动来处理块轴方向的溢出。
- `paged`：表示设备使用分页方式来处理块轴方向的溢出，如打印设备。

这个特性适用需要为不同显示设备提供不同布局策略的场景。比如，对于打印设备，应该使用分页布局；对于支持滚动的设备，可以使用粘性定位等现代布局技术；对于不支持溢出的设备，需要确保内容完全适应容器尺寸。

```css
@media (overflow-block: paged) {
  /* 为分页设备（如打印）优化 */
  .page-break {
    page-break-before: always;
  }
}

@media (overflow-block: scroll) {
  /* 为滚动设备优化 */
  .sticky {
    position: sticky;
  }
}
```

`overflow-inline` 检测设备在行内轴方向（通常是水平方向）如何处理内容溢出的情况，可选值为 `none` 和 `scroll`，表示无溢出和滚动。

- `none`：表示设备不支持行内轴方向的溢出处理，内容会被裁剪。
- `scroll`：表示设备支持水平滚动来处理行内轴方向的溢出。

这个特性适合需要处理宽内容（如表格、图片库、时间轴等）的场景。对于支持水平滚动的设备，可以提供水平滚动条；对于不支持水平溢出的设备，需要重新设计布局以避免内容被裁剪。

```css
@media (overflow-inline: scroll) {
  /* 为水平滚动设备优化 */
  .horizontal-scroll {
    overflow-x: auto;
  }
}
```

`color-gamut` 检测设备支持的色域范围，可选值为 `srgb`、`p3` 和 `rec2020`。

- `srgb`：表示设备支持标准 RGB 色域，这是最常见的色域标准，覆盖约 35% 的可见色彩。
- `p3`：表示设备支持 Display P3 色域，这是苹果设备广泛使用的色域，覆盖约 45% 的可见色彩。
- `rec2020`：表示设备支持 Rec. 2020 色域，这是超高清电视使用的色域，覆盖约 75% 的可见色彩。

这个特性适合需要为不同色域设备提供最佳颜色体验的场景。比如，对于高色域设备，可以使用更丰富的颜色；对于标准色域设备，需要确保颜色在安全范围内显示。

```css
@media (color-gamut: p3) {
  /* 为 Display P3 色域设备优化 */
  .wide-color {
    color: color(display-p3 1 0.5 0);
  }
}

@media (color-gamut: rec2020) {
  /* 为 Rec. 2020 色域设备优化 */
  .ultra-wide-color {
    color: color(rec2020 1 0.5 0);
  }
}
```

### 6.3 媒体特性类型分类系统

媒体查询第四版将媒体特性分为两类：范围类型（Range）和 离散类型。

范围类型特性是指那些可以取连续数值的媒体特性，这些特性支持范围查询和比较操作。下面的特性都属于范围类型特性。

- `width`：视口宽度。
- `height`：视口高度。
- `aspect-ratio`：视口宽高比。
- `resolution`：设备分辨率。
- `color`：颜色深度。
- `color-index`：颜色索引。
- `monochrome`：单色深度。

离散类型特性是指那些只能取有限个预定义值的媒体特性，这些特性不支持范围查询，只能进行精确匹配。

- `orientation`：设备方向。
- `scan`：扫描方式。
- `grid`：网格布局。
- `hover`：悬停能力。
- `pointer`：指针类型。
- `any-hover`：任何悬停能力。
- `any-pointer`：任何指针类型。
- `color-gamut`：色域支持。
- `update`：更新频率。
- `overflow-block`：块轴溢出处理。
- `overflow-inline`：行内轴溢出处理。

## 七、参考

- [媒体查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_media_queries)，MDN
