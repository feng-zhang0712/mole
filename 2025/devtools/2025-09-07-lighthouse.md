<!-- markdownlint-disable MD033 -->

# LightHouse

## 介绍

LightHouse 是 Google 推出的一款自动化开源工具，用于对网站的性能、无障碍、搜索引擎优化 (SEO) 等方面进行评估。LightHouse 有[多种工作流程][lighthouse-workflow]，下面的分析以[在 Chrome 开发者工具中][lighthouse-in-devtools]集成为例。

Lighthouse 通过打分机制，来对网站的性能进行评估，越高的分值，通常表示网站性能和用户体验越好。Lighthouse 的评分受[指标][metrics]的影响，通过优化 Lighthouse 给出的建议和诊断信息，可以提高相应的指标值。

Lighthouse 的评分可能出现波动，波动原因可能是下面这些问题导致。

- A/B 测试或广告服务的变化。
- 互联网流量路由的变化。
- 测试设备的不同。
- 注入 JavaScript 并并添加或者修改网络请求的浏览器扩展。
- 杀毒软件。

[这篇文章][lighthouse-variability] 对此进行了更详细的分析。

Lighthouse 得分是*指标分数*的加权平均值，权重大的指标对整体性能分数有更大的影响。指标分数在报告中不可见，而是在后台计算。下面是 Lighthouse 10 各种指标所占的权重。

<figure>
  <a href="https://googlechrome.github.io/lighthouse/scorecalc/">
    <img alt="Lighthouse 评分计算器 Web 应用" height="414" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/lighthouse-scoring-calcul-196f49058e387_2880.png 2880w" width="600">
  </a>
  <figcaption>
    <a href="https://googlechrome.github.io/lighthouse/scorecalc/">Lighthouse 评分计算器</a>
  </figcaption>
</figure>

