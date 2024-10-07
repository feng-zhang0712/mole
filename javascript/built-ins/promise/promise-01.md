# Promise-01

## 问题

下面代码的运行结果是什么？

```javascript
const asyncFunc = async () => {
  console.log('asyncFunc start');

  setTimeout(() => {
    console.log('asyncFunc timer')
  }, 2000)

  await new Promise(_ => {
    console.log('asyncFunc promise')
  })

  console.log('asyncFunc end')
  return 'asyncFunc success'
}

console.log('start');
asyncFunc().then(res => console.log(res));
console.log('end');

Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .catch(4)
  .then(res => console.log(res))

setTimeout(() => {
  console.log('timer')
}, 1000);
```

## 代码分析和执行顺序

（1）**同步代码执行**：执行 `console.log('start');`，并输出 `start`。

（2）**调用 `asyncFunc()` 并处理其返回的 `Promise`**：

  ```javascript
  asyncFunc().then(res => console.log(res));
  ```

（3）**`asyncFunc` 定义并执行**：

   ```javascript
   const asyncFunc = async () => {
     console.log('asyncFunc start');

     setTimeout(() => {
       console.log('asyncFunc timer')
     }, 2000)

     await new Promise(_ => {
       console.log('asyncFunc promise')
     })

     console.log('asyncFunc end')
     return 'asyncFunc success'
   }
   ```

- `console.log('asyncFunc start');` 输出 `asyncFunc start`
- `setTimeout` 定时器设置为 2000 毫秒，回调函数被放入宏任务队列。
- `await new Promise(_ => { console.log('asyncFunc promise') })`：
  - `new Promise` 的执行是同步的，因此会立即输出 `asyncFunc promise`
  - 这个 `Promise` 不会被解决（`resolve`）或拒绝（`reject`），所以 `await` 会一直等待，不会继续执行后续代码。

（4）`asyncFunc` 返回一个未解决的 `Promise`，因此不会立即返回结果。

（5）**继续执行同步代码** `console.log('end');` 输出 `end`。

（6）**处理 `Promise.resolve(1)` 链**，并输出 1。

   ```javascript
   Promise.resolve(1)
     .then(2)
     .then(Promise.resolve(3))
     .catch(4)
     .then(res => console.log(res))
   ```

- `Promise.resolve(1)` 返回一个已解决的 `Promise`，其值为 1。
- `.then(2)` 和 `.then(Promise.resolve(3))` 会被忽略，因为它们不是函数。
- `.then(res => console.log(res))` 中 `res` 的值为 1。

（7）**设置定时器**：这个定时器的回调函数会在 1000 毫秒后执行，并被放入宏任务队列。

   ```javascript
   setTimeout(() => {
     console.log('timer')
   }, 1000);
   ```

## 最终执行结果

这段代码的输出结果如下。

```javascript
start
asyncFunc start
asyncFunc promise
end
1
timer
asyncFunc timer
```
