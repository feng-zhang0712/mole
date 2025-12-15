# JavaScript 执行1000万任务：性能优化与防卡顿策略详解

## 核心优化策略

### 1. 异步执行 - 避免阻塞主线程

#### 1.1 使用 setTimeout/setInterval

```javascript
// 异步执行 - 不阻塞主线程
const asyncExecute = (tasks) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    
    const processNext = () => {
      // 每次处理一批任务
      const batchSize = 1000;
      const endIndex = Math.min(index + batchSize, tasks.length);
      
      for (let i = index; i < endIndex; i++) {
        results.push(processTask(tasks[i]));
      }
      
      index = endIndex;
      
      if (index < tasks.length) {
        // 使用 setTimeout 让出主线程
        setTimeout(processNext, 0);
      } else {
        resolve(results);
      }
    };
    
    processNext();
  });
};
```

#### 1.2 使用 requestAnimationFrame
```javascript
// 基于帧率的异步执行
const frameBasedExecute = (tasks) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    
    const processFrame = () => {
      const startTime = performance.now();
      const frameTime = 16; // 60fps = 16ms per frame
      
      // 在每帧内处理尽可能多的任务
      while (index < tasks.length && (performance.now() - startTime) < frameTime) {
        results.push(processTask(tasks[index]));
        index++;
      }
      
      if (index < tasks.length) {
        requestAnimationFrame(processFrame);
      } else {
        resolve(results);
      }
    };
    
    requestAnimationFrame(processFrame);
  });
};
```

#### 1.3 使用 MessageChannel
```javascript
// 使用 MessageChannel 实现真正的异步
const channelExecute = (tasks) => {
  return new Promise((resolve) => {
    const results = [];
    let index = 0;
    
    const channel = new MessageChannel();
    const port1 = channel.port1;
    const port2 = channel.port2;
    
    port1.onmessage = () => {
      const batchSize = 1000;
      const endIndex = Math.min(index + batchSize, tasks.length);
      
      for (let i = index; i < endIndex; i++) {
        results.push(processTask(tasks[i]));
      }
      
      index = endIndex;
      
      if (index < tasks.length) {
        port2.postMessage('continue');
      } else {
        resolve(results);
      }
    };
    
    port2.postMessage('start');
  });
};
```

### 2. Web Workers - 多线程处理

#### 2.1 基础 Web Worker 实现
```javascript
// main.js - 主线程
const workerExecute = (tasks) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker('task-worker.js');
    const results = [];
    
    // 分批发送任务
    const batchSize = 10000;
    let currentBatch = 0;
    
    const sendBatch = () => {
      const startIndex = currentBatch * batchSize;
      const endIndex = Math.min(startIndex + batchSize, tasks.length);
      const batch = tasks.slice(startIndex, endIndex);
      
      worker.postMessage({
        type: 'process',
        tasks: batch,
        batchIndex: currentBatch
      });
      
      currentBatch++;
    };
    
    worker.onmessage = (e) => {
      const { type, results: batchResults, batchIndex } = e.data;
      
      if (type === 'complete') {
        results[batchIndex] = batchResults;
        
        if (currentBatch * batchSize < tasks.length) {
          sendBatch();
        } else {
          // 所有批次完成
          const finalResults = results.flat();
          worker.terminate();
          resolve(finalResults);
        }
      }
    };
    
    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };
    
    sendBatch();
  });
};

// task-worker.js - Worker线程
self.onmessage = function(e) {
  const { type, tasks, batchIndex } = e.data;
  
  if (type === 'process') {
    const results = tasks.map(task => processTask(task));
    
    self.postMessage({
      type: 'complete',
      results: results,
      batchIndex: batchIndex
    });
  }
};

function processTask(task) {
  // 在Worker中处理任务
  return task * 2; // 示例处理逻辑
}
```

