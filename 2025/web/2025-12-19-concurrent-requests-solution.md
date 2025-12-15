# 页面请求大规模并发问题解决方案

## 问题分析

在实际开发中，大规模并发请求问题主要体现在以下几个方面：

1. 浏览器连接限制：每个域名最多6-8个并发连接，超出限制的请求会被阻塞
2. 服务器资源瓶颈：CPU、内存、数据库连接池限制，无法处理大量并发请求
3. 网络带宽限制：网络I/O成为瓶颈，影响数据传输效率
4. 数据库性能：数据库查询和连接数限制，导致查询超时和连接池耗尽
5. 缓存失效：缓存雪崩导致大量请求直击数据库，造成系统压力

### 并发问题的表现

当系统面临大规模并发请求时，会出现以下典型问题：

- 连接池耗尽：浏览器无法建立新的 HTTP 连接
- 服务器过载：CPU和内存使用率飙升，响应时间急剧增加
- 数据库压力：大量查询导致数据库连接池耗尽，查询超时
- 用户体验下降：页面加载缓慢，功能响应延迟，甚至出现白屏

```javascript
// 同时发起大量请求会导致系统崩溃
const concurrentRequests = async () => {
  const promises = [];
  for (let i = 0; i < 1000; i++) {
    promises.push(fetch(`/api/data/${i}`)); // 同时发起1000个请求
  }
};
```

## 前端解决方案

### 请求队列管理

请求队列管理是解决前端并发问题的核心方案。通过控制同时发起的请求数量，可以有效避免浏览器连接池耗尽，确保系统稳定运行。

核心原理：

- 维护一个请求队列，按优先级排序
- 限制同时执行的请求数量（通常为6-8个）
- 当有请求完成时，自动处理队列中的下一个请求
- 支持请求优先级，重要请求优先执行

```javascript
// 请求队列管理器 - 控制并发请求数量，避免浏览器连接池耗尽
const createRequestQueueManager = (options = {}) => {
  const maxConcurrent = options.maxConcurrent || 6; // 最大并发数
  const queue = []; // 等待队列
  const running = []; // 正在执行的请求
  let completed = 0; // 完成计数
  let failed = 0; // 失败计数

  // 按优先级插入任务到队列
  const insertByPriority = (task) => {
    let inserted = false;
    for (let i = 0; i < queue.length; i++) {
      if (task.priority > queue[i].priority) {
        queue.splice(i, 0, task);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      queue.push(task);
    }
  };

  // 处理队列中的请求
  const processQueue = async () => {
    if (running.length >= maxConcurrent || queue.length === 0) {
      return;
    }

    const task = queue.shift();
    running.push(task);

    try {
      const result = await task.requestFn();
      task.resolve(result);
      completed++;
    } catch (error) {
      task.reject(error);
      failed++;
    } finally {
      // 从运行列表中移除已完成的请求
      const index = running.findIndex(t => t.id === task.id);
      if (index !== -1) {
        running.splice(index, 1);
      }
      
      // 继续处理队列中的下一个请求
      processQueue();
    }
  };

  // 添加请求到队列
  const addRequest = async (requestFn, priority = 0) => {
    return new Promise((resolve, reject) => {
      const task = {
        requestFn,
        priority,
        resolve,
        reject,
        id: Date.now() + Math.random(),
      };

      insertByPriority(task); // 按优先级插入队列
      processQueue(); // 开始处理队列
    });
  };

  return {
    addRequest,
    getStatus: () => ({
      queued: queue.length,
      running: running.length,
      completed,
      failed,
    }),
    clear: () => {
      queue.forEach(task => {
        task.reject(new Error('队列已清空'));
      });
      queue.length = 0;
    }
  };
};

// 使用示例 - 批量请求数据，支持优先级
const requestManager = createRequestQueueManager({ maxConcurrent: 4 });

const batchFetchData = async (ids) => {
  const promises = ids.map(id => 
    requestManager.addRequest(
      () => fetch(`/api/data/${id}`).then(res => res.json()),
      id < 10 ? 10 : 1 // 前10个请求高优先级
    )
  );

  try {
    const results = await Promise.allSettled(promises);
    return results;
  } catch (error) {
    console.error('批量请求失败:', error);
  }
};
```

### 2.2 请求合并和批处理

请求合并是减少网络请求数量的有效方法。通过将多个相似的请求合并为一个批量请求，可以显著降低服务器压力，提高系统性能。

核心原理：

