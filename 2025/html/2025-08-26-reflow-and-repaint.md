# 重流和重绘

## 重流

重流（Reflow）是指当页面的布局发生变化时，浏览器需要重新计算元素的几何信息（位置、大小等），然后重新布局页面的过程。

重流是浏览器性能的主要瓶颈，重流发生时，往往需要重新计算所有受影响元素的几何信息，一个元素的重流可能影响其父元素、子元素和兄弟元素。

### 导致重流的操作

下面的操作会导致重流的发生。

#### `window` 操作

- `resize()`
- `scrollTo()`、`scrollBy()`

#### `Element` 属性和方法

- `position`、`display`、`overflow`、`visibility`、`float`、`zIndex`
- `padding`、`border`、`margin`
- `top/right/bottom/left`
- `clientLeft/clientTop`、`scrollLeft/scrollTop`、`offsetLeft/offsetTop`
- `width/height`、`clientWidth/clientHeight`、`scrollWidth/scrollHeight`、`offsetWidth/offsetHeight`

- `innerHTML`、`innerText`、`textContent`
- `fontFamily`、`fontSize`、`fontWeight`、`fontStyle`

- `computedStyle()`
- `getClientRects()`、`getBoundingClientRect()`
- `focus()`、`blur()`

- `appendChild()`、`removeChild()`、`replaceChild()`、`insertBefore()`、`remove()`

- `className = 'new-class'`、
- `classList.add()`、`classList.remove()`、`classList.toggle()`、
- `setAttribute('class', 'new-class')`

- `input.value = 'new value'`
- `textarea.value = 'new value'`
- `select.selectedIndex = 0`
- `input.checked = true/false`

#### CSS 伪类激活

- `:hover`、`:focus`、`:active`、`:visited`
- `:first-child`、`:first-of-type`、`:last-child`、`:last-of-type`、`:nth-child()`、`:nth-of-type()`

#### 其他

- 窗口大小、设备方向改变
- 图片、视频、音频尺寸变化
- 滚动容器内容变化、滚动条显示/隐藏、滚动位置改变
- CSS 动画开始/结束、CSS 过渡开始/结束

## 重绘

重绘（Repaint）是指当元素的样式发生变化，但不影响布局时，浏览器只需要重新绘制该元素的过程。重绘不会影响其他元素的布局，只是重新绘制像素。

重流会导致重绘的发生，但重绘不一定是因为重流。

### 导致重绘的操作

- `filter`、`transform`、`perspective`、`opacity`、`boxShadow`
- `color`、`borderColor`、`backgroundColor`
- `background`、`backgroundImage`、`backgroundSize`、`backgroundPosition`、`backgroundRepeat`、`backgroundOrigin` ...
- `borderWidth`、`borderStyle`、`borderRadius`、`borderImage` ...
- `fontFamily`、`fontSize`、`fontWeight`、`fontStyle` ...

...

### 避免重流操作

#### 避免频繁修改样式

通过脚本设置元素样式时，不要逐个设置，而是通过操作 `className` 来操作样式。

```javascript
// 使用 CSS 类
function betterStyleOperation() {
  const element = document.getElementById('myElement');
  element.className = 'new-style';
}
```

#### 分离属性的读取和更新

循环操作中，不要交替执行读写操作，而是分离读写操作，还可以考虑使用 `requestAnimationFrame` 使操作更流畅。

```javascript
// 先读取，后写入
const initialWidth = element.offsetWidth;
const initialHeight = element.offsetHeight;
for (let i = 0; i < 100; i++) {
    element.style.width = (initialWidth + i) + 'px';
    element.style.height = (initialHeight + i) + 'px';
}

// 使用 requestAnimationFrame
function betterExample() {
  const elements = document.querySelectorAll('.item');
  requestAnimationFrame(() => {
    // 在下一帧中批量操作
    const measurements = Array.from(elements).map(element => ({
      element,
      width: element.offsetWidth
    }));
    
    requestAnimationFrame(() => {
      measurements.forEach(({ element, width }) => {
        element.style.width = (width + 100) + 'px';
      });
    });
  });
}
```

#### DOM 离线操作

DOM 离线操作是指将需要修改的元素从文档流中暂时移除，进行批量修改后再重新插入，避免在文档流中频繁触发重流。实现这一目的的做法是通过设置 `display: none`、`position: absolute/fixed` 等属性。

```javascript
function offlineDOMOperation() {
    const element = document.getElementById('myElement');
    
    // 隐藏元素（脱离文档流）
    element.style.display = 'none';
    
    // 进行批量修改（不会触发重流）
    element.style.width = '200px';
    element.style.height = '150px';
    element.style.margin = '20px';
    element.style.padding = '15px';
    element.style.border = '2px solid red';
    element.style.borderRadius = '10px';
    element.style.backgroundColor = 'lightblue';
    
    // 显示元素（只触发一次重流）
    element.style.display = 'block';
}
```

#### 使用 DocumentFragment 操作

```javascript
function basicFragmentUsage() {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    div.textContent = `Item ${i}`;
    div.className = 'list-item';
    fragment.appendChild(div);
  }
  
  // 一次性插入到文档中（只触发一次重流）
  document.getElementById('list-container').appendChild(fragment);
}
```

#### 使用 CSS3 硬件加速

通过设置 `filter`、`transform`、`perspective`、`will-change` 等属性开启硬件加速。

```css
/* 启用硬件加速，避免重流 */
.hardware-accelerated {
  filter: blur(5px);
  transform: translateZ(0);
  perspective: 1000px;
  will-change: transform;
  backface-visibility: hidden;
}

/* 动画元素使用 transform 而不是改变位置 */
.animated-element {
  transition: transform 0.3s ease; /* 不会触发重流 */
}
```

#### 其他操作

对于非关键的内容，可以考虑使用 `setTimeout` 或者 `IntersectionObserver` 等方式延迟其加载。另外，还可以使用 Web Workers 处理复杂计算，使用 ResizeObserver 优化响应式布局等。
