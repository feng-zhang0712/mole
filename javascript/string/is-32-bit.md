# 判断字符位长度

ES6 中新增的 `String.prototype.codePointAt(index)` 方法，用于返回字符串中，对应 `index` 位置的 Unicode 字符。这个方法能够正确识别 4 个字节的 32 位字符，即对应码点大于 `0xFFFF` 的字符串。

它是测试一个字符由两个字节还是由四个字节组成的最简单方法。

```javascript
function is32Bit(c) {
  return c.codePointAt(0) > 0xFFFF;
}

is32Bit("𠮷") // true
is32Bit("a") // false
```

## 参考

- [字符串的新增方法，阮一峰](https://es6.ruanyifeng.com/#docs/string-methods)
