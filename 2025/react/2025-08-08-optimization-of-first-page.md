# React 项目优化 - 首页优化

## 一、介绍

React 中的首页优化，要解决下面这些问题。

## 二、加载时间优化

### 2.1 关键资源预加载

`<link>` 标签用于定义 HTML 文档与外部资源之间的关系，其中的 `rel` 属性，用于指定链接资源与当前文档的关系。`rel` 属性有几个特殊值，可以控制对资源进行提前处理。

#### （1）`preload`

`preload` 指预加载，表示对指定的资源提前下载并缓存，这些资源是页面很快就需要的资源，通过提前下载，确保它们尽早可用。

`preload` 一般用来加载关键的样式、脚本或者字体资源。

```html
<link rel="preload" href="critical-style.css" as="style" />
<link rel="preload" href="main.js" as="script" />
```

注意，`preload` 只会提前下载并缓存资源，并不会提前加载。另外，如果 `<link>` 标签的 `ref` 属性设置为 `preload`，则还必须同时指定 `as` 属性。

#### （2）`prefetch`

`prefetch` 指预获取，表示对指定的资源提前下载并缓存，这些资源在浏览器的后续导航中很可能会用到。`prefetch` 的优先级要比 `preload` 低，其指定的资源仅在浏览器空闲时进行下载，这意味着，如果条件不合适，浏览器并不会下载这些资源。

```html
<link rel="prefetch" href="non-critical.js">
```

注意，`preload` 只会提前下载并缓存资源，并不会提前加载。

#### （3）`dns-prefetch`

`dns-prefetch` 指 DNS 预解析，告诉浏览器对 `href` 属性指向的域名进行提前解析，从而对该域名下的资源进行请求时，减少 DNS 解析的时间。该属性在使用时有些需要注意的地方，

```html
<link rel="dns-prefetch" href="https://example.com" />
```

首先，`dns-prefetch` 仅对跨域域名的 DNS 解析有效，禁止将此属性用于当前域名。因为浏览器执行到这行代码时，当前域名早已执行了 DNS 解析过程。

其次，`dns-prefetch` 页可以通过 HTTP 头中的 [`Link`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Headers/Link) 字段进行指定。

```text
Link: <https://example.com>; rel=dns-prefetch
```

最后，`dns-prefetch` 可以跟 `preconnect` 配合使用。

#### （4）`preconnect`

`preconnect` 指预连接。HTTP(s) 通信过程中，要进行三报文传输的握手过程，`preconnect` 就是告诉浏览器，提前跟 `href` 属性指向的域名进行连接，从而减少对该域名下的资源进行请求时，减少连接建立的时间。

```html
<link rel="preconnect" href="https://example.com" />
```

还可以通过 HTTP 头中的 `Link` 字段指定。

```text
Link: <https://example.com>; rel="preconnect"
```

`dns-prefetch` 可以跟 `preconnect` 配对使用。`dns-prefetch` 执行 DNS 解析过程，而 `preconnect` 提前建立与服务器的连接。也就是说，这两个配置结合在一起，执行了 DNS 解析，以及 TCP 连接建立的过程。对于 HTTPS 的请求，`preconnect` 还会执行 TLS 握手过程。两者结合起来，进一步减少了跨域请求的感知延迟。

```html
<link rel="dns-prefetch" href="https://example.com" />
<link rel="preconnect" href="https://example.com" />
```

注意，如果当前页面需要与很多第三方域名建立连接，此配置很可能会适得其反。应该仅对关键资源的连接设置 `preconnect`，其他资源仅设置 `<link rel="dns-prefetch">` 就已足够。

### 2.2 优化资源加载

#### （1）关键 CSS 内联加载

关键 CSS 是指首页渲染所必需的 CSS 样式资源，比如，首屏可见内容的样式、页面布局的核心样式和关键组件的样式等。

对于关键 CSS 的处理，有两种方式，其一是手动进行内联处理，其二是使用 webpack 的打包工具自动处理。在这里只分析前者，后者的处理方式，可以参考 [webpack 在生产环境中的优化](/2025/webpack/2027-07-29-optimization-in-production-env.md)。

