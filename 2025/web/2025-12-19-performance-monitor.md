# 全站请求耗时分析工具设计

## 一、工具架构设计

### 1.1 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   数据收集层     │    │   数据存储层     │    │   数据分析层     │
│  Performance    │───▶│   IndexedDB     │───▶│   Analytics     │
│   Monitor       │    │   LocalStorage  │    │   Engine        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   网络请求      │    │   数据压缩       │    │   可视化仪表板   │
│   Interceptor   │    │   Compression   │    │   Dashboard     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.2 核心模块

1. **数据收集模块**：拦截和收集所有网络请求
2. **数据存储模块**：本地存储和云端同步
3. **数据分析模块**：性能指标计算和分析
4. **可视化模块**：图表和报表展示
5. **配置管理模块**：工具配置和设置

## 二、数据收集模块

### 2.1 核心监控类

```javascript
/**
 * 全站请求耗时分析工具
 * 遵循 Airbnb 代码规范
 */
class PerformanceMonitor {
  constructor(options = {}) {
    this.config = {
      enableNetworkMonitoring: true,
      enableResourceMonitoring: true,
      enableNavigationMonitoring: true,
      enableUserTiming: true,
      maxStorageSize: 10 * 1024 * 1024, // 10MB
      batchSize: 50,
      flushInterval: 30000, // 30秒
      enableCompression: true,
      ...options,
    };

    this.dataBuffer = [];
    this.isInitialized = false;
    this.observers = new Map();
    this.metrics = new Map();

    this.init();
  }

  /**
   * 初始化监控器
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.setupNetworkMonitoring();
      this.setupResourceMonitoring();
      this.setupNavigationMonitoring();
      this.setupUserTiming();
      this.setupDataFlush();
      
      this.isInitialized = true;
      this.log('PerformanceMonitor initialized successfully');
    } catch (error) {
      this.log('Failed to initialize PerformanceMonitor:', error);
    }
  }

  /**
   * 设置网络请求监控
   */
  setupNetworkMonitoring() {
    if (!this.config.enableNetworkMonitoring) {
      return;
    }

    // 拦截 fetch 请求
    this.interceptFetch();
    
    // 拦截 XMLHttpRequest
    this.interceptXHR();
    
    // 监控 WebSocket 连接
    this.interceptWebSocket();
  }

  /**
   * 拦截 fetch 请求
   */
  interceptFetch() {
    const originalFetch = window.fetch;
    
    window.fetch = async (input, init = {}) => {
      const startTime = performance.now();
      const requestId = this.generateRequestId();
      const url = typeof input === 'string' ? input : input.url;
      
      const requestData = {
        id: requestId,
        type: 'fetch',
        url,
        method: init.method || 'GET',
        startTime,
        timestamp: Date.now(),
        headers: init.headers || {},
      };

      try {
        const response = await originalFetch(input, init);
        const endTime = performance.now();
        
        this.recordRequest({
          ...requestData,
          endTime,
          duration: endTime - startTime,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          responseSize: this.getResponseSize(response),
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordRequest({
          ...requestData,
          endTime,
          duration: endTime - startTime,
          error: error.message,
          success: false,
        });

        throw error;
      }
    };
  }

  /**
   * 拦截 XMLHttpRequest
   */
  interceptXHR() {
    const originalXHR = window.XMLHttpRequest;
    
    window.XMLHttpRequest = function() {
      const xhr = new originalXHR();
      const startTime = performance.now();
      const requestId = this.generateRequestId();
      
      let requestData = {
        id: requestId,
        type: 'xhr',
        startTime,
        timestamp: Date.now(),
      };

      // 监听请求开始
      const originalOpen = xhr.open;
      xhr.open = function(method, url, ...args) {
        requestData = {
          ...requestData,
          method,
          url,
        };
        
        return originalOpen.call(this, method, url, ...args);
      };

      // 监听请求完成
      xhr.addEventListener('loadend', () => {
        const endTime = performance.now();
        
        this.recordRequest({
          ...requestData,
          endTime,
          duration: endTime - startTime,
          status: xhr.status,
          statusText: xhr.statusText,
          success: xhr.status >= 200 && xhr.status < 400,
          responseSize: xhr.responseText ? xhr.responseText.length : 0,
        });
      });

      // 监听请求错误
      xhr.addEventListener('error', () => {
        const endTime = performance.now();
        
        this.recordRequest({
          ...requestData,
          endTime,
          duration: endTime - startTime,
          error: 'Network error',
          success: false,
        });
      });

      return xhr;
    };
  }

  /**
   * 拦截 WebSocket 连接
   */
  interceptWebSocket() {
    const originalWebSocket = window.WebSocket;
    
    window.WebSocket = function(url, protocols) {
      const ws = new originalWebSocket(url, protocols);
      const startTime = performance.now();
      const requestId = this.generateRequestId();
      
      const requestData = {
        id: requestId,
        type: 'websocket',
        url,
        startTime,
        timestamp: Date.now(),
      };

      // 监听连接建立
      ws.addEventListener('open', () => {
        const endTime = performance.now();
        
        this.recordRequest({
          ...requestData,
          endTime,
          duration: endTime - startTime,
          success: true,
          status: 'connected',
        });
      });

      // 监听连接错误
      ws.addEventListener('error', () => {
        const endTime = performance.now();
        
        this.recordRequest({
          ...requestData,
          endTime,
          duration: endTime - startTime,
          error: 'WebSocket error',
          success: false,
        });
      });

      return ws;
    };
  }

  /**
   * 设置资源监控
   */
  setupResourceMonitoring() {
    if (!this.config.enableResourceMonitoring) {
      return;
    }

    // 监控资源加载性能
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        this.recordResource({
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration,
          startTime: entry.startTime,
          size: entry.transferSize || 0,
          timestamp: Date.now(),
        });
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  /**
   * 设置导航监控
   */
  setupNavigationMonitoring() {
    if (!this.config.enableNavigationMonitoring) {
      return;
    }

    // 监控页面导航性能
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        this.recordNavigation({
          type: entry.type,
          duration: entry.duration,
          startTime: entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
        });
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', observer);
  }

  /**
   * 设置用户计时监控
   */
  setupUserTiming() {
    if (!this.config.enableUserTiming) {
      return;
    }

    // 监控用户自定义计时
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        this.recordUserTiming({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          timestamp: Date.now(),
        });
      });
    });

    observer.observe({ entryTypes: ['measure', 'mark'] });
    this.observers.set('userTiming', observer);
  }

  /**
   * 设置数据刷新机制
   */
  setupDataFlush() {
    // 定期刷新数据到存储
    setInterval(() => {
      this.flushData();
    }, this.config.flushInterval);

    // 页面卸载时刷新数据
    window.addEventListener('beforeunload', () => {
      this.flushData();
    });
  }

  /**
   * 记录请求数据
   */
  recordRequest(data) {
    this.dataBuffer.push({
      ...data,
      category: 'request',
    });

    // 检查缓冲区大小
    if (this.dataBuffer.length >= this.config.batchSize) {
      this.flushData();
    }
  }

  /**
   * 记录资源数据
   */
  recordResource(data) {
    this.dataBuffer.push({
      ...data,
      category: 'resource',
    });
  }

  /**
   * 记录导航数据
   */
  recordNavigation(data) {
    this.dataBuffer.push({
      ...data,
      category: 'navigation',
    });
  }

  /**
   * 记录用户计时数据
   */
  recordUserTiming(data) {
    this.dataBuffer.push({
      ...data,
      category: 'userTiming',
    });
  }

  /**
   * 刷新数据到存储
   */
  async flushData() {
    if (this.dataBuffer.length === 0) {
      return;
    }

    try {
      const dataToStore = [...this.dataBuffer];
      this.dataBuffer = [];

      // 压缩数据
      const compressedData = this.config.enableCompression 
        ? await this.compressData(dataToStore)
        : dataToStore;

      // 存储到本地
      await this.storageManager.store(compressedData);

      this.log(`Flushed ${dataToStore.length} records to storage`);
    } catch (error) {
      this.log('Failed to flush data:', error);
    }
  }

  /**
   * 压缩数据
   */
  async compressData(data) {
    // 使用简单的数据压缩算法
    const compressed = data.map(item => ({
      ...item,
      // 移除不必要的字段
      headers: item.headers ? Object.keys(item.headers).length : 0,
    }));

    return compressed;
  }

  /**
   * 生成请求ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取响应大小
   */
  getResponseSize(response) {
    const contentLength = response.headers.get('content-length');
    return contentLength ? parseInt(contentLength, 10) : 0;
  }

  /**
   * 日志记录
   */
  log(message, ...args) {
    if (this.config.enableLogging) {
      console.log(`[PerformanceMonitor] ${message}`, ...args);
    }
  }

  /**
   * 销毁监控器
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.dataBuffer = [];
    this.isInitialized = false;
  }
}
```

