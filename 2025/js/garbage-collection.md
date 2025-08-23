# JavaScript 垃圾回收机制详解

## 一、概述

JavaScript 的垃圾回收（Garbage Collection，GC）是一种自动内存管理机制，它会自动识别和清理不再使用的内存，避免内存泄漏。与手动内存管理的语言（如 C/C++）不同，JavaScript 开发者不需要手动分配和释放内存。

## 二、垃圾回收的基本原理

### 2.1 可达性（Reachability）

垃圾回收的核心概念是**可达性**。一个对象被认为是"可达的"，当且仅当它可以通过以下方式之一被访问到：

1. **根对象（Roots）**：全局对象、当前执行上下文中的变量
2. **引用链**：从根对象出发，通过对象引用能够访问到的所有对象

```javascript
// 示例：可达性
let user = {
  name: "John"
};

// user 对象是可达的（通过全局变量引用）
let admin = user; // admin 也引用同一个对象

user = null; // 虽然 user 不再引用对象，但 admin 仍然引用它
// 对象仍然是可达的

admin = null; // 现在没有任何引用指向该对象
// 对象变为不可达，将被垃圾回收
```

### 2.2 垃圾回收的触发时机

垃圾回收通常在以下情况下触发：

1. **内存不足时**：当可用内存低于某个阈值
2. **周期性触发**：定期执行垃圾回收
3. **手动触发**：某些情况下可以手动触发（不推荐）

## 三、主要的垃圾回收算法

### 3.1 标记-清除算法（Mark and Sweep）

这是最常用的垃圾回收算法，分为两个阶段：

#### 标记阶段（Mark）
从根对象开始，递归遍历所有可达对象，并标记它们为"活跃"。

#### 清除阶段（Sweep）
遍历整个堆内存，回收所有未被标记的对象。

```javascript
// 标记-清除算法的简化示例
function markAndSweep() {
  // 标记阶段
  function mark(obj) {
    if (obj && !obj.marked) {
      obj.marked = true;
      // 递归标记所有引用的对象
      for (let key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
          mark(obj[key]);
        }
      }
    }
  }
  
  // 从根对象开始标记
  mark(globalObject);
  
  // 清除阶段
  function sweep() {
    // 遍历堆内存，清除未标记的对象
    // 重置已标记对象的标记
  }
}
```

**优点**：
- 能够处理循环引用
- 实现相对简单

**缺点**：
- 会产生内存碎片
- 在标记阶段需要暂停程序执行

### 3.2 引用计数算法（Reference Counting）

通过跟踪每个对象的引用次数来判断对象是否应该被回收。

```javascript
// 引用计数的简化示例
class ReferenceCountedObject {
  constructor() {
    this.refCount = 0;
  }
  
  addRef() {
    this.refCount++;
  }
  
  release() {
    this.refCount--;
    if (this.refCount === 0) {
      // 回收对象
      this.destroy();
    }
  }
}
```

**优点**：
- 实时性好，引用计数为0时立即回收
- 不会产生长时间的程序暂停

**缺点**：
- 无法处理循环引用
- 引用计数的开销较大

### 3.3 分代垃圾回收（Generational Garbage Collection）

基于对象存活时间的假设：大多数对象在创建后很快就会被回收，只有少数对象会存活较长时间。

#### 分代策略
- **新生代（Young Generation）**：存放新创建的对象
- **老生代（Old Generation）**：存放存活时间较长的对象

#### 复制算法（Copying）
用于新生代的垃圾回收：

```javascript
// 复制算法的简化示例
class CopyingGC {
  constructor() {
    this.fromSpace = []; // 使用空间
    this.toSpace = [];   // 空闲空间
  }
  
  copy() {
    // 1. 标记活跃对象
    // 2. 将活跃对象从 fromSpace 复制到 toSpace
    // 3. 交换 fromSpace 和 toSpace
  }
}
```

#### 标记-整理算法（Mark and Compact）
用于老生代的垃圾回收，在标记-清除的基础上增加整理阶段，减少内存碎片。

### 3.4 增量垃圾回收（Incremental Garbage Collection）

将垃圾回收过程分解为多个小步骤，与程序执行交替进行，减少程序暂停时间。

## 四、V8 引擎的垃圾回收机制

### 4.1 V8 的内存结构

```
V8 堆内存
├── 新生代（New Space）
│   ├── From Space
│   └── To Space
├── 老生代（Old Space）
├── 大对象空间（Large Object Space）
└── 代码空间（Code Space）
```

### 4.2 新生代垃圾回收（Scavenge）

- 使用复制算法
- 空间大小通常为 1-8MB
- 回收频率高，速度快

### 4.3 老生代垃圾回收

- 使用标记-清除和标记-整理算法
- 空间大小通常为几百MB到几GB
- 回收频率低，但耗时较长

### 4.4 垃圾回收的优化策略

#### 写屏障（Write Barrier）
在对象引用更新时记录跨代引用，避免扫描整个老生代。

#### 并发标记（Concurrent Marking）
在程序执行的同时进行标记，减少暂停时间。

## 五、内存泄漏的常见原因