| 项目 | 权重 |
|---------|------|
| [首次内容绘制](https://web.dev/articles/fcp) | 10% |
| [速度指数](/en/docs/lighthouse/performance/speed-index) | 10% |
| [最大内容绘制](https://web.dev/articles/lcp) | 25% |
| [总阻塞时间](https://web.dev/tbt/) | 30% |
| [累积布局偏移](https://web.dev/articles/cls) | 25% |

### 指标分数确定方式

Lighthouse 收集性能指标（大多数以毫秒为单位报告）后，会根据指标值在 Lighthouse 评分分布中的所处位置，将每个原始指标值转换为 0 到 100 之间的指标得分。评分分布是基于 [HTTP 归档][http-archive]中，真实网站性能数据的性能指标派生出来的对数正态分布。

例如，Largest Contentful Paint (LCP) 衡量的，是用户感知到网页上最大内容处于可见状态的时间。LCP 的指标值表示，从用户发起网页加载到网页呈现其主要内容之间的时长。根据真实的网站数据，性能最佳的网站在大约 1,220 毫秒内呈现 LCP，因此该指标值对应的评分为 99。

<figure>
  <img alt="TTI 评分曲线的图片" height="329" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/performance-scoring/image/image-the-scoring-curve-f72983bc008e4_2880.png 2880w" width="600">
  <figcaption class="dcc-caption">
    <a href="https://www.desmos.com/calculator/o98tbeyt1t">TTI 评分曲线</a>。
  </figcaption>
</figure>

指标得分和性能得分根据以下范围着色。

- 0 到 49（红色）：性能较差
- 50 到 89（橙色）：性能需要改进。
- 90 到 100（绿色）：性能良好。

## 指标

Lighthouse 得分主要受五个指标的影响，分别是：First Contentful Paint（FCP）、Largest Contentful Paint（LCP）、Cumulative Layout Shift（CLS）、Speed Index 和 Total Blocking Time（TTB）。关于这些指标的详细信息，可以参考[这篇文章][metrics]的介绍。

## 诊断信息

### 避免网络负载过大

网络负载过大会导致更多的流量消耗，如果用户使用蜂窝流量，这意味着需要缴纳更多的流量费用。

Lighthouse 会显示网页请求的所有资源的总大小（以千字节 (KiB) 为单位），最大的请求会列在最前面。

<figure>
  <img alt="Lighthouse“避免巨大的网络载荷”审核的屏幕截图" height="518" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/total-byte-weight/image/a-screenshot-the-lightho-5edd6e4e68e25_2880.png 2880w" width="800">
</figure>

根据 [HTTP Archive][http-archive-state-of-the-web] 数据，网络载荷的中位数介于 1,700 到 1,900 KiB 之间，Lighthouse 会标记网络请求总数超过 5,000 KiB 的页面。

下面是一些优化网络负载的措施。

- [缓存请求][web-reliable]。
- [压缩数据][reduce-network-payloads-using-text-compression]。
- 将请求推迟到需要时再发送。
- 使用响应式图片。
- [使用 WebP 格式（而非 JPEG 或 PNG）的图片][serve-images-webp]。
- [将 JPEG 图片的压缩级别设置为 85][use-imagemin-to-compress-images]。

### 采用高效的缓存政策提供静态资源

使用本地缓存可以提供更快的加载体验，同时解放服务器的压力。Lighthouse 会标记所有未缓存的静态资源。

<figure>
  <img alt="Lighthouse“采用高效的缓存策略提供静态资源”审核的屏幕截图" height="490" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/a-screenshot-the-lightho-d4eb993831c72_2880.png 2880w" width="800">
</figure>

上面图片中，列出了所有未缓存的资源，其中 `URL` 表示资源的地址，`CacheTTL` 表示资源的当前缓存时长，`Size` 表示用户可以节省的预估流量。

如果资源满足以下所有条件，Lighthouse 会将其视为可缓存的资源。

- 资源是样式、脚本、字体、图片或者媒体文件。
- 资源的 HTTP 状态代码为 `200`、`203` 或 `206`。
- 资源没有明确禁止缓存。

### 使用 HTTP 缓存缓存静态资源

HTTP 响应标头中的 `Cache-Control` 字段可以设置资源的缓存策略。

```http
Cache-Control: max-age=31536000
```

上面代码中，`max-age` 用于告诉浏览器应将资源缓存多长时间（以秒为单位），这里将时长设置为 31536000 秒，也就是一年。

对于长期不变的静态资源，应为其设置长时间缓存，比如一年或者更长的时间。当然，这也会导致资源变更时客户端无法获取最新的资源，可以在使用打包工具时（比如 webpack），将静态资源文件名指定为内容哈希来解决。

### 在 Chrome 开发者工具中验证缓存的响应

Chrome DevTools 中的 Network 标签页，可以查看浏览器从缓存中加载了哪些资源。

<img alt="“尺寸”列。" height="565" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/the-size-column-4c3e86c3d8b8f_2880.png 2880w" width="800">

上图中开发者工具中的 Size（大小）列展示了资源是否已缓存。Chrome 会从内存缓存中提供最常请求的资源，这种方式优点是速度快，但资源会在浏览器关闭时清除。

可以通过检查 HTTP 响应头中的 `Cache-Control` 字段，验证资源是否被设置为预期值。

<figure>
  <img alt="通过“Headers”标签页检查 Cache-Control 标头" height="597" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-long-cache-ttl/image/inspecting-cache-control-881e2975bf9d3_2880.png 2880w" width="800">
  <figcaption class="dcc-caption">
    响应头中的 <code dir="ltr" translate="no">Cache-Control</code> 字段
  </figcaption>
</figure>

### 避免 DOM 树过大

大型 DOM 树可能会通过多种方式[影响页面的性能][dom-size-and-interactivity]，比如降低网络效率、运行时性能和内存性能等。

Lighthouse 会报告网页的总 DOM 元素数、最大 DOM 深度以及其最大子元素数。

<figure>
  <img alt="避免 DOM 规模过大 Lighthouse 审核结果会显示 DOM 元素总数、DOM 最大深度和子元素的数量上限。" height="363" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/dom-size/image/lighthouse-excessive-dom-size-audit_2880.png 2880w" width="800">
</figure>

Lighthouse 会标记 DOM 树存在以下问题的网页。

- 如果正文元素包含超过 800 个节点，会发出警告。
- 如果正文元素包含的节点超过大约 1,400 个时，则会出现错误。

可以考虑从下面这些角度优化 DOM 大小。

- 仅在需要时创建 DOM 节点，并在不再需要时将其销毁。
- 移除未显示的节点，在用户交互时（例如滚动或点击按钮）再创建。
- [简化 CSS 选择器][reduce-the-scope-and-complexity-of-style-calculations]。
- 在 React 中，虚拟列表考虑使用 [react-window] 之类的库。
- 在 React 中，使用 `shouldComponentUpdate`、`PureComponent` 或 `React.memo` 尽量减少不必要的重复呈现。
- 在 React 中，跳过不必要的渲染。

### 缩短 JavaScript 执行时间

JavaScript 执行时间过长，会导致用户可交互时间被拉长、更多的流量消耗以及内存开销。

当 JavaScript 执行时间超过 2 秒时，Lighthouse 会显示警告；如果执行用时超过 3.5 秒，分析就会失败。

<figure>
  <img alt="Lighthouse 减少 JavaScript 执行时间审核的屏幕截图" height="321" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/bootup-time/image/a-screenshot-the-lightho-c3740d2b20198_2880.png 2880w" width="800">
</figure>

可以从以下方面加快 JavaScript 的执行。

- [缩减代码大小][reduce-network-payloads-using-text-compression]。
- [移除未使用的代码][remove-unused-code]。
- [代码拆分][reduce-javascript-payloads-with-code-splitting]，仅发送用户需要的代码。
- 使用 [PRPL 模式][apply-instant-loading-with-prpl]缓存代码来减少网络行程。

### 避免链接关键请求

[关键请求链][critical-rendering-path]是对页面呈现非常重要的一系列相关网络请求。链的长度越长且下载大小越大，对网页加载性能的影响就越显著。

Lighthouse 会报告以高优先级加载的关键请求。

<figure>
  <img alt="Lighthouse 最小化关键请求深度审核的屏幕截图" height="452" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/critical-request-chains/image/a-screenshot-the-lightho-d594327baf75_2880.png 2880w" width="800">
</figure>

Lighthouse 使用网络优先级作为代理，来别会阻塞渲染的关键资源。系统会从 Chrome 远程调试协议提取关键请求链、资源大小和下载资源所花费的时间。

考虑从以下方面降低关键请求链对性能的影响。

- 尽可能减少关键资源的数量：消除关键资源、延迟下载、将其标记为 `async` 等等。
- 优化关键字节数以缩短下载时间（往返次数）。
- 优化其余关键资源的加载顺序：尽早下载所有关键资源，以缩短关键路径长度。
- 优化 [CSS][defer-non-critical-css]、[JavaScript][apply-instant-loading-with-prpl]、[字体][avoid-invisible-text]和[图片][use-imagemin-to-compress-images]。

### User Timing 标记和测量

[User Timing API][user-timing-api] 用于衡量应用的 JavaScript 性能。通过在 JavaScript 中插入 API 调用，然后提取可用于优化代码的详细计时数据。

如果应用中使用 User Timing API 添加了标记（即时间戳）和测量结果（即标记之间经过的时间的测量结果），Lighthouse 会报告这些数据。

<figure>
  <img alt="Lighthouse User Timing 标记和测量审核的屏幕截图" height="408" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/user-timings/image/a-screenshot-the-lightho-e169ed5feb197_2880.png 2880w" width="800">
</figure>

在 React 中，可以使用 [React DevTools Profiler][react-profiler]（利用 Profiler API）来衡量组件的渲染性能。

### 减少主线程工作

浏览器的渲染程序进程会将您的代码转换为用户可以与之互动的网页。默认情况下，渲染程序进程的主线程通常会处理大多数代码：它会解析 HTML 并构建 DOM，解析 CSS 并应用指定的样式，然后解析、评估和执行 JavaScript。

主线程也会处理用户事件。 因此，每当主线程忙于执行其他操作时，您的网页可能不会响应用户互动，从而导致糟糕的体验。

Lighthouse 标记在加载期间主线程处于忙碌状态超过 4 秒的页面。

<figure>
  <img alt="Lighthouse 将主线程工作审核最小化的屏幕截图" height="408" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/mainthread-work-breakdown/image/a-screenshot-the-lightho-2e9196c10c9b_2880.png 2880w" width="800">
</figure>

考虑从以下方面减少主线程工作量。

1. 优化脚本
     - [优化第三方 JavaScript][optimize_your_third_party_resources]
     - [防抖和节流处理][debounce-your-input-handlers]
     - [使用 Web Worker][off-main-thread]
2. 优化样式和布局
     - [缩小样式计算的范围并降低其复杂性][reduce-the-scope-and-complexity-of-style-calculations]
     - [避免大型、复杂的布局和布局抖动][avoid-large-complex-layouts-and-layout-thrashing]
3. 渲染
     - [仅使用合成器的属性并管理层数][stick-to-compositor-only-properties-and-manage-layer-count]
     - [降低绘制的复杂性并减少绘制区域][simplify-paint-complexity-and-reduce-paint-areas]
4. 解析 HTML 和 CSS
     - [提取关键 CSS][extract-critical-css]
     - [缩减 CSS 大小][minify-css]
     - [推迟非关键 CSS][defer-non-critical-css]
5. 脚本解析和编译
     - [代码拆分][reduce-javascript-payloads-with-code-splitting]
     - [移除未使用的代码][remove-unused-code]
6. 垃圾回收
     - [使用 measureMemory() 监控网页的总内存用量][monitor-total-page-memory-usage]

### 确保文本在网页字体加载期间保持可见

### 保持较低的请求数量和较小的传输大小

### 确保该网页可以从往返缓存中恢复

## 页面优化措施

### 消除阻塞渲染的资源

Lighthouse 会列出阻止页面渲染的样式或者脚本资源。

<figure>
   <img alt="Lighthouse“移除阻塞渲染的资源”审核的屏幕截图" height="271" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/a-screenshot-the-lightho-5778b55a95aeb_2880.png 2880w" width="800">
</figure>

Lighthouse 会标记两种类型的阻塞渲染的网址：**脚本**和**样式表**。

具有以下特征的 `<script>` 标签会被标记。

- 位于文档的 `<head>` 中。
- 没有 `defer` 或者 `async` 属性。

具有以下特征的 `<link rel="stylesheet">` 标签会被标记。

- 没有 `disabled` 属性。如果具有此属性，则浏览器不会下载样式表。
- 没有与用户的设备具体匹配的 `media` 属性。`media="all"` 会被视为会阻塞渲染。

为了减少样式和脚本资源对页面加载的影响，应该延迟加载非关键资源。Chrome DevTools 提供了 [Coverage（覆盖率）标签页][devtools-coverage]来找出关键资源和非关键资源。

<figure>
  <img alt="Chrome 开发者工具：Coverage 标签页" height="407" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/render-blocking-resources/image/chrome-devtools-coverage-60f77a25e4012_2880.png 2880w" width="800">
  <figcaption class="dcc-caption">
    Chrome 开发者工具中的覆盖率标签页
  </figcaption>
</figure>

上图中，绿色部分表示关键资源，这些资源是首次绘制所需的样式；红色部分表示非关键资源。

对于关键的样式资源，可以直接将其内嵌在 `<style>` 标签中；对于非关键的样式资源，可以为其指定 `preload` 属性。

对于关键的脚本资源，可以直接将其内嵌在 `<script>` 标签中；对于非关键的脚本资源，可以为其指定 `async` 或者 `defer` 属性，对于未使用的代码，应将其移除。

### 样式处理

#### 移除未使用的 CSS

Lighthouse 报告的“优化”部分会列出所有未被使用的 CSS 文件。

<figure>
  <img alt="Lighthouse“移除未使用的 CSS”审核的屏幕截图" height="235" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/a-screenshot-the-lightho-48e33e715ffd9_2880.png 2880w" width="800">
</figure>

Chrome DevTools 提供了 [Coverage（覆盖率）标签页][devtools-css-coverage]来找出那些关键和非关键的样式资源。

<figure>
  <img alt="Chrome 开发者工具：“覆盖率”标签页" height="407" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/unused-css-rules/image/chrome-devtools-coverage-6915c1e9c2a93_2880.png 2880w" width="800">
  <figcaption class="dcc-caption">
    Chrome 开发者工具中的覆盖率标签页
  </figcaption>
</figure>

可以考虑使用 [critical]自动提取和内嵌“可见区域”样式资源。

#### 压缩 CSS

Lighthouse 报告的“优化建议”部分会列出所有未压缩的 CSS 文件，以及压缩这些文件后有望节省的 kibibyte (KiB)。

<figure>
  <img alt="Lighthouse 压缩 CSS 审核的屏幕截图" height="212" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-css/image/a-screenshot-the-lightho-9935f05e8c4cd_2880.png 2880w" width="800">
</figure>

减少样式资源的大小，一是开发中对样式资源进行一定程度的优化。比如下面的代码：

```css
/* 不好的风格 */
h1 {
  background-color: #000000;
}
h2 {
  background-color: #000000;
}

/* 好的风格 */
h1,
h2 {
  background-color: #000000;
}

/* 更好的风格 */
h1,
h2 {
  background-color: #000;
}
```

还可以考虑使用 [minify-css] 插件压缩样式资源。

### 脚本处理

#### 压缩 JavaScript

Lighthouse 报告的“优化建议”部分会列出所有未压缩的 JavaScript 文件，以及压缩这些文件后有望节省的 kibibyte (KiB)。

<figure>
  <img alt="Lighthouse“压缩 JavaScript”审核的屏幕截图" height="212" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/unminified-javascript/image/a-screenshot-the-lightho-e35d561e16c6f_2880.png 2880w" width="800">
</figure>

上面图片中，`Potential Savings` 选项给出了对应的脚本资源压缩后，预估能够节省的空间大小。

压缩脚本资源可以考虑使用 [Terser][terser] 插件。

#### 降低第三方代码的影响

项目中的第三方脚本可能会影响网页加载效果。Lighthouse 报告中，包含了那些阻塞主线程超过 250ms 或者更长时间的第三方代码。

<figure>
  <img alt="Lighthouse 的屏幕截图，以减少第三方代码审核的影响" height="481" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-summary/image/a-screenshot-the-lightho-61da3befa3627_2880.png 2880w" width="800">
</figure>

[识别运行缓慢的第三方 JavaScript](https://web.dev/articles/identify-slow-third-party-javascript)

[高效加载第三方 JavaScript](https://web.dev/articles/efficiently-load-third-party-javascript)

### 图片处理

#### 图片编码

Lighthouse 报告的“优化”部分会列出所有未经优化的图片，并可能以千字节 (KiB) 为单位节省空间。

<figure>
  <img alt="Lighthouse“对图片进行高效编码”审核的屏幕截图" height="263" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-optimized-images/image/a-screenshot-the-lightho-0ecd75d8d7fe8_2880.png 2880w" width="800">
</figure>

Lighthouse 会收集网页上的所有 JPEG 或 BMP 图片，将每个图片的压缩级别设为 85，然后将原始版本与压缩版本进行比较。如果潜在节省量至少为 4KiB，Lighthouse 会将图片标记为可优化。

考虑通过下面这些方式来优化图片。

- [压缩图片][use-imagemin-to-compress-images]
- [懒加载图片][codelab-use-lazysizes-to-lazyload-images]
- [提供响应式图片][serve-responsive-images]
- [将 GIF 动画替换为视频][replace-gifs-with-videos]
- [提供尺寸正确的图片][serve-images-with-correct-dimensions]
- [使用 WebP 图片][serve-images-webp]
- [使用图片 CDN][image-cdns]

还可以使用诸如 [ImageOptim] 或者 [Squoosh] 之类的工具对图片进行优化。

#### 调整图片大小

Lighthouse 报告的“优化建议”部分会列出网页中尺寸不当的所有图片，以及可能节省的 kibibyte (KiB) 数。调整这些图片的大小可节省流量并缩短网页加载时间。

<figure>
  <img alt="Lighthouse“适当调整图片大小”审核的屏幕截图" height="264" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-responsive-images/image/a-screenshot-the-lightho-7c337c3ae8988_2880.png 2880w" width="800">
</figure>

对于页面上的每张图片，Lighthouse 会将所渲染图片的大小与实际图片的大小进行比较。 呈现的大小还会考虑设备像素比。如果呈现大小比实际大小小至少 4KiB，则图片将无法通过审核。

考虑使用以下方式优化图片尺寸。

- [提供响应式图片][serve-responsive-images]
- [RespImageLint][respimagelint] 是一个实用的书签页，可以帮助确定图片的最佳 `srcset` 和 `sizes` 属性值
- 使用 [图片 CDN][image-cdns]
- [使用 SVG 替代复杂图标][replace_complex_icons_with_svg]
- [gulp-responsive] 或 [responsive-images-generator] 等工具可帮助自动将图片转换为多种格式

#### 推迟显示屏幕外图片

Lighthouse 报告的“优化建议”部分会列出网页中的所有屏幕外或隐藏图片，以及可能节省的 kibibyte (KiB) 数。

<figure>
  <img alt="Lighthouse 推迟屏幕外图像审核的屏幕截图" height="416" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/offscreen-images/image/a-screenshot-the-lightho-886f5632a8905_2880.png 2880w" width="800">
</figure>

[针对 Web 的浏览器级图片延迟加载](https://web.dev/articles/browser-level-image-lazy-loading)

#### 使用现代格式的图片

Lighthouse 报告的“优化建议”部分列出了采用旧版图片格式的所有图片。

Lighthouse 收集网页上的每张 BMP、JPEG 和 PNG 图片，将每张图片转换为 WebP 格式，并估算 AVIF 文件大小，从而根据转化数据报告有望节省的费用。

<figure>
  <img alt="Lighthouse “以现代格式提供图片”审核的屏幕截图" height="306" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-webp-images/image/a-screenshot-the-lightho-f5772f34fea23_2880.png 2880w" width="800">
</figure>

与旧版 JPEG 和 PNG 相比，AVIF 和 WebP 这两种图片格式具有更优的压缩和质量特性。采用这些格式（而非 JPEG 或 PNG）对图片进行编码，可以提高图片的加载速度，并消耗更少的移动数据网络。

Chrome、Firefox 和 Opera 支持 [AVIF]，并且与具有相同画质设置的其他格式相比，AVIF 的大小会更小。

最新版本的 Chrome、Firefox、Safari、Edge 和 Opera 支持 [WebP]，可为网络上的图片提供更好的有损和无损压缩。

注意，最新版本的 Chrome、Firefox、Safari、Edge 和 Opera 支持 WebP，而 AVIF 支持则较为有限。 您需要投放后备 PNG 或 JPEG 图片，以便支持旧版浏览器。可以参考 [这篇文章][how_can_i_detect_browser_support_for_webp]来检测浏览器对 WebP的支持。

### 请求处理

#### 启用文本压缩

文本资源在传送时应进行压缩，以最大限度减少网络总字节数。Lighthouse 报告的“优化建议”部分列出了所有未压缩的文本资源。

<figure>
  <img alt="Lighthouse“启用文本压缩”审核的屏幕截图" height="271" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/a-screenshot-the-lightho-b5e39391250f_2880.png 2880w" width="800">
</figure>

Lighthouse 会收集满足以下条件的所有响应。

- 具有基于文本的资源类型。
- 不包含设置为 `br`、`gzip` 或 `deflate` 的 `Content-Encoding` 标头。

Lighthouse 会使用 [GZIP] 压缩每个文件，以计算潜在的节省量。如果响应的原始大小小于 1.4KiB，或者可能的压缩节省量小于原始大小的 10%，则 Lighthouse 不会在结果中标记该响应。

浏览器请求资源时，使用 `Accept-Encoding` 请求标头来指明其支持的压缩算法，之后服务器返回 `Content-Encoding` 响应标头，指明其使用的压缩算法。

```http
Accept-Encoding: gzip, compress, br

Content-Encoding: br
```

如果浏览器支持，应该优先考虑使用 [Brotli] (br)，因为它比其他压缩算法能更有效地缩减资源的文件大小。将 GZIP 用作 Brotli 的备选方案。所有主流浏览器都支持 GZIP，但其效率不如 Brotli。

Chrome DevTools 提供的 Network （网络）标签可以用来查看服务器是否压缩了响应。

<figure>
  <img alt="Content-Encoding 响应标头" height="571" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-text-compression/image/the-content-encoding-resp-e031e0e84f95.svg" width="800">
  <figcaption class="dcc-caption">
    <code dir="ltr" translate="no">Content-Encoding</code> 响应头
  </figcaption>
</figure>

#### DNS 预解析和预连接

Lighthouse 报告的“优化建议”部分列出了尚未使用 `<link rel=preconnect>` 优先处理提取请求的所有关键请求。

<figure>
  <img alt="Lighthouse 预先连接到所需来源的审核的屏幕截图" height="226" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preconnect/image/a-screenshot-the-lightho-689699d0527e1_2880.png 2880w" width="800">
</figure>

建议添加 `preconnect` 或 `dns-prefetch` 资源提示，以尽早连接到重要的第三方源。

`<link rel="preconnect">` 告知浏览器您的网页打算与另一个起点建立连接，以及您希望尽快启动该过程。

在速度较慢的网络中建立连接通常非常耗时，尤其是要建立安全连接时，因为这一过程可能涉及 DNS 查询、重定向以及指向处理用户请求的最终服务器的若干往返。

提前处理好上述事宜将使您的应用提供更加流畅的用户体验，且不会为带宽的使用带来负面影响。建立连接所消耗的时间大部分用于等待而不是交换数据。

只需向您的页面添加一个 link 标记，便可告知浏览器您的意图 `<link rel="preconnect" href="https://example.com">`。

这会让浏览器知道该网页打算连接到 `example.com` 并从中检索内容。

注意，虽然 `<link rel="preconnect">` 成本较低，但却会占用宝贵的 CPU 时间，建立安全连接时尤其如此。如果未在 10 秒内使用连接，情况尤为糟糕，因为当浏览器关闭连接时，所有已完成的连接都将遭到浪费。

一般而言，请尽可能使用 `<link rel="preload">`，以更加全面地提升性能，但仅在极端情况下使用 `<link rel="preconnect">`，例如：

- 应用场景：[了解来源，但不了解提取内容][knowing_where_from_but_not_what_youre_fetching]
- 应用场景：[在线媒体][streaming_media]

`<link rel="dns-prefetch">` 是另一种与连接相关的 `<link>` 类型。这仅处理 DNS 查找，但其浏览器支持范围更广，因此可以作为很好的后备方案。使用方法完全一样：

```html
<link rel="dns-prefetch" href="https://example.com" />.
```

#### 缩短服务器响应时间

Lighthouse 报告的“优化”部分会报告服务器响应时间，即发出请求后，用户的浏览器收到网页内容的第一个字节所需的时间。

<figure>
  <img alt="“Lighthouse 服务器响应时间偏短”审核结果的屏幕截图" height="118" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/server-response-time/image/a-screenshot-the-lightho-dee8ff91ad494_2880.png 2880w" width="800">
</figure>

如果浏览器等待服务器响应主文档请求的时间超过 600 毫秒，此审核将会失败。用户不喜欢网页加载时间过长。服务器响应时间缓慢是导致网页加载时间过长的一个可能原因。

当用户在网络浏览器中导航到某个网址时，浏览器会发出网络请求以提取相应内容。您的服务器会收到请求并返回网页内容。

服务器响应时间只是完整首字节时间 (TTFB) 的一部分。除了服务器响应时间之外，TTFB 通常还包括 DNS 查询和重定向（例如，如果省略了最后一个斜线或 www 子网域或 https 协议，则服务器可能会重定向到正确的网址；如果是通过多个网域重定向的网址缩短工具或广告，则会增加 TTFB）。许多 Lighthouse 测试都会测试最终到达网址，而忽略重定向时间，但即使不是这样，服务器响应时间也会排除这些部分。 因此，Lighthouse 对 Core Web Vitals TTFB 建议时间（800 毫秒）的限制较小（600 毫秒）。

服务器可能需要执行大量工作，才能返回包含用户所需的所有内容的网页。例如，如果用户查看其订单记录，服务器需要从数据库中提取每位用户的记录，然后将这些内容插入到网页中。优化服务器以尽快执行此类工作，是缩短用户等待网页加载时间的一种方法。

即使服务器不需要执行大量工作，客户端和服务器之间的网络延迟时间也可能会导致服务器响应时间缓慢。

若要缩短服务器响应时间，第一步是确定服务器必须完成哪些核心概念任务才能返回网页内容，然后测量每项任务所需的时间。确定最长时间的任务后，请寻找加速这些任务的方法。

导致服务器响应缓慢的原因有很多，因此有许多可能的改进方法：

优化服务器的应用逻辑，以加快网页准备速度。如果您使用的是服务器框架，该框架中可能会包含具体操作建议。
优化服务器查询数据库的方式，或迁移到更快的数据库系统。
升级服务器硬件，以增加内存或 CPU。
使用 CDN 缩短网络延迟时间。如果文档可以缓存在 CDN 边缘节点，这种方法尤为有效。

如需了解详情，请参阅[优化 TTFB][optimize-ttfb] 指南。

#### 避免多次网页重定向

重定向会降低网页加载速度。当浏览器请求已重定向的资源时，服务器通常会返回如下所示的 HTTP 响应。

```http
HTTP/1.1 301 Moved Permanently
Location: /path/to/new/location
```

Lighthouse 会标记包含多个重定向的网页。

<figure>
  <img alt="" height="276" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/redirects/image/uGOmnhqZoJnMoBgAiFJj_2880.png 2880w" width="800">
</figure>

如果网页有两次或更多重定向，则会在此次审核中失败。

将指向已标记资源的链接指向相应资源的当前位置。避免在[关键渲染路径][critical-rendering-path]所需的资源中出现重定向尤为重要。

如果您使用重定向将移动用户转到移动版网页，不妨考虑重新设计网站以使用[自适应设计][responsive-web-design-basics]。

#### 预加载关键请求

Lighthouse 报告中的“优化”部分 将关键请求链中的第三级请求标记为预加载候选项。

<figure>
  <img alt="Lighthouse 预加载关键请求审核的屏幕截图" height="214" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/a-screenshot-the-lightho-a0f22e9688496_2880.png 2880w" width="800">
</figure>

假设您网页的 关键请求链如下所示。

```text
index.html |--app.js |--styles.css |--ui.js
```

您的 index.html 文件声明了 `<script src="app.js">`。当 `app.js` 运行时，它会调用 `fetch()` 才能下载 `styles.css` 和 `ui.js`。该页面似乎不完整 直到最后 2 个资源被下载、解析和执行为止。 使用上面的示例，Lighthouse 会将 `styles.css` 和 `ui.js` 标记为候选对象。

可能节省的时间取决于浏览器能尽早处理 来启动请求。 例如，如果 app.js 的下载、解析和执行用时为 200 毫秒， 每项资源有望节省 200 毫秒的时间，因为 app.js 不再是每个请求的瓶颈。

预加载请求可以提高您的网页加载速度。

<figure>&lt;/ph&gt;
  <img alt="如果没有预加载链接，则只有在下载、解析和执行 app.js 后，系统才会请求 style.css 和 ui.js。" height="486" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/without-preload-links-st-f9c93e03b4029_2880.png 2880w" width="800">
<figcaption class="dcc-caption">
    如果没有预加载链接，<code dir="ltr" translate="no">styles.css</code> 和
    仅在 <code dir="ltr" translate="no">app.js</code> 下载完成后请求 <code dir="ltr" translate="no">ui.js</code>，
    解析和执行
  </figcaption>
</figure>

这里的问题在于 后 2 项资源所占的比例app.js。 但您知道这些资源很重要 文件。

在 HTML 中声明预加载链接，以指示浏览器下载关键资源 尽快处理。

```html
<head>
  <!-- ... -->
  <link rel="preload" href="styles.css" as="style" />
  <link rel="preload" href="ui.js" as="script" />
  <!-- ... -->
</head>
```

<figure>
  <img alt="使用预加载链接时，系统会同时请求 style.css 和 ui.js 以及 app.js。" height="478" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/uses-rel-preload/image/with-preload-links-style-da7d794e22995_2880.png 2880w" width="800">
  <figcaption class="dcc-caption">
    采用预加载链接时，<code dir="ltr" translate="no">styles.css</code> 和
    <code dir="ltr" translate="no">ui.js</code> 与 <code dir="ltr" translate="no">app.js</code> 同时请求。
  </figcaption>
</figure>

另请参阅[预加载关键资源以提高加载速度][preload-critical-assets]，获取更多指导。

### 动画处理

#### 使用视频格式制作动画内容

Lighthouse 报告的“优化建议”部分会列出所有 GIF 动画，以及将这些 GIF 动画转换为视频后预计可缩短的秒数。

<figure>
  <img alt="Lighthouse“使用视频格式为动画内容进行审核”的屏幕截图" height="235" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2.png" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_36.png 36w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_48.png 48w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_72.png 72w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_96.png 96w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_480.png 480w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_720.png 720w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_856.png 856w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_960.png 960w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_1440.png 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_1920.png 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/efficient-animated-content/image/a-screenshot-the-lightho-8a0ec21794e2_2880.png 2880w" width="800">
</figure>

使用大型 GIF 提供动画内容会导致效率低下。 通过将大型 GIF 转换为视频，您可以大幅节省用户的带宽。建议您改用 MPEG4/WebM 视频（来提供动画）和 PNG/WebP（来提供静态图片）以减少网络活动消耗的字节数。

（1）制作 MPEG 视频

您可以通过多种方式将 GIF 转换为视频。 本指南中使用的是 [FFmpeg] 工具。 如需使用 FFmpeg 将 GIF my-animation.gif 转换为 MP4 视频，请在控制台中运行以下命令：

```bash
ffmpeg -i my-animation.gif my-animation.mp4
```

这会指示 FFmpeg 将 my-animation.gif（由 -i 标志表示）作为输入，并将其转换为名为 my-animation.mp4 的视频。

（2）创建 WebM 视频

WebM 视频比 MP4 视频小得多，但并非所有浏览器都支持 WebM，因此最好同时生成这两种格式的视频。

如需使用 FFmpeg 将 my-animation.gif 转换为 WebM 视频，请在控制台中运行以下命令：

```bash
ffmpeg -i my-animation.gif -c vp9 -b:v 0 -crf 41 my-animation.webm
```

（3）将 GIF 图片替换为视频

动画 GIF 具有视频需要复制的三个关键特征：

- 会自动播放。
- 它们会连续循环（通常如此，但也可以防止循环）。
- 它们是静音的。

幸运的是，您可以使用 `<video>` 元素重新创建这些行为。

```html
<video autoplay loop muted playsinline>
  <source src="my-animation.webm" type="video/webm" />
  <source src="my-animation.mp4" type="video/mp4" />
</video>
```

（4）使用可将 GIF 转换为 HTML5 视频的服务

许多[图片 CDN][image-cdns] 都支持将 GIF 转换为 HTML5 视频。您将 GIF 上传到图片 CDN，图片 CDN 会返回 HTML5 视频。

#### 避免使用未合成的动画

网页上的某些动画可以完全在渲染流水线的 compositor 阶段处理。

未合成的动画需要进行更多工作，并且在低端手机上或在主线程上运行性能密集型任务时，可能会出现卡顿（不流畅）问题。

非合成动画还会增加网页的累积布局偏移 (CLS)，因为它们会导致 CLS 算法衡量的元素发生实际移动，这可能会导致其他元素出现连锁偏移。合成动画不会导致其他元素发生位移，因此会从 CLS 中排除。降低 CLS 有助于提高 Lighthouse 性能得分。

浏览器用于将 HTML、CSS 和 JavaScript 转换为像素的算法统称为渲染流水线。

<figure>
  <img alt="渲染流水线由以下顺序步骤组成：JavaScript、样式、布局、绘制、合成。" height="122" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6.jpg" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_36.jpg 36w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_48.jpg 48w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_72.jpg 72w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_96.jpg 96w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_480.jpg 480w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_720.jpg 720w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_856.jpg 856w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_960.jpg 960w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_1440.jpg 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_1920.jpg 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/non-composited-animations/image/the-rendering-pipeline-co-ab82078a2fca6_2880.jpg 2880w" width="800">
  <figcaption class="dcc-caption">渲染流水线。</figcaption>
</figure>

即使您不了解渲染流水线的每个步骤的含义，也无妨。现在要重点了解的是，在渲染流水线的每个步骤中，浏览器都会使用上一步操作的结果来创建新数据。例如，如果您的代码执行了某些会触发布局的操作，则需要重新运行 Paint 和 Composite 步骤。非合成动画是指触发渲染流水线中较早步骤（样式、布局或绘制）的任何动画。非合成动画的性能较差，因为它们会迫使浏览器执行更多工作。

请参阅以下资源，深入了解渲染管道：

- [深入了解现代网络浏览器（第 3 部分）][inside-browser-part3]
- [简化绘制复杂性并减少绘制区域][simplify-paint-complexity-and-reduce-paint-areas]
- [仅使用合成器属性并管理图层数量][stick-to-compositor-only-properties-and-manage-layer-count]

如果无法合成动画，Chrome 会将失败原因报告给 DevTools 轨迹，Lighthouse 会读取该轨迹。Lighthouse 会列出未合成的动画的 DOM 节点，以及每个动画的失败原因。

关于确保动画合成，请参阅[仅使用合成器属性并管理图层数量][stick-to-compositor-only-properties-and-manage-layer-count]和[高性能动画][animations-guide]。

### 使用 Facade 延迟加载第三方资源

第三方资源通常用于展示广告或视频，以及与社交媒体集成。默认方法是在网页加载后立即加载第三方资源，但这可能会不必要地降低网页加载速度。如果第三方内容不重要，可以通过延迟加载来降低这种性能开销。

此项审核突出显示了可以在互动时延迟加载的第三方嵌入。在这种情况下，系统会使用外观来代替第三方内容，直到用户与其互动。

<figure>
  <img alt="使用外观加载 YouTube 嵌入式播放器的示例。立面为 3 KB，在互动时加载播放器为 540 KB。" height="521" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5.jpg?hl=zh-cn" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_36.jpg?hl=zh-cn 36w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_48.jpg?hl=zh-cn 48w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_72.jpg?hl=zh-cn 72w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_96.jpg?hl=zh-cn 96w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_480.jpg?hl=zh-cn 480w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_720.jpg?hl=zh-cn 720w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_856.jpg?hl=zh-cn 856w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_960.jpg?hl=zh-cn 960w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_1440.jpg?hl=zh-cn 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_1920.jpg?hl=zh-cn 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/an-example-loading-youtu-d7a9b6d1365a5_2880.jpg?hl=zh-cn 2880w" width="800">
  <figcaption class="dcc-caption">
    使用 Facade 加载 YouTube 嵌入式播放器。
  </figcaption>
</figure>

Lighthouse 会查找可延迟加载的第三方产品，例如社交媒体按钮微件或视频嵌入内容（例如 YouTube 嵌入式播放器）。

有关可推迟付款的商品和可用外观的相关数据在 third-party-web 中维护。

如果网页加载了属于其中某个第三方嵌入的资源，则审核会失败。

<figure>
  <img alt="Lighthouse 第三方 Facade 审核，突出显示了 Vimeo 嵌入式播放器和 Drift 实时聊天。" height="517" sizes="(max-width: 840px) 100vw, 856px" src="https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91.jpg?hl=zh-cn" srcset="https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_36.jpg?hl=zh-cn 36w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_48.jpg?hl=zh-cn 48w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_72.jpg?hl=zh-cn 72w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_96.jpg?hl=zh-cn 96w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_480.jpg?hl=zh-cn 480w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_720.jpg?hl=zh-cn 720w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_856.jpg?hl=zh-cn 856w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_960.jpg?hl=zh-cn 960w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_1440.jpg?hl=zh-cn 1440w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_1920.jpg?hl=zh-cn 1920w,https://developer.chrome.com/static/docs/lighthouse/performance/third-party-facades/image/lighthouse-third-party-fa-fd03a1923af91_2880.jpg?hl=zh-cn 2880w" width="800">
  <figcaption class="dcc-caption">
    Lighthouse 第三方 Facade 审核。
  </figcaption>
</figure>

请勿直接将第三方嵌入内容添加到 HTML，而是使用与实际嵌入的第三方内容类似的静态元素加载网页。交互模式应如下所示：

- 加载时：向页面添加 Facade。
- 鼠标悬停时：Facade 会预先连接到第三方资源。
- 点击：门面会替换为第三方产品。

一般来说，视频嵌入、社交按钮 widget 和聊天 widget 都可以采用立面模式。选择立面时，请考虑大小与特征集之间的平衡。

以下列表列出了我们推荐的开源外观。您还可以使用延迟 iframe 加载器，例如 vb/lazyframe。

（1）YouTube 嵌入式播放器

- [paulirish/lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed)
- [justinribeiro/lite-youtube](https://github.com/justinribeiro/lite-youtube)
- [Daugilas/lazyYT](https://github.com/Daugilas/lazyYT)
- [ngx-lite-video](https://github.com/karim-mamdouh/ngx-lite-video)

（2）Vimeo 嵌入式播放器

- [luwes/lite-vimeo-embed](https://github.com/luwes/lite-vimeo-embed)
- [slightlyoff/lite-vimeo](https://github.com/slightlyoff/lite-vimeo)
- [ngx-lite-video](https://github.com/karim-mamdouh/ngx-lite-video)

（3）实时聊天（Intercom、Drift、Help Scout、Facebook Messenger）

- [calibreapp/react-live-chat-loader](https://github.com/calibreapp/react-live-chat-loader)

您可以选择使用前面概述的交互模式[构建自定义 Facade 解决方案](https://wildbit.com/blog/2020/09/30/getting-postmark-lighthouse-performance-score-to-100#:%7E:text=What%20if%20we%20could%20replace%20the%20real%20widget)。与推迟的第三方产品相比，Facade 应明显小得多，并且仅包含足够的代码来模仿产品的外观。

如果您希望自己的解决方案包含在该列表中，请查看[提交流程](https://github.com/patrickhulce/third-party-web/blob/master/facades.md)。

[lighthouse-workflow]: https://developer.chrome.com/docs/lighthouse/overview?hl=en#get-started
[lighthouse-in-devtools]: https://developer.chrome.com/docs/lighthouse/overview?hl=en#devtools
[lighthouse-variability]: https://github.com/GoogleChrome/lighthouse/blob/master/docs/variability.md
[http-archive]: https://httparchive.org/
[metrics]: /2025/devtools/2025-09-06-web-vitals.md
[http-archive-state-of-the-web]: https://httparchive.org/reports/state-of-the-web?start=latest#bytesTotal
[reduce-network-payloads-using-text-compression]: https://web.dev/articles/reduce-network-payloads-using-text-compression
[serve-images-webp]: https://web.dev/articles/serve-images-webp
[use-imagemin-to-compress-images]: https://web.dev/articles/use-imagemin-to-compress-images
[web-reliable]: https://web.dev/explore/reliable
[reduce-the-scope-and-complexity-of-style-calculations]: https://web.dev/reduce-the-scope-and-complexity-of-style-calculations
[dom-size-and-interactivity]: https://web.dev/articles/dom-size-and-interactivity
[react-window]: https://web.dev/articles/virtualize-long-lists-react-window
[remove-unused-code]: https://web.dev/articles/remove-unused-code
[reduce-javascript-payloads-with-code-splitting]: https://web.dev/articles/reduce-javascript-payloads-with-code-splitting
[apply-instant-loading-with-prpl]: https://web.dev/articles/apply-instant-loading-with-prpl
[critical-rendering-path]: https://web.dev/articles/critical-rendering-path
[defer-non-critical-css]: https://web.dev/articles/defer-non-critical-css
[avoid-invisible-text]: https://web.dev/articles/avoid-invisible-text
[react-profiler]: https://react.dev/reference/react/Profiler
[user-timing-api]: https://developer.mozilla.org/docs/Web/API/User_Timing_API
[optimize_your_third_party_resources]: https://web.dev/articles/fast#optimize_your_third_party_resources
[debounce-your-input-handlers]: https://web.dev/articles/debounce-your-input-handlers
[off-main-thread]: https://web.dev/articles/off-main-thread
[avoid-large-complex-layouts-and-layout-thrashing]: https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
[stick-to-compositor-only-properties-and-manage-layer-count]: https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count
[simplify-paint-complexity-and-reduce-paint-areas]: https://web.dev/articles/simplify-paint-complexity-and-reduce-paint-areas
[extract-critical-css]: https://web.dev/articles/extract-critical-css
[minify-css]: https://web.dev/articles/minify-css
[monitor-total-page-memory-usage]: https://web.dev/articles/monitor-total-page-memory-usage
[devtools-coverage]: https://developer.chrome.com/docs/devtools/coverage
[terser]: https://github.com/terser-js/terser
[devtools-css-coverage]: https://developer.chrome.com/docs/devtools/css/reference#coverage
[critical]: https://github.com/addyosmani/critical/blob/master/README.md
[image-cdns]: https://web.dev/articles/image-cdns
[replace-gifs-with-videos]: https://web.dev/articles/replace-gifs-with-videos
[codelab-use-lazysizes-to-lazyload-images]: https://web.dev/articles/codelab-use-lazysizes-to-lazyload-images
[serve-responsive-images]: https://web.dev/articles/serve-responsive-images
[serve-images-with-correct-dimensions]: https://web.dev/articles/serve-images-with-correct-dimensions
[imageoptim]: https://imageoptim.com/mac
[squoosh]: https://squoosh.app/
[respimagelint]: https://ausi.github.io/respimagelint/
[replace_complex_icons_with_svg]: https://web.dev/articles/responsive-images#replace_complex_icons_with_svg
[gulp-responsive]: https://www.npmjs.com/package/gulp-responsive
[responsive-images-generator]: https://www.npmjs.com/package/responsive-images-generator
[avif]: https://codelabs.developers.google.com/codelabs/avif
[webp]: https://developers.google.com/speed/webp
[how_can_i_detect_browser_support_for_webp]: https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_for_webp
[gzip]: https://www.gnu.org/software/gzip/
[knowing_where_from_but_not_what_youre_fetching]: https://web.dev/articles/preconnect-and-dns-prefetch#knowing_where_from_but_not_what_youre_fetching
[streaming_media]: https://web.dev/articles/preconnect-and-dns-prefetch#streaming_media
[optimize-ttfb]: https://web.dev/articles/optimize-ttfb
[responsive-web-design-basics]: https://web.dev/articles/responsive-web-design-basics
[preload-critical-assets]: https://web.dev/articles/preload-critical-assets
[ffmpeg]: https://ffmpeg.org/
[inside-browser-part3]: https://developer.chrome.com/blog/inside-browser-part3
[animations-guide]: https://web.dev/animations-guide

## 参考

- [LightHouse](https://developer.chrome.com/docs/lighthouse)，Google
- [Prevent unnecessary network requests with the HTTP Cache](https://web.dev/articles/http-cache), Ilya Grigorik, Jeff Posnick
- [Configuring HTTP caching behavior](https://web.dev/articles/codelab-http-cache), Jeff Posnick
- [JavaScript Start-up Optimization](https://web.dev/articles/optimizing-content-efficiency-javascript-startup-optimization), Addy Osmani
