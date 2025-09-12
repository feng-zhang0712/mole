# React 项目优化 - 首页优化

## 介绍

React 中的首页优化，要解决下面这些问题。

## 模板文件优化

### `<title>` 标签

`<title>` 标签用于设置页面的标题，标题最好控制在 50-60 字符。

```html
<title>...</title>
```

### `<meta>` 标签

`<meta>` 标签是一个空标签，用于设置网站的元数据。

#### 基本设置

`charset` 属性用于设置网页编码，如果没有设置此属性，可能会导致浏览器解析页面时出现乱码。此属性通常设置为 `utf-8`，且必须出现在页面前 1024 字节中。

```html
<meta charset="UTF-8" />
```

`viewport` 属性用于告诉浏览器如何控制页面的尺寸和缩放比例，特别对于移动端的显示效果有影响。如果忘记设置此属性，很可能会导致页面在移动设备上内容显示过小。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

上面的代码，设置页面的宽度为设备宽度，内容缩放比例为 100%。这样，在移动设备上，页面的内容将正常显示，不至于过大，也不至于过小。

为了提供更好的 SEO 优化，应该设置 `<meta>` 标签的关键词（`keywords`）和描述（`description`）等信息。

- `keywords` 应该是也当前站点的业务高度相关的词汇，关键词不宜过多，也不应该重复 `<title>` 和 `description` 中的内容。另外，[Google][google-does-not-use-keywords-meta-tag] 虽已不再使用 `keywords` 作为排名因素，但其他搜索引擎可能依然使用。
- `description` 用于对站点业务进行描述，最好控制在 160 个字符之内。

```html
<meta name="keywords" content="..." />
<meta name="description" content="..." />
```

`robots` 属性能够控制搜索引擎的爬虫行为，直接影响站点在 SEO 中的表现。该属性可以设置多个值。

- `index` 默认值，允许搜索引擎索引页面，适用于大部分页面。
- `noindex` 禁止搜索引擎索引页面，启用该设置后，页面不会出现在搜索结果中。
- `follow` 默认值，允许搜索引擎跟踪页面上的链接，用于大部分页面。
- `nofollow` 禁止搜索引擎跟踪页面上的链接。
- 其他值还有比如 `noarchive`（禁止搜索引擎缓存页面）、`nosnippet`（禁止搜索引擎显示页面摘要）、`noimageindex`（禁止搜索引擎索引页面中的图片）、`max-snippet`（限制搜索结果中显示的摘要长度）等。

```html
<meta name="robots" content="index, follow" />
```

历史上，IE 浏览器的各版本差异巨大，不同的版本使用不同的渲染引擎，`X-UA-Compatible` 属性就是告诉浏览器，使用哪个版本的渲染引擎来兼容显示页面。

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
```

#### Open Graph 标签优化

Open Graph 标签是由 Facebook 开发的元数据协议，用于控制页面在社交媒体上的显示效果，该标签有利于提升站点在社交媒体的点击率，建立品牌在社交媒体上的形象。

下面列出了 Open Graph 标签支持的属性。

- `og:title` 分享时的标题。
- `og:description` 分享时的描述。
- `og:image` 分享时的图片。
- `og:url` 页面的 URL。
- `og:type` 页面内容类型，可选值为 `website`、`article`、`product`、`video` 等。
- `og:site_name` 网站名称。
- `og:locale` 页面语言和地区。

```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:url" content="..." />
<meta property="og:type" content="..." />
<meta property="og:site_name" content="..." />
<meta property="og:locale" content="..." />
```

#### 结构化数据标记

结构化数据标记是一种提供网页相关信息，并对网页内容进行分类的标准化格式，有助于帮助搜索引擎更好地理解网页，该标记由 Google、Microsoft、Yahoo 等公司共同制定。

```html
<head>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Vungle",
    "alternateName": "Vungle Inc.",
    "url": "https://vungle.com",
    "logo": "https://vungle.com/assets/logo.png",
    "description": "Vungle 是全球领先的移动广告技术公司，为广告主和开发者提供创新的广告解决方案",
    "foundingDate": "2011",
    "founder": {
      "@type": "Person",
      "name": "Jack Smith"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Market Street",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service",
        "availableLanguage": ["English", "Chinese", "Japanese"]
      },
      {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4568",
        "contactType": "sales",
        "availableLanguage": ["English", "Chinese", "Japanese"]
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/vungle",
      "https://twitter.com/vungle",
      "https://www.facebook.com/vungle",
      "https://www.crunchbase.com/organization/vungle"
    ],
    "numberOfEmployees": "500-1000",
    "industry": "Advertising Technology",
    "knowsAbout": [
      "Mobile Advertising",
      "Programmatic Advertising",
      "Ad SDK",
      "Video Advertising",
      "In-App Advertising"
    ]
  }
  </script>