对于关键样式资源，可以直接将样式资源内嵌在 `<style>` 标签，并将其嵌入 `<head>` 标签中。

```html
<head>
  <!-- 内联关键CSS -->
  <style>
    /* 首屏关键样式 */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* ... */
  </style>
</head>
```

#### （2）非关键 CSS 异步加载

对于非关键的样式资源，首先，可以通过上面介绍的 `<link rel="prefetch">` 方式来缓存。

```html
<head>  
  <!-- 预加载非关键 CSS -->
  <link rel="prefetch" href="/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="/non-critical.css">
  </noscript>
<head> 
```

其次，也可以通过脚本动态创建 `<link>` 标签加载资源。

```html
<body>
  <!-- 异步加载非关键 CSS -->
  <script>
    // 异步加载非关键CSS
    function loadNonCriticalCSS() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/non-critical.css';
      link.onload = function() {
        this.media = 'all';
      };
      document.head.appendChild(link);
    }
    
    // 页面加载完成后加载非关键 CSS
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
    } else {
      loadNonCriticalCSS();
    }
  </script>
</body>
```

另外，还可以通过 JavaScript 中提供的 `Intersection Observer` API，实现对异步样式资源的加载。这种方式的原理是，设置浏览器对目标元素进行监听，当目标元素即将进入可视窗口时，便会执行 `IntersectionObserver` 的回调函数，这时，就可以将动态创建的 `<link>` 标签，追加载页面上。

```html
<!-- 方法3：基于视口加载 -->
<script>
  function loadCSSWhenVisible() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/non-critical.css';
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.head.appendChild(link);
          observer.disconnect();
        }
      });
    });
    
    // 观察需要非关键 CSS 的元素
    const targetElement = document.querySelector('.non-critical-content');
    if (targetElement) {
      observer.observe(targetElement);
    }
  }
  
  loadCSSWhenVisible();
</script>
```

#### （3）`async` 和 `defer`

`async` 和 `defer` 是 `<script>` 标签中的两个布尔属性。这两个属性标记的资源都会异步下载，在下载过程中，不会阻塞页面的解析。

```html
<script async src="script.js"></script>
<script defer src="script.js"></script>
```

`async` 属性具有如下特点特性。

- 对于 `async` 标记的资源，浏览器会异步下载。
- 资源下载完成便会**立即**执行，由于脚本资源的执行会阻塞浏览器解析，所以，`async` 指定的资源的执行时机，可能在 `DOMContentLoaded` 事件触发之前，也可能在之后。
- 如果有多个脚本文件指定了 `async` 属性，无法保证他们的执行顺序。哪个脚本先下载结束，就先执行那个脚本。

`defer` 属性具有如下特点特性。

- 对于 `defer` 标记的资源，浏览器会异步下载。
- 资源下载完成后，会等待页面解析完成，之后再解析脚本资源，等到脚本执行完成，再触发 `DOMContentLoaded` 事件。这意味着，`defer` 标记的脚本资源的执行时机，在 `DOMContentLoaded` 事件触发之前。
- 如果有多个脚本文件指定了 `defer` 属性，会按照他们在文档中出现的位置，**按顺序执行**。
- 对于内置而不是加载外部脚本的 `script` 标签，以及动态生成的 `script` 标签，`defer` 属性不起作用。

一般来说，如果脚本之间没有依赖关系，就使用 `async` 属性，如果脚本之间有依赖关系，就使用 `defer` 属性。如果同时使用 `async` 和 `defer` 属性，后者不起作用，浏览器行为由 `async` 属性决定。

另外，使用 `async` 和 `defer` 加载的外部脚本，都不应该使用 `document.write` 方法。

