# 前端开发小技巧

## `navigator.sendBeacon()` 在浏览器关闭之前发送数据

以前，想要在浏览器跳转到下一个页面之前，向服务器发送数据，只能通过延迟当前页面的卸载时间，并执行 `XMLHttpRequest` 或者 `fetch()` 方法。这种方式并不可靠，浏览器在卸载当前页面时，很可能不会执行 Ajax 请求。另外，这种方式会延迟当前页面的卸载，用户体验上，导致卡顿效果。

[navigator.sendBeacon()] 就能够解决这个问题，它是 Web API 中一个专门用于在页面卸载时异步发送数据的方法，它的使用方式也很简单。

```javascript
navigator.sendBeacon(url, data);
```

其中，

- `url` 是请求地址，支持跨域请求。
- `data` 表示向服务器发送的数据，可以是字符串、FormData、Blob、ArrayBuffer 或者 URLSearchParams 实例对象。

这个方法执行之后，返回一个布尔值，`true` 表示数据成功加入传输队列，反之表示数据未能加入传输队列。

比如，下面的方法，在页面隐藏时，向服务器发送一些统计数据。

```javascript
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'hidden') {
    navigator.sendBeacon('/log', analyticsData);
  }
});
```

这个 API 的优点是，它执行的是异步操作，不会阻塞当前页面的正常卸载。另外，它支持跨域请求，可以向跨域的服务器发送数据。

不过，这个 API 在使用时也要注意，不应该发送太大的数据，建议控制在 64KB 以下。该 API 只适合在页面卸载时使用，应避免在页面正常运行时使用。

[navigator.sendBeacon()]: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon

## 统计页面的长任务（Long Tasks）

[PerformanceObserver] API 提供了一种[观察页面中长任务][getting_long_tasks]的方法，它的使用方式很简单，只需要在页面中执行下面的代码即可以。

```javascript
const observer = new PerformanceObserver(list => {
  for (const entry of list.getEntries()) {
    console.log('Long Task:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name
    });
  }
});

observer.observe({
  entryTypes: ['longtask'],
  buffered: true
});
```

上面代码中，

- `entryTypes` 指定要监听的事件类型，`longtask` 表示监听长任务事件。该属性可以设置监听多种类型的事件，比如 `['longtask', 'measure', 'navigation']`。
- `buffered` 控制是否包含页面加载前的历史数据。`true` 表示包含历史数据，可以获取页面加载时的长任务，否则表示只监听新产生的长任务。

回调函数中的 `entry` 属性，是一个 [PerformanceEntry] 对象。

- `duration` 任务持续时间（毫秒）。
- `startTime` 任务开始时间（相对于页面加载时间）。
- `name` 任务名称（长任务通常为空字符串）。
- `entryType` 事件类型，这里是 `longtask`。

这种方式的优势在于，能够准确捕获超过 50ms 的任务，同时浏览器原生支持，不会影响页面性能。

除了使用 PerformanceObserver，还可以通过 [performance.now()] 方法，记录任务开始和结束的时间，然后计算出时间差，从而计算出任务的耗时情况。

[PerformanceObserver]: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver
[getting_long_tasks]: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming#getting_long_tasks
[performance.now()]: https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
[PerformanceEntry]: https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry

## 检测页面是否处于活跃状态

一种方法是使用 [document.hidden] 或者 [document.visibilityState] 属性，这是一个只读的布尔值，返回当前页面是否可见。

```javascript
// 检测页面是否可见
function isPageVisible() {
  return !document.hidden;
}

// 监听页面可见性变化
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // ...
  } 
});

document.visibilityState // 'visible' 或 'hidden'
```

另一种方式是使用 [document.hasFocus()] 方法，或者通过监听页面的 `focus` 和 `blur` 事件。

```javascript
// 检测窗口是否有焦点
function isWindowFocused() {
  return document.hasFocus();
}

// 监听窗口焦点变化
window.addEventListener('focus', function() {
  // 窗口获得焦点 ...
});

window.addEventListener('blur', function() {
  // 窗口失去焦点 ...
});
```

上面两种方法，推荐使用第一种。

[document.hidden]: https://developer.mozilla.org/en-US/docs/Web/API/Document/hidden
[document.visibilityState]: https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState
[document.hasFocus()]: https://developer.mozilla.org/en-US/docs/Web/API/Document/hasFocus

## PDF 预览

使用 `<iframe>` 标签预览 PDF。

```jsx
<iframe src={pdfUrl} />
```

还可以使用 `react-pdf` 或者 `pdfjs-dist` 这样的第三方库。

## 




## 参考

- [Navigator: sendBeacon() method](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon), MDN
- [PerformanceLongTaskTiming](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming), MDN
