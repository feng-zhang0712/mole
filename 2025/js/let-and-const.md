下面代码的运行结果是什么？

```javascript
var b = 10;
(function b() {
  b = 20;
  console.log(b);
})();
```

本题考查 JavaScript 中的函数表达式和函数声明不同的处理方式，以及函数表达式的函数名的特殊作用域规则。

（1）`var b = 10;` 创建了一个全局变量 `b`，值为 `10`。

（2）`(function b() { ... })` 定义了一个函数表达式，函数名是 `b`，但这个 `b` 是局部的，只在函数内部可见。

（3）函数立即被调用。

（4）在函数内部，尝试将 `b` 赋值为 `20`，但由于 `b` 是只读的，这个赋值操作被忽略。

（5）打印 `b`，结果是函数自身。

这段代码的输出结果是 `function b()`。

```javascript
foo;  // undefined
var foo = function () {
    console.log('foo1');
}

foo();  // foo1，foo赋值

var foo = function () {
    console.log('foo2');
}

foo();
```

```javascript
foo();  // foo2
function foo() {
    console.log('foo1');
}

foo();  // foo2

function foo() {
    console.log('foo2');
}

foo();
```

```javascript
foo();  // foo2
var foo = function() {
    console.log('foo1');
}

foo();  // foo1，foo重新赋值

function foo() {
    console.log('foo2');
}

foo();
```
