让我们详细分析这段代码的执行顺序，并解释 `Promise.race` 是如何工作的。

### 代码分析

```javascript
function runAsync(x) {
  const p = new Promise(r =>
    setTimeout(() => r(console.log(x)), 1000)
  );
  return p;
}

function runReject(x) {
  const p = new Promise((res, rej) =>
    setTimeout(() => rej(`Error: ${x}`, console.log(x)), 1000 * x)
  );
  return p;
}

Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
  .then(res => console.log("result: ", res))
  .catch(err => console.log(err));
```

### 核心概念

- `Promise.race`：接受一个 promise 数组，当其中的某一个 promise 解决或拒绝时，返回的 promise 解决或拒绝。
- `setTimeout`：用于模拟异步操作，延迟执行代码。

### 执行流程和步骤

1. **调用 `runReject(0)`**：
   ```javascript
   runReject(0);
   ```
   - 创建一个新的 promise `p`，在 `0 * 1000` 毫秒（即立即）后调用 `rej` 回调，输出 `0` 并拒绝这个 promise。
   - 返回这个 promise。

2. **调用 `runAsync(1)`**：
   ```javascript
   runAsync(1);
   ```
   - 创建一个新的 promise `p`，在 `1000` 毫秒后调用 `r` 回调，输出 `1` 并解决这个 promise。
   - 返回这个 promise。

3. **调用 `runAsync(2)`**：
   ```javascript
   runAsync(2);
   ```
   - 创建一个新的 promise `p`，在 `1000` 毫秒后调用 `r` 回调，输出 `2` 并解决这个 promise。
   - 返回这个 promise。

4. **调用 `runAsync(3)`**：
   ```javascript
   runAsync(3);
   ```
   - 创建一个新的 promise `p`，在 `1000` 毫秒后调用 `r` 回调，输出 `3` 并解决这个 promise。
   - 返回这个 promise。

5. **调用 `Promise.race`**：
   ```javascript
   Promise.race([runReject(0), runAsync(1), runAsync(2), runAsync(3)])
     .then(res => console.log("result: ", res))
     .catch(err => console.log(err));
   ```
   - `Promise.race` 会返回一个新的 promise，当 `runReject(0)` 拒绝时，这个新的 promise 立即被拒绝，并触发 `.catch` 回调。

### 输出分析

1. **立即执行 `runReject(0)` 的 `setTimeout` 回调**：
   输出：
   ```
   0
   ```
   - 这个 promise 被拒绝，触发 `Promise.race` 的 `.catch` 回调。

2. **执行 `.catch` 回调**：
   输出：
   ```
   Error: 0
   ```

3. **其余的 `setTimeout` 回调（尽管不会影响最终结果，但会在 `1` 秒后执行）**：
   - `runAsync(1)` 输出：
     ```
     1
     ```
   - `runAsync(2)` 输出：
     ```
     2
     ```
   - `runAsync(3)` 输出：
     ```
     3
     ```

### 最终输出顺序

最终输出顺序为：
```
0
Error: 0
1
2
3
```

### 解释

- `Promise.race` 会在第一个 promise 被解决或拒绝时立即返回结果。
- 在本例中，`runReject(0)` 的 `setTimeout` 回调立即执行，拒绝这个 promise。因此 `Promise.race` 返回的 promise 被拒绝，并触发 `.catch` 回调。
- 其他 promise 继续以各自的延迟时间运行，但不会影响 `Promise.race` 的结果。