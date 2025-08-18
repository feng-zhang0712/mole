# 文件上传

## 一、介绍

文件上传功能的实现，依赖于浏览的拖拽（Drag and Drop）接口。

## 二、浏览器拖拽 API

拖拽功能相关的接口有四个，分别是 `DragEvent`、`DataTransfer`、`DataTransferItem` 和 `DataTransferItemList`，下面分别进行介绍。

### 2.1 `DragEvent`

`DragEvent` 接口用于操作拖拽过程中元素之间的交互，该接口继承自 `MouseEvent` 和 `Event` 接口。

```text
Event <- MouseEvent <- DragEvent
```

#### 2.1.1 构造函数

`DragEvent` 作为构造函数，可以用来创建一个合成的拖拽事件对象。实际上，不可能通过该构造函数创建一个可用的 `DataTransfer` 对象，`DataTransfer` 对象用于保存拖拽过程中的一些上下文数据，而这些数据是无法通过简单地执行 `DragEvent` 接口来创建的。所以，不应该使用此构造函数创建拖拽对象。

```javascript
new DragEvent(type, options)
```

`DragEvent` 构造函数可以接受两个参数。

- `type`：字符串，表示事件名称。比如 `dragstart`、`dragend` 等。
- `options` ：可选的配置对象，仅有一个 `dataTransfer` 属性，该属性为 `DataTransfer` 类型。默认值为 `null`。

#### 2.1.2 属性

`DragEvent` 对象仅有一个 `dataTransfer` 属性，该属性保存拖拽过程中的数据。

```javascript
document.addEventListener(
  'dragend',
  function (event) {
    if (event.dataTransfer) {
      //...
    };
  },
  false,
);
```

#### 2.1.3 拖拽事件

对象拖拽过程中，会触发一系列的事件，拖拽过程的处理，就是通过设置相应的监听事件，操作被拖拽的节点和目标容器。元素节点和文本信息都可以被拖拽，这里以节点统一指代两者。

- `dragstart` 拖拽开始时，在被拖拽的节点上触发。通常在这个事件的监听函数中，指定拖拽的数据 `dataTransfer`。

  注意，`dragstart`、`dragend` 和 `drag` 事件回调函数中 `event` 对象的 `target` 属性都指向被拖拽的节点。

  ```javascript
  document.addEventListener('dragstart',
    function (event) {
      // event.target 指向被拖拽的对象
    }
  );
  ```

- `drag` 对象被拖拽过程中触发，该事件会频繁触发。
- `dragend` 拖拽结束时（释放鼠标按钮或按下 ESC 键）在被拖拽的节点上触发。不管拖拽是否跨窗口，或者中途被取消，`dragend` 事件总是会触发。
- `dragenter` 被拖拽的节点进入某个有效的容器时触发，该事件只会触发一次。该事件一般有两个作用：

  1. 指定是否允许被拖拽的节点在当前容器放下（`drop`），如果当前节点没有该事件的监听函数，或者监听函数不执行任何操作，就意味着该元素不接受任何拖拽支持。
  2. 在元素可以被放下的前提下，设置目标容器的外观，从而提示用户被拖拽的元素已经入可放置的范围。

  注意，`dragenter`、`dragover` 和 `dragleave` 事件，都需要设置在目标容器上，并且回调函数中 `event` 对象的 `target` 属性，指向目标容器。

- `dragover` 被拖拽的节点处于有效容器的上方时触发，该事件在拖拽过程中会频繁触发。需要在回调函数中执行 `event.preventDefault()` 方法，阻止容器的默认行为。
- `dragleave` 被拖拽的节点离开目标容器时触发。一般在这个事件中重置目标容器的样式。
- `drop` 被拖拽的节点释放到目标容器时触发。需要在回调函数中执行 `event.preventDefault()` 方法，阻止容器的默认行为。

  ```javascript
  target.addEventListener('drop', 
    function (event) => {
     event.preventDefault();

     if (event.target.className === 'dropzone') {
       source.parentNode.removeChild(dragged);
       event.target.appendChild(dragged);
      }
    }
  );
  ```

  注意，如果当前节点不允许 `drop`，即使在该节点上方松开鼠标，也不会触发该事件。如果用户按下 `ESC` 键，取消这个操作，也不会触发该事件。该事件的监听函数负责取出拖拽数据，并进行相关处理。

注意，拖拽事件支持冒泡。

### 2.2 `DataTransfer`

`DataTransfer` 对象用于保存拖拽过程中的数据。

拖拽开始时，数据必须与被拖拽的节点相关联。例如，在文本框中拖拽选定的文本时，与拖拽数据项相关联的数据就是文本本身。类似地，在 Web 页面上拖拽链接时，拖拽数据项就是链接的 URL。