### 2.2 存储管理模块

```javascript
/**
 * 存储管理器
 * 负责数据的本地存储和云端同步
 */
class StorageManager {
  constructor(options = {}) {
    this.config = {
      maxStorageSize: 10 * 1024 * 1024, // 10MB
      enableIndexedDB: true,
      enableLocalStorage: true,
      enableCloudSync: false,
      cloudEndpoint: null,
      ...options,
    };

    this.dbName = 'PerformanceMonitorDB';
    this.dbVersion = 1;
    this.db = null;
    this.storageKey = 'performance_data';

    this.init();
  }

  /**
   * 初始化存储
   */
  async init() {
    if (this.config.enableIndexedDB) {
      await this.initIndexedDB();
    }
  }

  /**
   * 初始化 IndexedDB
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建数据存储表
        if (!db.objectStoreNames.contains('performance_data')) {
          const store = db.createObjectStore('performance_data', {
            keyPath: 'id',
            autoIncrement: true,
          });
          
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('url', 'url', { unique: false });
        }
      };
    });
  }

  /**
   * 存储数据
   */
  async store(data) {
    if (this.config.enableIndexedDB && this.db) {
      await this.storeToIndexedDB(data);
    }

    if (this.config.enableLocalStorage) {
      await this.storeToLocalStorage(data);
    }

    if (this.config.enableCloudSync) {
      await this.syncToCloud(data);
    }
  }

  /**
   * 存储到 IndexedDB
   */
  async storeToIndexedDB(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['performance_data'], 'readwrite');
      const store = transaction.objectStore('performance_data');

      data.forEach(item => {
        store.add(item);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * 存储到 LocalStorage
   */
  async storeToLocalStorage(data) {
    try {
      const existingData = this.getFromLocalStorage();
      const newData = [...existingData, ...data];
      
      // 检查存储大小限制
      const dataSize = JSON.stringify(newData).length;
      if (dataSize > this.config.maxStorageSize) {
        // 清理旧数据
        const cleanedData = this.cleanOldData(newData);
        localStorage.setItem(this.storageKey, JSON.stringify(cleanedData));
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(newData));
      }
    } catch (error) {
      console.error('Failed to store to localStorage:', error);
    }
  }

  /**
   * 从 LocalStorage 获取数据
   */
  getFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get from localStorage:', error);
      return [];
    }
  }

  /**
   * 清理旧数据
   */
  cleanOldData(data) {
    // 按时间戳排序，保留最新的数据
    const sortedData = data.sort((a, b) => b.timestamp - a.timestamp);
    const maxItems = Math.floor(this.config.maxStorageSize / 1000); // 估算最大项目数
    
    return sortedData.slice(0, maxItems);
  }

  /**
   * 同步到云端
   */
  async syncToCloud(data) {
    if (!this.config.cloudEndpoint) {
      return;
    }

    try {
      const response = await fetch(this.config.cloudEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Cloud sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Cloud sync error:', error);
    }
  }

  /**
   * 查询数据
   */
  async query(options = {}) {
    const {
      startTime,
      endTime,
      category,
      url,
      limit = 1000,
    } = options;

    if (this.config.enableIndexedDB && this.db) {
      return this.queryFromIndexedDB(options);
    }

    return this.queryFromLocalStorage(options);
  }

  /**
   * 从 IndexedDB 查询
   */
  async queryFromIndexedDB(options) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['performance_data'], 'readonly');
      const store = transaction.objectStore('performance_data');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.bound(
        options.startTime || 0,
        options.endTime || Date.now()
      );
      
      const request = index.openCursor(range);
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const value = cursor.value;
          
          // 应用过滤条件
          if (this.matchesFilter(value, options)) {
            results.push(value);
          }
          
          cursor.continue();
        } else {
          resolve(results.slice(0, options.limit));
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 从 LocalStorage 查询
   */
  async queryFromLocalStorage(options) {
    const data = this.getFromLocalStorage();
    return data.filter(item => this.matchesFilter(item, options))
               .slice(0, options.limit);
  }

  /**
   * 检查数据是否匹配过滤条件
   */
  matchesFilter(item, options) {
    if (options.category && item.category !== options.category) {
      return false;
    }
    
    if (options.url && !item.url?.includes(options.url)) {
      return false;
    }
    
    if (options.startTime && item.timestamp < options.startTime) {
      return false;
    }
    
    if (options.endTime && item.timestamp > options.endTime) {
      return false;
    }
    
    return true;
  }

  /**
   * 清理存储
   */
  async clear() {
    if (this.config.enableIndexedDB && this.db) {
      const transaction = this.db.transaction(['performance_data'], 'readwrite');
      const store = transaction.objectStore('performance_data');
      store.clear();
    }

    if (this.config.enableLocalStorage) {
      localStorage.removeItem(this.storageKey);
    }
  }
}
```