- 收集短时间内发起的相似请求
- 当达到批次大小或超时时间时，执行批量请求
- 将批量结果分发给各个原始请求
- 支持不同业务场景的批次分组

```javascript
// 请求合并器 - 将多个相似请求合并为一个批量请求
const createRequestBatcher = (options = {}) => {
  const batchSize = options.batchSize || 50; // 批次大小
  const batchTimeout = options.batchTimeout || 100; // 100ms超时
  const batches = new Map(); // 存储不同批次的请求

  // 执行批量请求
  const executeBatch = async (batchKey) => {
    const batch = batches.get(batchKey);
    if (!batch || batch.keys.length === 0) {
      return;
    }

    batches.delete(batchKey); // 删除已处理的批次
    
    try {
      // 发送批量请求到服务器
      const response = await fetch('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys: batch.keys }),
      });
      
      const results = await response.json();
      
      // 将结果分发给各个原始请求
      batch.promises.forEach((promise, index) => {
        const key = batch.keys[index];
        const result = results[key];
        
        if (result !== undefined) {
          promise.resolve(result);
        } else {
          promise.reject(new Error(`未找到数据: ${key}`));
        }
      });
    } catch (error) {
      // 批量请求失败，所有promise都reject
      batch.promises.forEach(promise => {
        promise.reject(error);
      });
    }
  };

  // 批量获取数据
  const batchGet = async (key, batchKey = 'default') => {
    return new Promise((resolve, reject) => {
      let batch = batches.get(batchKey);
      
      if (!batch) {
        batch = {
          keys: [],
          promises: [],
          timer: null,
        };
        batches.set(batchKey, batch);
      }

      batch.keys.push(key);
      batch.promises.push({ resolve, reject });

      // 清除之前的定时器
      if (batch.timer) {
        clearTimeout(batch.timer);
      }

      // 检查是否达到批次大小或设置新的定时器
      if (batch.keys.length >= batchSize) {
        executeBatch(batchKey); // 立即执行批量请求
      } else {
        batch.timer = setTimeout(() => {
          executeBatch(batchKey); // 超时后执行批量请求
        }, batchTimeout);
      }
    });
  };

  return { batchGet };
};

// 使用示例 - 看起来是独立的请求，实际会被合并
const batcher = createRequestBatcher({ batchSize: 20, batchTimeout: 50 });

const getUserInfo = async (userId) => {
  try {
    return await batcher.batchGet(userId, 'users'); // 使用'users'作为批次键
  } catch (error) {
    console.error(`获取用户${userId}信息失败:`, error);
    throw error;
  }
};

// 这些请求会被自动合并为一个批量请求
Promise.all([
  getUserInfo(1),
  getUserInfo(2),
  getUserInfo(3),
  // ... 更多请求
]);
```

### 2.3 智能重试机制

智能重试机制是提高系统可靠性的重要手段。通过指数退避、抖动和断路器模式，可以有效处理网络波动和临时故障。

核心原理：
- 指数退避：重试间隔逐渐增加，避免对服务器造成持续压力
- 抖动机制：在延迟时间中加入随机性，避免多个客户端同时重试
- 断路器模式：当失败率过高时，暂时停止请求，保护系统
- 自适应恢复：系统恢复后自动重新开始请求