![async 和 defer](https://html.spec.whatwg.org/images/asyncdefer.svg "async 和 defer 的执行时机")
> 图片来自 [HTML 规范](https://html.spec.whatwg.org/)

#### （4）图片懒加载和预加载

对于图片的懒加载，请参考 [React 中的图片懒加载](/2025/react/2025-08-19-image-lazy-loading.md)，这里只介绍图片的预加载。

图片的预加载，就是尽快下载并缓存关键的图片资源，以使其在加载时，尽快呈现给用户。

首先，可以使用上面介绍的 `<link rel="preload">` 来指定图片的预加载，同时还可以指定 `media` 和 `type` 属性，让浏览器选择最合适的图片来加载。

```html
<link rel="preload" href="..." as="image" media="(min-width: 1200px)" type="image/webp">
<link rel="preload" href="..." as="image" media="(max-width: 800px)" type="image/webp">
<link rel="preload" href="..." as="image" media="(min-width: 1200px)" type="image/jpeg">
<link rel="preload" href="..." as="image" media="(max-width: 800px)" type="image/jpeg">
```

其次，可以使用脚本来控制图片的加载。

```html
<script>
  // 预加载图片列表
  const preloadImages = [
    '/images/banner.jpg',
    '/images/logo.png',
  ];
  
  function preloadImages(images) {
    images.forEach(src => {
      const img = new Image();
      img.src = src;
      // ...
    });
  }
  
  window.addEventListener('load', () => {
    preloadImages(preloadImages);
  });
</script>
```

或者使用 CSS Sprite 预加载。

```html
<style>
  .sprite-preload {
    background-image: url('/images/sprite.png');
    background-size: 0 0;
    position: absolute;
    left: -9999px;
    top: -9999px;
    width: 1px;
    height: 1px;
  }
</style>

<div class="sprite-preload"></div>
```

除此之外，还可以使用 webpack 中的[资源模块](/2025/webpack/2027-07-29-optimization-in-production-env.md#41-图片压缩)，将图片转为 Base64 格式，作为内联资源嵌入到页面中。

注意，由于图片相对来说体积都较大，所以，不管使用哪种方式，图片的预加载，都只应该加载最关键的资源。并且选择合适的格式，同时对图片进行压缩等处理。

### 2.3 代码分割

关于这部分，请参考 [](/2025/webpack/2027-07-29-optimization-in-production-env.md#31-多入口)。

## 三、内容优化

### 3.1 【TODO】骨架屏

骨架屏（Skeleton Screen）是一种在页面加载过程中显示的占位符界面，它模拟了真实内容的布局结构，为用户提供视觉反馈，减少等待焦虑。

### 3.2 【TODO】渐进式加载

- 先显示核心内容
- 逐步加载次要内容
- 使用 Intersection Observer 实现视口加载
- 图片的渐进式加载

### 3.3 【TODO】首屏渲染优化

服务端渲染（SSR）
静态站点生成（SSG）（预渲染静态页面、增量静态再生（ISR）、动态路由的静态生成、构建时数据获取）
流式渲染（Streaming SSR）
部分水合（Partial Hydration）

## 四、SEO 优化

搜索引擎优化（Search engine optimization，简写：SEO）是一种通过优化网站结构、内容和外部因素，提高网站在搜索引擎自然搜索结果中排名位置的技术。

### 4.1 meta 标签优化

`meta` 标签是 HTML `<head>` 中的一个空标签，用于设置网站的元数据，正确优化 meta 标签对于 SEO 有重要影响。

搜索引擎爬虫无法像人类一样“看到”页面内容，`<meta>` 标签提供了页面内容的摘要和关键信息，能够帮助搜索引擎理解页面的主题和相关性。搜索结果中的标题和描述也直接影响点击率，准确的描述能提高用户对页面的信任度，关键词优化有助于提高搜索排名。

另外，通过社交媒体分享优化，能够控制社交媒体分享时的展示效果，提供丰富的预览信息，增加分享内容的吸引力。比如设置 Open Graph 标签和 Twitter Cards 标签等。

`meta` 标签的优化，可以从下面几个方面进行。

#### （1）字符编码和语言设置

```html
<!-- 字符编码设置 -->
<meta charset="UTF-8" />

<!-- 语言设置 -->
<html lang="zh-CN">
<head>
  <meta http-equiv="Content-Language" content="zh-CN" />
  <meta name="language" content="Chinese" />
</head>
```

注意，标题长度最好控制在 60 个字符以内。

#### （2）页面标题部分优化

这部分包括 `<title>` 标签，`<meta>` 标签 `name` 属性中的 `keywords`、`description`、`author` 和 `robots` 等。

```html
<title>...</title>

<meta name="keywords" content="..." />
<meta name="description" content="..." />
<meta name="author" content="..." />

<meta name="robots" content="index, follow" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
```

并不是 `<meta>` 中的所有属性，搜索引擎都会将其作为排名算法的参考依据，比如，[Google](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag) 在他的排名算法中，就不会使用 `<meta name="keywords">` 标记。

注意，并不是关键词越多，SEO 就越友好，过多的关键词，反而会适得其反。另外，描述长度最好控制在 50 到 160 个字符之间。

#### （3）Open Graph 标签优化

```html
<!-- Open Graph 基础标签 -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="..." />
<meta property="og:site_name" content="..." />
<meta property="og:locale" content="..." />

<!-- Open Graph 图片优化 -->
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta property="og:image:alt" content={title} />
```

#### （4）Twitter Cards 优化

```html
<meta name="twitter:card" content="..." />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
<meta name="twitter:site" content="..." />
<meta name="twitter:creator" content="..." />
```

#### （5）结构化数据标记

结构化数据是一种提供网页相关信息，并对网页内容进行分类的标准化格式，有助于帮助搜索引擎更好地理解网页。

```html
<head>
  <title>Finding an apprenticeship - Frequently Asked Questions(FAQ)</title>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [{
      "@type": "Question",
      "name": "How to find an apprenticeship?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "<p>We provide an official service to search through available apprenticeships. To get started, create an account here, specify the desired region, and your preferences. You will be able to search through all officially registered open apprenticeships.</p>"
      }
    }, {
      "@type": "Question",
      "name": "Whom to contact?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can contact the apprenticeship office through our official phone hotline above, or with the web-form below. We generally respond to written requests within 7-10 days."
      }
    }]
  }
  </script>
</head>
```

#### （6）React Helmet 集成

React 开发中，如果要动态更新 `meta` 标签的属性，还可以配合使用 [react-helmet](https://github.com/nfl/react-helmet) 这样的库。

```jsx
const DynamicSEO = ({
  title = '网站标题',
  description,
  keywords,
  image = 'https://example.com/default-image.jpg',
  url = window.location.href,
  type = 'website',
  author,
}) => (
  <Helmet>
    {/* 基础 meta 标签 */}
    <title>{title}</title>
    <meta name="description" content={description} />
    {keywords && <meta name="keywords" content={keywords} />}
    {author && <meta name="author" content={author} />}
    
    {/* 规范链接 */}
    <link rel="canonical" href={url} />
    
    {/* Open Graph 标签 */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content={type} />
    <meta property="og:site_name" content="网站名称" />
    
    {/* Twitter Cards */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    
    {/* 文章特定标签 */}
    {author && <meta property="article:author" content={author} />}
  </Helmet>
);

export default DynamicSEO;
```

#### （7）路由级 SEO 优化

还可以根据路由，动态设置 `meta` 标签的属性。下面就列出了一种实现，它的思路是，通过监听当前的路由路径，来动态获取配置项中的属性。

```jsx
// hooks/useRouteSEO.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteSEO(config) {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    const c = config[path] || config['*'] || {};
    
    // 更新页面标题
    if (c.title) {
      document.title = `${c.title} | 网站名称`;
      // 更新 Open Graph 标签
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', c.title);
      }
    }
    
    // 更新 meta description
    if (c.description) {
      const desc = document.querySelector('meta[name="description"]');
      if (desc) {
        desc.setAttribute('content', c.description);
      }
      // 更新 Open Graph 标签
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) {
        ogDesc.setAttribute('content', c.description);
      }
    }
    
    // 更新 meta keywords
    if (c.keywords) {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        keywords.setAttribute('content', c.keywords);
      }
    }
    
    if (c.image) {
      const img = document.querySelector('meta[property="og:image"]');
      if (img) {
        img.setAttribute('content', c.image);
      }
    }
  }, [location, config]);
}
```

下面是一个使用示例。

```jsx
const App: React.FC = () => {
  useRouteSEO({
    '/': {
      title: '首页',
      description: '欢迎访问我们的网站，提供最新的技术资讯和解决方案',
      keywords: '技术, 解决方案, 资讯',
      type: 'website'
    },
    '/about': {
      title: '关于我们',
      description: '了解我们的团队和使命',
      keywords: '关于, 团队, 使命',
      type: 'website'
    },
    '/blog': {
      title: '博客',
      description: '技术博客，分享最新的技术文章和见解',
      keywords: '博客, 技术, 文章',
      type: 'website'
    }
  });
  
  return (
    <div>
      {/* ... */}
    </div>
  );
};
```

### 4.2 内容优化

#### （1）语义化的 HTML 结构

语义化标签是指使用具有明确含义的 HTML 标签来描述内容的结构和含义，而不是仅仅为了样式效果。语义化标签让代码更具可读性，同时帮助搜索引擎和屏幕阅读器更好地理解页面内容。

下面列出了一些常见的页面结构标签。

- `header`：页面或区块的头部。
- `nav`：导航区域。
- `main`：主要内容区域。
- `article`：独立的文章内容。
- `section`：文档中的区块。
- `aside`：侧边栏内容。
- `footer`：页面或区块的底部。

下面列出了一些常见的内容语义化标签。

- `h1` - `h6`：标题层级。
- `p`：段落。
- `blockquote`：引用块。
- `cite`：引用来源。
- `code`：代码。
- `pre`：预格式化文本。
- `mark`：高亮文本。
- `time`：时间。
- `address`：联系信息。

#### （2）合理的标题层级

#### （3）图片 alt 属性优化

alt 属性不仅对屏幕阅读器用户重要，也是搜索引擎理解图片内容的关键因素。

内部链接结构优化

## 五、可访问性优化

### 5.1 键盘导航

#### （1）实现键盘导航支持

键盘导航是指用户仅使用键盘（`Tab`、方向键、`Enter`、`Space` 等）就能完全操作网站或应用的功能，从而为无法使用鼠标的用户提供操作能力。

下面的 `useKeyboardNavigation` Hook 是一种键盘导航的实现方式，它的原理是这样。

1. 首先获取页面上所有可以获取焦点的元素，并其转为数组。
2. 当用户按下某个按键时，获取当前获得焦点的元素在数组中的位置 `currentIndex`。
3. 当用户按下 `Tab` 键时，由于 `Tab` 键自身就支持可交互元素的切换，所以这种情况不做处理。
4. 当用户按下 `ArrowDown`（下方向键）或者 `ArrowRight`（右方向键）键时，跳转到数组中当前位置（`currentIndex`）的元素的下一个元素位置，同时调用下一个元素的 `focus()` 方法，使其获得焦点。
5. 当用户按下 `ArrowUp`（上方向键）或者 `ArrowLeft`（左方向键）键时，跳转到数组中当前位置（`currentIndex`）的元素的上一个元素位置，同时调用上一个元素的 `focus()` 方法，使其获得焦点。
6. 如果按下的是键盘上的 `Home` 或者 `End` 键，则分别跳转到数组对应的第一个或者最后一个元素的位置，然后调用它的 `focus()` 方法。

```js
// hooks/useKeyboardNavigation.ts

import { useEffect, useRef } from 'react';

export function useKeyboardNavigation() {
  const focusableElements = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // 获取所有可聚焦元素
    const getFocusableElements = () => {
      const elements = document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      return Array.from(elements) as HTMLElement[];
    };

    focusableElements.current = getFocusableElements();

    // 键盘导航处理
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, target } = event;
      const currentIndex = focusableElements.current.indexOf(target as HTMLElement);

      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (key) {
        case 'Tab':
          // 默认 Tab 行为
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % focusableElements.current.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = currentIndex === 0 
            ? focusableElements.current.length - 1 
            : currentIndex - 1;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = focusableElements.current.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        focusableElements.current[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return focusableElements;
}
```

上面的代码，同时也支持焦点管理。所谓焦点管理，是指控制页面中哪个元素当前处于焦点状态，以及如何在不同元素间移动焦点的机制。焦点管理的目的是，确保用户知道当前操作位置，提供清晰的焦点指示器。

#### （2）跳过跳转链接

[跳转链接](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/a#%E8%B7%B3%E8%BD%AC%E9%93%BE%E6%8E%A5)是页面顶部的一个隐藏链接，允许用户直接跳转到主要内容区域，跳过导航菜单等重复内容。

跳转链接对于键盘用户、屏幕阅读器用户以及借助辅助技术进行导航的人来说特别有用，能够提高页面操作效率。

```html
<body>
  <a href="#content" class="skip-link">跳转至主要内容</a>
  <main id="content"></main>
  <!-- 跳转链接会跳转至这里 -->
</body>
```

```css
.skip-link {
  position: absolute;
  top: -3em;
  background: #fff;
}
.skip-link:focus {
  top: 0;
}
```

（3）快捷键支持

快捷键支持是指为用户提供键盘快捷键来快速执行常用操作，如保存、撤销、重做等。目的是提高用户操作效率，为高级用户提供快速操作方式以及支持无障碍操作等。

```jsx
// hooks/useKeyboardShortcuts.ts

import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(shortcut => {
      const isMatch = 
        event.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!event.ctrlKey === !!shortcut.ctrlKey &&
        !!event.shiftKey === !!shortcut.shiftKey &&
        !!event.altKey === !!shortcut.altKey &&
        !!event.metaKey === !!shortcut.metaKey;

      if (isMatch) {
        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

```jsx
// components/KeyboardShortcuts.tsx

import React, { useEffect, useState } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  modifiers?: string[];
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  showHelp?: boolean;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  shortcuts,
  showHelp = false
}) => {
  const [isHelpVisible, setIsHelpVisible] = useState(showHelp);

  const shortcutConfigs = shortcuts.map(shortcut => ({
    key: shortcut.key,
    action: shortcut.action,
    description: shortcut.description
  }));

  useKeyboardShortcuts(shortcutConfigs);

  // 帮助快捷键
  useEffect(() => {
    const handleHelpKey = (event: KeyboardEvent) => {
      if (event.key === '?' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setIsHelpVisible(!isHelpVisible);
      }
    };

    document.addEventListener('keydown', handleHelpKey);
    return () => document.removeEventListener('keydown', handleHelpKey);
  }, [isHelpVisible]);

  return (
    <>
      {isHelpVisible && (
        <div className="shortcuts-help">
          <h3>键盘快捷键</h3>
          <ul>
            {shortcuts.map((shortcut, index) => (
              <li key={index}>
                <kbd>{shortcut.modifiers?.join('+') || ''}{shortcut.key}</kbd>
                <span>{shortcut.description}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => setIsHelpVisible(false)}>关闭</button>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
```

### 5.2 屏幕阅读器支持

#### （1）ARIA 标签使用

ARIA（Accessible Rich Internet Applications）是一组属性，用于增强 HTML 元素的可访问性，特别是为屏幕阅读器提供额外的语义信息。

```jsx
// components/AriaSupport.tsx
import React from 'react';

interface AriaSupportProps {
  children: React.ReactNode;
  role?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  'aria-live'?: 'off' | 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

const AriaSupport: React.FC<AriaSupportProps> = ({
  children,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-hidden': ariaHidden,
  'aria-expanded': ariaExpanded,
  'aria-controls': ariaControls,
  'aria-current': ariaCurrent,
  'aria-live': ariaLive,
  'aria-atomic': ariaAtomic,
  'aria-relevant': ariaRelevant,
  className = '',
  ...props
}) => {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      aria-hidden={ariaHidden}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-current={ariaCurrent}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      aria-relevant={ariaRelevant}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default AriaSupport;
```

（2）语义化 HTML。这部分请参考上面的介绍。

（3）替代文本

替代文本是为图片、视频、音频等多媒体内容提供的文字描述，帮助无法看到或听到这些内容的用户理解内容。目的是为视觉障碍用户提供内容描述，提升搜索引擎优化效果以及增强用户体验等。

（4）标题层级结构。参考上面的介绍。

### 5.3 视觉可访问性

- 颜色对比度
- 字体大小可调整
- 高对比度模式
- 动画减少选项

## 六、参考
