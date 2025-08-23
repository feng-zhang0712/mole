# React 项目优化 - 网络和资源优化

## 一、介绍

## 二、API 和数据优化

### 2.1 请求优化

- 请求缓存策略
- 请求合并和批处理
- 请求取消机制
- 错误重试和降级

### 2.2 数据获取优化

- 数据预取和预加载
- 乐观更新
- 离线缓存策略
- 数据同步和冲突解决

## 三、缓存策略

### 3.1 浏览器缓存

- 设置合适的缓存头
- 使用 Service Worker 缓存
- 版本控制和缓存失效
- 离线缓存策略

### 3.2 应用缓存

- 内存缓存
- 本地存储缓存
- 会话存储缓存
- 缓存更新策略

## 四、资源加载优化

### 4.1 图片优化

#### 4.1.1 选择合适的图片格式

前端使用的图片大致可以分为两类：位图和矢量图。位图主要是 `WebP`、`JPEG`、`PNG` 和 `GIF` 等格式，矢量图主要是 `SVG` 格式。下面分别对他们进行介绍。

**WebP** 是一种同时提供了有损压缩与无损压缩的图片文件格式。WebP 的设计目标是在减少文件容量同时，达到和 JPEG、PNG、GIF 格式相同的图片质量，并希望借此能够减少图片档在网络上的传输时间。WebP 文件扩展名格式为 `.webp`，MIME 类型为 `image/webp`。

WebP 格式的图片有如下特点。

- 现代图像格式。
- 支持无损/有损压缩。
- 文件体积小，压缩率高，质量高。
- 支持透明度和动画。

WebP 格式的图片适合以下场景。

- 现代浏览器或者性能要求高的场景。
- 对文件体积敏感的场景。
- 需要动画和透明度的场景。
- 照片和复杂图像场景。

WebP 格式的图片不适用于旧版浏览器。

在现代应用开发中，对于图片的选择，应该首选 WebP 格式。

**JPEG**（Joint Photographic Experts Group）是一种针对照片影像而广泛使用的**有损压缩**方法，即在压缩过程中图像的质量会遭受到可见的破坏。JPEG 文件普遍使用的扩展名格式为 `.jpeg` 和 `.jpg`，MIME 类型为 `image/jpeg`。

JPEG 格式的图片有如下特点。

- 有损压缩。
- 文件体积小，压缩率高。
- 不支持动画和透明度。
- 支持渐进式加载。

JPEG 格式的图片的使用场景。

- 照片及头像。
- 产品和背景展示图片。
- 对文件体积敏感的场景。

JPEG 格式的图片不适合需要透明背景的图像、文字和图标以及需要高质量显示图像的场景。

便携式网络图形（Portable Network Graphics，**PNG**）是一种采用**无损压缩**方法的位图图形格式，其文件扩展名为 `.png`，MIME 类型为 `image/png`。

PNG 格式的图片有如下特点。

- 无损压缩。
- 文件体积大，但质量高。
- 支持透明度，但不支持动画。
- 支持多种颜色深度。
- 适合文字和图标。

PNG 格式的图片适用场景如下。

- Logo 和品牌元素。
- 需要高质量显示的图像。
- 透明背景的图像。
- 文字和图标。
- 截图。

PNG 格式的图片不适合照片和复杂图像、网页背景图片以及对文件体积较敏感的场景。

图像互换格式（Graphics Interchange Format，简称 **GIF**）是一种位图图形文件格式，GFI 采用的是一种叫做[LZW](https://zh.wikipedia.org/wiki/LZW)的**无损压缩**算法。其文件扩展名为 `.gif`，MIME 类型为 `image/webp`。

GIF 格式的图片有如下特点。

- 无损压缩。
- 文件体积小。
- 支持动画和透明度。
- 兼容性好。

GIF 格式的图片适合以下场景。

- 简单动画。
- 图标和小图像。
- 表情包和装饰元素。

GIF 格式的图片不适用照片、复杂图像及有高质量图像需求的场景。

可缩放矢量图形（Scalable Vector Graphics，SVG）是一种基于可扩展标记语言（XML），用于描述二维矢量图形的图形格式。其文件格式为 `.svg`，MIME 类型为 `image/svg+xml`。

SVG 格式的图片有如下特点。

- 无损缩放，矢量格式。
- 文件体积小。
- 支持动画、透明度和交互。
- 可编程。

SVG 格式的图片适合以下场景。

- Logo 和品牌元素。
- 图标和简单图形。
- 动画和缩放场景。

从上面的分析可以看出，对于不同的场景，可以按下面的方案进行选择。

- 对于 Logo 和图标，优先选择 SVG，其次是 PNG。
- 对于产品展示和背景图片，优先选择 WebP，其次是 JPEG。
- 对于动画和透明度的场景，优先选择 WebP，其次是 GIF（PNG） 和 SVG。

#### 4.1.2 图像懒加载

参考 [图片懒加载](/2025/react/2025-08-19-image-lazy-loading.md)。

#### 4.1.3 使用 CDN 加速

### 4.2 字体优化

字体文件压缩
字体子集化
使用 `font-display: swap`
预加载关键字体

### 4.3 CSS 优化

提取关键 CSS
异步加载非关键 CSS
CSS 压缩和优化
使用 CSS Modules 避免样式冲突

## 参考

- [wikipedia](https://zh.wikipedia.org/)
- [HTMLImageElement：loading 属，MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLImageElement/loading)
- [交叉观察器 API，MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API)
- [IntersectionObserver，阮一峰](https://wangdoc.com/webapi/intersectionObserver)