## 三、数据分析模块

### 3.1 分析引擎

```javascript
/**
 * 数据分析引擎
 * 负责性能数据的分析和指标计算
 */
class AnalyticsEngine {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5分钟缓存
  }

  /**
   * 获取性能概览
   */
  async getPerformanceOverview(options = {}) {
    const cacheKey = `overview_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const data = await this.storageManager.query(options);
    const overview = this.calculateOverview(data);
    
    this.cache.set(cacheKey, {
      data: overview,
      timestamp: Date.now(),
    });

    return overview;
  }

  /**
   * 计算性能概览
   */
  calculateOverview(data) {
    const requests = data.filter(item => item.category === 'request');
    const resources = data.filter(item => item.category === 'resource');
    const navigations = data.filter(item => item.category === 'navigation');

    return {
      totalRequests: requests.length,
      totalResources: resources.length,
      totalNavigations: navigations.length,
      averageResponseTime: this.calculateAverage(requests, 'duration'),
      averageResourceSize: this.calculateAverage(resources, 'size'),
      successRate: this.calculateSuccessRate(requests),
      slowestRequests: this.getSlowestRequests(requests, 10),
      mostRequestedUrls: this.getMostRequestedUrls(requests, 10),
      performanceMetrics: this.calculatePerformanceMetrics(data),
    };
  }

  /**
   * 计算平均值
   */
  calculateAverage(data, field) {
    if (data.length === 0) return 0;
    
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return Math.round(sum / data.length * 100) / 100;
  }

  /**
   * 计算成功率
   */
  calculateSuccessRate(requests) {
    if (requests.length === 0) return 0;
    
    const successful = requests.filter(req => req.success).length;
    return Math.round((successful / requests.length) * 100);
  }

  /**
   * 获取最慢的请求
   */
  getSlowestRequests(requests, limit = 10) {
    return requests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(req => ({
        url: req.url,
        duration: req.duration,
        method: req.method,
        status: req.status,
        timestamp: req.timestamp,
      }));
  }

  /**
   * 获取最常请求的URL
   */
  getMostRequestedUrls(requests, limit = 10) {
    const urlCount = {};
    
    requests.forEach(req => {
      urlCount[req.url] = (urlCount[req.url] || 0) + 1;
    });

    return Object.entries(urlCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([url, count]) => ({ url, count }));
  }

  /**
   * 计算性能指标
   */
  calculatePerformanceMetrics(data) {
    const requests = data.filter(item => item.category === 'request');
    const resources = data.filter(item => item.category === 'resource');

    return {
      // 响应时间分布
      responseTimeDistribution: this.calculateDistribution(requests, 'duration'),
      
      // 请求大小分布
      requestSizeDistribution: this.calculateDistribution(resources, 'size'),
      
      // 错误率
      errorRate: this.calculateErrorRate(requests),
      
      // 网络质量指标
      networkQuality: this.calculateNetworkQuality(requests),
    };
  }

  /**
   * 计算分布
   */
  calculateDistribution(data, field) {
    const values = data.map(item => item[field] || 0);
    const sorted = values.sort((a, b) => a - b);
    
    return {
      min: sorted[0] || 0,
      max: sorted[sorted.length - 1] || 0,
      median: this.calculateMedian(sorted),
      p95: this.calculatePercentile(sorted, 95),
      p99: this.calculatePercentile(sorted, 99),
    };
  }

  /**
   * 计算中位数
   */
  calculateMedian(sorted) {
    const len = sorted.length;
    if (len === 0) return 0;
    
    const mid = Math.floor(len / 2);
    return len % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * 计算百分位数
   */
  calculatePercentile(sorted, percentile) {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)] || 0;
  }

  /**
   * 计算错误率
   */
  calculateErrorRate(requests) {
    if (requests.length === 0) return 0;
    
    const errors = requests.filter(req => !req.success).length;
    return Math.round((errors / requests.length) * 100);
  }

  /**
   * 计算网络质量
   */
  calculateNetworkQuality(requests) {
    const successful = requests.filter(req => req.success);
    if (successful.length === 0) return 'unknown';

    const avgDuration = this.calculateAverage(successful, 'duration');
    
    if (avgDuration < 100) return 'excellent';
    if (avgDuration < 500) return 'good';
    if (avgDuration < 1000) return 'fair';
    return 'poor';
  }

  /**
   * 获取时间序列数据
   */
  async getTimeSeriesData(options = {}) {
    const {
      startTime = Date.now() - 24 * 60 * 60 * 1000, // 24小时前
      endTime = Date.now(),
      interval = 60 * 1000, // 1分钟间隔
      category = 'request',
    } = options;

    const data = await this.storageManager.query({
      startTime,
      endTime,
      category,
    });

    return this.aggregateTimeSeries(data, interval);
  }

  /**
   * 聚合时间序列数据
   */
  aggregateTimeSeries(data, interval) {
    const buckets = new Map();
    
    data.forEach(item => {
      const bucketTime = Math.floor(item.timestamp / interval) * interval;
      
      if (!buckets.has(bucketTime)) {
        buckets.set(bucketTime, {
          timestamp: bucketTime,
          count: 0,
          totalDuration: 0,
          errors: 0,
          success: 0,
        });
      }
      
      const bucket = buckets.get(bucketTime);
      bucket.count++;
      bucket.totalDuration += item.duration || 0;
      
      if (item.success) {
        bucket.success++;
      } else {
        bucket.errors++;
      }
    });

    return Array.from(buckets.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(bucket => ({
        ...bucket,
        averageDuration: bucket.count > 0 ? bucket.totalDuration / bucket.count : 0,
        successRate: bucket.count > 0 ? (bucket.success / bucket.count) * 100 : 0,
      }));
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.cache.clear();
  }
}
```

## 四、可视化仪表板

### 4.1 仪表板组件

```javascript
/**
 * 性能监控仪表板
 * 提供可视化的性能数据展示
 */
