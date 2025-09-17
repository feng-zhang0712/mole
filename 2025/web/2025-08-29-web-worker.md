# Web Workers API

## 介绍

JavaScript 语言采用的是单线程模型，所有任务只能在一个线程上完成，一次只能做一件事。随着电脑计算能力的增强，尤其是多核 CPU 的出现，单线程带来很大的不便，无法充分发挥计算机的计算能力。

Web Worker 为 JavaScript 提供了多线程环境，允许主线程创建 Worker 线程，将一些任务分配给后者运行。在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务可以交由 Worker 线程执行，主线程（通常负责 UI 交互）能够保持流畅，不会被阻塞或拖慢。

Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，这也造成了 Worker 比较耗费资源，不应该过度使用，一旦使用完毕，就应该关闭。

Web Worker 有以下几个使用注意点。

- 同源限制：分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件**同源**。
- 文件限制：Worker 线程无法读取本地文件，即不能打开本机的文件系统（`file://`），它所加载的脚本，必须来自网络。
- DOM 限制：Worker 线程所在的全局对象，无法读取主线程所在网页的 DOM 对象，也无法使用 `window`、`document` 这些对象。但是，Worker 线程可以使用 `navigator` 对象和 `location` 对象。
- 全局对象限制：Worker 的全局对象 WorkerGlobalScope，不同于网页的全局对象 Window，很多接口拿不到。比如，理论上 Worker 线程不能使用 `console.log`，因为标准里面没有提到 Worker 的全局对象存在 `console` 接口，只定义了 Navigator 接口和 Location 接口。不过，浏览器实际上支持 Worker 线程使用 `console.log`，保险的做法还是不使用这个方法。
- 脚本限制：Worker 线程不能执行 `alert()` 方法和 `confirm()` 方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求，[这个页面][functions-and-classes-available-to-web-workers]列出了 Web Workers 可以使用的 Web API。
- 通信联系：Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息完成。

[functions-and-classes-available-to-web-workers]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers

## 结构化克隆算法

结构化克隆算法用于复制复杂的 JavaScript 对象。它在以下场景中被内部使用：

- 调用 [structuredClone] 时。
- 通过 [postMessage] 在 Worker 之间传输数据时。
- 使用 IndexedDB 存储对象时。
- 为其他 API 复制对象时。

结构化克隆算法无法处理下面的情况。

- **函数**对象无法通过结构化克隆算法进行复制，否则会抛出 DataCloneError 异常。
- 克隆 **DOM 节点**会抛出 DataCloneError 异常。
- 某些对象属性无法保留，比如：
  - RegExp 对象的 `lastIndex` 属性。
  - 属性描述符、`setter`、`getter` 以及类似的元数据特性不会被复制。比如，如果一个对象通过属性描述符被标记为只读，在复制后的对象中它将变为可读/可写，因为这是默认的状态。
  - 原型链不会被遍历或复制。
  - 类的私有属性不会被复制（内置类型的内部字段可能会被复制）。

[structuredClone]: https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope/structuredClone
[postMessage]: https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage

## 可转移对象

可转移对象（Transferable objects）是指那些可以从一个上下文转移到另一个上下文的对象，这种机制能够确保资源在任意时刻只在一个上下文中可用。转移完成后，原始对象将不再可用；它不再指向已转移的资源，任何尝试读取或写入该对象的操作都会抛出异常。

可转移对象通常用于共享那些一次只能安全地暴露给单个 JavaScript 线程的资源。例如，ArrayBuffer 是一个拥有内存块的可转移对象。当这样的缓冲区在线程之间转移时，关联的内存资源会从原始缓冲区分离，并附加到新线程中创建的缓冲区对象上。原始线程中的缓冲区对象不再可用，因为它不再拥有内存资源。

转移也可以在创建对象的深度副本时使用，比如通过 `structuredClone()`。克隆操作完成后，转移的资源会被移动（而不是复制）到克隆对象中。
对于 `postMessage()` 和 `structuredClone()`，转移的资源必须附加到数据对象上，否则它们在接收端将不可用，因为可转移数组只指示某些资源应该如何发送，但实际上并不发送它们（尽管它们总是会被分离）。

用于转移对象资源的机制取决于对象类型。例如，当 ArrayBuffer 在线程之间转移时，它指向的内存资源会在上下文之间进行字面意义上的移动，这是一个快速高效的零拷贝操作。其他对象可能通过复制关联资源，然后从旧上下文中删除它来进行转移。

并非所有对象都是可转移的。[这个页面][transferable-objects]提供了一个可转移对象的列表。

下面的代码演示了从主线程向 Worker 线程发送消息时转移是如何工作的。Uint8Array 在 Worker 中被复制（重复），而其缓冲区被转移。转移后，任何尝试从主线程读取或写入 `uInt8Array` 的操作都会抛出异常，但仍然可以检查 `byteLength` 来确认它是否为零。

```javascript
const uInt8Array = new Uint8Array(1024 * 1024 * 8).map((v, i) => i);
uInt8Array.byteLength // 8388608

worker.postMessage(uInt8Array, [uInt8Array.buffer]);
uInt8Array.byteLength // 0
```

注意，类型化数组（如 Int32Array 和 Uint8Array）是可序列化的，但不可转移。然而，它们底层的缓冲区是一个 ArrayBuffer，而 ArrayBuffer 是一个可转移对象。我们可以在 `data` 参数中发送 `uInt8Array.buffer`，但不能在转移数组中发送 `uInt8Array`。

