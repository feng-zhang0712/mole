# 原型和原型链

有些内置构造函数的 `prototype` 属性是其自身的实例。比如，`Number.prototype` 是数字 `0`，`Array.prototype` 是一个空数组，`RegExp.prototype` 是 `/(?:)/`。

```javascript
Boolean.prototype == false // true
Number.prototype == 0 // true
String.prototype == '' // true
Array.prototype.push(1) // 1
RegExp.prototype.source // (?:)
Function.prototype() // undefined
```

然而，这一点对于用户定义的构造函数、Set、Map 等现代构造函数不成立，

```javascript
Set.prototype.add(1) // Method Set.prototype.add called on incompatible receiver
Map.prototype.set('foo', 1) // // Method Map.prototype.set called on incompatible receiver
```

```javascript
function Foo() { }

const foo = new Foo();

foo.__proto__ === Foo.prototype // true
Foo.prototype.__proto__ === Object.prototype // true
Object.prototype.__proto__ === null // true

// 原型链指向是
// foo -> Foo.prototype -> Object.prototype -> null
```
