# CSS 居中布局方案

## 水平居中

### flex 布局

`justify-content` 属性控制项目在容器主轴方向上的对齐方式。

```css
.box {
  display: flex;
  justify-content: center;
}
```

### grid 布局

`justify-content` 属性设置整个内容区域在容器水平位置的对齐方式。

```css
.box {
  display: grid;
  justify-content: center;
}
```

### 绝对定位 + `transform`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
```

### 绝对定位 + `margin: auto`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100px; /* 必须设置宽度 */
}
```

### 绝对定位 + `calc()`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  left: calc(50% - 50px);
  width: 100px;
}
```

### `text-align: center`（适用于内联或内联块元素）

```css
.box {
  text-align: center;
}
.item {
  display: inline; /* 或 inline-block */
}
```

### `table-cell`

```css
.box {
  display: table;
  width: 100%;
}
.item {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
```

### `margin`（适用于块级元素，且宽度固定）

```css
.box {
  width: 100%;
}
.item {
  display: block;
  margin: 0 auto;
  width: 100px; /* 必须设置宽度 */
}
```

注意，这种方法要求子元素必须是块级元素且有固定宽度。

### `inline-block` + `text-align`（结合伪元素）

```css
.box {
  text-align: center;
  font-size: 0; /* 消除 inline-block 间隙 */
}
.box::before {
  content: '';
  display: inline-block;
  width: 0;
}
.item {
  display: inline-block;
  font-size: 16px; /* 重置字体大小 */
}
```

## 垂直居中

### flex 布局

`align-items` 属性控制项目在交叉轴方向上的对齐方式。

```css
.box {
  display: flex;
  align-items: center;
}
```

`align-self` 属性允许单个项目有与其他项目不一样的对齐方式，可覆盖 `align-items` 属性。默认值为 `auto`，表示继承父元素的 `align-items` 属性，如果没有父元素，则等同于 `stretch`。

```css
.box {
  display: flex;
}
.item {
  align-self: center;
}
```

### grid 布局

`align-content` 属性控制整个内容区域在容器垂直方向的对齐方式。

```css
.box {
  display: grid;
  align-content: center;
}
```

`align-items` 属性设置单元格在垂直方向的布局方式。

```css
.box {
  display: grid;
  align-items: center;
} 
```

`align-self` 属性设置单元格内容在垂直方向的对齐方式。

```css
.box {
  display: grid;
}
.item {
  align-self: center;
}
```

### 绝对定位 + `transform`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}
```

### 绝对定位 + `margin: auto`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto;
  height: 100px; /* 必须设置固定高度  */
}
```

### 绝对定位 + `calc()`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  top: calc(50% - 50px);
  height: 100px;
}
```

### `line-height`（仅限单行文本）

```css
.box {
  line-height: 100vh;
  height: 100vh;
}
.item {
  line-height: normal; /* 重置子元素的 line-height */
}
```

注意，这种方法只适用于单行文本，多行文本会显示异常。

### `table-cell`

```css
.box {
  display: table-cell;
  vertical-align: middle;
  height: 100vh;
}
.item {
  display: inline-block; /* 确保子元素正确显示 */
}
```

## 水平垂直居中

### flex

```css
.box {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### grid

```css
.box {
  display: grid;
  place-content: center;
} 
```

```css
.box {
  display: grid;
  place-items: center;
} 
```

### `transform`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 绝对定位 + `margin: auto`

```css
.box {
  position: relative;
}
.item {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 100px;
  margin: auto;
}
```

### `table-cell`

```css
.box {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
  height: 100vh;
  width: 100vw;
}
.item {
  display: inline-block;
}
```

## 参考

- [Flex 布局教程：语法篇](https://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)，阮一峰
- [CSS Grid 网格布局教程](https://www.ruanyifeng.com/blog/2019/03/grid-layout-tutorial.html)，阮一峰
