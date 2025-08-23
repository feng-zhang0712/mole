# async 和 await

## 一、async

### 1.1 async 的基本用法

`async` 用来声明异步函数，执行该异步函数，会返回一个新的 Promise 对象，作为该异步函数的返回值。

```javascript
async function name() {
  // ...
}
```

async 函数内部，可以使用 `await` 表达式，这允许我们可以像书写同步代码那样，执行异步操作，并且可以使用 `try/catch` 代码块，来捕获函数执行过程中抛出的错误。

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

上面代码中， `x` 是一个未定义的变量，`await` 后面的表达式抛出错误后，就会被 `try/catch` 捕获。

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

如果 async 函数中，试图返回一个 Promise 对象，则**该异步函数会返回一个跟原 Promise 不同的对象，而 `Promise.resolve` 会返回同一个对象**。

```javascript
const p = new Promise(resolve => resolve(1));

function basicReturn() {
  return Promise.resolve(p);
}

async function asyncReturn() {
  return p;
}

console.log(p === basicReturn()); // true
console.log(p === asyncReturn()); // false
```

上面代码中，`Promise.resolve` 返回的 Promise 对象和 `p` 是同一个对象，而 `asyncReturn` 返回的 Promise 对象和原始的 `p` 不是同一个对象。

异步函数的函数体，可以被看作是由零个或者多个 `await` 表达式分割开来的。从该函数体的顶层代码直到（并包括）第一个 `await` 表达式（如果有的话）都是同步运行的。这意味着，如果异步函数中，不包含 `await` 表达式，那么异步函数中的代码就是同步执行的。

```javascript
async function foo() {
  return 1;
}
```

上面 `foo` 函数中的代码，是同步执行的，结果会立即返回。

如果函数体内包含 `await` 表达式，则异步函数就一定会异步完成。

```javascript
async function foo() {
  await 1;
}

// 等价于
function foo() {
  return Promise.resolve(1).then(() => undefined);
}
```

注意，`async function` 声明的函数，同样存在提升行为，它的行为类似于 `function`，会被提升到所在作用域的顶部。

### 1.2 async 实现原理

我们知道，Generator 函数执行后，会返回一个 `iterator` 对象，只有通过调用 `iterator` 对象的 `next` 方法，才会执行函数体内的代码。而 async 函数实际上就是 Generator 函数的自动执行器。

下面的代码，是 async 函数的简化版实现，这其实也是 [`co`](https://github.com/tj/co/blob/master/index.js) 模块的实现。

```javascript
function co(gen) {
  return new Promise((resolve, reject) => {
    const iterator = gen();
    
    function step(next, arg) {
      let rst;
      try {
        rst = next.call(iterator, arg);
        if (rst.done) {
          return resolve(rst.value);
        }

        Promise.resolve(rst.value).then(
          value => step(iterator.next, value),
          reason => step(iterator.throw, reason),
        );
      } catch (error) {
        return reject(error);
      }
    }

    step(iterator.next);
  });
}

```

上面代码中，确保 `rst.value` 包装为 Promise，这样，不管 `rst.value` 是普通值还是 Promise，都可以按照统一的方式处理。

有了这个 async 函数，就可以像下面这样使用。

```javascript
co(function *(){
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

`await` 会对其后的表达式进行同步地求值处理，类似于 `Promise.resolve()`，如果 `await` 后面的表达式不是 Promise 对象，则会将其包装为一个 Promise 对象，然后等待其兑现。

- 如果 `await` 后面的表达式，是 Promise 对象，`await` 会等待其兑现。
- 如果 `await` 后面的表达式，是 thenable 对象，此对象会被包装成一个新的 Promise 对象，并调用它的 `then()` 方法。
- 如果 `await` 后面的表达式，不是 thenable 对象，或者压根不是对象，那么该值会被包装为一个**已兑现的** Promise 对象，返回的结果就是该表达式的值。

### 1.3 顶层 await

`await` 可以用在模块的顶层，此时，当前模块会等待 `await` 后面表达式的执行。

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

异步函数中如果存在多个 `await` 表达式，除了第一个 `await` 后面的表达式会立即执行，其余的每个 `await` 表达式后面的代码，都可以认为是存在于 Promise 的 `then` 回调中。此时，后面代码的执行会暂停，并被推送到微任务队列中，然后主线程继续执行事件循环中的下一个任务。

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

## 三、常见用法

### 3.1 并发执行

`forEach` 方法和 `for...of` 循环都无法完成异步操作的并发执行，原因是 `forEach` 不支持异步操作，而 `for...of` 执行的其实是继发，而不是并发。

要实现真正的并发操作，一种方法是使用数组的 `reduce` 方法。

```javascript
function readFile(file) {
  return new Promise(resolve => {
    setTimeout(() => resolve(file), 1000);
  });
}

async function readFiles(files) {
  const results = [];
  await files.reduce(
    async (_, file) => results.push(await readFile(file)), 
    undefined,
  );

  return results;
}
```

另一种方法是使用 `Promise.all` 方法，该方法里边的多个异步操作会并发而不是继发执行。

```javascript
async function readFiles(files) {
  const promises = files.map(readFile);
  const results =  await Promise.all(promises);

  return results;
}
```

### 3.2 按顺序执行

实现异步操作按序执行，一种方式是使用数组的 `reduce` 方法。

```javascript
async function readFiles(files) {
  files.reduce(
    async (chain, file) => {
      return chain.then(() => readFile(file))
        .then(res => console.log(res));
    },
    Promise.resolve(),
  );
}
```

上面的代码会按序执行，每隔一秒输出文件读取的结果，但是这种写法可读性差。

另一种方式是使用 `for` 或者 `for...of` 循环。

```javascript
async function readFiles(files) {
  for (const file of files) {
    console.log(await readFile(file));
  }
}
```

上面的代码，每隔一秒输出文件的读取结果，即只有第一个异步操作完成后，才会执行第二个，...，直到最后一个。这种方式可读性好，但是效率差，只有等到上一个异步操作完成，才会执行下一个操作。

下面是使用数组的 `map` 方法跟 `for...of` 结合的例子。

```javascript
async function readFiles(files) {
  const promises = files.map(readFile);
  for (const promise of promises) {
    console.log(await promise);
  }
}
```

上面的代码，首先使用 `map` 方法获取所有异步操作数组，然后使用 `for...of` 循环等待异步执行的结果。这种方式是并发执行的，所有操作会在一秒后完成，并且一次性地按序输出。`map` 方法虽然不会等待每个异步操作完成，但是每次执行 `readFile` 方法是，异步操作已经开始执行了。等到 `for...of` 等待完成第一个异步操作，其他所有的操作也都已经完成了。

### 3.3 限制并发数

```javascript
async function limitedParallelLoop(items, limit = 3) {
  const results = [];

  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    
    results.push(...batchResults);
  }

  return results;
}
```

上面代码中，通过 `limit` 关键字限制每一轮执行的异步操作数量，它的原理是，通过数组的 `slice` 方法每次取出三个数据项，然后将其转换为三个异步的 Promise 操作，并将其放入 `Promise.all` 中执行。这样，只有在每一轮的三个异步操作执行完成后，才会继续取出下一轮的三个异步任务执行。

## 四、参考

- [async](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
- [await](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/await)
- [async 函数](https://es6.ruanyifeng.com/#docs/async)
- [co](https://github.com/tj/co)