```javascript
// 智能重试管理器 - 实现指数退避、断路器等高级重试策略
const createSmartRetryManager = (options = {}) => {
  const maxRetries = options.maxRetries || 3; // 最大重试次数
  const baseDelay = options.baseDelay || 1000; // 基础延迟时间
  const maxDelay = options.maxDelay || 10000; // 最大延迟时间
  const exponentialBase = options.exponentialBase || 2; // 指数基数
  const jitterRange = options.jitterRange || 0.1; // 抖动范围
  
  // 断路器状态管理
  const circuitBreaker = {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
    threshold: options.circuitThreshold || 5,
    timeout: options.circuitTimeout || 60000,
  };

  // 计算重试延迟（指数退避 + 抖动）
  const calculateDelay = (attempt) => {
    const exponentialDelay = baseDelay * Math.pow(exponentialBase, attempt);
    const jitter = exponentialDelay * jitterRange * (Math.random() * 2 - 1);
    const delay = exponentialDelay + jitter;
    
    return Math.min(delay, maxDelay);
  };

  // 检查断路器状态
  const isCircuitClosed = () => {
    const now = Date.now();
    
    switch (circuitBreaker.state) {
      case 'CLOSED':
        return true;
      
      case 'OPEN':
        // 检查是否到了半开时间
        if (now - circuitBreaker.lastFailureTime > circuitBreaker.timeout) {
          circuitBreaker.state = 'HALF_OPEN';
          return true;
        }
        return false;
      
      case 'HALF_OPEN':
        return true;
      
      default:
        return true;
    }
  };

  // 记录失败并更新断路器状态
  const recordFailure = () => {
    circuitBreaker.failures++;
    circuitBreaker.lastFailureTime = Date.now();

    if (circuitBreaker.failures >= circuitBreaker.threshold) {
      circuitBreaker.state = 'OPEN';
      console.warn('断路器打开，暂时拒绝请求');
    }
  };

  // 重置断路器状态
  const resetCircuitBreaker = () => {
    circuitBreaker.failures = 0;
    circuitBreaker.state = 'CLOSED';
  };

  // 休眠函数
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // 执行带重试的请求
  const executeWithRetry = async (requestFn, options = {}) => {
    const retryCount = options.maxRetries || maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // 检查断路器状态
        if (!isCircuitClosed()) {
          throw new Error('断路器打开，请求被拒绝');
        }

        const result = await requestFn();
        
        // 请求成功，重置断路器
        resetCircuitBreaker();
        return result;
      } catch (error) {
        lastError = error;
        recordFailure();

        // 最后一次尝试失败
        if (attempt === retryCount) {
          break;
        }

        // 计算延迟时间并等待
        const delay = calculateDelay(attempt);
        console.warn(`请求失败，${delay}ms后重试 (${attempt + 1}/${retryCount}):`, error.message);
        
        await sleep(delay);
      }
    }

    throw new Error(`请求失败，已重试${retryCount}次: ${lastError.message}`);
  };

  return { executeWithRetry };
};

// 使用示例 - 创建健壮的API调用函数
const retryManager = createSmartRetryManager({
  maxRetries: 5,
  baseDelay: 500,
  circuitThreshold: 10,
});

const robustApiCall = async (url, options) => {
  return retryManager.executeWithRetry(async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
};
```

### 2.4 请求优先级管理

请求优先级管理是优化用户体验的关键技术。通过根据业务重要性和用户行为智能调度请求，确保关键功能优先响应。

核心原理：
- 优先级分级：将请求分为关键、高、普通、低、后台五个级别
- 智能调度：高优先级请求优先执行，低优先级请求延后处理
- 动态降级：长时间等待的请求自动降低优先级
- 紧急处理：支持紧急请求插队执行

