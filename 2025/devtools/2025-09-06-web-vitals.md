<!-- markdownlint-disable MD033 -->

# 网页性能指标

## 介绍

以前，衡量网页主要内容的加载速度和对用户的可见时间是很困难的，像诸如 [load][load-event] 和 [DOMContentLoaded][dom-content-loaded-event] 之类的网页事件并不能准确反映用户看到的内容的加载时机。

网页指标（Web Vitals）就是用来解决这些问题的，它是由 Google 提出的一系列概念，它是一套为提高网页性能而提出的规范。

在诸多网页指标中，核心网页指标（Core Web Vitals）是最重要的网页指标，每个核心网页指标代表着用户体验的一部分。目前，核心网页指标主要有三个： LCP、INP 和 CLS，他们分别关注于网页的加载、交互和视觉稳定性，

<div>
  <img src="https://web.dev/static/articles/vitals/image/largest-contentful-paint-ea2e6ec5569b6.svg" alt="最大内容渲染推荐阈值" width="250" height="220">
  <img src="https://web.dev/static/articles/vitals/image/inp-thresholds.svg" alt="下次渲染交互推荐阈值" width="250" height="220">
  <img src="https://web.dev/static/articles/vitals/image/cumulative-layout-shift-t-5d49b9b883de4.svg" alt="累积布局偏移推荐阈值" width="250" height="220">
</div>

- Largest Contentful Paint（LCP，最大内容渲染）关注网页加载性能，网页首次加载时，LCP 最好控制在 2.5s 以内。
- Interaction to Next Paint（INP，下次渲染交互）关注交互性，INP 最好控制在 200ms 或者以内。
- Cumulative Layout Shift（CLS，累积布局偏移）关注视觉稳定性，CLS 最好控制在 0.1 或者以内。

[Chrome 用户体验报告][chrome-user-experience-report]、[Chrome 开发者工具][chrome-devtools]、[PageSpeed Insights][pagespeed-insights] 和 [Search Console (核心网页指标报告)][search-console] 都支持上面列出的三个核心网页指标，也可以在 JavaScript 中使用 [web-vitals] 获取这些指标。

除了上面列出的三个核心网页指标，还有一些其他指标，比如 [First Contentful Paint][fcp]（FCP，首次内容渲染）和 [Time to First Byte][ttfb]（TTFB，加载第一个字节所需时间）。

下面分别对这些指标进行介绍。

[chrome-user-experience-report]: https://developer.chrome.com/docs/crux
[chrome-devtools]: https://developer.chrome.com/docs/devtools/performance/overview#compare
[pagespeed-insights]: https://developers.google.com/speed/pagespeed/insights/
[search-console]: https://support.google.com/webmasters/answer/9205520
[web-vitals]: https://github.com/GoogleChrome/web-vitals
[fcp]: https://web.dev/articles/fcp
[ttfb]: https://web.dev/articles/ttfb
[load-event]: https://developer.mozilla.org/docs/Web/Events/load
[dom-content-loaded-event]: https://developer.mozilla.org/docs/Web/Events/DOMContentLoaded

## Largest Contentful Paint（LCP）

Largest Contentful Paint（LCP，最大内容渲染）用于衡量可感知的页面加载速度，在页面加载过程中，主要内容在加载时会被标记。LCP 测量的是页面加载过程中最大可见内容元素的渲染时间。这个时间是从用户首次导航到页面开始，到最大内容元素完全渲染完成的时间。

注意，LCP 中包括了上一个网页的卸载时间、连接设置时间、重定向时间和其他 TTFB 延迟时间，这些时间在实际测量时可能会很长，并且可能会导致实际测量结果与实验室测量结果之间存在差异。

网页应将最大内容绘制时间控制在 2.5s 以内，为确保达到这一目标，可以按照 75% 页面加载时间进行衡量。