#### 2.2 多Worker并行处理
```javascript
// 使用多个Worker并行处理
const multiWorkerExecute = (tasks, workerCount = 4) => {
  return new Promise((resolve, reject) => {
    const workers = [];
    const results = new Array(workerCount);
    let completedWorkers = 0;
    
    // 创建多个Worker
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker('task-worker.js');
      workers.push(worker);
      
      worker.onmessage = (e) => {
        const { type, results: workerResults, workerIndex } = e.data;
        
        if (type === 'complete') {
          results[workerIndex] = workerResults;
          completedWorkers++;
          
          if (completedWorkers === workerCount) {
            // 所有Worker完成
            workers.forEach(w => w.terminate());
            resolve(results.flat());
          }
        }
      };
      
      worker.onerror = (error) => {
        workers.forEach(w => w.terminate());
        reject(error);
      };
    }
    
    // 分配任务给各个Worker
    const tasksPerWorker = Math.ceil(tasks.length / workerCount);
    
    workers.forEach((worker, index) => {
      const startIndex = index * tasksPerWorker;
      const endIndex = Math.min(startIndex + tasksPerWorker, tasks.length);
      const workerTasks = tasks.slice(startIndex, endIndex);
      
      worker.postMessage({
        type: 'process',
        tasks: workerTasks,
        workerIndex: index
      });
    });
  });
};
```

### 3. 分批处理 - 控制内存使用

#### 3.1 流式处理
```javascript
// 流式处理大量数据
const streamProcess = async (tasks, batchSize = 1000) => {
  const results = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  return results;
};

const processBatch = (batch) => {
  return new Promise((resolve) => {
    const results = batch.map(task => processTask(task));
    resolve(results);
  });
};
```

#### 3.2 内存管理
```javascript
// 内存友好的处理方式
const memoryEfficientProcess = (tasks) => {
  const results = [];
  const maxMemoryUsage = 100 * 1024 * 1024; // 100MB限制
  
  let currentMemory = 0;
  let index = 0;
  
  const processWithMemoryCheck = () => {
    const startTime = performance.now();
    
    while (index < tasks.length && (performance.now() - startTime) < 16) {
      const result = processTask(tasks[index]);
      results.push(result);
      
      // 估算内存使用
      currentMemory += estimateMemoryUsage(result);
      
      if (currentMemory > maxMemoryUsage) {
        // 内存使用过高，清理并暂停
        results.splice(0, Math.floor(results.length / 2));
        currentMemory = Math.floor(currentMemory / 2);
        break;
      }
      
      index++;
    }
    
    if (index < tasks.length) {
      setTimeout(processWithMemoryCheck, 0);
    }
  };
  
  processWithMemoryCheck();
  return results;
};
```

### 4. 任务调度优化

#### 4.1 优先级调度
```javascript
// 基于优先级的任务调度
class PriorityTaskScheduler {
  constructor() {
    this.highPriorityTasks = [];
    this.normalPriorityTasks = [];
    this.lowPriorityTasks = [];
    this.isProcessing = false;
  }
  
  addTask(task, priority = 'normal') {
    switch (priority) {
      case 'high':
        this.highPriorityTasks.push(task);
        break;
      case 'low':
        this.lowPriorityTasks.push(task);
        break;
      default:
        this.normalPriorityTasks.push(task);
    }
    
    if (!this.isProcessing) {
      this.processTasks();
    }
  }
  
  async processTasks() {
    this.isProcessing = true;
    
    while (this.hasTasks()) {
      const task = this.getNextTask();
      if (task) {
        await this.processTask(task);
      }
      
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.isProcessing = false;
  }
  
  hasTasks() {
    return this.highPriorityTasks.length > 0 || 
           this.normalPriorityTasks.length > 0 || 
           this.lowPriorityTasks.length > 0;
  }
  
  getNextTask() {
    if (this.highPriorityTasks.length > 0) {
      return this.highPriorityTasks.shift();
    } else if (this.normalPriorityTasks.length > 0) {
      return this.normalPriorityTasks.shift();
    } else {
      return this.lowPriorityTasks.shift();
    }
  }
  
  async processTask(task) {
    // 处理单个任务
    return task();
  }
}
```