</head>
```

### `<link>` 标签

`<link>` 标签用于定义 HTML 文档与外部资源之间的关系，其中的 `rel` 属性，用于指定链接资源与当前文档的关系。`rel` 属性有几个特殊值，可用于对资源的加载策略进行控制。

#### （1）`preload`

`preload` 指预加载，表示对指定的资源提前下载并缓存，对于页面中那些很快会用到的资源，通过提前下载，可以确保它们尽早可用。`preload` 一般用来加载关键的样式、脚本或者字体资源。

```html
<link rel="preload" href="critical-style.css" as="style" />
<link rel="preload" href="main.js" as="script" />
```

注意，`preload` 只会提前下载并缓存资源，并不会提前加载。另外，设置了 `preload` 的同时，还必须同时指定 `as` 属性。

#### （2）`prefetch`

`prefetch` 指预获取，表示对指定的资源提前下载并缓存，通常用在那些在浏览器的后续导航中很可能会用到的资源。`prefetch` 的优先级要比 `preload` 低，其指定的资源仅在浏览器空闲时进行下载，这意味着，如果条件不合适，浏览器并不会下载这些资源。

```html
<link rel="prefetch" href="non-critical.js">
```

注意，`preload` 只会提前下载并缓存资源，并不会提前加载。

#### （3）`dns-prefetch`

`dns-prefetch` 指 DNS 预解析，用于告诉浏览器对 `href` 属性指向的跨域的域名进行提前解析，从而对该域名下的资源进行请求时，减少 DNS 解析的时间。

```html
<link rel="dns-prefetch" href="https://example.com" />
```

`dns-prefetch` 仅对跨域域名的 DNS 解析有效，不应该将此属性用于当前域名。因为浏览器执行到这行代码时，当前域名早已执行了 DNS 解析过程。

`dns-prefetch` 除了在 `<link>` 标签中指定，也可以通过 HTTP 头中的 [Link][http-headers-link] 字段指定。

```http
Link: <https://example.com>; rel=dns-prefetch
```

#### （4）`preconnect`

`preconnect` 指预连接。HTTP(s) 通信过程中，要进行三报文传输的握手过程，`preconnect` 就是告诉浏览器，提前对 `href` 属性指向的域名进行连接，从而在对该域名下的资源进行请求时，减少连接建立的时间。

```html
<link rel="preconnect" href="https://example.com" />
```

还可以通过 HTTP 头中的 Link 字段指定。

```text
Link: <https://example.com>; rel="preconnect"
```

`dns-prefetch` 可以跟 `preconnect` 配对使用。`dns-prefetch` 执行 DNS 解析过程，而 `preconnect` 提前建立与服务器的连接。也就是说，这两个配置结合在一起，执行了 DNS 解析，以及 TCP 连接建立的过程。对于 HTTPS 的请求，`preconnect` 还会执行 TLS 握手过程。两者结合起来，进一步减少了跨域请求的感知延迟。

```html
<link rel="dns-prefetch" href="https://example.com" />
<link rel="preconnect" href="https://example.com" />
```

注意，应该仅对关键资源的连接设置 `preconnect`，其他资源仅设置 `<link rel="dns-prefetch">` 就已足够。

[http-headers-link]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Link

### CSS 资源

关键 CSS 是指首页渲染所必需的 CSS 样式资源，比如，首屏可见内容的样式、页面布局的核心样式和关键组件的样式等。对于关键的样式资源，可以直接将其内嵌在 `<style>` 标签。

```html
<head>
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

其次，也可以通过脚本动态创建 `<link>` 标签进行资源的加载。

```html
<body>
  <script>
    function loadNonCriticalCSS() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/non-critical.css';
      link.onload = function() {
        this.media = 'all';
      };
      document.head.appendChild(link);
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
    } else {
      loadNonCriticalCSS();
    }
  </script>
</body>
```

另外，还可以通过 JavaScript 提供的 `Intersection Observer` API，实现对异步样式资源的加载。这种方式的原理是，设置浏览器对目标元素进行监听，当目标元素即将进入可视窗口时，便会执行 `IntersectionObserver` 的回调函数，这时，就可以将动态创建的 `<link>` 标签，追加载页面上。

```html
<script>
  function loadCSSWhenVisible() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/non-critical.css';
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.head.appendChild(link);
          observer.disconnect();
        }
      });
    });
    
    const targetElement = document.querySelector('.non-critical-content');
    if (targetElement) {
      observer.observe(targetElement);
    }
  }
  
  loadCSSWhenVisible();
</script>
```

### JavaScript 资源

`async` 和 `defer` 是 `<script>` 标签中的两个布尔属性。这两个属性标记的资源都会异步下载，在下载过程中，不会阻塞页面的解析。

