# MutationObserver

`MutationObserver` 用于监听 DOM 的结构与内容变更，是对历史上 DOM Mutation Events（如 `DOMNodeInserted`）的替代。

## 基本使用

### 构造函数

`MutationObserver(callback)` 构造函数创建一个新的观察者对象，它可以接受一个 `callback` 回调函数作为参数，当被观察的节点或者子树发生变化时，回调函数被执行。

```javascript
const observer = new MutationObserver(callback);
```

`callback` 回调函数接受两个参数。

- 第一个参数是 `MutationRecord` 对象类型的数组，描述了每次发生的变化。
- 第二个参数是 `MutationObserver` 观察者对象本身。

注意，回调函数在**微任务**（microtask）阶段批量触发，浏览器会将同一轮事件循环中的多个 DOM 变更合并成一组 `MutationRecord`，因此天然具备“批处理/节流”效果。

### 实例方法

#### `observe()`

`observe(target, options)` 方法用于指定观察的对象。观察者可以观察某个 node 节点，或者该节点的所有子节点，也可以对同一个节点多次调用该方法，执行观察不同类型的变更，某个节点也可以被多个观察者对象观察。

```javascript
observe(target, options)
```

- `target` 指定要观察的节点。
- `options` 一个配置对象，指定观察哪些类型的 DOM 变更。必须指定为 `attributes`、`childList` 或者 `characterData` 三者之一，否则报错。

`options` 配置对象可以接受多个配置属性。

- `subtree` 将监控范围扩展到以 `target` 为根的整个子树。其余属性也会应用到子树中所有节点，默认为 `false`。注意，如果 `target` 的某个后代被移除，在关于该“移除”通知送达之前，仍会继续观察被移除节点子树中的变化。
- `childList` 监控子节点的新增与移除操作（对 `target`，以及当 `subtree: true` 时对其所有后代），默认为 `false`。
- `attributes` 监控属性值的变化。如果指定了 `attributeFilter` 或 `attributeOldValue`，其默认值为 `true`；否则默认 `false`。
- `attributeFilter` 仅监控给定属性名数组中的属性变化；未提供时，所有属性变化都会触发通知。
- `attributeOldValue` 记录属性变化前的旧值，默认为 `false`。
- `characterData` 监控文本节点（字符数据）内容的变化（对 `target`，以及当 `subtree: true` 时对其所有后代）。若指定了 `characterDataOldValue`，其默认值为 `true`；否则默认为 `false`。
- `characterDataOldValue` 记录文本变化前的旧值，默认为 `false`。

如果在观察某个节点时，配置对象中设置了 `subtree`，即使该子树的一部分被移除，回调函数仍会继续收到该节点后代发生变化的通知。然而，一旦关于该移除的通知被投递，随后对被移除的子树的进一步修改将不再触发观察者。

这可以防止在连接被切断之后、而在有机会专门开始监视被移动的节点或子树之前，错过其间发生的变化。从理论上讲，这意味着如果你记录下描述这些变化的 `MutationRecord` 对象，你应该能够“撤销”这些变化，将 DOM 回滚到初始状态。

```html
<div id="target">
  <div id="child"></div>
</div>

<script>
const target = document.getElementById('target');
const child = document.getElementById('child');

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' && mutation.target.id === 'target') {
      // 在收到“该子节点已被移除”的通知后，对已分离子树所做的后续修改将不再触发观察者。
      child.setAttribute('data-bar', '');
    }
  });
});

observer.observe(target, {
  attributes: true,
  childList: true,
  subtree: true,
});

target.removeChild(child);
// 这项变更发生在“childList target”通知被传递之前，因此它也会触发观察者。
child.setAttribute('data-foo', '');

// 输出：
// childList target null
// attributes child data-foo
// There is no "attributes child data-bar" notification.
</script>
```

下面是一个使用 `attributeFilter` 的例子。

