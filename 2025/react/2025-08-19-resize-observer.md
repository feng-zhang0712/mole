# Resize Observer API

## 概述

Resize Observer API 是一个现代 Web API，提供了高性能的机制来监控 DOM 元素尺寸的变化。当被观察元素的尺寸发生变化时，会自动触发回调函数，实现响应式的布局调整。

有时，我们需要监听某个元素尺寸的变化，一种方案是，设置窗口的 `resize` 监听，然后在回调中执行 `Element.getBoundingClientRect` 或者 `getComputedStyle` 等方法。

```javascript
window.addEventListener('resize', () => {
  const element = document.querySelector('.my-element');
  const rect = element.getBoundingClientRect();
  // 处理尺寸变化...
});
```

这种方式只能监听窗口尺寸的变化，无法监听元素本身尺寸的变化。另外，`resize` 事件被频繁触发，会阻塞主线程任务的执行。Resize Observer API 为这类问题提供了解决方案，它允许我们以**异步**的方式，监听一个或者多个元素的尺寸变化。同时，浏览器内部对该 API 进行了优化，能够减少不必要的计算。

```javascript
const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    console.log(entry.target);
    console.log(entry.contentRect.width, entry.contentRect.height);
  }
});

const element = document.querySelector('.my-element');
observer.observe(element);
```

注意，由于 Resize Observer 是一个**异步** API，所以，尺寸的变化可能不会立即触发回调事件，通常在下一帧渲染之前或之后执行回调。

## 基本使用

### 构造函数

ResizeObserver 监听的是元素的尺寸变化，这些变化包括：

- 内容变化，即元素内容增减导致的尺寸变化，比如，内容加载、元素插入、文本内容变化、图片加载完成等。
- 响应式布局变化，包括媒体查询、弹性布局变化等。
- 字体变化，包括字体加载、切换等。
- CSS 动画变化。

```javascript
new ResizeObserver(callback)
```

ResizeObserver 构造函数接受一个 `callback` 回调函数，回调中接受两个参数。

- `entries`：一个 ResizeObserverEntry 对象类型的数组，保存了被监测元素的尺寸变化信息。
- `observer`：观察器实例。

```javascript
function callback(entries, observer) {
  for (const entry of entries) {
    //...
  }
}
```

### 方法

#### `observe()`

`observe(target)` 方法开始观察指定的 DOM 元素。

```javascript
observe(target)
observe(target, options)
```

- `target`：被观察的目标元素。
- `options`：配置对象，该对象只有一个 `box` 属性，用于指定观察哪个盒模型。

`box` 属性有三个可选值：

- `content-box` 默认值，标准盒模型，只关心内容区域尺寸的变化。
- `border-box` 替代盒模型，包含 `padding` 和 `border`。
- `device-pixel-content-box` 设备像素单位，观察精度更高。

```javascript
observer.observe(target, { box: "border-box" });
```

CSS 中主要有两种盒模型：标准盒模型（`content-box`）和替代盒模型（`border-box`）。可以通过 `box-sizing` 属性，将元素指定为两者之一。

```css
div {
  box-sizing: content-box;
}
```

盒模型由四部分组成，包括内容（`content`）、内边距（`padding`）、边框（`border`）和外边距（`margin`）。

当对开启了标准盒模型的元素设置 `width` 和 `height` 属性时，实际设置的是内容（`content`）部分的宽度和高度，整个盒模型的宽高要另外加上 `padding` 和 `border` 部分。当对开启了替代盒模型的元素设置 `width` 和 `height` 属性时，实际设置的是内容（`content`）、内边距（`padding`）和边框（`border`）三部分的宽度和高度。

#### `unobserve()`

`unobserve(target)` 停止观察指定的 DOM 元素。

```javascript
observer.unobserve(target)
```

#### `disconnect()`

`disconnect()` 方法停止观察所有的 DOM 元素。

```javascript
observer.disconnect();
```

### ResizeObserverEntry

ResizeObserverEntry 接口表示传递给 `ResizeObserver()` 回调函数的对象，该对象保存着被观察元素的信息。该对象有下面几个属性。

#### `target`

`target` 被观察的元素。

#### `contentBoxSize`

`contentBoxSize` 返回被观察元素的标准盒模型尺寸信息（只包含 `content`），该属性是一个数组，其中的每一个对象都有两个属性：

- `blockSize` 水平书写模式中，表示高度；垂直书写模式中，表示宽度。
- `inlineSize` 水平书写模式中，表示宽度；垂直书写模式中，表示高度。