class PerformanceDashboard {
  constructor(container, analyticsEngine) {
    this.container = container;
    this.analyticsEngine = analyticsEngine;
    this.charts = new Map();
    this.isInitialized = false;

    this.init();
  }

  /**
   * 初始化仪表板
   */
  async init() {
    if (this.isInitialized) {
      return;
    }

    this.createLayout();
    await this.loadData();
    this.setupEventListeners();
    
    this.isInitialized = true;
  }

  /**
   * 创建布局
   */
  createLayout() {
    this.container.innerHTML = `
      <div class="performance-dashboard">
        <header class="dashboard-header">
          <h1>性能监控仪表板</h1>
          <div class="dashboard-controls">
            <select id="timeRange" class="time-range-selector">
              <option value="1h">最近1小时</option>
              <option value="24h" selected>最近24小时</option>
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
            </select>
            <button id="refreshBtn" class="refresh-btn">刷新</button>
          </div>
        </header>
        
        <div class="dashboard-content">
          <div class="metrics-grid">
            <div class="metric-card" id="totalRequests">
              <h3>总请求数</h3>
              <div class="metric-value">-</div>
            </div>
            <div class="metric-card" id="averageResponseTime">
              <h3>平均响应时间</h3>
              <div class="metric-value">-</div>
            </div>
            <div class="metric-card" id="successRate">
              <h3>成功率</h3>
              <div class="metric-value">-</div>
            </div>
            <div class="metric-card" id="errorRate">
              <h3>错误率</h3>
              <div class="metric-value">-</div>
            </div>
          </div>
          
          <div class="charts-grid">
            <div class="chart-container">
              <h3>响应时间趋势</h3>
              <canvas id="responseTimeChart"></canvas>
            </div>
            <div class="chart-container">
              <h3>请求分布</h3>
              <canvas id="requestDistributionChart"></canvas>
            </div>
            <div class="chart-container">
              <h3>最慢请求</h3>
              <div id="slowestRequests"></div>
            </div>
            <div class="chart-container">
              <h3>最常请求URL</h3>
              <div id="mostRequestedUrls"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addStyles();
  }

  /**
   * 添加样式
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .performance-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e0e0e0;
      }
      
      .dashboard-controls {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      .time-range-selector, .refresh-btn {
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .refresh-btn {
        background: #007bff;
        color: white;
        border: none;
        cursor: pointer;
      }
      
      .refresh-btn:hover {
        background: #0056b3;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .metric-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .metric-card h3 {
        margin: 0 0 10px 0;
        color: #666;
        font-size: 14px;
        font-weight: 500;
      }
      
      .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
      
      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
      }
      
      .chart-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .chart-container h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 16px;
      }
      
      .chart-container canvas {
        max-width: 100%;
        height: 300px;
      }
      
      .request-list {
        max-height: 300px;
        overflow-y: auto;
      }
      
      .request-item {
        padding: 10px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .request-item:last-child {
        border-bottom: none;
      }
      
      .request-url {
        flex: 1;
        margin-right: 10px;
        font-size: 12px;
        color: #666;
        word-break: break-all;
      }
      
      .request-duration {
        font-weight: bold;
        color: #007bff;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * 加载数据
   */
  async loadData() {
    try {
      const timeRange = document.getElementById('timeRange').value;
      const options = this.getTimeRangeOptions(timeRange);
      
      const overview = await this.analyticsEngine.getPerformanceOverview(options);
      const timeSeriesData = await this.analyticsEngine.getTimeSeriesData(options);
      
      this.updateMetrics(overview);
      this.updateCharts(overview, timeSeriesData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }

  /**
   * 获取时间范围选项
   */
  getTimeRangeOptions(timeRange) {
    const now = Date.now();
    const ranges = {
      '1h': now - 60 * 60 * 1000,
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
    };
    
    return {
      startTime: ranges[timeRange],
      endTime: now,
    };
  }

  /**
   * 更新指标
   */
  updateMetrics(overview) {
    document.getElementById('totalRequests').querySelector('.metric-value').textContent = overview.totalRequests;
    document.getElementById('averageResponseTime').querySelector('.metric-value').textContent = `${overview.averageResponseTime}ms`;
    document.getElementById('successRate').querySelector('.metric-value').textContent = `${overview.successRate}%`;
    document.getElementById('errorRate').querySelector('.metric-value').textContent = `${100 - overview.successRate}%`;
  }

  /**
   * 更新图表
   */
  updateCharts(overview, timeSeriesData) {
    this.updateResponseTimeChart(timeSeriesData);
    this.updateRequestDistributionChart(overview);
    this.updateSlowestRequests(overview.slowestRequests);
    this.updateMostRequestedUrls(overview.mostRequestedUrls);
  }

  /**
   * 更新响应时间图表
   */
  updateResponseTimeChart(data) {
    const canvas = document.getElementById('responseTimeChart');
    const ctx = canvas.getContext('2d');
    
    // 简单的图表绘制
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (data.length === 0) return;
    
    const maxDuration = Math.max(...data.map(d => d.averageDuration));
    const stepX = canvas.width / data.length;
    const stepY = canvas.height / maxDuration;
    
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = index * stepX;
      const y = canvas.height - (point.averageDuration * stepY);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }

  /**
   * 更新请求分布图表
   */
  updateRequestDistributionChart(overview) {
    const canvas = document.getElementById('requestDistributionChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const distribution = overview.performanceMetrics.responseTimeDistribution;
    const values = [distribution.min, distribution.median, distribution.p95, distribution.p99];
    const labels = ['Min', 'Median', 'P95', 'P99'];
    const colors = ['#28a745', '#ffc107', '#fd7e14', '#dc3545'];
    
    const barWidth = canvas.width / values.length;
    const maxValue = Math.max(...values);
    
    values.forEach((value, index) => {
      const barHeight = (value / maxValue) * canvas.height;
      const x = index * barWidth;
      const y = canvas.height - barHeight;
      
      ctx.fillStyle = colors[index];
      ctx.fillRect(x, y, barWidth - 10, barHeight);
      
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 5);
    });
  }

  /**
   * 更新最慢请求列表
   */
  updateSlowestRequests(requests) {
    const container = document.getElementById('slowestRequests');
    container.innerHTML = '<div class="request-list"></div>';
    
    const list = container.querySelector('.request-list');
    
    requests.forEach(req => {
      const item = document.createElement('div');
      item.className = 'request-item';
      item.innerHTML = `
        <div class="request-url">${req.url}</div>
        <div class="request-duration">${req.duration}ms</div>
      `;
      list.appendChild(item);
    });
  }

  /**
   * 更新最常请求URL列表
   */
  updateMostRequestedUrls(urls) {
    const container = document.getElementById('mostRequestedUrls');
    container.innerHTML = '<div class="request-list"></div>';
    
    const list = container.querySelector('.request-list');
    
    urls.forEach(item => {
      const element = document.createElement('div');
      element.className = 'request-item';
      element.innerHTML = `
        <div class="request-url">${item.url}</div>
        <div class="request-duration">${item.count}</div>
      `;
      list.appendChild(element);
    });
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    document.getElementById('timeRange').addEventListener('change', () => {
      this.loadData();
    });
    
    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.loadData();
    });
  }

  /**
   * 销毁仪表板
   */
  destroy() {
    this.charts.clear();
    this.container.innerHTML = '';
    this.isInitialized = false;
  }
}
```

## 五、使用示例和配置

### 5.1 基本使用

```javascript
// 初始化性能监控工具
const storageManager = new StorageManager({
  maxStorageSize: 10 * 1024 * 1024, // 10MB
  enableIndexedDB: true,
  enableLocalStorage: true,
});

const analyticsEngine = new AnalyticsEngine(storageManager);

const performanceMonitor = new PerformanceMonitor({
  enableNetworkMonitoring: true,
  enableResourceMonitoring: true,
  enableNavigationMonitoring: true,
  enableUserTiming: true,
  batchSize: 50,
  flushInterval: 30000,
});

// 初始化仪表板
const dashboardContainer = document.getElementById('dashboard');
const dashboard = new PerformanceDashboard(dashboardContainer, analyticsEngine);

// 获取性能数据
async function getPerformanceData() {
  const overview = await analyticsEngine.getPerformanceOverview({
    startTime: Date.now() - 24 * 60 * 60 * 1000, // 24小时前
    endTime: Date.now(),
  });
  
  console.log('性能概览:', overview);
  return overview;
}

// 获取时间序列数据
async function getTimeSeriesData() {
  const data = await analyticsEngine.getTimeSeriesData({
    startTime: Date.now() - 60 * 60 * 1000, // 1小时前
    endTime: Date.now(),
    interval: 60 * 1000, // 1分钟间隔
  });
  
  console.log('时间序列数据:', data);
  return data;
}
```

### 5.2 高级配置

```javascript
// 高级配置示例
const advancedConfig = {
  // 数据收集配置
  dataCollection: {
    enableNetworkMonitoring: true,
    enableResourceMonitoring: true,
    enableNavigationMonitoring: true,
    enableUserTiming: true,
    enableErrorTracking: true,
    enableCustomMetrics: true,
  },
  
  // 存储配置
  storage: {
    maxStorageSize: 50 * 1024 * 1024, // 50MB
    enableIndexedDB: true,
    enableLocalStorage: true,
    enableCloudSync: true,
    cloudEndpoint: 'https://api.example.com/performance-data',
    compressionEnabled: true,
  },
  
  // 分析配置
  analytics: {
    enableRealTimeAnalysis: true,
    enableHistoricalAnalysis: true,
    enablePredictiveAnalysis: false,
    cacheTimeout: 5 * 60 * 1000, // 5分钟
  },
  
  // 仪表板配置
  dashboard: {
    enableRealTimeUpdates: true,
    updateInterval: 10000, // 10秒
    enableExport: true,
    enableAlerts: true,
  },
};

// 使用高级配置初始化
const advancedMonitor = new PerformanceMonitor(advancedConfig.dataCollection);
const advancedStorage = new StorageManager(advancedConfig.storage);
const advancedAnalytics = new AnalyticsEngine(advancedStorage);
const advancedDashboard = new PerformanceDashboard(
  document.getElementById('advanced-dashboard'),
  advancedAnalytics,
  advancedConfig.dashboard
);
```

## 六、性能优化和最佳实践

### 6.1 性能优化策略

1. **数据压缩**：使用压缩算法减少存储空间
2. **批量处理**：批量处理数据减少I/O操作
3. **缓存机制**：使用缓存减少重复计算
4. **异步处理**：使用异步操作避免阻塞主线程
5. **内存管理**：及时清理不需要的数据

### 6.2 代码规范

1. **Airbnb 代码规范**：遵循 Airbnb JavaScript 代码规范
2. **错误处理**：完善的错误处理和日志记录
3. **类型检查**：使用 TypeScript 或 JSDoc 进行类型检查
4. **测试覆盖**：编写单元测试和集成测试
5. **文档完善**：提供完整的API文档和使用说明

### 6.3 最佳实践

1. **渐进式加载**：按需加载功能模块
2. **用户隐私**：保护用户隐私和数据安全
3. **跨浏览器兼容**：确保跨浏览器兼容性
4. **移动端适配**：优化移动端体验
5. **可扩展性**：设计可扩展的架构

这套全站请求耗时分析工具提供了完整的性能监控解决方案，包括数据收集、存储、分析和可视化功能，遵循了 Airbnb 代码规范和性能优化最佳实践。
