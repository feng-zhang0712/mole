// 高级优化工具集合

// 内存管理优化器
class MemoryOptimizer {
  constructor() {
    this.weakRefs = new Map();
    this.gcInterval = null;
  }

  // 使用 WeakRef 管理大对象
  trackLargeObject(key, object) {
    this.weakRefs.set(key, new WeakRef(object));
  }

  // 清理失效的 WeakRef
  cleanupWeakRefs() {
    for (const [key, weakRef] of this.weakRefs.entries()) {
      if (!weakRef.deref()) {
        this.weakRefs.delete(key);
      }
    }
  }

  // 手动触发垃圾回收（如果支持）
  requestGC() {
    if (window.gc) {
      window.gc();
    }
  }

  // 监控内存使用
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2) + '%'
      };
    }
    return null;
  }

  startMonitoring() {
    this.gcInterval = setInterval(() => {
      this.cleanupWeakRefs();
      if (this.getMemoryInfo()?.usage > 80) {
        this.requestGC();
      }
    }, 10000);
  }

  stopMonitoring() {
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = null;
    }
  }
}

// 网络优化器
class NetworkOptimizer {
  constructor() {
    this.requestQueue = [];
    this.activeRequests = new Map();
    this.maxConcurrent = 6;
    this.retryAttempts = 3;
  }

  // 请求去重
  deduplicateRequest(url, options = {}) {
    const key = `${url}-${JSON.stringify(options)}`;
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key);
    }

    const promise = this.executeRequest(url, options);
    this.activeRequests.set(key, promise);
    
    promise.finally(() => {
      this.activeRequests.delete(key);
    });

    return promise;
  }

  // 执行请求
  async executeRequest(url, options = {}, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt < this.retryAttempts && error.name !== 'AbortError') {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        return this.executeRequest(url, options, attempt + 1);
      }
      throw error;
    }
  }

  // 批量请求
  async batchRequests(requests) {
    const results = [];
    const batchSize = 3;

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(req => this.executeRequest(req.url, req.options))
      );
      results.push(...batchResults);
    }

    return results;
  }

  // 预加载关键资源
  preloadCriticalResources(urls) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'fetch';
      document.head.appendChild(link);
    });
  }
}

// 渲染优化器
class RenderOptimizer {
  constructor() {
    this.observer = null;
    this.intersectionCache = new Map();
    this.resizeCache = new Map();
  }

  // 设置 Intersection Observer
  setupIntersectionObserver(callback, options = {}) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const key = entry.target.dataset.key;
        this.intersectionCache.set(key, entry.isIntersecting);
        callback(key, entry.isIntersecting, entry);
      });
    }, {
      rootMargin: '50px',
      threshold: 0,
      ...options
    });
  }

  // 观察元素
  observeElement(element, key) {
    if (this.observer) {
      element.dataset.key = key;
      this.observer.observe(element);
    }
  }

  // 停止观察
  unobserveElement(element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  // 批量DOM更新
  batchDOMUpdates(updates) {
    const fragment = document.createDocumentFragment();
    
    updates.forEach(update => {
      const { element, content, attributes } = update;
      
      if (content) {
        element.innerHTML = content;
      }
      
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
      
      fragment.appendChild(element);
    });

    return fragment;
  }

  // 虚拟滚动优化
  optimizeVirtualScroll(container, options = {}) {
    const {
      itemHeight = 60,
      bufferSize = 5,
      throttleMs = 16
    } = options;

    let ticking = false;
    let lastScrollTop = 0;

    const updateVisibleRange = () => {
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + bufferSize * 2,
        options.totalCount || Infinity
      );

      if (options.onRangeChange) {
        options.onRangeChange({
          start: Math.max(0, startIndex - bufferSize),
          end: endIndex,
          scrollTop
        });
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateVisibleRange);
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }

  // 清理
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.intersectionCache.clear();
    this.resizeCache.clear();
  }
}

// 性能分析器
class PerformanceAnalyzer {
  constructor() {
    this.metrics = {
      renderTimes: [],
      scrollEvents: [],
      memorySnapshots: [],
      networkRequests: []
    };
    this.observers = [];
  }

  // 测量函数执行时间
  measureExecutionTime(fn, name = 'unnamed') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.metrics.renderTimes.push({
      name,
      duration: end - start,
      timestamp: Date.now()
    });

    return result;
  }

  // 监控滚动性能
  monitorScrollPerformance(element) {
    let lastTime = performance.now();
    let frameCount = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          this.metrics.scrollEvents.push({
            name: entry.name,
            duration: entry.duration,
            timestamp: Date.now()
          });
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);

    return () => {
      observer.disconnect();
    };
  }

  // 获取性能报告
  getPerformanceReport() {
    const renderTimes = this.metrics.renderTimes;
    const scrollEvents = this.metrics.scrollEvents;

    const avgRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((sum, item) => sum + item.duration, 0) / renderTimes.length 
      : 0;

    const avgScrollTime = scrollEvents.length > 0
      ? scrollEvents.reduce((sum, item) => sum + item.duration, 0) / scrollEvents.length
      : 0;

    return {
      avgRenderTime: avgRenderTime.toFixed(2),
      avgScrollTime: avgScrollTime.toFixed(2),
      totalRenders: renderTimes.length,
      totalScrollEvents: scrollEvents.length,
      memoryInfo: this.getMemoryInfo()
    };
  }

  // 获取内存信息
  getMemoryInfo() {
    if (performance.memory) {
      return {
        used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB'
      };
    }
    return null;
  }

  // 清理
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = {
      renderTimes: [],
      scrollEvents: [],
      memorySnapshots: [],
      networkRequests: []
    };
  }
}

export {
  MemoryOptimizer,
  NetworkOptimizer,
  RenderOptimizer,
  PerformanceAnalyzer
};