```javascript
// 处理多列布局的尺寸信息
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    // 支持多列布局，可能有多个片段
    entry.contentBoxSize.forEach((size, index) => {
      console.log(`列 ${index}:`, size.inlineSize, 'x', size.blockSize);
    });
  });
});
```

#### `borderBoxSize`

`borderBoxSize` 返回被观察元素的标准盒模型尺寸信息（包含 `content`、`padding` 和 `border`），该属性是一个数组，其中的每一个对象都有两个属性：

- `blockSize` 水平书写模式中，表示高度；垂直书写模式中，表示宽度。
- `inlineSize` 水平书写模式中，表示宽度；垂直书写模式中，表示高度。

```javascript
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const borderSize = entry.borderBoxSize[0];
    console.log('总宽度（含边框）:', borderSize.inlineSize);
    console.log('总高度（含边框）:', borderSize.blockSize);
  });
});
```

#### `devicePixelContentBoxSize`

`devicePixelContentBoxSize` 返回设备像素尺寸信息，用于高精度显示适配。

- `blockSize` 水平书写模式中，表示高度；垂直书写模式中，表示宽度。
- `inlineSize` 水平书写模式中，表示宽度；垂直书写模式中，表示高度。

```javascript
// 高分辨率图片适配
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const deviceSize = entry.devicePixelContentBoxSize[0];
    const cssSize = entry.contentBoxSize[0];
    
    const dpr = deviceSize.inlineSize / cssSize.inlineSize;
    const img = entry.target.querySelector('img');
    if (img && dpr > 1) {
      img.src = img.dataset.highRes || img.src;
    }
  });
});
```

该属性适用于高分辨率显示器适配、精确的像素级布局控制的场景、与 Canvas 或其他像素级操作结合使用以及处理不同设备像素比（DPR）的情况。

```javascript
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const cssSize = entry.contentBoxSize[0];
    const deviceSize = entry.devicePixelContentBoxSize[0];
    
    console.log('CSS 像素:', cssSize.inlineSize, 'x', cssSize.blockSize);
    console.log('设备像素:', deviceSize.inlineSize, 'x', deviceSize.blockSize);
    console.log('像素比:', deviceSize.inlineSize / cssSize.inlineSize);
  });
});
```

#### `contentRect`

`contentRect` 一个 `DOMRectReadOnly` 类型的值，表示被观察元素的新尺寸。

注意，`contentRect` 是早期 API，已被标记为废弃，建议使用 `contentBoxSize` 和 `borderBoxSize`。

```javascript
// 不推荐使用（兼容性回退）
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const { width, height } = entry.contentRect;
    console.log('旧 API 尺寸:', width, 'x', height);
  });
});

// 兼容性处理
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    let width, height;
    
    // 优先使用新 API
    if (entry.contentBoxSize && entry.contentBoxSize[0]) {
      const size = entry.contentBoxSize[0];
      width = size.inlineSize;
      height = size.blockSize;
    } else {
      // 回退到旧 API
      width = entry.contentRect.width;
      height = entry.contentRect.height;
    }
    
    console.log('最终尺寸:', width, 'x', height);
  });
});
```

## 应用

### 自适应字体大小

