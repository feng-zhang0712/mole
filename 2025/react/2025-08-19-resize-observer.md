# Resize Observer API

## 介绍

Resize Observer API 提供了一种高性能的机制，通过该机制，可以监控元素尺寸的变化，每次尺寸发生变化时都会执行回调函数。

有时，我们需要监听某个元素尺寸的变化，一种方案是，设置窗口的 `resize` 监听，然后在回调中执行 `Element.getBoundingClientRect` 或 `getComputedStyle` 等方法，但是，元素大小的改变，不一定是因为窗口尺寸发生了变化，这时事件监听就会失效。另外，相关逻辑在主线程执行，性能也不好。

Resize Observer API 为这类问题提供了解决方案，它允许我们以**异步**的方式，观察和响应元素内容或边框盒尺寸的变化。

Resize Observer 的使用方式跟其他观察器，比如 Intersection Observer 使用方式类似。

```javascript
const calcBorderRadius = (size1, size2) => `${Math.min(100, size1 / 10 + size2 / 10)}px`;

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const boxSize = entry.borderBoxSize;
    if (boxSize) {
      entry.target.style.borderRadius = calcBorderRadius(
        boxSize[0].inlineSize, 
        boxSize[0].blockSize,
      );
    } else {
      entry.target.style.borderRadius = calcBorderRadius(
        entry.contentRect.width,
        entry.contentRect.height,
      );
    }
  }
});

observer.observe(document.querySelector('div'));
```

注意，由于 Resize Observer 是一个异步 API，所以，尺寸的变化可能不会立即触发回调事件，通常在下一帧渲染之前或之后执行回调。

## 基本使用

### 构造函数

ResizeObserver 接口能够监测开启了标准盒模型、替代盒模型以及 SVGElement 元素的替代盒模型的尺寸变化。

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

`observe()` 方法开始观察指定的 Element 或 SVGElement。

```javascript
observe(target)
observe(target, options)
```

- `target`：被观察的目标元素。
- `options`：配置对象，该对象只有一个 `box` 属性，用于指定观察哪个盒模型。有三个可选值：

  - `content-box` 默认值，标准盒模型。
  - `border-box` 替代盒模型。
  - `device-pixel-content-box` 在应用任何 CSS 样式前，元素或者其祖先的内容盒模型，以像素为单位。

```javascript
observer.observe(divElem, { box: "border-box" });
```

顺便补充下，CSS 中主要有两种盒模型：标准盒模型（`content-box`）和替代盒模型（`border-box`）。可以通过 `box-sizing` 属性，将元素指定为两者之一。

```css
div {
  box-sizing: content-box;
}
```

盒模型由四部分组成：内容（`content`）、内边距（`padding`）、边框（`border`）和外边距（`margin`）。

- 当对开启了标准盒模型的元素设置 `width` 和 `height` 属性时，实际设置的是内容（`content`）部分的宽和高。整个盒模型的宽高要另外加上 `padding` 和 `border` 部分。
- 当对开启了替代盒模型的元素设置 `width` 和 `height` 属性时，实际设置的是内容（`content`）、内边距（`padding`）和边框（`border`）三部分，此时就是整个盒模型的宽高。

#### `unobserve()`

`unobserve()` 停止观察指定的 Element 或 SVGElement。

```javascript
observer.unobserve(target)
```

#### `disconnect()`

`disconnect()` 方法停止观察所有的 Element 或 SVGElement。

```javascript
observer.disconnect();
```

### ResizeObserverEntry

ResizeObserverEntry 接口表示传递给 `ResizeObserver()` 构造函数回调函数的对象，该对象保存着被观察元素的尺寸信息。该对象有下面几个属性。

#### `target`

`target` 被观察的元素。

#### `contentBoxSize`

`contentBoxSize` 返回一个数组，数组中包含回调函数运行时被观察元素的新的标准盒模型尺寸。数组中的每个对象都有两个属性。

- `blockSize`：被观察元素的盒模型在块维度的长度。对于具有水平书写模式的盒子，表示垂直维度，即高度；如果书写模式是垂直的，表示水平维度，即宽度。
- `inlineSize`：被观察元素的盒模型在行内维度的长度。对于具有水平书写模式的盒子，表示水平维度，即宽度；如果书写模式是垂直的，表示垂直维度，即高度。