### 5.1 全局变量

```javascript
// 错误示例
function createUser() {
  user = { name: "John" }; // 没有 var/let/const，成为全局变量
}

// 正确示例
function createUser() {
  let user = { name: "John" };
  return user;
}
```

### 5.2 闭包

```javascript
// 可能导致内存泄漏的闭包
function createLeakyClosure() {
  const largeData = new Array(1000000).fill('data');
  
  return function() {
    console.log(largeData.length); // 闭包持有 largeData 的引用
  };
}

const leakyFunction = createLeakyClosure();
// largeData 不会被回收，因为 leakyFunction 持有引用
```

### 5.3 事件监听器

```javascript
// 可能导致内存泄漏的事件监听器
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    console.log('clicked');
  }
  
  // 忘记移除事件监听器
  destroy() {
    // 应该在这里移除事件监听器
    // document.removeEventListener('click', this.handleClick);
  }
}
```

### 5.4 定时器

```javascript
// 可能导致内存泄漏的定时器
class Timer {
  constructor() {
    this.timer = setInterval(() => {
      console.log('tick');
    }, 1000);
  }
  
  // 忘记清除定时器
  destroy() {
    // 应该在这里清除定时器
    // clearInterval(this.timer);
  }
}
```

### 5.5 DOM 引用

```javascript
// 可能导致内存泄漏的 DOM 引用
class DOMReference {
  constructor() {
    this.element = document.getElementById('myElement');
    this.data = new Array(1000000).fill('data');
  }
  
  destroy() {
    // 只移除 DOM 元素，但 data 仍然被引用
    this.element.remove();
    // 应该设置为 null
    // this.data = null;
  }
}

## 六、内存管理的最佳实践

### 6.1 及时清理引用

```javascript
// 好的实践
class GoodComponent {
  constructor() {
    this.data = new Array(1000000).fill('data');
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick);
  }
  
  handleClick() {
    console.log('clicked');
  }
  
  destroy() {
    // 清理所有引用
    document.removeEventListener('click', this.handleClick);
    this.data = null;
    this.handleClick = null;
  }
}
```

### 6.2 使用 WeakMap 和 WeakSet

```javascript
// 使用 WeakMap 避免内存泄漏
const cache = new WeakMap();

function expensiveOperation(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  const result = /* 昂贵的计算 */;
  cache.set(obj, result);
  return result;
}

// 当 obj 被垃圾回收时，cache 中的条目也会被自动清理
```

### 6.3 避免循环引用

```javascript
// 避免循环引用
class Parent {
  constructor() {
    this.children = [];
  }
  
  addChild(child) {
    this.children.push(child);
    child.parent = this; // 创建循环引用
  }
  
  destroy() {
    // 清理循环引用
    this.children.forEach(child => {
      child.parent = null;
    });
    this.children = null;
  }
}
```

### 6.4 使用对象池

```javascript
// 对象池模式
class ObjectPool {
  constructor(createFn, resetFn) {
    this.pool = [];
    this.createFn = createFn;
    this.resetFn = resetFn;
  }
  
  get() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// 使用示例
const pool = new ObjectPool(
  () => new Array(1000), // 创建函数
  (arr) => arr.length = 0 // 重置函数
);
```

## 七、调试和监控内存使用

### 7.1 Chrome DevTools

```javascript
// 在控制台中查看内存使用情况
console.log(performance.memory);

// 手动触发垃圾回收（仅在开发模式下有效）
if (window.gc) {
  window.gc();
}
```

### 7.2 内存泄漏检测

```javascript
// 简单的内存泄漏检测
class MemoryLeakDetector {
  constructor() {
    this.objects = new WeakSet();
  }
  
  track(obj) {
    this.objects.add(obj);
  }
  
  isTracked(obj) {
    return this.objects.has(obj);
  }
}

const detector = new MemoryLeakDetector();

// 跟踪对象
const obj = { data: 'test' };
detector.track(obj);

// 检查对象是否被跟踪
console.log(detector.isTracked(obj)); // true
```

### 7.3 性能监控

```javascript
// 监控内存使用
class MemoryMonitor {
  constructor() {
    this.startMemory = performance.memory.usedJSHeapSize;
    this.interval = setInterval(() => {
      this.checkMemory();
    }, 1000);
  }
  
  checkMemory() {
    const currentMemory = performance.memory.usedJSHeapSize;
    const diff = currentMemory - this.startMemory;
    
    if (diff > 10 * 1024 * 1024) { // 10MB
      console.warn('Memory usage increased significantly:', diff / 1024 / 1024, 'MB');
    }
  }
  
  stop() {
    clearInterval(this.interval);
  }
}
```

## 八、总结

JavaScript 的垃圾回收机制是一个复杂但重要的主题。理解其工作原理有助于：

1. **避免内存泄漏**：识别和修复常见的内存泄漏问题
2. **优化性能**：减少垃圾回收的频率和影响
3. **提高代码质量**：编写更高效、更可靠的内存管理代码

虽然垃圾回收是自动的，但开发者仍然需要了解其工作原理，并遵循最佳实践来确保应用程序的内存使用效率。
``` 