<picture>
  <source srcset="https://web.dev/static/articles/lcp/image/good-lcp-values.svg" media="(min-width: 640px)" width="800" height="200">
  <img src="https://web.dev/static/articles/lcp/image/good-lcp-values-are-25-s-28836be83d1aa.svg" alt="好的 LCP 值为 2.5 秒或更短，差的值大于 4 秒，在这两者之间的任何值都需要改进" width="640" height="480">
</picture>

根据 [Largest Contentful Paint API][largest-contentful-paint-api] 的描述，衡量 LCP 时，下面的元素会被考虑。

- `<img>` 元素。
- `svg` 中的 `<image>` 元素。
- `<video>` 元素。
- 使用 `url()` 函数设置了背景图片的元素。
- 包含文本节点或者其他行内文本子元素的块级元素。

LCP 不会考虑“无内容”的元素，包括：

- `opacity` 为 0 的元素。
- 覆盖适口的元素，他们会被当作背景而不是内容。
- 不会反映真实内容的占位图或者低熵的图片。

注意，First Contentful Paint（FCP）和 LCP 采取的算法是不同的，FCP 测量任何内容绘制到屏幕的时间，它可能会考虑占位图或者全屏视口图片，而 LCP 测量主要内容绘制的时间，它的一个特点是选择性，即选择最大的那个内容。

LCP 测量内容时，采用如下的策略。

- 只计算视口内可见的部分，被裁剪或溢出的部分不计入尺寸。
- 对于图片元素，取可见尺寸和固有尺寸的较小值。
- 对于文本元素，只考虑包含所有文本节点的最小矩形。
- 不考虑样式属性中的 `margin`、`padding` 和 `border`。
- 每个文本节点属于最近的块级祖先元素，这确保了文本尺寸计算的准确性。

这些规则确保了 LCP 测量的是用户实际看到的内容大小，而不是元素的完整渲染尺寸。

### LCP 何时报告

网页通常分阶段加载，因此页面上的最大元素可能会发生变化。

为了应对这种变化，浏览器在绘制第一帧后立即分发一个类型为 `largest-contentful-paint` 的 PerformanceEntry，用于标识最大的内容元素。然后，在后续渲染中，每当最大的内容元素发生变化时，它都会分发另一个 PerformanceEntry。

例如，在一个包含文本和主图（hero image）的页面上，浏览器可能最初只渲染文本，此时浏览器会分发一个 `largest-contentful-paint` 条目，其 `element` 属性可能是一个 `<p>` 或 `<h1>` 元素。稍后，一旦主图完成加载，会分发第二个 `largest-contentful-paint` 条目，其 `element` 属性会变为 `<img>` 元素。

一个元素只有在渲染完成且对用户可见后才能被视为最大的内容元素。尚未加载的图片不被视为"已渲染"。在字体阻塞期间使用网络字体的文本节点也是如此。在这种情况下，可能会报告一个较小的元素作为最大的内容元素，但一旦较大的元素完成渲染，就会创建另一个 PerformanceEntry。

除了延迟加载的图片和字体外，页面可能会在新内容可用时向 DOM 添加新元素。如果这些新元素中的任何一个比之前最大的内容元素更大，也会报告新的 PerformanceEntry。

如果最大的内容元素从视口中移除，甚至从 DOM 中移除，它仍然保持为最大的内容元素，除非渲染了更大的元素。

注意，一旦用户与页面交互（通过点击、滚动或按键），浏览器就会停止报告新条目，因为用户交互往往会改变用户可见的内容（滚动时尤其如此）。

出于分析目的，应该只向服务报告最近分发的 PerformanceEntry。

<!-- 注意，由于用户可以在后台标签页中打开页面，`largest-contentful-paint` 条目可能直到用户聚焦标签页时才会分发，这可能比他们首次加载页面时晚得多。Google 测量 LCP 的工具不会报告在后台加载的页面的此指标，因为它不能反映用户感知的加载时间。 -->

另外，对于跨域的图片，建议设置 [Timing-Allow-Origin][timing-allow-origin] 头，这样指标会更准确。

### 处理元素布局和尺寸变化

