# 图像懒加载

## 一、介绍

图片懒加载是项目优化中一个绕不开的话题，图片懒加载对于优化页面加载、提升页面响应和用户体验，甚至 SEO 都有重要的影响。

## 二、懒加载实现

### 2.1 使用 `<img>` 标签的 `loading` 属性

`<img>` 标签的 `loading` 属性，用于控制图片的加载策略，该属性有两个可选值。

- `eager` 默认值，`<img>` 标签被解析时立即加载图片。
- `lazy` 图片会被推迟加载，直到浏览器认为图片即将显示时再加载。此时，图片的具体加载时机由浏览器控制。比如，页面滚动时，图片即将进入可视区域时才被加载。

```html
<img width="300" height="150" loading="lazy" src="...">
```

设置了 `eager` 属性的图片会在浏览器的 `load` 事件触发前被载入，如果设置了懒加载的图片，在页面加载时位于视口中，懒加载不会延迟 `load` 事件的触发，这意味着，`load` 事件触发时，懒加载的图片可能还没有显示出来。

另外，在加载设置了懒加载的图片时，`<img>` 标签占据的尺寸（宽和高）很可能需要重新计算，这就会导致重流操作，好的做法是，给设置了懒加载的图片指定具体的宽（`width`）和高（`height`），从而避免重流的发生。

注意，只有 JavaScript 被启用，`lazy` 属性才会正常工作。这是一种反追踪措施，主要是为了防止在禁用脚本的情况下，仍然可以通过跟踪图片的加载数量和加载时机，追踪用户的行为。

### 2.2 Intersection Observer API

另一种实现图像懒加载的方式，是使用交叉观察器（Intersection Observer）API。关于 Intersection Observer 的详细内容，可以参考 [这篇文章](#22-intersection-observer-api)。

下面的代码，是一个使用 Intersection Observer API 实现图像懒加载的例子。

```html
<body>
  <img class="lazy-img" data-src="...">
  <img class="lazy-img" data-src="...">

  <script>
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(entry.target);
          }
        }); 
      });

      document.querySelectorAll('.lazy-image').forEach(observer.observe);
    }
  </script>
</body>
</html>
```

### 2.3 ResizeObserver API

```jsx
const container = document.querySelector('.container');

const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    const rect = entry.contentRect;
    const isVisible = (
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0
    );
    if (isVisible) {
      const lazyImages = entry.target.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        observer.unobserve(entry.target);
      });
    }
  }
});

observer.observe(container);
```

这种方式性能较好，但要考虑浏览器的兼容性。

### 2.4 MutationObserver API

```jsx
const observer = new MutationObserver(() => {
  const rect = imgRef.current.getBoundingClientRect();
  const isVisible = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
  
  if (isVisible) {
    const lazyImages = entry.target.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => img.src = img.dataset.src);
    observer.disconnect();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style', 'class']
});
```

这种方式可以监听 DOM 变化，但开销较大。

### 2.5 `scroll` 事件监听

监听窗口的 `scroll` 事件，判断 `<img>` 标签顶部或者左侧距离与视口的宽高差，为了防止 `scroll` 事件被频繁触发，使用了 `useThrottle` 进行节流控制。

这种方式优点是实现简单，但性能较差。

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useThrottle } from './src/throttle';