```javascript
const userListElement = document.querySelector("#user-list");

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    switch (mutation.type) {
      case 'attributes':
        switch (mutation.attributeName) {
          case 'status':
            userStatusChanged(mutation.target.username, mutation.target.status);
            break;
          case 'username':
            usernameChanged(mutation.oldValue, mutation.target.username);
            break;
        }
        break;
    }
  });
});

observer.observe(userListElement, {
  attributeFilter: ['status', 'username'],
  attributeOldValue: true,
  subtree: true,
});
```

上面例子中，`observer` 对象观察聊天室用户名的子树中任意元素的 `status` 和 `username` 属性变化。这样，代码就可以实时反映用户昵称的更新，或将用户标记为离开键盘（AFK）或离线。

下面是一个观察属性值的例子。

```html
<style>
  body {
    background-color: paleturquoise;
  }

  button,
  input,
  pre {
    margin: 0.5rem;
  }
</style>

<button id="toggle">Toggle direction</button><br />
<div id="container">
  <input type="text" id="rhubarb" dir="ltr" value="Tofu" />
</div>
<pre id="output"></pre>

<script>
  const toggle = document.querySelector('#toggle');
  const rhubarb = document.querySelector('#rhubarb');
  const observerTarget = document.querySelector('#container');
  const output = document.querySelector('#output');

  toggle.addEventListener('click', () => {
    rhubarb.dir = rhubarb.dir === 'ltr' ? 'rtl' : 'ltr';
  });

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') {
        output.textContent = `The ${mutation.attributeName} attribute was modified from '${mutation.oldValue}'.`;
      }
    }
  });

  observer.observe(observerTarget, {
    subtree: true,
    attributeOldValue: true,
  });
</script>
```

上面例子中，在点击按钮改变元素的 `dir` 属性值时，旧的属性值也会被记录。

#### `disconnect`

`disconnect()` 停止观察目标，之后还可以通过执行 `observe()` 方法重新启用观察。

注意，执行 `disconnect()` 方法时，所有已检测但尚未上报给 observer 的变化会被丢弃，此时可使用 `takeRecords()` 方法来获取这些变化。

#### `takeRecords`

`takeRecords()` 方法返回所有已检测到、但尚未处理的 DOM 变更列表。常用于在断开观察者之前，立即获取所有待处理的变更记录。

注意，执行该方法会清空变更结果数组。

```javascript
const observer = new MutationObserver(callback);
observer.observe(document.querySelector('#someElement'), {
  childList: true,
  attributes: true,
});

const mutations = observer.takeRecords();

observer.disconnect();

if (mutations.length > 0) {
  callback(mutations);
}
```

## MutationRecord

## 实际应用

### 等待元素出现（动态插入）

```js
function waitForElement(
  selector, 
  {
    root = document,
    timeout = 10000,
  } = {},
) {
  return new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) return resolve(existing);

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    if (timeout) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    }
  });
}

// 用法
// const el = await waitForElement('#app .item');
```

### 监听 class 变化（只关心某属性）

```js
const observer = new MutationObserver(records => {
  for (const record of records) {
    if (record.type === 'attributes' && record.attributeName === 'class') {
      // r.target.className 已是新值
      // r.oldValue 为旧 class
    }
  }
});

observer.observe(node, {
  attributes: true,
  attributeFilter: ['class'],
  attributeOldValue: true,
});
```

### 监听文本变化（contenteditable/富文本）

```js
observer.observe(editableEl, {
  characterData: true,
  subtree: true,
  characterDataOldValue: true,
});
```

### 监听整个树的节点增删

```js
observer.observe(container, { childList: true, subtree: true });
```

### 结合 requestAnimationFrame 进行批处理

```js
let dirty = false;
const observer = new MutationObserver(() => {
  if (!dirty) {
    dirty = true;
    requestAnimationFrame(() => {
      dirty = false;
      // 一帧内统一处理所有 DOM 变更
    });
  }
});

observer.observe(root, {
  childList: true,
  attributes: true,
  subtree: true,
});
```

### Shadow DOM 内的监听

```js
// 对 shadowRoot 单独 observe
const shadow = host.shadowRoot;
observer.observe(shadow, { childList: true, subtree: true });
```

## 参考

- [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)，MDN
- [MutationRecord](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord)，MDN
