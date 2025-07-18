# async

## async 的基本用法

async 用来声明异步函数，执行该异步函数，会返回一个新的 Promise 对象，该对象被作为该异步函数的返回值。

```javascript

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

上面代码中， `x` 是一个为定义的变量，await 后面的表达式的抛出错误后，就会被 `try/catch` 捕获。

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

如果 async 函数中，试图返回一个 Promise 对象，则该异步函数会返回一个跟原 Promise 对象不同的引用，而 `Promise.resolve` 会返回相同的引用，

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

上面代码中，`asyncReturn` 函数返回的 Promise 对象和原始的 `p` 是不同的引用地址，而 `Promise.resolve` 函数返回的 Promise 对象和 `p` 引用相同。

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

## async 实现原理

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
      },
    );
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

## 参考

- [async function](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [async 函数](https://es6.ruanyifeng.com/#docs/async)
- [co](https://github.com/tj/co)
