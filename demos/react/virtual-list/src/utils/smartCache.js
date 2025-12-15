// 智能缓存系统
class SmartCache {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = [];
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0
    };
  }

  // 获取缓存项
  get(key) {
    if (this.cache.has(key)) {
      this.stats.hits++;
      this.updateAccessOrder(key);
      return this.cache.get(key);
    }
    this.stats.misses++;
    return null;
  }

  // 设置缓存项
  set(key, value, ttl = 300000) { // 默认5分钟TTL
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0
    });
    this.updateAccessOrder(key);
  }

  // 更新访问顺序
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
    
    // 更新访问次数
    const item = this.cache.get(key);
    if (item) {
      item.accessCount++;
    }
  }

  // LRU淘汰策略
  evictLRU() {
    if (this.accessOrder.length === 0) return;
    
    const lruKey = this.accessOrder.shift();
    this.cache.delete(lruKey);
    this.stats.evictions++;
  }

  // 清理过期项
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
          this.accessOrder.splice(index, 1);
        }
      }
    }
  }

  // 预加载数据
  preload(keys, loader) {
    return Promise.all(
      keys.map(async (key) => {
        if (!this.cache.has(key)) {
          try {
            const value = await loader(key);
            this.set(key, value);
            return { key, success: true };
          } catch (error) {
            return { key, success: false, error };
          }
        }
        return { key, success: true, cached: true };
      })
    );
  }

  // 获取缓存统计
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses)
    };
  }

  // 清空缓存
  clear() {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
}

// 预测性缓存
class PredictiveCache extends SmartCache {
  constructor(maxSize = 1000) {
    super(maxSize);
    this.accessPatterns = new Map();
    this.predictionWindow = 10;
  }

  // 记录访问模式
  recordAccess(key) {
    if (!this.accessPatterns.has(key)) {
      this.accessPatterns.set(key, []);
    }
    
    const pattern = this.accessPatterns.get(key);
    pattern.push(Date.now());
    
    // 保持最近N次访问记录
    if (pattern.length > this.predictionWindow) {
      pattern.shift();
    }
  }

  // 预测下一个可能访问的项
  predictNextAccess(currentKey) {
    const currentPattern = this.accessPatterns.get(currentKey);
    if (!currentPattern || currentPattern.length < 2) return [];

    // 简单的线性预测
    const predictions = [];
    for (const [key, pattern] of this.accessPatterns.entries()) {
      if (key === currentKey) continue;
      
      // 计算访问频率
      const frequency = pattern.length / this.predictionWindow;
      if (frequency > 0.3) { // 30%以上的访问频率
        predictions.push({ key, frequency });
      }
    }

    return predictions
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5) // 返回前5个预测
      .map(p => p.key);
  }

  // 智能预加载
  async smartPreload(currentKey, loader) {
    const predictions = this.predictNextAccess(currentKey);
    if (predictions.length > 0) {
      return this.preload(predictions, loader);
    }
    return [];
  }
}

export { SmartCache, PredictiveCache };