为了保持计算和分发新性能条目的性能开销较低，元素尺寸或位置的变化不会生成新的 LCP 候选元素。只考虑元素在视口中的初始尺寸和位置。这意味着最初在屏幕外渲染然后过渡到屏幕上的图片可能不会被报告。这也意味着最初在视口中渲染然后被推下屏幕的元素仍会报告其初始的视口内尺寸。

下面的例子演示了 LCP 的触发时机。

<figure>
  <img src="/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa.png" alt="Largest Contentful Paint timeline from cnn.com" width="800" height="311" srcset="https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_36.png 36w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_48.png 48w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_72.png 72w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_96.png 96w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_480.png 480w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_720.png 720w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_856.png 856w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_960.png 960w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_1440.png 1440w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_1920.png 1920w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-fc43128e011aa_2880.png 2880w" sizes="(max-width: 840px) 100vw, 856px">
  <figcaption>
    cnn.com 的 LCP 时间轴
  </figcaption>
</figure>

<figure>
  <img src="/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a.png" alt="Largest Contentful Paint timeline from techcrunch.com" width="800" height="311" srcset="https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_36.png 36w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_48.png 48w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_72.png 72w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_96.png 96w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_480.png 480w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_720.png 720w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_856.png 856w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_960.png 960w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_1440.png 1440w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_1920.png 1920w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-3713e2f14970a_2880.png 2880w" sizes="(max-width: 840px) 100vw, 856px">
  <figcaption>
    techcrunch.com 的 LCP 时间轴
  </figcaption>
</figure>

上面两个页面加载过程中，随着内容的加载，最大元素也在发生变化。第一个例子中，新的内容被添加到 DOM 中，页面在加载，最大元素也在发生变化。第二个例子中，随着布局的变化，之前的最大元素被从视口中移除了。

多数情况下，后加载的内容比页面上已有的内容更大。下面的两个例子演示了 LCP 发生在页面完全加载之前的情况。

<figure>
  <img src="/static/articles/lcp/image/largest-contentful-paint-9bc403e812154.png" alt="Largest Contentful Paint timeline from instagram.com" width="800" height="311" srcset="https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_36.png 36w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_48.png 48w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_72.png 72w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_96.png 96w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_480.png 480w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_720.png 720w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_856.png 856w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_960.png 960w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_1440.png 1440w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_1920.png 1920w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-9bc403e812154_2880.png 2880w" sizes="(max-width: 840px) 100vw, 856px">
  <figcaption>
    instagram.com 的 LCP 时间轴
  </figcaption>
</figure>

上面例子中，Instagram 图标相对较早地加载，即使其他内容逐步显示，它仍然保持为最大的元素。

注意，在 Instagram 时间线的第一帧中，相机图标周围没有绿色框。这是因为它是一个 `<svg>` 元素，而 `<svg>` 元素目前不被视为 LCP 候选元素（`<img src="...svg">` 和 `<svg>` 元素内的单个 `<image>` 元素是候选元素）。第一个 LCP 候选元素是第二帧中的文本。

<figure>
  <img src="/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7.png" alt="Largest Contentful Paint timeline from google.com" width="800" height="311" srcset="https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_36.png 36w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_48.png 48w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_72.png 72w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_96.png 96w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_480.png 480w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_720.png 720w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_856.png 856w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_960.png 960w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_1440.png 1440w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_1920.png 1920w,https://web.dev/static/articles/lcp/image/largest-contentful-paint-6c5554de0eac7_2880.png 2880w" sizes="(max-width: 840px) 100vw, 856px">
  <figcaption>
    google.com 上的 LCP 时间轴
  </figcaption>
</figure>

上面的例子中，最大元素是一段文本，它在任何图片完成加载之前就已经显示了。由于所有单独的图片都比这段文本小，因此它在整个加载过程中始终保持为最大的元素。

### LCP 测量方式

LCP 有多种测量方式，包括使用在线测量工具或者开发者工具。

#### 在线测量工具