```javascript
// 请求优先级管理器 - 根据请求重要性和用户行为智能调度请求
const createRequestPriorityManager = () => {
  const priorities = {
    CRITICAL: 100,    // 关键请求（登录、支付）
    HIGH: 80,         // 高优先级（用户操作响应）
    NORMAL: 60,       // 普通请求（数据获取）
    LOW: 40,          // 低优先级（预加载）
    BACKGROUND: 20,   // 后台任务（统计、日志）
  };
  
  const queueManager = createRequestQueueManager({ maxConcurrent: 6 });
  const activeRequests = new Map();

  // 检查并降级优先级
  const checkAndDegradePriority = (requestId) => {
    const request = activeRequests.get(requestId);
    if (!request) return;

    const waitTime = Date.now() - request.startTime;
    
    // 如果等待时间过长，降低优先级
    if (waitTime > 5000 && request.priority > priorities.LOW) {
      request.priority = priorities.LOW;
      console.warn(`请求${requestId}等待时间过长，降低优先级`);
    }
  };

  // 生成请求ID
  const generateRequestId = () => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 根据优先级值获取优先级名称
  const getPriorityName = (value) => {
    for (const [name, val] of Object.entries(priorities)) {
      if (val === value) return name;
    }
    return 'UNKNOWN';
  };

  // 获取优先级分布
  const getPriorityDistribution = () => {
    const distribution = {};
    
    activeRequests.forEach(request => {
      const priority = getPriorityName(request.priority);
      distribution[priority] = (distribution[priority] || 0) + 1;
    });

    return distribution;
  };

  // 执行优先级请求
  const executeRequest = async (requestFn, priority = 'NORMAL', metadata = {}) => {
    const priorityValue = priorities[priority] || priorities.NORMAL;
    const requestId = generateRequestId();
    
    // 记录请求信息
    activeRequests.set(requestId, {
      priority: priorityValue,
      startTime: Date.now(),
      metadata,
    });

    try {
      const result = await queueManager.addRequest(
        async () => {
          // 执行前检查是否需要降级
          checkAndDegradePriority(requestId);
          return await requestFn();
        },
        priorityValue
      );
      
      return result;
    } finally {
      activeRequests.delete(requestId);
    }
  };

  // 批量执行不同优先级的请求
  const executeBatchRequests = async (requests) => {
    const promises = requests.map(({ requestFn, priority, metadata }) =>
      executeRequest(requestFn, priority, metadata)
    );

    return Promise.allSettled(promises);
  };

  // 紧急请求（立即执行）
  const emergencyRequest = async (requestFn) => {
    // 清空低优先级队列，为紧急请求让路
    queueManager.queue = queueManager.queue.filter(
      task => task.priority >= priorities.HIGH
    );

    return executeRequest(requestFn, 'CRITICAL');
  };

  // 预加载请求（低优先级）
  const preloadRequest = async (requestFn, cacheKey) => {
    return executeRequest(
      requestFn,
      'BACKGROUND',
      { type: 'preload', cacheKey }
    );
  };

  return {
    executeRequest,
    executeBatchRequests,
    emergencyRequest,
    preloadRequest,
    getStatus: () => ({
      ...queueManager.getStatus(),
      activeRequests: activeRequests.size,
      priorityDistribution: getPriorityDistribution(),
    })
  };
};

// 使用示例 - 不同优先级的请求处理
const priorityManager = createRequestPriorityManager();

const handleUserActions = async () => {
  // 关键请求：用户登录
  const loginResult = await priorityManager.executeRequest(
    () => fetch('/api/login', { method: 'POST' }),
    'CRITICAL'
  );

  // 高优先级：获取用户数据
  const userData = await priorityManager.executeRequest(
    () => fetch('/api/user/profile'),
    'HIGH'
  );

  // 普通请求：获取推荐内容
  const recommendations = await priorityManager.executeRequest(
    () => fetch('/api/recommendations'),
    'NORMAL'
  );

  // 低优先级：预加载下一页数据
  priorityManager.preloadRequest(
    () => fetch('/api/data/page/2'),
    'next-page-data'
  );

  // 后台任务：发送统计数据
  priorityManager.executeRequest(
    () => fetch('/api/analytics', { method: 'POST' }),
    'BACKGROUND'
  );
};
```

## 三、缓存策略

### 3.1 多层缓存架构

多层缓存架构是提高系统性能的核心技术。通过在不同层级设置缓存，可以显著减少网络请求，提高响应速度。

核心原理：
- 内存缓存：最快访问速度，容量有限，适合热点数据
- LocalStorage：持久化存储，容量中等，适合用户偏好数据
- IndexedDB：大容量存储，适合复杂数据结构
- HTTP缓存：浏览器原生缓存，减少网络传输