拖拽事件回调函数中的 `event` 对象的 `dataTransfer` 属性，就是 `DataTransfer` 类型。

```javascript
document.addEventListener(
  'dragstart',
  function (event) {
    if (event.dataTransfer) {
      //...
    };
  },
  false,
);
```

#### 2.2.1 构造函数

`DataTransfer` 构造函数用于创建一个 `DataTransfer` 实例对象，该构造函数不接受任何参数。单独创建该对象没有实际意义，并且 IE 不支持该构造函数。

该对象中包含两个信息，数据的类型（或格式）和数据值。数据的类型是一个字符串（例如文本数据的类型是 `text/plain`），数据的值是一个文本字符串。

拖拽开始时，必须设置数据类型和数据值。在拖拽过程中，在 `dragenter` 和 `dragover` 的事件监听程序中，检查数据类型，以确定是否允许放置（`drop`）被拖拽的对象。比如，在只允许放下链接的区域，检查拖拽的数据类型是否为 `text/uri-list`。

发生 `drop` 事件时，监听函数取出拖拽的数据，对其进行处理。

#### 2.2.2 属性

##### （1）`types`

##### （2）`items`

##### （3）`files`

##### （4）`dropEffect`

`dropEffect` 属性用于在目标容器上，设置放置（`drop`）被拖拽节点时的效果，会影响到拖拽经过相关区域时鼠标的形状。可选值如下。

- `copy`：复制被拖拽的节点。
- `move`：移动被拖拽的节点。
- `link`：创建指向被拖拽的节点的链接。
- `none`：无法放下被拖拽的节点。

```javascript
target.addEventListener(
  'dragover', 
  function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
  }
);
```

在 `drop` 和 `dragend` 事件中，通过检查 `dropEffect` 属性，以确定最终选择了哪种效果。比如，如果所选的效果是 `'move'`，那么应该在 `dragend` 事件中从拖拽源头删除拖拽数据。

该属性一般在 `dragenter` 和 `dragover` 事件的监听函数中设置。

##### （5）`effectAllowed`

`effectAllowed` 属性指定拖拽的节点，在拖拽过程中允许设置的效果。该属性有多个可选值。

- `none`：不可以放下被拖拽的节点。
- `copy`：复制被拖拽的节点。
- `copyLink`：允许 `copy` 或 `link` 操作。
- `copyMove`：允许 `copy` 或 `move` 操作。
- `link`：创建指向被拖拽节点的链接。
- `linkMove`：允许`link`或``move` 操作。
- `move`：移动被拖拽的节点。
- `all`：允许所有效果。
- `uninitialized`：默认值，等同于 `all`。

如果某种效果不被允许使用，用户就无法在目标节点中达成这种效果。`effectAllowed` 属性通常与 `dropEffect` 一起使用，前者设置被拖拽节点允许的效果，后者设置目标容器的效果。

```javascript
source.addEventListener(
  'dragstart', 
  function (event) {
    event.dataTransfer.effectAllowed = 'move';
  }
);

target.addEventListener(
  'dragover', 
  function (event) {
    event.dataTransfer.dropEffect = 'move';
  }
);
```

只要 `effectAllowed` 和 `dropEffect` 属性之中，有一个为 `none`，就无法在目标节点上完成 `drop` 操作。

注意，应该在 `dragstart` 中执行这个操作。另外，IE 使用全小写格式（比如，`copyLink` 在 IE 中为 `copylink`）。

#### 2.2.3 方法

##### （1）`getData()`

`getData(format)` 方法用于获取拖拽过程中，携带的特定类型的数据（通常是 `setData()` 方法设置的数据）。该方法返回值是一个字符串，如果没有对应的类型，则返回空字符串。该方法一般在 `drop` 事件中执行。

```javascript
target.addEventListener(
  'drop',
  function (event) {
      event.preventDefault();
      const data = event.dataTransfer.getData('text/plain');
      event.target.textContent = data;
   }
);
```

注意，一定不要忘了执行 `preventDefault()` 方法来取消浏览器的默认行为，因为假如用户拖拽的是一个链接，浏览器默认会在当前窗口打开这个链接。

下面是一个手动处理 `getData()` 方法返回数据的例子。

```javascript
target.addEventListener(
  'drop',
  function (event) {
    event.preventDefault();
    const lines = event.dataTransfer.getData('text/uri-list').split('\n');
    lines
      .filter(line => !line.startsWith('#'))
      .forEach(line => {
        const link = document.createElement('a');
        link.href = line;
        link.textContent = line;
        event.target.appendChild(link);
      });
  }
);
```

可以使用 `'URL'` 关键字，取出第一个有效的链接。

```javascript
const link = event.dataTransfer.getData('URL');
```

下面的例子是从多种类型的数据里面取出数据。

```javascript
function dropHandler(event) {
  event.preventDefault();
  const supportedTypes = [
    'application/x-moz-file',
    'text/uri-list',
    'text/plain',
  ];
  const types = event.dataTransfer.types.filter(type =>
    supportedTypes.includes(type),
  );
  if (types.length) {
    const data = event.dataTransfer.getData(types[0]);
  }
}
```

##### （2）`setData()`

`setData(format, data)` 方法用于设置拖拽事件携带数据的数据类型和数据值。

```javascript
document.addEventListener(
  'dragstart',
  function (event) {
    event.dataTransfer.setData('text/plain', 'Text to drag');
  }
);
```

如果指定类型的数据在 `dataTransfer` 属性不存在，那么这些数据将被加入，否则原有的数据将被新数据替换。

如果是拖拽文本框或者拖拽选中的文本，会默认将对应的文本数据，添加到 `dataTransfer` 属性，不用手动指定。

```javascript
<div draggable="true">
  这里的内容在拖拽时会自动携带
