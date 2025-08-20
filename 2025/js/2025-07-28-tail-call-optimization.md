# 尾调用优化

## 一、尾调用

尾调用是指，一个函数的最后一步是调用另一个函数。

```javascript
function f(x){
  return g(x);
}
```

上面代码中，函数 `f` 的最后一步是调用函数 `g`，这就叫尾调用。

以下三种情况，都不属于尾调用。

```javascript
// 情况一
function f(x){
  let y = g(x);
  return y;
}

// 情况二
function f(x){
  return g(x) + 1;
}

// 情况三
function f(x){
  g(x);
}
```

上面代码中，情况一是调用函数 `g` 之后，还有赋值操作，所以不属于尾调用，即使语义完全一样。情况二也属于调用后还有其他操作，即使写在一行内。

尾调用不一定出现在函数尾部，只要是**最后一步操作**即可。

```javascript
function f(x) {
  if (x > 0) {
    return m(x)
  }
  return n(x);
}
```

上面代码中，函数 `m` 和 `n` 都属于尾调用，因为它们都是函数 `f` 的最后一步操作。

## 二、尾调用优化

函数在调用时会创建**调用帧**（stack frame），保存函数执行过程中的内部变量和调用位置信息。只有这样，在函数调用结束时，才会携带着函数调用的结果，返回到之前的位置。尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用帧，因为调用位置、内部变量等信息都不会再用到了，只要直接用内层函数的调用帧，取代外层函数的调用帧就可以了。

原则上，**尾调用可以通过简化函数调用帧的结构而获得性能优化，做到只保留内层函数的调用帧**，这就叫做“尾调用优化”（Tail call optimization）。如果所有函数都是尾调用，那么完全可以做到每次执行时，调用帧只有一项，这将大大节省内存。这就是“尾调用优化”的意义。尾调用优化是否可行取决于运行环境对此类优化的支持程度。目前只有 Safari 浏览器支持尾调用优化，Chrome 和 Firefox 都不支持。

注意，ES6 的尾调用优化只在严格模式下开启，正常模式是无效的。因为在正常模式下，函数内部有两个变量，可以跟踪函数的调用栈。

- `func.arguments`：返回调用时函数的参数。
- `func.caller`：返回调用当前函数的那个函数。

严格模式禁用这两个变量，所以尾调用模式仅在严格模式下生效。

## 三、尾递归

函数调用自身，称为递归。如果尾调用自身，就称为尾递归。

递归非常耗费内存，因为需要同时保存成千上百个调用帧，很容易发生“栈溢出”错误（stack overflow）。但对于尾递归来说，由于只存在一个调用帧，所以永远不会发生“栈溢出”错误。

```javascript
function factorial(n) {
  if (n === 1) return 1;
  return n * factorial(n - 1);
}

factorial(5) // 120
```

上面代码是一个阶乘函数，计算 `n` 的阶乘，最多需要保存 `n` 个调用记录，复杂度 `O(n)` 。

如果改写成尾递归，只保留一个调用记录，复杂度 `O(1)` 。

```javascript
function factorial(n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5, 1) // 120
```

ES6 明确规定，所有 ECMAScript 尾递归的实现，都必须部署“尾调用优化”。这就是说，ES6 中只要使用尾递归，就不会发生栈溢出（或者层层递归造成的超时），相对节省内存。

## 四、递归函数的改写

尾递归的实现，往往需要改写递归函数，确保最后一步只调用自身。做到这一点的方法，就是**把所有用到的内部变量改写成函数的参数**。

### 4.1 函数柯里化（闭包）

函数的柯里化（currying），是指将多参数的函数转换成单参数的形式。也可以使用柯里化实现尾递归。

```javascript
function currying(fn, n) {
  return function (m) {
    return fn.call(this, m, n);
  };
}

function tailFactorial(n, total) {
  if (n === 1) return total;
  return tailFactorial(n - 1, n * total);
}

const factorial = currying(tailFactorial, 1);

factorial(5) // 120
```

### 4.3 函数参数的默认值

ES6 中，函数的参数可以设置默认值，通过设置默认值，很容易就能实现尾递归。

```javascript
function factorial(n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}

factorial(5) // 120
```

递归本质上是一种循环操作。纯粹的函数式编程语言没有循环操作命令，所有的循环都用递归实现，这就是为什么尾递归对这些语言极其重要。

## 五、尾递归优化的实现

尾递归优化只在严格模式下生效，正常模式下，可以采用“**循环**”代替“递归”的形式，实现尾递归优化。

下面是一个正常的递归函数。

```javascript
function sum(x, y) {
  if (y > 0) {
    return sum(x + 1, y - 1);
  } else {
    return x;
  }
}

sum(1, 100000)
// Uncaught RangeError: Maximum call stack size exceeded(…)
```

上面代码中，`sum` 是一个递归函数，参数 `x` 是需要累加的值，参数 `y` 控制递归次数。一旦指定 `sum` 递归 100000 次，就会报错，提示超出调用栈的最大次数。

蹦床函数（trampoline）可以将递归执行转为循环执行。

```javascript
function trampoline(f) {
  while (f && f instanceof Function) {
    f = f();
  }
  return f;
}
```

上面就是蹦床函数的一个实现，它接受一个函数 `f` 作为参数。只要 `f` 执行后返回一个函数，就继续执行。注意，这里是返回一个函数，然后执行该函数，而不是函数里面调用函数，这样就避免了递归执行，从而就消除了调用栈过大的问题。

然后，将原来的递归函数，改写为每一步返回另一个函数。再使用蹦床函数执行 `sum`，就不会发生调用栈溢出。

```javascript
function sum(x, y) {
  if (y > 0) {
    return sum.bind(null, x + 1, y - 1);
  } else {
    return x;
  }
}

trampoline(sum(1, 100000))
// 100001
```

蹦床函数并不是真正的尾递归优化，下面的实现才是。

```javascript
function tco(f) {
  var value;
  var active = false;
  var accumulated = [];

  return function accumulator() {
    accumulated.push(arguments);
    if (!active) {
      active = true;
      while (accumulated.length) {
        value = f.apply(this, accumulated.shift());
      }
      active = false;
      return value;
    }
  };
}

var sum = tco(function(x, y) {
  if (y > 0) {
    return sum(x + 1, y - 1)
  }
  else {
    return x
  }
});

sum(1, 100000)
// 100001
```

上面代码中，`tco` 函数是尾递归优化的实现，它的奥妙就在于状态变量 `active`。默认情况下，这个变量是不激活的。一旦进入尾递归优化的过程，这个变量就激活了。然后，每一轮递归 `sum` 返回的都是 `undefined`，所以就避免了递归执行；而 `accumulated` 数组存放每一轮 `sum` 执行的参数，总是有值的，这就保证了 `accumulator` 函数内部的 `while` 循环总是会执行。这样就很巧妙地将“递归”改成了“循环”，而后一轮的参数会取代前一轮的参数，保证了调用栈只有一层。

## 参考

- [尾调用，维基百科](https://zh.wikipedia.org/wiki/%E5%B0%BE%E8%B0%83%E7%94%A8)
- [函数的扩展 - 尾调用优化，阮一峰](https://es6.ruanyifeng.com/#docs/function#%E5%B0%BE%E8%B0%83%E7%94%A8%E4%BC%98%E5%8C%96)
