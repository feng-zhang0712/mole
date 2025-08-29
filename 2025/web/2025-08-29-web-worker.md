# Web Workers API

## 介绍

JavaScript 语言采用的是单线程模型，所有任务只能在一个线程上完成，一次只能做一件事。随着电脑计算能力的增强，尤其是多核 CPU 的出现，单线程带来很大的不便，无法充分发挥计算机的计算能力。

Web Worker 为 JavaScript 提供了多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务可以交由 Worker 线程执行，主线程（通常负责 UI 交互）能够保持流畅，不会被阻塞或拖慢。

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，而且一旦使用完毕，就应该关闭。

Web Worker 有以下几个使用注意点。

- 同源限制：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件**同源**。
- 文件限制：Worker 线程无法读取本地文件，即不能打开本机的文件系统（`file://`），它所加载的脚本，必须来自网络。
- DOM 限制：Worker 线程所在的全局对象，无法读取主线程所在网页的 DOM 对象，也无法使用 `window`、`document` 这些对象。但是，Worker 线程可以使用 `navigator` 对象和 `location` 对象。
- 全局对象限制：Worker 的全局对象 WorkerGlobalScope，不同于网页的全局对象 Window，很多接口拿不到。比如，理论上 Worker 线程不能使用 `console.log`，因为标准里面没有提到 Worker 的全局对象存在 `console` 接口，只定义了 Navigator 接口和 Location 接口。不过，浏览器实际上支持 Worker 线程使用 `console.log`，保险的做法还是不使用这个方法。
- 脚本限制：Worker 线程不能执行 `alert()` 方法和 `confirm()` 方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求，[这里] 列出了 Web Workers 可以使用的 Web API。
- 通信联系：Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。

[这里]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers

## 结构化克隆算法

## 可转移对象

## Worker

### 基本使用

#### `Worker()` 构造函数

`Worker()` 构造函数用于创建一个指定了特定 Worker URL 地址的实例对象。

```javascript
new Worker(url)
new Worker(url, option)
```

- `url` Worker 线程执行的 JavaScript 脚本地址，该地址受同源策略的影响。
- `options` 可选的配置对象，该对象可以接受下面三个参数。
  - `type` Worker 的类型，可选值为 `classic` 和 `module`，前者为默认值。
  - `credentials` Worker 使用的凭证类型，可选值为 `omit`、`same-origin` 和 `include`，默认值为 `same-origin`，即只在同源请求时发送凭证信息。
  - `name` 指定 `DedicatedWorkerGlobalScope` 的别名，主要用于调试目的。

通常，第二个参数很少使用。

#### 实例方法

##### `postMessage()`

主线程和 Worker 线程之间的通信，通过 `postMessage()` 进行。

```javascript
postMessage(message)
postMessage(message, transfer)
postMessage(message, options)
```

- `message` 向对方发送的数据，可以是任意类型，如果是对象，会被[结构化克隆算法]处理。在接收端，通过回调函数的 `event.data` 来获取。该参数必须制定，如果没有数据要发送，可以指定为 `null` 或者 `undefined`。
- `transfer` 可选的可转移对象数组，用于将当前上下文环境中的对象，转移到目标上下文，一旦转移完成，这些对象在当前上下文就不可用。注意，数组中的对象必须挂载到第一个参数对象中。
- `options` 可选的配置对象，该对象只有一个 `transfer` 属性，其作用跟上面的 `transfer` 一致。

[结构化克隆算法]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

##### `terminate()`

`terminate()` 方法终止 Worker 的执行，该方法会立即执行，如果此时有数据传输，传输会被终止。

```javascript
terminate()
```

注意，该方法是 Worker 实例方法，只能通过 `worker.terminate()` 执行，在 Worker 脚本内部，可以通过执行 `self.close()` 关闭 Worker。

#### 事件

##### `message`

`message` 事件在收到对方发送来的消息时触发，该事件不能被取消且不会冒泡。

```javascript
// 在主线程中
worker.addEventListener('message', event => { })
worker.onmessage = event => { }

// 或者在 worker 脚本中
self.addEventListener('message', event => { })
self.onmessage = event => { }
```

下面列出了 `event` 对象的属性。

- `data` 发送方发送的数据。
- `origin` 发送方的域名。
- `source` 发送方的源引用。
- `ports` 一个 `MessagePort` 对象数组，表示发送消息的端口。
- `lastEventId` 事件 ID 字符串。

##### `error`

`error` 事件在通信过程发生错误时触发。

##### `messageerror`

`messageerror` 事件在接受到一个不可序列化的数据时触发，该事件不能被取消且不会冒泡。

