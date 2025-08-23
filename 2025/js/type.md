# 类型判断

ES6 中引入了 `class`（类）的概念。后来，[ES2022](https://github.com/tc39/proposal-class-fields) 为 `class` 添加了私有属性和私有方法，它的写法是在属性名和方法名之前使用 `#` 来表示。

不管在类的内部还是外部，读取一个不存在的私有属性或者私有方法，都会报错。这跟类的公开的属性不同，读取一个不存在的公开的属性，不会报错，只会返回 `undefine`。此外，[ES2022](https://github.com/tc39/proposal-private-fields-in-in) 改进了 `in` 运算法，使它可以用来判断私有属性。利用这两个特性，可以用来判断，一个对象是否是当前类的实例。

```javascript
class {
  #brand;

  static isC(obj) {
    if (#brand in obj) {
      return true;  
    }
    return false;
  }
}
```

上面示例中，`in` 运算符判断某个对象是否有私有属性 `#brand`。它不会报错，而是返回一个布尔值。

注意，判断私有属性时，`in` 只能用在类的内部。另外，判断所针对的私有属性，一定要先声明，否则会报错。

## 参考

- [class 的基本语法，阮一峰](https://es6.ruanyifeng.com/#docs/class)