```javascript
// 多层缓存管理器 - 实现内存缓存、LocalStorage、IndexedDB的统一管理
const createMultiLevelCacheManager = (options = {}) => {
  const config = {
    memoryLimit: options.memoryLimit || 50 * 1024 * 1024, // 50MB内存限制
    localStorageLimit: options.localStorageLimit || 5 * 1024 * 1024, // 5MB本地存储限制
    defaultTTL: options.defaultTTL || 5 * 60 * 1000, // 5分钟默认过期时间
    ...options,
  };

  const memoryCache = new Map(); // 内存缓存
  let memoryCacheSize = 0; // 内存缓存大小
  const cacheStats = {
    hits: { memory: 0, localStorage: 0, indexedDB: 0, http: 0 },
    misses: 0,
    evictions: 0,
  };

  let db = null; // IndexedDB实例

  // 初始化 IndexedDB
  const initIndexedDB = async () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CacheDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains('cache')) {
          const store = database.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  };

  // 获取缓存数据 - 按层级查找
  const get = async (key) => {
    // 1. 尝试内存缓存
    const memoryResult = getFromMemory(key);
    if (memoryResult !== null) {
      cacheStats.hits.memory++;
      return memoryResult;
    }

    // 2. 尝试 LocalStorage
    const localStorageResult = getFromLocalStorage(key);
    if (localStorageResult !== null) {
      cacheStats.hits.localStorage++;
      // 提升到内存缓存
      setToMemory(key, localStorageResult.data, localStorageResult.expiry);
      return localStorageResult.data;
    }

    // 3. 尝试 IndexedDB
    const indexedDBResult = await getFromIndexedDB(key);
    if (indexedDBResult !== null) {
      cacheStats.hits.indexedDB++;
      // 提升到内存缓存和 LocalStorage
      setToMemory(key, indexedDBResult.data, indexedDBResult.expiry);
      setToLocalStorage(key, indexedDBResult.data, indexedDBResult.expiry);
      return indexedDBResult.data;
    }

    cacheStats.misses++;
    return null;
  };

  // 内存缓存操作
  const getFromMemory = (key) => {
    const item = memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      memoryCacheSize -= item.size;
      return null;
    }
    
    return item.data;
  };

  const setToMemory = (key, data, expiry) => {
    const size = JSON.stringify(data).length;
    
    // 检查内存限制，必要时淘汰旧数据
    while (memoryCacheSize + size > config.memoryLimit && memoryCache.size > 0) {
      evictLRU();
    }
    
    memoryCache.set(key, {
      data,
      expiry,
      size,
      lastAccess: Date.now(),
    });
    
    memoryCacheSize += size;
  };

  // LRU 淘汰策略
  const evictLRU = () => {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, item] of memoryCache) {
      if (item.lastAccess < oldestTime) {
        oldestTime = item.lastAccess;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const item = memoryCache.get(oldestKey);
      memoryCache.delete(oldestKey);
      memoryCacheSize -= item.size;
      cacheStats.evictions++;
    }
  };

  // LocalStorage 操作
  const getFromLocalStorage = (key) => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return parsed;
    } catch (error) {
      return null;
    }
  };

  const setToLocalStorage = (key, data, expiry) => {
    try {
      const item = { data, expiry };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      // LocalStorage 满了，清理过期项
      cleanExpiredLocalStorage();
    }
  };

  // IndexedDB 操作
  const getFromIndexedDB = async (key) => {
    if (!db) return null;
    
    return new Promise((resolve) => {
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (!result || Date.now() > result.expiry) {
          resolve(null);
        } else {
          resolve(result);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  };

  const setToIndexedDB = async (key, data, expiry) => {
    if (!db) return;
    
    return new Promise((resolve) => {
      const transaction = db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      store.put({ key, data, expiry });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  };

  // 清理过期缓存
  const cleanExpiredLocalStorage = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (Date.now() > item.expiry) {
            keysToRemove.push(key);
          }
        } catch (error) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  // 初始化 IndexedDB
  initIndexedDB();

  return {
    get,
    set: async (key, data, ttl = config.defaultTTL) => {
      const expiry = Date.now() + ttl;
      
      // 同时设置到所有缓存层
      setToMemory(key, data, expiry);
      setToLocalStorage(key, data, expiry);
      await setToIndexedDB(key, data, expiry);
    },
    getStats: () => {
      const hitRate = cacheStats.hits.memory + cacheStats.hits.localStorage + 
                     cacheStats.hits.indexedDB + cacheStats.hits.http;
      const totalRequests = hitRate + cacheStats.misses;
      
      return {
        ...cacheStats,
        hitRate: totalRequests > 0 ? (hitRate / totalRequests * 100).toFixed(2) + '%' : '0%',
        memoryUsage: memoryCacheSize,
        memoryItems: memoryCache.size,
      };
    }
  };
};

// 使用示例 - 带缓存的数据获取
const cacheManager = createMultiLevelCacheManager({
  memoryLimit: 100 * 1024 * 1024, // 100MB
  defaultTTL: 10 * 60 * 1000, // 10分钟
});

const getCachedUserData = async (userId) => {
  return cacheManager.getWithFallback(
    `user_${userId}`,
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      return response.json();
    },
    { ttl: 30 * 60 * 1000 } // 30分钟缓存
  );
};
```

## 四、后端解决方案

### 4.1 连接池管理

后端连接池管理是处理高并发的关键技术。通过合理配置数据库连接池和Redis连接池，可以有效提升系统性能。

核心原理：
- 连接复用：避免频繁创建和销毁连接的开销
- 连接限制：控制最大连接数，防止资源耗尽
- 健康检查：定期检查连接状态，及时清理无效连接
- 负载均衡：合理分配连接，避免单点压力