下面是一个 MDN 上的[例子](https://mdn.github.io/dom-examples/resize-observer/resize-observer-text.html)，演示了如何根据容器宽度动态调整字体大小。

```javascript
const observer = new ResizeObserver(entries => {
  entries.forEach(entry => {
    const { contentBoxSize } = entry;
    let containerWidth;
    
    // 获取容器宽度（兼容性处理）
    if (contentBoxSize && contentBoxSize[0]) {
      containerWidth = contentBoxSize[0].inlineSize;
    } else {
      containerWidth = entry.contentRect.width;
    }
    
    // 动态调整字体大小
    const h1 = entry.target.querySelector('h1');
    const p = entry.target.querySelector('p');
    
    if (h1) {
      h1.style.fontSize = Math.max(1.5, containerWidth / 200) + 'rem';
    }
    if (p) {
      p.style.fontSize = Math.max(1, containerWidth / 600) + 'rem';
    }
  });
});

observer.observe(document.querySelector('.text-container'));
```

上面的示例，演示了当容器尺寸变化时，字体大小会自动调整，这种方式能够使字体在不同设备上保持最佳的阅读体验。

![Resize Observer Example](/2025/assets/resize-observer-exmaple-by-mdn.gif)

### 图片懒加载

下面的例子，演示了结合 ResizeObserver 和 IntersectionObserver 实现图片懒加载。

```javascript
class LazyImageLoader {
  constructor(container) {
    this.container = container;
    this.resizeObserver = new ResizeObserver(() => this.checkImages());
    this.intersectionObserver = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { rootMargin: '100px' }
    );
    
    this.resizeObserver.observe(this.container);
    this.checkImages();
  }

  checkImages() {
    const lazyImages = this.container.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      this.intersectionObserver.observe(img);
    });
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        this.intersectionObserver.unobserve(img);
      }
    });
  }
  
  destroy() {
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
  }
}
```

### 自适应布局切换

下面的例子，演示了如何根据容器尺寸自动切换布局模式。

```javascript
class ResponsiveLayout {
  constructor(element) {
    this.element = element;
    this.breakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1024
    };
    
    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => this.handleResize(entry));
    });
    
    this.observer.observe(this.element);
  }
  
  handleResize(entry) {
    const width = entry.contentBoxSize[0].inlineSize;
    const currentLayout = this.getCurrentLayout();
    const newLayout = this.getLayoutByWidth(width);
    
    if (currentLayout !== newLayout) {
      this.switchLayout(newLayout);
    }
  }
  
  getCurrentLayout() {
    return this.element.dataset.layout || 'desktop';
  }
  
  getLayoutByWidth(width) {
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    return 'desktop';
  }
  
  switchLayout(layout) {
    this.element.dataset.layout = layout;
    this.element.className = `layout-${layout}`;
    
    // 触发自定义事件
    this.element.dispatchEvent(new CustomEvent('layoutchange', {
      detail: { layout }
    }));
  }
}
```

### 虚拟列表滚动优化

下面的例子，演示了优化长列表的虚拟滚动性能。

```javascript
class VirtualScrollOptimizer {
  constructor(container) {
    this.container = container;
    this.itemHeight = 50;
    this.visibleCount = 0;
    this.scrollTop = 0;
    
    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => this.updateVisibleCount(entry));
    });
    
    this.observer.observe(this.container);
    this.updateVisibleCount({ contentBoxSize: [{ blockSize: this.container.clientHeight }] });
  }
  
  updateVisibleCount(entry) {
    const height = entry.contentBoxSize[0].blockSize;
    const newVisibleCount = Math.ceil(height / this.itemHeight) + 2; // 额外缓冲
    
    if (newVisibleCount !== this.visibleCount) {
      this.visibleCount = newVisibleCount;
      this.renderVisibleItems();
    }
  }
  
  renderVisibleItems() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.totalItems);
    
    this.renderItems(startIndex, endIndex);
  }
  
  renderItems(start, end) {
    // 项目渲染逻辑...
  }
}
```

### 容器查询替代方案

在没有 CSS Container Queries 支持时，使用 ResizeObserver 实现类似功能。

```javascript
class ContainerQuery {
  constructor(element) {
    this.element = element;
    this.queries = new Map();
    
    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => this.evaluateQueries(entry));
    });
    
    this.observer.observe(this.element);
  }
  
  addQuery(name, condition) {
    this.queries.set(name, condition);
    this.evaluateQuery(name, this.getCurrentSize());
  }
  
  evaluateQueries(entry) {
    const size = this.getSizeFromEntry(entry);
    this.queries.forEach((condition, name) => {
      this.evaluateQuery(name, size);
    });
  }
  
  evaluateQuery(name, size) {
    const condition = this.queries.get(name);
    const result = condition(size);
    
    this.element.classList.toggle(`cq-${name}`, result);
    this.element.dispatchEvent(new CustomEvent('containerquery', {
      detail: { query: name, matches: result, size }
    }));
  }
  
  getCurrentSize() {
    return {
      width: this.element.clientWidth,
      height: this.element.clientHeight
    };
  }
  
  getSizeFromEntry(entry) {
    const size = entry.contentBoxSize[0];
    return {
      width: size.inlineSize,
      height: size.blockSize
    };
  }
}

// 使用
const cq = new ContainerQuery(document.querySelector('.card'));

// 定义查询
cq.addQuery('small', size => size.width < 300);
cq.addQuery('medium', size => size.width >= 300 && size.width < 600);
cq.addQuery('large', size => size.width >= 600);

// 监听查询结果
document.querySelector('.card').addEventListener('containerquery', (e) => {
  console.log(`查询 ${e.detail.query} 匹配:`, e.detail.matches);
});
```

## 参考

- [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API), MDN
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries), MDN
- [ResizeObserver Polyfill](https://github.com/que-etc/resize-observer-polyfill)
- [Can I Use - ResizeObserver](https://caniuse.com/resizeobserver)
