# Intersection Observer API

## 介绍

交叉观察器（Intersection Observer），提供了一种**异步地**观察目标元素和祖先元素或顶级文档视口之间，交叉变化的方式。该 API 常见的使用场景包括：

- 页面滚动时，懒加载图片或者其他内容。
- 实现“无限滚动”效果，页面滚动时加载更多内容，免去了翻页的麻烦。
- 根据用户能否看到结果，决定是否执行相应的任务或者动画。
- 报告广告的可见性，从而计算广告收入。

过去，实现交叉检测，一般需要频繁的执行事件处理函数，比如通过执行 `Element.getBoundingClientRect()` 方法，不断获取元素的位置信息。这些逻辑在主线程执行，很可能导致性能问题。Intersection Observer API 正是为了解决这个问题而产生，它允许注册一个回调函数，每当特定元素**进入**或**退出**与另一个元素（或视口）的交叉时，或者当两个元素之间的交叉按指定的阈值变化时，该函数就会被执行。

注意，Intersection Observer API 是一个**异步**观察器，这意味着，在对目标“观察”过程中，不会阻塞主线程。

## 基本使用

### 构造函数

Intersection Observer 对象通过 `IntersectionObserver()` 构造函数创建，该函数接受两个参数。

```javascript
const observer = new IntersectionObserver(callback, options);
```

- `callback()` 回调函数，该函数在出现以下任一情况时触发。

  - 观察器首次观察目标元素时。
  - 目标元素与设备视口或指定的元素相交时，该指定元素被称为根元素或根（`root`）。

- `options` 配置对象，用于指定观察器对象的行为，该对象有四个属性。

  - `root`：检查目标可见性的视口元素，必须是目标的祖先元素。如果未指定则默认为浏览器视口。
  - `rootMargin`：元素周围的边距，类似于 CSS `margin` 属性，例如 `"10px 20px 30px 40px"`（上、右、下、左）。单位为像素（px）或百分比（%）。这组值用于在计算交叉之前，扩大或缩小根元素的边界框。负值将缩小根元素的边界框，正值将扩大。如果未指定，默认值为 `"0px 0px 0px 0px"`。
  - `scrollMargin`：嵌套滚动容器周围的边距，具有与 `rootMargin` 相同的值和默认值。在计算交叉之前，边距会应用到嵌套的可滚动容器。正值会扩大容器的裁剪矩形，允许目标在变得可见之前就相交，而负值会缩小裁剪矩形。
  - `threshold`：单个数字或数字数组，表示在目标与其根相交到什么程度时，执行观察器的回调函数。比如 `0.5` 代表目标元素与根相交 50% 时触发回调；如果指定为数组，比如 `[0, 0.25, 0.5, 0.75, 1]`，那么每隔 25% 回调函数就会触发一次。默认值为 `0`（意味着只要有一个像素可见，回调就会被触发）。值为 `1.0` 意味着直到每个像素都可见时，回调函数才会触发。

另外，`callback(entries, observer)` 回调函数接受两个参数。

- `entries`：一个 `IntersectionObserverEntry` 对象数组。
- `observer`：观察器实例对象。

```javascript
const callback = (entries, observer) => {
  entries.forEach(entry => {
    // entry.target
    // entry.isIntersecting
    // entry.intersectionRatio
    // entry.intersectionRect
    // entry.boundingClientRect
    // entry.rootBounds
    // entry.time
  });
};

const options = {
  root: document.querySelector("#scrollArea"),
  rootMargin: "0px",
  scrollMargin: "0px",
  threshold: 1.0,
};

const observer = new IntersectionObserver(callback, options);
```

### 属性

IntersectionObserver 的属性就是传递给构造函数的 `options` 对象中的属性，包括 `root`、`rootMargin`、`scrollMargin` 和 `thresholds`。

### 方法

#### `observe()`

`observe(target)` 将目标添加到目标元素集合，这个方法可以被执行多次，从而将多个目标放入集合中。