下面是一个主线程与 Worker 线程通信的例子。

```javascript
// 主线程
const worker = new Worker('work.js');

worker.postMessage('Hello World');

worker.onmessage = function (event) {
  worker.postMessage('Work done!');
  // ...
}

// worker.terminate();
```

上面的代码在主线程创建了一个 Worker 示例，之后向 Worker 线程发送了一条消息，通信完成后，要执行 `worker.terminate()` 方法关闭 Worker。

```javascript
// worker.js

self.addEventListener('message', function (event) {
  self.postMessage('You said: ' + event.data);
}, false);

// self.close();
```

Worker 线程通过设置 `message` 事件监听来自主线程 Worker 发送来的消息，Worker 线程通信完成后，要通过 `close()` 方法关闭。

#### `importScripts()`

使用 `importScripts()` 方法可以在 Worker 脚本中导入其他模块。

```javascript
importScripts("foo.js", "bar.js");
```

`importScripts()` 导入的模块可以按任意顺序下载，但会按照顺序执行，这些模块同步执行，之后继续往下执行。

### 特殊例子

#### 同页面的 Web Worker

通常情况下，Worker 载入的是一个单独的 JavaScript 脚本文件，但是也可以载入与主线程在同一个网页的代码。

```html
<body>
  <script id="worker" type="app/worker">
    addEventListener('message', function () {
      postMessage('some message');
    }, false);
  </script>
</body>
```

上面是一段嵌入网页的脚本，注意必须指定 `<script>` 标签的 `type` 属性是一个浏览器不认识的值，上例是 `app/worker`。

然后，读取这一段嵌入页面的脚本，用 Worker 来处理。

```javascript
const blob = new Blob([document.querySelector('#worker').textContent]);
const url = window.URL.createObjectURL(blob);
const worker = new Worker(url);

worker.onmessage = function (e) {
  // e.data === 'some message'
};
```

上面代码中，先将嵌入网页的脚本代码，转成一个二进制对象，然后为这个二进制对象生成 URL，再让 Worker 加载这个 URL。这样就做到了，主线程和 Worker 的代码都在同一个网页上面。

#### Worker 中新建 Worker

Worker 线程内部还能再新建 Worker 线程（目前只有 Firefox 浏览器支持）。下面的例子是将一个计算密集的任务，分配到 10 个 Worker。

```javascript
// 主线程

const worker = new Worker('worker.js');
worker.onmessage = function (event) {
  document.getElementById('result').textContent = event.data;
};

// Worker 线程 - worker.js

const num_workers = 10;
const items_per_worker = 1000000;

let result = 0;
const pending_workers = num_workers;
for (var i = 0; i < num_workers; i += 1) {
  const worker = new Worker('core.js');
  worker.postMessage(i * items_per_worker);
  worker.postMessage((i + 1) * items_per_worker);
  worker.onmessage = storeResult;
}

function storeResult(event) {
  result += event.data;
  pending_workers -= 1;
  if (pending_workers <= 0) {
    postMessage(result); // finished!
  }
}
```

上面代码中，Worker 线程内部新建了 10 个 Worker 线程，并且依次向这 10 个 Worker 发送消息，告知了计算的起点和终点。

### 应用场景

#### 大数据处理

Worker 常用来处理大量数据、复杂计算等需求，将复杂计算交给 Worker 线程执行，可以避免主线程被阻塞。

```javascript
// 主线程 - 创建Worker
const worker = new Worker('/workers/data-processor.js');

// 发送大量数据到 Worker 处理
const processLargeDataset = data => {
  worker.postMessage(data);
};

// 接收处理结果
worker.onmessage = event => {
  // event.data ...
};

// Worker 线程 - data-processor.js
self.onmessage = function (event) {
  const processedData = processData(event.data);
  self.postMessage(processedData);
};
```

#### 文件处理

Worker 线程也可以用来处理各种文件，比如图片处理、PDF 文件处理、大文件分片上传等。

```javascript
// 主线程 - 图片处理 Worker
const worker = new Worker('/workers/image-processor.js');

const image = new Image();

image.onload = () => {
  worker.postMessage({
    type: 'COMPRESS_IMAGE',
    image,
    quality: 0.8
  });
};

image.src = URL.createObjectURL(file);

worker.onmessage = (event) => {
  const { compressedImage, size } = event.data;
  // ...
};

// Worker 线程 - image-processor.js
self.onmessage = function (event) {
  const { image, quality } = event.data;
  const compressed = compressImageData(image, quality);
  self.postMessage({
    compressedImage: compressed,
    size: calculateSize(compressed)
  });
};
```

#### 数据同步和轮询