下面的代码展示了一个 `structuredClone()` 操作，其中底层缓冲区从原始对象复制到克隆对象。

```javascript
const original = new Uint8Array(1024);
const clone = structuredClone(original);
original.byteLength // 1024
clone.byteLength // 1024

original[0] = 1;
clone[0] // 0

// 尝试转移 Uint8Array 会抛出异常，因为它不是一个可转移对象
// const transferred = structuredClone(original, {transfer: [original]});

// 但是 Uint8Array.buffer 是可转移的
const transferred = structuredClone(original, { transfer: [original.buffer] });
transferred.byteLength // 1024
transferred[0] // 1

// 转移后，Uint8Array.buffer 无法使用
original.byteLength // 0
```

[transferable-objects]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#supported_objects

## Worker

### Worker 基本使用

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

#### Worker 实例方法

##### `postMessage()`

主线程和 Worker 线程之间的通信，通过 `postMessage()` 进行。

```javascript
worker.postMessage(message)
worker.postMessage(message, transfer)
worker.postMessage(message, options)
```

- `message` 向对方发送的数据，可以是任意类型（受[结构化克隆算法]的限制），如果是对象，会被[结构化克隆算法]处理。在接收端，通过回调函数的 `event.data` 来获取。该参数必须指定，如果没有数据要发送，可指定为 `null` 或者 `undefined`。
- `transfer` 可选的可转移对象数组，用于将当前上下文环境中的对象，转移到目标上下文，一旦转移完成，这些对象在当前上下文就不可用。注意，这些对象必须挂载到第一个参数对象中。
- `options` 可选的配置对象，该对象只有一个 `transfer` 属性，其作用跟上面的 `transfer` 一致。

[结构化克隆算法]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm

##### `terminate()`

`terminate()` 方法终止 Worker 的执行，该方法会立即执行，如果此时有数据传输，传输会被终止。

```javascript
worker.terminate()
```

注意，该方法是 Worker 实例方法，只能通过 `worker.terminate()` 执行，在 Worker 脚本内部，可以通过执行 `self.close()` 关闭 Worker。

#### Worker 中的事件

(1) `message`

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
- `source` 发送方的引用。
- `ports` 一个 MessagePort 对象数组，表示发送消息的端口。
- `lastEventId` 事件 ID 字符串。

(2) `error`

`error` 事件在通信过程发生错误时触发。

(3) `messageerror`

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

上面的代码在主线程创建了一个 Worker 实例，之后向 Worker 线程发送了一条消息，通信完成后，要执行 `worker.terminate()` 方法关闭 Worker。

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

`importScripts()` 导入的模块按任意顺序下载，但会按顺序执行，这些模块同步执行，之后继续往下执行。

### Worker 特殊例子

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

Worker 线程内部还能再新建 Worker 线程（目前只有 Firefox 浏览器支持）。下面的例子将一个计算密集的任务，分配到 10 个 Worker。

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
for (var i = 0; i <   ; i += 1) {
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

### Worker 应用场景

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
  // ...
};

// Worker 线程 - data-processor.js
self.onmessage = function (event) {
  const processedData = processData(event.data);
  self.postMessage(processedData);
};
```

#### 文件处理

Worker 线程也可以用来处理各种文件，比如图片、PDF 文件、大文件分片上传等。

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

另外一个常见的场景是，需要持续获取服务器数据或进行实时同步的场景。下面的例子演示了浏览器如何使用 Worker 轮询服务器状态。

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

SharedWorker 是一种特殊的 Web Worker，允许多个页面、标签页或 iframe 共享同一个 Worker 实例。与普通的 Worker 不同，SharedWorker 可以在多个上下文之间共享，实现**跨页面的数据共享和通信**。

一旦创建了 SharedWorker，同一源中的任何脚本都可以获得对该 SharedWorker 的引用并与它通信。只要其全局作用域的所有者集合（Document 和 WorkerGlobalScope 对象的集合）不为空，共享 Worker 就会保持活跃状态（例如，如果有任何活跃页面持有对它的引用，可能是通过 `new SharedWorker()` 创建的）。

### SharedWorker 基本使用

#### 构造函数

`SharedWorker()` 构造函数用于创建一个指定了特定 Worker URL 地址的实例对象。当多个页面使用相同的 URL 创建 SharedWorker 时，浏览器会复用同一个 SharedWorker 实例，所有连接到这个 SharedWorker 的页面共享同一个 worker 线程和内存空间。

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

SharedWorker 脚本中，使用 `onconnect` 回调函数连接到 Worker 的端口（port）。当在其他页面使用相同 URL 时创建 Worker 实例时，浏览器复用现有实例，并触发 `connect` 事件。

```javascript
// shared-worker.js
const connections = [];

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

### SharedWorker 应用场景

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

## WorkerGlobalScope

## DedicatedWorkerGlobalScope

## WorkerLocation

## SharedWorkerGlobalScope

## 参考

- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)，MDN
- [Web Worker](https://wangdoc.com/javascript/bom/webworker)，阮一峰
- [The structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)，MDN
- [Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)，MDN
- [WorkerGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/WorkerGlobalScope)，MDN
- [DedicatedWorkerGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope)，MDN
- [WorkerLocation](https://developer.mozilla.org/en-US/docs/Web/API/WorkerLocation)，MDN
- [SharedWorkerGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorkerGlobalScope)，MDN
