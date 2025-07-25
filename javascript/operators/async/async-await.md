# async 和 await

## 一、async

### 1.1 async 的基本用法

`async` 用来声明异步函数，执行该异步函数，会返回一个新的 Promise 对象，作为该异步函数的返回值。

```javascript
async function name() {
  // ...
}
```

async 函数内部，可以使用 `await` 表达式，这允许我们可以像书写同步代码那样，执行异步操作，进而可以使用 `try/catch` 代码块，来捕获函数执行过程中抛出的错误。

```javascript
async function foo() {
  try {
    await Promise.resolve(x);
  } catch (error) {
    console.log('catch: ', error);
  }
}

foo();
```

上面代码中， `x` 是一个为定义的变量，`await` 后面的表达式的抛出错误后，就会被 `try/catch` 捕获。

async 函数总是返回一个 Promise 对象，如果返回值不是 Promise 对象，它会被包裹为一个 Promise 对象。

```javascript
async function foo() {
  return 1;
}

// 等同于
function foo() {
  return Promise.resolve(1);
}
```

如果 async 函数中，试图返回一个 Promise 对象，则**该异步函数会返回一个跟原 Promise 对象不同的引用，而 `Promise.resolve` 会返回相同的引用**。

```javascript
const p = new Promise(resolve => resolve(1));

async function asyncReturn() {
  return p;
}

function basicReturn() {
  return Promise.resolve(p);
}

console.log(p === basicReturn()); // true
console.log(p === asyncReturn()); // false
```

上面代码中，`asyncReturn` 函数返回的 Promise 对象和原始的 `p` 是不同对象，而 `Promise.resolve` 函数返回的 Promise 对象和 `p` 是同一个对象。

异步函数的函数体，可以被看作是由零个或者多个 `await` 表达式分割开来的。从该函数的顶层代码直到（并包括）第一个 `await` 表达式（如果有的话），代码都是同步运行的。这也就意味着，如果异步函数中，不包含 `await` 表达式，那么异步函数中的代码就是同步执行的。

```javascript
async function foo() {
  await 1;
}

// 等价于
function foo() {
  return Promise.resolve(1).then(() => undefined);
}
```

每个 `await` 表达式之后的代码，可以被认为存在于 `.then` 回调中。通过这种方式，可以通过函数的每个可重入步骤来逐步构建 promise 链。而返回值构成了链中的最后一个环。

注意，`async function` 声明的函数，同样存在提升行为，它的行为类似于 `function`，会被提升到所在作用于的顶部。

### 1.2 async 实现原理

我们知道，Generator 函数执行后，会返回一个 `iterator` 对象，只有通过调用 `iterator` 对象的 `next` 方法，才会执行函数体内的代码。而 async 函数实际上就是 Generator 函数的自动执行器。

下面的代码，是 async 函数的简化版实现，这其实也是 `co` 模块的实现。

```javascript
function async(genFn) {
  return new Promise(function(resolve, reject) {
    const gen = genFn();
    function step(ret) {
      try {
        if (ret.done) {
          return resolve(ret.value);
        }
      } catch (error) {
        return reject(error);
      }
      Promise.resolve(ret.value).then(function(res) {
        return step(gen.next(res));
      }, function(error) {
        return step(gen.throw(error));
      });
    }
    step(gen.next());
  });
}
```

有了这个 async 函数，就可以像下面这样使用。

```javascript
async(function *(){
  var a = Promise.resolve(1);
  var b = Promise.resolve(2);
  var c = Promise.resolve(3);
  var res = yield [a, b, c];
  console.log(res);
  // => [ Promise { 1 }, Promise { 2 }, Promise { 3 } ]
}).catch(onerror);

function onerror(err) {
  console.error(err.stack);
}
```

## 二、await

### 1.1 介绍

`await` 表达式用于等待一个 Promise 的兑现，并返回 Promise 兑现后的值。`await` 表达式只能在**异步函数**或者**模块顶层**中使用。

```javascript
await expression;
```

### 1.2 await 的基本使用

await 会对其后的表达式进行同步地求值处理，类似于 Promise.resolve()，如果 await 后面的表达式不是 Promise 对象，则会将其包装为一个 Promise 对象，然后等待其兑现。

- 如果 await 后面的表达式，是 Promise 对象，await 会等待其兑现。
- 如果 await 后面的表达式，是 thenable 对象，此对象会被包装成一个新的 Promise 对象，并调用它的 `then()` 方法。
- 如果 await 后面的表达式，不是 thenable 对象，或者压根不是对象，那么该值会被包装为一个**已兑现的** Promise 对象，返回的结果就是该表达式的值。

### 1.3 顶层 await

await 可以用在模块的顶层，此时，当前模块会等待 await 后面表达式的执行。

### 1.4 await 对执行过程的影响

```javascript
async function foo(name) {
  console.log(name, "start");
  await console.log(name, "middle");
  console.log(name, "end");
}

foo("First");
foo("Second");

// First start
// First middle
// Second start
// Second middle
// First end
// Second end
```

异步函数在执行过程中，如果遇到 `await`，后面的表达式会被立即执行，并且，后面代码的执行会被暂停，同时被推送到微任务队列中，然后主线程继续执行事件循环中的下一个任务。

```javascript
let i = 0;

queueMicrotask(function test() {
  i++;
  console.log("microtask", i);
  if (i < 3) {
    queueMicrotask(test);
  }
});

(async () => {
  console.log("async function start");
  for (let i = 1; i < 3; i++) {
    await null;
    console.log("async function resume", i);
  }
  await null;
  console.log("async function end");
})();

queueMicrotask(() => {
  console.log("queueMicrotask() after calling async function");
});

console.log("script sync part end");

// async function start
// script sync part end
// microtask 1
// async function resume 1
// queueMicrotask() after calling async function
// microtask 2
// async function resume 2
// microtask 3
// async function end
```

## 三、参考

- [async](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)
- [async 函数](https://es6.ruanyifeng.com/#docs/async)
- [co](https://github.com/tj/co)