```javascript
const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const boxSize = entry.contentBoxSize[0]; // 获取第一个片段
    console.log(`宽度: ${boxSize.inlineSize}`);
    console.log(`高度: ${boxSize.blockSize}`);
  }
});
```

#### `borderBoxSize`

`borderBoxSize` 返回一个数组，该数组包含回调函数运行时被观察元素的新的替代盒模型尺寸。数组中的每个对象都有两个属性。

- `blockSize`：被观察元素的盒模型在块维度的长度。对于具有水平书写模式的盒子，表示垂直维度，即高度；如果书写模式是垂直的，表示水平维度，即宽度。
- `inlineSize`：被观察元素的盒模型在行内维度的长度。对于具有水平书写模式的盒子，表示水平维度，即宽度；如果书写模式是垂直的，表示垂直维度，即高度。

```javascript
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const boxSize = entry.borderBoxSize[0]; // 获取第一个片段
    console.log(`总宽度: ${boxSize.inlineSize}`);
    console.log(`总高度: ${boxSize.blockSize}`);
  }
});
```

注意，`borderBoxSize` 包含内容、内边距和边框的完整尺寸，而 `contentBoxSize` 只包含内容区域，不包括内边距和边框。这两个属性都适合多列布局和复杂的文本流等场景。

#### `devicePixelContentBoxSize`

`devicePixelContentBoxSize` 返回一个数组，该数组包含回调函数运行时被观察元素在设备像素中的尺寸。数组中的每个对象都有两个属性。

- `blockSize`：被观察元素在块维度的标准盒模型尺寸，以设备像素为单位。对于具有水平书写模式的盒子，表示垂直维度，即高度；如果书写模式是垂直的，表示水平维度，即宽度。
- `inlineSize`：被观察元素在行内方向的标准盒模型尺寸，以设备像素为单位。对于具有水平书写模式的盒子，表示水平维度，即宽度；如果书写模式是垂直的，表示垂直维度，即高度。

```javascript
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const size = entry.devicePixelContentBoxSize[0];
    console.log(`设备像素宽度: ${size.inlineSize}`);
    console.log(`设备像素高度: ${size.blockSize}`);
  }
});
```

注意，`devicePixelContentBoxSize` 属性以设备像素为单位，而 `contentBoxSize` 和 `borderBoxSize` 以 CSS 像素为单位。

该属性适用于高分辨率显示器适配、精确的像素级布局控制的场景、与 Canvas 或其他像素级操作结合使用以及处理不同设备像素比（DPR）的情况。

#### `contentReact`

`contentReact` 被观察元素的新尺寸，是一个 `DOMRectReadOnly` 类型的值。

- 对于 Element 对象，该属性返回标准盒模型信息。
- 对于 SVGElement 对象，该属性返回替代盒模型信息。

```javascript
const resizeObserver = new ResizeObserver(entries => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`新尺寸: ${width} x ${height}`);
  }
});
```

注意，该属性是 Resize Observer API 的早期实现，兼容性好，但以后可能会被移除。因此建议使用 `contentBoxSize` 和 `borderBoxSize`，因为这两个属性提供了更精确和标准化的尺寸信息。

## 应用场景

### 懒加载

```javascript
// 根据容器尺寸变化触发懒加载
const container = document.querySelector('.container');

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    if (width > 0 && height > 0) {
      // 容器可见，触发懒加载
      const lazyImages = entry.target.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  }
});

observer.observe(container);
```

### 响应式网格布局

```javascript
const container = document.querySelector('.container');

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const width = entry.contentRect.width;
    const columns = Math.floor(width / 300); // 每列最小 300px
    entry.target.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }
});

observer.observe(container);
```

### 自适应字体大小

```javascript
// 根据容器宽度调整字体大小
const container = document.querySelector('.adaptive-text');

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const width = entry.contentRect.width;
    const fontSize = Math.max(12, Math.min(24, width / 20));
    entry.target.style.fontSize = `${fontSize}px`;
  }
});

observer.observe(container);
```

## 参考

- [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API)，MDN