</div>
```

上面代码中，在拖拽这个 `<div>` 元素时，会自动带上文本数据。

拖拽过程中可以包括多种不同类型的数据，对于自定义类型，目标容器不一定支持，这时，提供 `text/plain` 类型的普通文本数据，就相当于提供了一个回退数据，因为这种格式的支持性最好。

```javascript
const dt = event.dataTransfer;
dt.setData('application/x.bookmark', bookmarkString);
dt.setData('text/uri-list', 'http://www.mozilla.org');
dt.setData('text/plain', 'http://www.mozilla.org');
```

上面代码中，通过在同一个事件上面，存放三种类型的数据，使得拖拽事件可以在不同的对象上面，`drop` 不同的值。注意，第一种格式是一个自定义格式，浏览器默认无法读取，这意味着，只有某个部署了特定代码的节点，才可能 `drop`（读取到）这个数据。

##### （3）`clearData()`

`clearData([format])`

##### （4）`setDragImage()`

拖拽发生时，会生成被拖拽目标的一个半透明图像（即触发 `dragstart` 事件的元素），并在拖拽过程中跟踪鼠标指针。这个图像是自动创建的，通常不需要自己创建。当然，也可以使用 `setDragImage()` 方法来自定义这个反馈图像。

`setDragImage()` 方法接受三个参数。

```javascript
setDragImage(imgElement, xOffset, yOffset)
```

- `imgElement`：一个是 `<img>` 或者 `<canvas>` 节点，如果省略或为 `null`，则使用被拖拽的节点的外观。
- `xOffset`：鼠标相对于该图片左上角的横坐标。
- `yOffset`：鼠标相对于该图片左上角的纵坐标。

通常在 `dragstart` 事件处理程序中调用此方法。

```javascript
div.addEventListener(
  'dragstart',
  function (event) {
    const img = new Image();
    img.src = 'example.gif';
    event.dataTransfer.setDragImage(img, 10, 10);
  }
);
```

### 2.3 `DataTransferItem`

`DataTransferItem` 对象表示一个拖拽项。在拖拽过程中，`DragEvent` 的 `dataTransfer` 属性的 `items` 数组中（这个数组的类型是下面要介绍的 `DataTransferItemList`），每一项的类型就是 `DataTransferItem`。

#### 2.3.1 属性

- `type`：字符串，表示被拖拽数据项的类型（格式），该类型通常是 MIME 类型。比如，`text/plain` 和 `text/html`。
- `kind`：表示被拖拽数据项的类型，可选值为 `'file'` 或者 `'string'`。

#### 2.3.2 方法

- `getAsFile()`：如果被拖拽是文件，则返回该文件（`File`）对象，否则返回 `null`。
- `getAsString(callback)`：如果被拖拽节点的 `kind` 属性是字符串（`'string'`），将该字符传入指定的回调函数处理。该方法是异步的，所以需要传入回调函数。

下面这个示例，展示了上面这两个属性和方法的用法。

```javascript
target.addEventListener('drop',
  function (event) {
    event.preventDefault();
    const data = event.dataTransfer.items;
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].kind === 'string' && data[i].type.match('^text/plain')) {
        // 该项目是目标节点
        data[i].getAsString(s => event.target.appendChild(document.getElementById(s)));
      } else if (data[i].kind === 'string' && data[i].type.match('^text/html')) {
        // 拖拽数据项是 HTML
      } else if (
        data[i].kind === 'string' &&
        data[i].type.match('^text/uri-list')
      ) {
        // 拖拽数据项是 URI
      } else if (data[i].kind === 'file' && data[i].type.match('^image/')) {
        // 拖拽数据项是图像文件
        const file = data[i].getAsFile();
      }
    }
  }
)
```

### 2.4 `DataTransferItemList`

`DataTransferItemList` 对象是一个 `DataTransferItem` 对象列表，`DragEvent` 的 `dataTransfer` 属性的 `items` 数组就是 `DataTransferItemList` 类型。该接口主要用来操作 `dataTransfer.items` 数组对象。

#### 2.4.1 属性

- `length`：返回拖拽项列表中成员的数量。

#### 2.4.2 方法

- `add(data, type)` 或者 `add(file)`：向 `dataTransfer.items` 列表中添加一个新的数据项（`DataTransferItem`），前者指定要添加的数据和类型（比如 `text/html` 和 `text/plain`），后者指定要添加的文件。该方法的返回值是被添加的 `DataTransferItem` 对象。
- `remove(index)`：删除 `dataTransfer.items` 列表指定 `index` 位置的数据项。
- `clear()`：清空 `dataTransfer.items` 列表。

下面的示例演示了这两个方法的用法。

```javascript
document.addEventListener('dragstart', 
  function (event) {
    const { items } = event.dataTransfer;
    items.add(event.target.id, 'text/plain');
    items.add('<p>Paragraph…</p>', 'text/html');
    items.add('http://www.example.org', 'text/uri-list');
  }
);

