# 字符串长度

## 一、介绍

字符串的 `length` 属性，用于返回字符串对应的 UTF-16 码元的长度。这个方法只能识别 Unicode 码点区间在 `0x000` ~ `0xFFFF` 之间的字符，对于码点大于 `0xFFFF` 的字符，`length` 的判断会出现误差。

```javascript
'𠮷'.length // 2
```

## 二、解决办法

### 2.1 for...of

ES6 为字符串添加了遍历器接口，使得字符串可以被 `for...of` 循环遍历。它的的最大优点是，能够识别大于 `0xFFFF` 的码点。

```javascript
const text = String.fromCodePoint(0x20BB7); // "𠮷"

for (const i of text) {
  console.log(i);
}
```

### 2.2 扩展运算符

扩展运算符（`...`）也可以调用字符串的遍历器接口，将字符串（`...`）展开，它也能够识别大于 `0xFFFF` 的码点。

```javascript
[...text].length // 1

for (const s of [...text]) {
  console.log(s); 
}
// "𠮷"
```

## 参考

- [字符串的扩展，阮一峰](https://es6.ruanyifeng.com/#docs/string)