```javascript
// 数据库连接池管理器 - Node.js + MySQL 示例
const mysql = require('mysql2/promise');

const createDatabaseConnectionPool = (config) => {
  const poolConfig = {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: config.connectionLimit || 20, // 最大连接数
    acquireTimeout: config.acquireTimeout || 60000, // 获取连接超时
    timeout: config.timeout || 60000, // 查询超时
    reconnect: true,
    ...config,
  };

  const pool = mysql.createPool(poolConfig);
  let activeConnections = 0;
  let waitingRequests = 0;

  // 执行查询
  const query = async (sql, params) => {
    waitingRequests++;
    
    try {
      const connection = await pool.getConnection();
      activeConnections++;
      waitingRequests--;
      
      try {
        const [results] = await connection.execute(sql, params);
        return results;
      } finally {
        connection.release();
        activeConnections--;
      }
    } catch (error) {
      waitingRequests--;
      throw error;
    }
  };

  // 批量查询
  const batchQuery = async (queries) => {
    const promises = queries.map(({ sql, params }) => query(sql, params));
    return Promise.allSettled(promises);
  };

  // 事务处理
  const transaction = async (callback) => {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };

  // 获取连接池状态
  const getStats = () => ({
    activeConnections,
    waitingRequests,
    maxConnections: poolConfig.connectionLimit,
    utilizationRate: (activeConnections / poolConfig.connectionLimit) * 100,
  });

  return { query, batchQuery, transaction, getStats };
};
```

### 4.2 请求限流和熔断

请求限流和熔断是保护系统稳定的重要机制。通过限制请求频率和快速失败，可以防止系统过载。

核心原理：
- 令牌桶算法：平滑限制请求速率，允许突发流量
- 滑动窗口：精确控制时间窗口内的请求数量
- 熔断器模式：快速失败，避免级联故障
- 自适应恢复：系统恢复后自动重新开始服务

```javascript
// 请求限流器 - 实现令牌桶、滑动窗口等限流算法
const createRateLimiter = (options = {}) => {
  const algorithm = options.algorithm || 'token-bucket';
  const config = options;
  const buckets = new Map();

  // 令牌桶算法
  const tokenBucketLimit = (key, config) => {
    const { capacity = 100, refillRate = 10, refillInterval = 1000 } = config;
    
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        tokens: capacity,
        lastRefill: Date.now(),
      };
      buckets.set(key, bucket);
    }

    // 补充令牌
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / refillInterval) * refillRate;
    
    bucket.tokens = Math.min(capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // 检查是否有令牌
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: 0, retryAfter: refillInterval };
  };

  // 检查是否允许请求
  const allowRequest = async (key, options = {}) => {
    const requestConfig = { ...config, ...options };
    
    switch (algorithm) {
      case 'token-bucket':
        return tokenBucketLimit(key, requestConfig);
      default:
        throw new Error(`未知的限流算法: ${algorithm}`);
    }
  };

  return { allowRequest };
};

// 熔断器
const createCircuitBreaker = (options = {}) => {
  const failureThreshold = options.failureThreshold || 5;
  const timeout = options.timeout || 60000;
  
  let state = 'CLOSED';
  let failureCount = 0;
  let lastFailureTime = null;
  let successCount = 0;

  // 执行受保护的函数
  const execute = async (fn) => {
    if (state === 'OPEN') {
      if (Date.now() - lastFailureTime < timeout) {
        throw new Error('熔断器打开，请求被拒绝');
      }
      
      // 进入半开状态
      state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      onSuccess();
      return result;
    } catch (error) {
      onFailure();
      throw error;
    }
  };

  const onSuccess = () => {
    if (state === 'HALF_OPEN') {
      successCount++;
      if (successCount >= 3) {
        reset();
      }
    } else {
      reset();
    }
  };

  const onFailure = () => {
    failureCount++;
    lastFailureTime = Date.now();
    
    if (failureCount >= failureThreshold) {
      state = 'OPEN';
    }
  };

  const reset = () => {
    state = 'CLOSED';
    failureCount = 0;
    successCount = 0;
    lastFailureTime = null;
  };

  return {
    execute,
    getState: () => ({
      state,
      failureCount,
      lastFailureTime,
    })
  };
};
```

## 五、监控和降级方案

### 5.1 系统监控

系统监控是保障服务稳定运行的重要手段。通过实时监控关键指标，可以及时发现和处理问题。

核心原理：
- 指标收集：CPU、内存、响应时间、错误率等关键指标
- 阈值告警：超过预设阈值时自动告警
- 趋势分析：分析指标变化趋势，预测潜在问题
- 可视化展示：通过图表直观展示系统状态