另外一个常见的场景是需要持续获取服务器数据或进行实时同步的场景。下面的例子演示了浏览器如何使用 Worker 轮询服务器状态。

```javascript
function createWorker(func) {
  const blob = new Blob(['(' + func.toString() + ')()']);
  const url = URL.createObjectURL(blob);
  return new Worker(url);;
}

const worker = createWorker(function (event) {
  let cache;

  function compare(new, old) { ... };

  setInterval(function () {
    fetch('/my-api-endpoint').then(function (response) {
      const data = response.json();

      if (!compare(data, cache)) {
        cache = data;
        self.postMessage(data);
      }
    })
  }, 1000)
});

worker.onmessage = function (event) {
  // render data
}
```

上面代码中，Worker 每秒钟轮询一次数据，然后跟缓存做比较。如果不一致，就说明服务端有了新的变化，因此就要通知主线程。

## SharedWorker

SharedWorker 是一种特殊的 Web Worker，允许多个页面、标签页或 iframe 共享同一个 Worker 实例。与普通的 Worker 不同，SharedWorker 可以在多个上下文之间共享，实现跨页面的数据共享和通信。

一旦创建了 SharedWorker，同一源中的任何脚本都可以获得对该 SharedWorker 的引用并与它通信。只要其全局作用域的所有者集合（Document 和 WorkerGlobalScope 对象的集合）不为空，共享 worker 就会保持活跃状态（例如，如果有任何活跃页面持有对它的引用，可能是通过 `new SharedWorker()` 创建的）。

### 基本使用

#### 构造函数

`SharedWorker()` 构造函数用于创建一个指定了特定 Worker URL 地址的实例对象。

```javascript
new SharedWorker(url)
new SharedWorker(url, name)
new SharedWorker(url, options)
```

- `url` Worker 线程执行的 JavaScript 脚本地址，该地址受同源策略的影响。
- `name` 指定 `DedicatedWorkerGlobalScope` 的别名，主要用于调试目的。
- `options` 可选的配置对象，该对象可以接受下面三个参数。
  - `type` Worker 的类型，可选值为 `classic` 和 `module`，前者为默认值。
  - `credentials` Worker 使用的凭证类型，可选值为 `omit`、`same-origin` 和 `include`，默认值为 `same-origin`，即只在同源请求时发送凭证信息。
  - `name` 指定 `DedicatedWorkerGlobalScope` 的别名，主要用于调试目的。
  - `sameSiteCookies` 指定哪些 SameSite cookie 可被 Worker 线程使用，可选值为 `all` 和 `none`。

#### 实例属性

`port` 是 SharedWorker 唯一的属性，类型为 [MessagePort]，用于与其他上下文通信以及控制 SharedWorker 对象。

```javascript
// 主线程创建 SharedWorker
const sw = new SharedWorker('shared-worker.js');

const port = sw.port;

// 启动端口
port.start();

port.postMessage('HELLO');

port.onmessage = function (event) {
  // ...
};
```

[MessagePort]: https://developer.mozilla.org/en-US/docs/Web/API/MessagePort

#### 事件

`error` 事件在通信过程发生错误时触发。

```javascript
// 主线程
worker.addEventListener('error', (event) => { })
worker.onerror = (event) => { }

// worker 线程
self.addEventListener('error', (event) => { })
self.onerror = (event) => { }
```

SharedWorker 脚本中，使用 `onconnect` 回调函数连接到 Worker 的端口（port）。

```javascript
// shared-worker.js
let connections = [];

self.onconnect = function (event) {
  const port = event.ports[0];
  connections.push(port);

  port.start();

  // 处理消息
  port.onmessage = function (event) {
    connections.forEach(port => {
      try {
        port.postMessage('WELCOME');
      } catch (error) {
        // 移除无效连接
        const index = connections.indexOf(port);
        if (index > -1) {
          connections.splice(index, 1);
        }
      }
    });
  };
};
```

### 应用场景

SharedWorker 可以实现跨标签页数据同步，或者类似场景的需求。

```javascript
// 标签页 A
const workerA = new SharedWorker('data-sync.js');
const portA = workerA.port;
portA.start();

portA.postMessage({
  type: 'UPDATE_USER',
  data: {
    name: 'Alice',
    age: 25,
  },
});

// 标签页 B
const workerB = new SharedWorker('data-sync.js');
const portB = workerB.port;
portB.start();

portB.onmessage = function (event) {
  if (event.data.type === 'USER_UPDATED') {
    updateUI(event.data.data);
  }
};
```

## 参考

- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Web Worker](https://wangdoc.com/javascript/bom/webworker)，阮一峰