#### 4.2 时间片调度
```javascript
// 基于时间片的任务调度
class TimeSliceScheduler {
  constructor(timeSlice = 5) {
    this.timeSlice = timeSlice; // 5ms时间片
    this.tasks = [];
    this.isProcessing = false;
  }
  
  addTasks(tasks) {
    this.tasks.push(...tasks);
    if (!this.isProcessing) {
      this.processTasks();
    }
  }
  
  async processTasks() {
    this.isProcessing = true;
    
    while (this.tasks.length > 0) {
      const startTime = performance.now();
      
      // 在时间片内处理任务
      while (this.tasks.length > 0 && (performance.now() - startTime) < this.timeSlice) {
        const task = this.tasks.shift();
        await this.processTask(task);
      }
      
      // 时间片用完，让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.isProcessing = false;
  }
  
  async processTask(task) {
    return task();
  }
}
```

### 5. 缓存与优化

#### 5.1 结果缓存
```javascript
// 使用缓存避免重复计算
class TaskCache {
  constructor(maxSize = 10000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // 清理最旧的缓存
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  has(key) {
    return this.cache.has(key);
  }
}

const cachedProcess = (tasks) => {
  const cache = new TaskCache();
  const results = [];
  
  for (const task of tasks) {
    const cacheKey = JSON.stringify(task);
    
    if (cache.has(cacheKey)) {
      results.push(cache.get(cacheKey));
    } else {
      const result = processTask(task);
      cache.set(cacheKey, result);
      results.push(result);
    }
  }
  
  return results;
};
```

#### 5.2 预计算优化
```javascript
// 预计算常用结果
class PrecomputeOptimizer {
  constructor() {
    this.precomputed = new Map();
    this.precomputeCommonTasks();
  }
  
  precomputeCommonTasks() {
    // 预计算常见的任务结果
    const commonTasks = [1, 2, 3, 4, 5, 10, 100, 1000];
    
    for (const task of commonTasks) {
      this.precomputed.set(task, processTask(task));
    }
  }
  
  processTask(task) {
    if (this.precomputed.has(task)) {
      return this.precomputed.get(task);
    }
    
    return processTask(task);
  }
}
```

## 实际应用示例

### 完整的大规模任务处理系统
```javascript
class LargeScaleTaskProcessor {
  constructor(options = {}) {
    this.options = {
      batchSize: 1000,
      workerCount: 4,
      timeSlice: 5,
      maxMemoryUsage: 100 * 1024 * 1024,
      ...options
    };
    
    this.monitor = new PerformanceMonitor();
    this.debugger = new TaskDebugger();
    this.cache = new TaskCache();
    this.scheduler = new TimeSliceScheduler(this.options.timeSlice);
  }
  
  async processTasks(tasks) {
    this.monitor.start();
    this.debugger.log('开始处理任务', { taskCount: tasks.length });
    
    try {
      // 根据任务数量选择处理策略
      if (tasks.length < 10000) {
        return await this.processSmallBatch(tasks);
      } else if (tasks.length < 100000) {
        return await this.processMediumBatch(tasks);
      } else {
        return await this.processLargeBatch(tasks);
      }
    } catch (error) {
      this.debugger.error(error, { taskCount: tasks.length });
      throw error;
    } finally {
      const report = this.monitor.end();
      this.debugger.log('任务处理完成', report);
    }
  }
  
  async processSmallBatch(tasks) {
    // 小批量任务：直接异步处理
    return await this.asyncExecute(tasks);
  }
  
  async processMediumBatch(tasks) {
    // 中批量任务：使用时间片调度
    return await this.scheduler.processTasks(tasks);
  }
  
  async processLargeBatch(tasks) {
    // 大批量任务：使用Web Workers
    return await this.multiWorkerExecute(tasks);
  }
  
  async asyncExecute(tasks) {
    const results = [];
    const batchSize = this.options.batchSize;
    
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await this.processBatch(batch);
      results.push(...batchResults);
      
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    return results;
  }
  
  async processBatch(batch) {
    return batch.map(task => this.processTask(task));
  }
  
  processTask(task) {
    // 检查缓存
    const cacheKey = JSON.stringify(task);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 处理任务
    const result = this.executeTask(task);
    
    // 缓存结果
    this.cache.set(cacheKey, result);
    
    return result;
  }
  
  executeTask(task) {
    // 实际的任务执行逻辑
    return task * 2; // 示例
  }
  
  async multiWorkerExecute(tasks) {
    // 多Worker并行处理实现
    // ... (前面已实现)
  }
}

// 使用示例
const processor = new LargeScaleTaskProcessor({
  batchSize: 1000,
  workerCount: 4,
  timeSlice: 5
});

// 处理1000万个任务
const tasks = Array.from({ length: 10000000 }, (_, i) => i);
const results = await processor.processTasks(tasks);
```











