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

因此，使用下面的方法，就可以用来获取字符串的长度。

```javascript
function length(str) {
  return [...str].length;
}
```

### 2.3 Array.from

ES6 中新增了 `Array.from()` 方法，它可以将两种类型的数据转为真正的数组：类似数组的对象以及部署了 iterator 接口的对象。

`Array.from()` 还可以将字符串转为数组，并且能够正确识别 Unicode 码点大于 `0xFFFF` 的字符。

```javascript
function countSymbols(string) {
  return Array.from(string).length;
}
```

## 参考

- [字符串的扩展，阮一峰](https://es6.ruanyifeng.com/#docs/string)