const LazyImage = ({ src, placeholder }) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  const checkIfInView = useCallback(() => {
    if (!imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const isVisible = (
      rect.top < windowHeight + 100 && // 提前 100px 加载
      rect.bottom > -100 &&
      rect.left < windowWidth + 100 &&
      rect.right > -100
    );
    
    if (isVisible && !isInView) {
      setIsInView(true);
    }
  }, [isInView]);

  const check = useThrottle(checkIfInView, 100);

  useEffect(() => {
    check();
    window.addEventListener('scroll', check);
    window.addEventListener('resize', check);

    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [check]);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
    />
  );
};
```

### 2.6 `scroll` + `content-visibility`（TODO：NOT FINISH YET）

CSS 的 `content-visibility` 属性控制元素是否渲染其内容，它使用户代理能够跳过元素的渲染工作（包括布局和绘制），直到需要时才进行渲染，这使得初始页面加载速度大大提升。

当设置了 `content-visibility: auto` 的元素的渲染工作，开始或停止被跳过时，`contentvisibilityautostatechange` 事件会在该元素上触发。这样就可以在不需要时启动或停止渲染过程（例如，在 `<canvas>` 上绘制），从而节省处理能力。

该属性有三个可选值。

- `visible` 默认值，元素的内容正常渲染，不进行任何优化。
- `hidden` 元素的内容被隐藏，且不会触发布局、样式和绘制等操作，但元素仍然占据空间（类似于 `display: none`）。
- `auto` 浏览器会根据元素是否在视口中（viewport）来决定是否渲染其内容。如果元素不在视口中，浏览器会跳过其子树的布局、样式和绘制等操作，从而优化性能。

当使用 `content-visibility: auto` 时，如果元素没有明确的尺寸，可能会导致内容加载时发生布局偏移。因此，`content-visibility` 属性一般跟 `contain-intrinsic-size` 属性一起使用。

```css
.section {
  content-visibility: auto;
  contain-intrinsic-size: 300px; /* 提供元素的预期尺寸 */
}
```

上面代码中，`content-visibility: auto` 确保只有视口内的 `.section` 元素才会被渲染。`contain-intrinsic-size` 提供了一个估计的尺寸，防止页面在未渲染内容时出现布局偏移（layout shift）。

下面是一个 `scroll` 监听配合 CSS 的 `content-visibility` 属性，实现图片懒加载的例子。

```jsx
const LazyImage = ({ src, placeholder }) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const checkIfInView = () => {
      const rect = containerRef.current.getBoundingClientRect();
      const isVisible = (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0
      );
      
      if (isVisible && !isInView) {
        setIsInView(true);
      }
    };

    checkIfInView();

    window.addEventListener('scroll', checkIfInView);
    window.addEventListener('resize', checkIfInView);

    return () => {
      window.removeEventListener('scroll', checkIfInView);
      window.removeEventListener('resize', checkIfInView);
    };
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '200px 200px' // 预设尺寸
      }}
    >
      <img src={isInView ? src : placeholder} />
    </div>
  );
};
```

注意，`content-visibility` 在现代浏览器中支持较好，但在某些旧版本浏览器中，可能存在兼容性问题。

### 2.7 `scroll` + Web Worker

```javascript
class ScrollWorkerLazyLoader {
  constructor() {
    this.worker = new Worker('lazy-loading-worker.js');
    this.observedImages = new Map();
    this.initWorker();
  }

  initWorker() {
    this.worker.onmessage = event => {
      if (event.data.type !== 'VISIBILITY_RESULT') return;
      this.loadVisibleImages(event.data.visibleElements);
    };
  }

  observe(img, src) {
    const index = this.observedImages.size;
    this.observedImages.set(index, {
      img,
      src, 
      loaded: false,
    });
  }

  checkVisibility() {
    const elements = Array.from(this.observedImages.values()).map(item => {
      const rect = item.img.getBoundingClientRect();
      return {
        top: rect.top + window.pageYOffset,
        height: rect.height,
      };
    });

    this.worker.postMessage({
      type: 'CHECK_VISIBILITY',
      data: {
        elements,
        scrollTop: window.pageYOffset,
        viewportHeight: window.innerHeight,
      }
    });
  }

  loadVisibleImages(visibleElements) {
    visibleElements.forEach(index => {
      const item = this.observedImages.get(index);
      if (item && !item.loaded) {
        item.img.src = item.src;
        item.loaded = true;
      }
    });
  }
}

// lazy-loading-worker.js
self.onmessage = function (event) {
    const { type, data } = event.data;
    
    if (type !== 'CHECK_VISIBILITY') return;

    const visibleElements = [];
    const { elements, viewportHeight, scrollTop } = data;
    
    elements.forEach((element, index) => {
        const { top, height } = element;
        const elementTop = top - scrollTop;
        const elementBottom = elementTop + height;
        
        if (elementBottom > -200 && elementTop < viewportHeight + 200) {
            visibleElements.push(index);
        }
    });
    
    self.postMessage({ type: 'VISIBILITY_RESULT', visibleElements });
};
```

下面是一个使用的例子。

```javascript
const loader = new ScrollWorkerLazyLoader();
document.querySelectorAll('.lazy-image').forEach(img => {
  loader.observe(img, img.dataset.src);
});

window.addEventListener('scroll', throttle(loader.checkVisibility, 200));
```

这种方式的优点是滚动计算不阻塞主线程，适合大量图片的复杂计算。

## 参考

- [HTMLImageElement: loading property](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/loading)，MDN
- [content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)，MDN