如何统计用户访问数据？比如PV、UV
如何判断DOM元素是否在可视范围内？
如何通过设置失效时间清除本地数据？
不使用脚手架，如何用webpack搭建一个react项目？详细分析每一步的流程。
package.json中有哪些属性？每个属性作用是什么？原理是什么？详细列出这些所有的属性。
package.json中的sideEffects属性是什么？有什么作用？原理是什么？
`<script>` `<link>` `<meta>` 标签有哪些属性？每个属性作用是什么？
为什么SPA应用都会提供一个hash路由？
如何进行路由变化监听？
react-router和原生路由区别是什么？react-router实现原理是什么？
单点登录是什么？它的提出是为了解决什么问题？实际开发中，单点登录实现的具体流程是什么？
实际开发中，页面白屏的原因有哪些？如何排查？如何解决
如何实现大对象深度对比？
如何理解数据驱动视图？有哪些核心要素？
ESLint 代码检测原理是什么？过程是什么？
DocumentFragment API是什么？有哪些使用场景？
-git pull vs git fetch
- 如何解决递归导致的栈溢出问题
- 站点防爬虫
- 不同窗口通信方式有哪些
- 表单校验时，如何让页面滚动到报错位置
- 如何一次性渲染10w条数据且不卡顿
- webpack 打包时，hash是如何生成的
- js加载会阻塞浏览器渲染吗
- 浏览器队头阻塞优化
- webpack 中通过script引入资源，在项目中如何处理？
- 应用上线后，如何通知用户刷新页面？
- 常见的登录鉴权方式有哪些？token进行身份验证了解多少？
- 需要在跨域请求时，携带另外一个域名的cookie 如何处理？
- 封装一个请求超时重试的代码
- 前端如何设置请求超时时间？
- node如何利用多核cpu
- 后端一次性返回的树形结构数据太大，前端如何处理
- 组件封装如何做？遵守哪些原则？
- 前端日志埋点设计思路
- 前端应用如何进行权限设计？
- indexdb存储空间大小如何约束？
- webpack如何打包运行时chunk？项目工程中如何去加载这个运行时chunk？
- react避免不必要渲染的方法
- 全局样式冲突和覆盖有哪些解决思路
- react如何实现转场动画？



实现扫码登录项目，要求：
1. 包括客户端和服务器端代码，客户端使用 react、webpack、javascript、Airbnb代码规范、BEM命名规范，服务端使用node、express、mongo、mongoose。
2. 模拟真实的项目开发环境，考虑到各种安全方面问题，比如二维码生命周期管理、实时状态同步、身份验证安全、会话管理安全、数据传输安全、Token存储安全等。
3. 整个流程按照这个图片的流程进行设计。