注意，观察器回调总是在调用 `observe()` 后会立即触发一次，即使被观察的元素相对于视口还没有移动。这意味着，比如，当在元素上调用 `observe()` 时，如果该元素在视口外，回调会立即被调用，至少有一个项目的 `intersecting` 设置为 `false`。如果元素在视口内，回调会立即被调用，至少有一个项目的 `intersecting` 设置为 `true`。

```javascript
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.intersectionRatio > 0) {
      // 目标元素与跟元素已经相交
      entry.target.classList.add("active");
    } else {
      entry.target.classList.remove("active");
    }
  });
});

const boxElList = document.querySelectorAll(".box");
boxElList.forEach(box => {
  io.observe(box);
});
```

`unobserve(target)` 停止观察指定的元素。

```javascript
const observer = new IntersectionObserver(callback);
observer.observe(document.getElementById("elementToObserve"));

// …

observer.unobserve(document.getElementById("elementToObserve"));
```

#### `disconnect()`

`disconnect()` 停止观察所有目标元素，并清空观察者列表。

#### `takeRecords()`

`takeRecords()` 返回所有观察目标的最新相交状态记录数组，返回值是 `IntersectionObserverEntry` 数组。每个 `IntersectionObserverEntry` 对象对应一个被观察的元素。

通常没有特殊的理由不会执行这个方法，因为执行这个方法会清空目标数组，这使得 `callback` 函数不再触发。

### IntersectionObserverEntry

`IntersectionObserverEntry` 描述了目标元素与根在特定时刻的相交情况。

```javascript
const callback = (entries, observer) => {
  entries.forEach(entry => {
    // entry.target
    // entry.isIntersecting
    // entry.intersectionRatio
    // entry.intersectionRect
    // entry.boundingClientRect
    // entry.rootBounds
    // entry.time
  });
};
```

- `target`：目标元素。
- `isIntersecting`：布尔值，目标元素是否正与根元素相交。
- `intersectionRatio`：目标元素与根元素相交的比例，即 `intersectionRect` 占 `boundingClientRect` 的比例，完全可见时为 1，完全不可见时小于等于 0。
- `intersectionRect`：目标元素与根元素相交区域的信息，类型为 `DOMRectReadOnly`。当元素完全不可见时，所有值都为 0。
- `rootBounds`：根元素的边界矩形信息，类型为 `DOMRectReadOnly`，这个区域受 `rootMargin` 属性的影响。
- `boundingClientRect`：目标元素的矩形区域的信息，类型为 `DOMRectReadOnly`。
- `time`：相交状态发生变化的时间戳，单位为毫秒。注意，这个时间是相对于文档的创建时间。

## 实际应用

### 图片懒加载

使用 Intersection Observer API，还可以实现很多其他效果。比如，页面无限滚动、广告曝光统计、视频自动播放控制、导航栏自动隐藏/显示和内容预加载等效果。

### 下拉刷新

```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';

const useInfiniteScroll = (fetchData, hasMore, loading) => {
  const observerRef = useRef();
  
  return useCallback(ref => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchData();
      }
    }, {
      rootMargin: '20px',
      threshold: 0.1
    });
    
    if (ref) {
      observerRef.current.observe(ref);
    }
  }, [loading, hasMore, fetchData]);
};
```

使用时，需要将 `useInfiniteScroll()` 赋值给列表底部某个 `div` 的 `ref` 属性。

### 广告统计

```jsx
const AdComponent = () => {
  const adRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 发送广告曝光事件
            console.log('Ad viewed:', entry.target.dataset.adId);
            // analytics.track('ad_view', { adId: entry.target.dataset.adId });
          }
        });
      },
      { threshold: 0.5 } // 50% 可见时触发
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={adRef} data-ad-id="ad-123" className="ad-container">
      <h3>广告内容</h3>
      <p>当广告被用户看到时会记录曝光</p>
    </div>
  );
};
```

### 视频自动播放

```jsx
const AutoPlayVideo = () => {
  const videoRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="auto-play-video"
    >
      <source src="/path/to/video.mp4" type="video/mp4" />
    </video>
  );
};
```

上面是一个视频自动播放控制的例子。

## 参考

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)，MDN