document.addEventListener('dragend', 
  function (event) {
    const { items } = event.dataTransfer;
    for (let i = 0; i < items.length; i++) {
      items.remove(i);
    }
    
    items.clear();
  }
);
```

## 三、拖拽流程

### 3.1 确定拖拽节点

选中的文本、图片和链接默认支持拖拽，不需要做额外的设置。但元素节点默认不支持拖拽，要让元素节点支持拖拽，需要做两件事。

首先，设置其 `draggable` 属性为 `true`。

```javascript
<div draggable="true">
  此区域可拖拽
</div>
```

其次，添加 `dragstart` 事件监听。如下所示。

### 3.2 设置拖拽数据

在 `dragstart` 回调函数中通过 `event.dataTransfer` 属性设置拖拽数据。

```javascript
document.addEventListener(
  'dragstart',
  function (event) {
    event.dataTransfer.setData('text/plain', ev.target.innerText);
    event.dataTransfer.setData('text/html', ev.target.outerHTML);
    event.dataTransfer.setData(
      'text/uri-list',
      event.target.ownerDocument.location.href,
    );
  }
);
```

### 3.3 设置拖拽反馈图像（可选）

当拖拽发生时，会生成被拖拽目标的一个半透明图像（即触发 `dragstart` 事件的元素），并在拖拽过程中跟踪鼠标指针。这个图像是自动创建的，通常不需要自己创建。当然，也可以使用 `setDragImage()` 方法来自定义这个反馈图像。

```javascript
div.addEventListener(
  'dragstart',
  function (event) {
    const img = new Image();
    img.src = 'example.gif';
    event.dataTransfer.setDragImage(img, 10, 10);
  }
);
```

### 3.4 设置拖拽效果（可选）

通过设置 `effectAllowed` 属性指定拖拽过程中允许设置的效果，通过设置 `dropEffect` 属性指定在目标容器上放下（`drop`）被拖拽节点时的效果。

### 3.5 指定放置目标

指定放置目标的方式，不是设置目标容器的某个属性，而是要满足下面的两个条件。

1. 设置目标的 `dragenter` 或者 `dragover` 事件监听。
2. 在事件监听中阻止默认事件，否则默认处理方式不允许放置被拖拽的节点。

```html
<div ondragover="return false"></div>
<div ondragover="event.preventDefault()"></div>

<!-- 或者使用脚本 -->
<script>
  div.addEventListener(
    'dragover',
    function (event) {
      event.preventDefault();
    }
  )
</script>
```

通常来说，好的做法是在事件回调函数中，判断数据类型是否应该被允许放置。如果执行了 `event.preventDefault()` 方法，则表示允许放置，否则表示不允许。

下面的例子通过检查 `dataTransfer` 属性的 `types` 属性来查看哪些类型允许放置。

```javascript
function contains(types, value) {
  for (let i = 0; i < types.length; ++i) {
    if (types[i] === value) return true;
  }
  return false;
}