```html
<script async src="script.js"></script>
<script defer src="script.js"></script>
```

`async` 属性具有如下特点。

- 对于 `async` 标记的资源，浏览器会异步下载。
- 资源下载完成便会立即执行，由于脚本资源的执行会阻塞浏览器解析，所以，`async` 指定的资源的执行时机，可能在 `DOMContentLoaded` 事件触发之前，也可能在之后。
- 如果有多个脚本文件指定了 `async` 属性，无法保证他们的执行顺序。哪个脚本先下载结束，就先执行那个脚本。

`defer` 属性具有如下特点。

- 对于 `defer` 标记的资源，浏览器会异步下载。
- 资源下载完成后，会等待页面解析完成，之后再解析脚本资源，等到脚本执行完成，再触发 `DOMContentLoaded` 事件。这意味着，`defer` 标记的脚本资源的执行时机，在 `DOMContentLoaded` 事件触发之前。
- 如果有多个脚本文件指定了 `defer` 属性，会按照他们在文档中出现的位置，按顺序执行。
- 对于内联的脚本资源，以及动态生成的 `script` 标签，`defer` 属性不起作用。

一般来说，如果脚本之间没有依赖关系，就使用 `async` 属性，如果脚本之间有依赖关系，就使用 `defer` 属性。如果同时使用 `async` 和 `defer` 属性，后者不起作用，浏览器行为由 `async` 属性决定。

另外，使用 `async` 和 `defer` 加载的外部脚本，都不应该使用 `document.write` 方法。

![async 和 defer](https://html.spec.whatwg.org/images/asyncdefer.svg "async 和 defer 的执行时机")

## 图片资源处理

### 懒加载

关于这部分内容，可以参考 [图片懒加载的实现方式](/2025/react/2025-08-19-image-lazy-loading.md)。

### 图片内联

在使用 webpack 之类的工具打包时，将小图片内联为 Base64 格式，从而减少图片请求次数，加快图片加载速度。

### 格式和压缩

并且选择合适的格式，同时对图片进行压缩等处理。

## 路由懒加载

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// 使用魔法注释优化代码分割
const HomePage = lazy(() => 
  import(/* webpackChunkName: "home" */ './pages/HomePage')
);
const ProductsPage = lazy(() => 
  import(/* webpackChunkName: "products" */ './pages/ProductsPage')
);
const AboutPage = lazy(() => 
  import(/* webpackChunkName: "about" */ './pages/AboutPage')
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Suspense>
  );
};
```

## 服务端渲染（SSR）

## 骨架屏

## SEO 优化

### 使用语义化 HTML 标签

语义化标签是指使用具有明确含义的 HTML 标签来描述内容的结构和含义，而不是仅仅为了样式效果。语义化标签让代码更具可读性，同时帮助搜索引擎和屏幕阅读器更好地理解页面内容。

### 使用 react-helmet

[react-helmet] 是一个用于管理 React 应用头部信息的库，它允许开发者在组件级别动态设置 HTML 文档的 `<head>` 标签内容。这个库在 SEO 优化、性能提升和用户体验改善方面发挥着重要作用。

下面是一个动态设置 `<title>` 和 `<meta>` 标签的例子。

```jsx
import { Helmet } from 'react-helmet';

const SomePage = ({ title, description, keywords }) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords.join(', ')} />

    {/* ... */}
  </Helmet>
);

export default SomePage;
```

react-helmet 也可以用于预加载关键资源，如字体、CSS 文件和关键图片。

```jsx
const SomePage = () => {
  return (
    <Helmet>
      <link rel="preload" href="/fonts/main-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/images/hero-image.jpg" as="image" />
      <link rel="preload" href="/critical.css" as="style" />
    </Helmet>
  );
};
```

### 路由级 SEO 优化

还可以根据路由，动态设置 `<meta>` 标签的属性。下面就列出了一种实现，它的思路是，通过监听当前的路由路径，来动态获取配置项中的属性。

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteSEO(config) {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    const c = config[path] || config['*'] || {};
    
    if (c.title) {
      document.title = `${c.title} | 网站名称`;
    }
    
    if (c.description) {
      const desc = document.querySelector('meta[name="description"]');
      if (desc) {
        desc.setAttribute('content', c.description);
      }
    }
    
    if (c.keywords) {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) {
        keywords.setAttribute('content', c.keywords);
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

[google-does-not-use-keywords-meta-tag]: https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag
[react-helmet]: https://github.com/nfl/react-helmet

## 参考

- [HTML Living Standard](https://html.spec.whatwg.org/#scripting-3), spec.whatwg.org
- [<meta>: The metadata element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta), MDN
- [Schema.org](https://schema.org/)