```javascript
// 系统性能监控器
const createSystemMonitor = (options = {}) => {
  const metrics = new Map();
  const thresholds = {
    cpuUsage: options.cpuThreshold || 80,
    memoryUsage: options.memoryThreshold || 80,
    responseTime: options.responseTimeThreshold || 1000,
    errorRate: options.errorRateThreshold || 5,
    ...options.thresholds,
  };
  
  const alerts = [];
  const alertCallbacks = [];

  // 收集系统指标
  const collectMetrics = () => {
    const metricData = {
      timestamp: Date.now(),
      cpu: getCPUUsage(),
      memory: getMemoryUsage(),
      responseTime: getAverageResponseTime(),
      errorRate: getErrorRate(),
      activeConnections: getActiveConnections(),
    };

    metrics.set(metricData.timestamp, metricData);
    
    // 只保留最近1小时的数据
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [timestamp] of metrics) {
      if (timestamp < oneHourAgo) {
        metrics.delete(timestamp);
      }
    }
  };

  // 检查阈值
  const checkThresholds = () => {
    const latest = Array.from(metrics.values()).pop();
    if (!latest) return;

    // 检查各项指标
    if (latest.cpu > thresholds.cpuUsage) {
      triggerAlert('HIGH_CPU', `CPU使用率: ${latest.cpu}%`);
    }

    if (latest.memory > thresholds.memoryUsage) {
      triggerAlert('HIGH_MEMORY', `内存使用率: ${latest.memory}%`);
    }

    if (latest.responseTime > thresholds.responseTime) {
      triggerAlert('SLOW_RESPONSE', `响应时间: ${latest.responseTime}ms`);
    }

    if (latest.errorRate > thresholds.errorRate) {
      triggerAlert('HIGH_ERROR_RATE', `错误率: ${latest.errorRate}%`);
    }
  };

  // 触发告警
  const triggerAlert = (type, message) => {
    const alert = {
      type,
      message,
      timestamp: Date.now(),
      level: getAlertLevel(type),
    };

    alerts.push(alert);
    
    // 通知所有注册的回调函数
    alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('告警回调执行失败:', error);
      }
    });

    console.warn(`[ALERT] ${alert.level}: ${message}`);
  };

  const getAlertLevel = (type) => {
    const levels = {
      HIGH_CPU: 'WARNING',
      HIGH_MEMORY: 'WARNING',
      SLOW_RESPONSE: 'WARNING',
      HIGH_ERROR_RATE: 'CRITICAL',
    };
    
    return levels[type] || 'INFO';
  };

  // 获取各项指标（简化实现）
  const getCPUUsage = () => Math.random() * 100;
  const getMemoryUsage = () => {
    const used = process.memoryUsage();
    const total = require('os').totalmem();
    return (used.heapUsed / total) * 100;
  };
  const getAverageResponseTime = () => Math.random() * 2000;
  const getErrorRate = () => Math.random() * 10;
  const getActiveConnections = () => Math.floor(Math.random() * 100);

  // 注册告警回调
  const onAlert = (callback) => {
    alertCallbacks.push(callback);
  };

  // 获取监控报告
  const getReport = (timeRange = 3600000) => {
    const startTime = Date.now() - timeRange;
    const relevantMetrics = Array.from(metrics.values())
      .filter(metric => metric.timestamp >= startTime);

    return {
      timeRange: { start: startTime, end: Date.now() },
      summary: calculateSummary(relevantMetrics),
      alerts: alerts.filter(alert => alert.timestamp >= startTime),
    };
  };

  const calculateSummary = (metrics) => {
    if (metrics.length === 0) return {};

    return {
      avgCPU: metrics.reduce((sum, m) => sum + m.cpu, 0) / metrics.length,
      avgMemory: metrics.reduce((sum, m) => sum + m.memory, 0) / metrics.length,
      avgResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
      avgErrorRate: metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length,
    };
  };

  // 开始监控
  setInterval(() => {
    collectMetrics();
    checkThresholds();
  }, 5000);

  return { onAlert, getReport };
};
```

### 5.2 服务降级

服务降级是在系统压力过大时的保护机制。通过暂时关闭非核心功能，确保核心服务正常运行。

核心原理：

- 分级降级：根据系统压力程度，逐步关闭非核心功能
- 自动触发：基于监控指标自动触发降级策略
- 快速恢复：系统恢复后自动恢复正常服务
- 用户体验：在降级期间保持基本功能可用