- [Chrome 用户体验报告][chrome-user-experience-report]
- [PageSpeed Insights][pagespeed-insights]
- [Search Console (核心网页指标报告)][search-console]
- [web-vitals]

#### 开发者工具

- [Chrome 开发者工具][chrome-devtools]
- [Lighthouse][lighthouse]
- [WebPageTest][webpage-test]

#### JavaScript 中测量 LCP

在 JavaScript 中测量 LCP，可以使用 [Largest Contentful Paint API][largest-contentful-paint-api]。下面的例子演示了如何使用 [PerformanceObserver][performance-observer] 监听 `largest-contentful-paint` 项目的变化。

```javascript
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log('LCP candidate:', entry.startTime, entry);
  }
}).observe({type: 'largest-contentful-paint', buffered: true});
```

上面代码中，每个记录的 `largest-contentful-paint` 条目都代表当前的 LCP 候选项目。一般来说，最后发出的条目的 `startTime` 值就是 LCP 值。然而，情况并非总是如此。并非所有的 `largest-contentful-paint` 条目都适用于测量 LCP。

以下部分列出了 API 报告的内容与指标计算方式之间的差异。

- API 会为在后台加载的标签页分发 `largest-contentful-paint` 条目，但在计算 LCP 时应该忽略这些页面。
- API 会为进入后的页面持续分发 `largest-contentful-paint` 条目，但在计算 LCP 时应该忽略这些页面（只有页面处于前台时才会被考虑）。
- 当页面从前进/后退缓存恢复时，API 不会报告 `largest-contentful-paint` 条目，但 LCP 应该考虑到这些情况，因为这对用户来说，是不同的页面访问。
- API 不考虑 iframe 内的元素，但指标会考虑，因为它们是页面用户体验的一部分。iframe 页面中的 LCP（比如视频中的海报图片），将在 CrUX 和 RUM 之间显示差异。为了正确测量 LCP，应该考虑到这些因素。子框架可以使用 API 将其 `largest-contentful-paint` 条目报告给父框架进行聚合。
- API 从导航开始测量 LCP，但对于预渲染页面，应该从 [activationStart][activation-start] 开始测量 LCP，因为这与用户体验到的 LCP 时间对应。

注意，开发者工具 [web-vitals] 自动处理了这些情况。

另外，有时最大的元素并不是最重要的元素，此时可以考虑使用 [Element Timing API][element-timing]，具体的使用方法，可以参考[这篇][element_timing_api]文章。

[largest-contentful-paint-api]: https://wicg.github.io/largest-contentful-paint/
[lighthouse]: https://developer.chrome.com/docs/lighthouse/overview
[webpage-test]: https://webpagetest.org/
[performance-observer]: https://developer.mozilla.org/docs/Web/API/PerformanceObserver
[activation-start]: https://developer.mozilla.org/docs/Web/API/PerformanceNavigationTiming/activationStart
[element-timing]: https://wicg.github.io/element-timing/
[element_timing_api]: https://web.dev/articles/custom-metrics#element_timing_api
[timing-allow-origin]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Timing-Allow-Origin

## 参考

- [Web Vitals](https://web.dev/articles/vitals), Philip Walton
- [Largest Contentful Paint (LCP)](https://web.dev/articles/lcp), Philip Walton, Barry Pollard
- [Interaction to Next Paint (INP)](https://web.dev/articles/inp), Jeremy Wagner, Barry Pollard
- [Cumulative Layout Shift (CLS)](https://web.dev/articles/cls), Milica Mihajlija, Philip Walton
- [Optimize Largest Contentful Paint](https://web.dev/articles/optimize-lcp), Philip Walton, Barry Pollard
- [Optimize Interaction to Next Paint](https://web.dev/articles/optimize-inp), Jeremy Wagner, Philip Walton, Barry Pollard
- [Optimize Cumulative Layout Shift](https://web.dev/articles/optimize-cls), Addy Osmani, Barry Pollard
- [Core Web Vitals workflows with Google tools](https://web.dev/articles/vitals-tools)
- []()
- []()