function doDragOver(event) {
  var isLink = contains(event.dataTransfer.types, 'text/uri-list');
  if (isLink) {
    event.preventDefault();
  }
}
```

上面的代码中，只有 `text/uri-list` 类型的数据被允许方式，其他类型都不允许。

### 3.6 放置反馈（可选）

设置视觉放置反馈的目的，是让用户知道，被拖拽的元素已经进入到了可以放置的区域。反馈的设置有多种方式。

#### 3.6.1 默认情况

默认情况下，鼠标指针将根据 `dropEffect` 属性的值做必要的更新。鼠标指针具体的外观取决于用户平台，典型的如加号图标会出现在 `'copy'` 中，而不允许放置时，会出现禁止放置的图标。在许多情况下，鼠标指针反馈就足够了。

#### 3.6.2 `:-moz-drag-over`

CSS 的 `:-moz-drag-over` 伪类是一个 Mozilla 扩展，用于在触发 `dragover` 事件过程中匹配一个元素。

```css
.drop-area:-moz-drag-over {
  background-color: #f0f8ff;
}
```

上面代码中，当 `drop-area` 元素是一个有效的放置目标时，即在该元素的 `dragenter` 事件中调用 `preventDefault()` 方法时，元素背景色会变为 `#f0f8ff`。

注意， 要使这个伪类生效，必须在 `dragenter` 事件中调用 `preventDefault()` 方法，因为这个伪类状态不会检查 `dragover` 事件（即在 `dragover` 事件中调用 `preventDefault()` 方法不会使伪类生效，尽管这个伪类叫做 `-moz-drag-over`）。

使用 `:-moz-drag-over` 伪类设置的效果会在 `dragleave` 事件触发时被自动移除，也可以在 `dragleave` 事件中移除自定义的视觉反馈，即使拖拽被取消，这个事件也会触发。

#### 3.6.3 自定义判断逻辑

可以通过一个变量，判断目标容器是否触发了 `dragenter` 或者处于 `dragover` 状态，然后根据这个状态，设置对应的视觉反馈。

```jsx
const FileUploader = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  // ...
  return (
    <div
     style={{
       backgroundColor: isDragOver ? "#f0f8ff" : "#fafafa",
     }}
     onDragOver={() => setIsDragOver(true)}
   >
    <input type="file" />
   </div>
  )
}
```

### 3.7 放置

用户放开鼠标，拖拽操作就会结束，如果放置成功，此时就会触发 `drop` 事件。在拖拽过程中，`dataTransfer` 属性一直保存着拖拽数据。可使用 `getData()` 方法来取回数据。

```javascript
target.addEventListener(
  'drop',
  function (event) {
    event.preventDefault();
     const data = event.dataTransfer.getData('text/plain');
     event.target.textContent = data;
   }
);
```

### 3.8 拖拽完成

拖拽完成时，`dragend` 事件会在被拖拽的元素上触发，无论拖拽成功与否，这个事件都会触发。

在这个事件中，仍然可以使用 `dropEffect` 属性来指定执行什么放置操作。比如，如果在 `dragend` 事件中，`dropEffect` 属性值为 `none`，则拖拽会被取消。源头相关的元素也可在这个事件中，从原来的位置移除被拖拽的项目。

`dragend` 事件结束后，整个拖拽操作就完成了。

## 四、文件上传的实现

### 4.1 关键点

文件（特别是大文件）上传过程中，要解决下面这些问题。

- 文件分片上传：将大文件分割成小块（chunks）进行上传，避免单次请求超时和内存溢出
- 断点续传：客户端和服务器都需要记录已上传的文件片段，网络中断后请求服务器获取已上传的数据，从断点处继续上传。
- 文件完整性验证：计算文件 MD5/SHA256 等哈希值，上传完成后服务器验证文件完整性，防止文件损坏或传输错误。
- 上传进度监控：实时显示上传进度条，还可以考虑显示当前上传速度和剩余时间，并提供取消上传功能。
- 并发控制：限制同时上传的文件数量，控制单个文件的并发分片数，避免服务器压力过大。
- 错误处理和重试机制：网络异常时需要自动重试，上传失败的分片要重新上传。
- 内存管理：避免大文件在内存中完整加载，使用流式处理或分片读取，及时释放不需要的内存。
- 用户体验优化：支持拖拽上传，文件类型和大小限制，上传队列管理。
- 安全性考虑：文件类型白名单验证，文件大小限制，防止恶意文件上传。
- 服务器端配合：支持分片上传的接口设计，分片合并和存储策略，临时文件清理机制。

## 参考

- [HTML 拖放 API](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API)，MDN
- [拖拉事件](https://wangdoc.com/javascript/events/drag)，阮一峰