```javascript
// 服务降级管理器
const createServiceDegradationManager = (options = {}) => {
  const degradationRules = new Map();
  let currentLevel = 0; // 0: 正常, 1-5: 降级级别
  const monitor = options.monitor;

  // 设置默认降级规则
  const setupDefaultRules = () => {
    // 级别1：轻度降级
    degradationRules.set(1, {
      name: '轻度降级',
      triggers: ['HIGH_RESPONSE_TIME'],
      actions: [
        () => disableNonEssentialFeatures(),
        () => increaseTimeout(),
      ],
    });

    // 级别2：中度降级
    degradationRules.set(2, {
      name: '中度降级',
      triggers: ['HIGH_CPU', 'HIGH_MEMORY'],
      actions: [
        () => enableSimpleCache(),
        () => reduceDataPrecision(),
        () => limitConcurrentRequests(50),
      ],
    });

    // 级别3：重度降级
    degradationRules.set(3, {
      name: '重度降级',
      triggers: ['HIGH_ERROR_RATE', 'DATABASE_TIMEOUT'],
      actions: [
        () => enableStaticResponse(),
        () => limitConcurrentRequests(20),
        () => disableComplexQueries(),
      ],
    });
  };

  // 降级动作实现
  const disableNonEssentialFeatures = () => {
    console.log('禁用非必要功能');
  };

  const increaseTimeout = () => {
    console.log('增加请求超时时间');
  };

  const enableSimpleCache = () => {
    console.log('启用简单缓存策略');
  };

  const reduceDataPrecision = () => {
    console.log('降低数据精度');
  };

  const limitConcurrentRequests = (limit) => {
    console.log(`限制并发请求数为: ${limit}`);
  };

  const enableStaticResponse = () => {
    console.log('启用静态响应');
  };

  const disableComplexQueries = () => {
    console.log('禁用复杂查询');
  };

  // 触发降级
  const triggerDegradation = (trigger, severity = 1) => {
    const targetLevel = Math.max(currentLevel, severity);
    
    if (targetLevel > currentLevel) {
      activateDegradation(targetLevel, trigger);
    }
  };

  // 激活降级
  const activateDegradation = async (level, trigger) => {
    console.warn(`激活${level}级降级，触发原因: ${trigger}`);
    
    currentLevel = level;
    
    // 执行对应级别的所有降级动作
    for (let i = 1; i <= level; i++) {
      const rule = degradationRules.get(i);
      if (rule) {
        console.log(`执行降级规则: ${rule.name}`);
        
        for (const action of rule.actions) {
          try {
            await action();
          } catch (error) {
            console.error(`降级动作执行失败:`, error);
          }
        }
      }
    }

    // 设置自动恢复检查
    scheduleRecoveryCheck();
  };

  // 计划恢复检查
  const scheduleRecoveryCheck = () => {
    setTimeout(() => {
      checkRecovery();
    }, 30000); // 30秒后检查恢复
  };

  // 检查系统恢复情况
  const checkRecovery = async () => {
    if (currentLevel === 0) return;

    // 检查系统指标是否恢复正常
    const systemHealthy = await checkSystemHealth();
    
    if (systemHealthy) {
      const newLevel = Math.max(0, currentLevel - 1);
      
      if (newLevel < currentLevel) {
        console.log(`系统恢复，降级级别从 ${currentLevel} 降至 ${newLevel}`);
        currentLevel = newLevel;
        
        if (newLevel > 0) {
          // 仍需降级，继续监控
          scheduleRecoveryCheck();
        } else {
          console.log('系统完全恢复正常');
          restoreNormalOperation();
        }
      }
    } else {
      // 系统仍有问题，继续监控
      scheduleRecoveryCheck();
    }
  };

  // 检查系统健康状况
  const checkSystemHealth = async () => {
    if (!monitor) return true;

    const report = monitor.getReport(60000); // 检查最近1分钟
    const summary = report.summary;

    // 检查各项指标是否在正常范围内
    return (
      summary.avgCPU < 70 &&
      summary.avgMemory < 70 &&
      summary.avgResponseTime < 800 &&
      summary.avgErrorRate < 3
    );
  };

  // 恢复正常运行
  const restoreNormalOperation = () => {
    console.log('恢复正常运行模式');
  };

  // 获取当前状态
  const getStatus = () => {
    const currentRule = degradationRules.get(currentLevel);
    
    return {
      level: currentLevel,
      ruleName: currentRule ? currentRule.name : '正常运行',
      isHealthy: currentLevel === 0,
    };
  };

  setupDefaultRules();

  return {
    triggerDegradation,
    getStatus,
  };
};

// 集成使用示例
const monitor = createSystemMonitor({
  cpuThreshold: 80,
  memoryThreshold: 80,
  responseTimeThreshold: 1000,
});

const degradationManager = createServiceDegradationManager({ monitor });

// 监听告警并触发降级
monitor.onAlert((alert) => {
  const severity = alert.level === 'CRITICAL' ? 3 : 
                  alert.level === 'WARNING' ? 2 : 1;
  
  degradationManager.triggerDegradation(alert.type, severity);
});
```
