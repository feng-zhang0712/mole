import { useRef, useCallback, useMemo } from 'react';

/**
 * 数据缓存Hook - 解决数据同步和缓存问题
 * 包括数据去重、数据排序、缓存策略等
 */
export const useDataCache = (maxSize = 100, ttl = 5 * 60 * 1000) => {
  const cacheRef = useRef(new Map());
  const accessOrderRef = useRef([]);
  const sizeRef = useRef(0);

  // 清理过期缓存
  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    const expiredKeys = [];
    
    for (const [key, value] of cacheRef.current.entries()) {
      if (value.timestamp && (now - value.timestamp) > ttl) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      cacheRef.current.delete(key);
      sizeRef.current--;
      
      const index = accessOrderRef.current.indexOf(key);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
    });
  }, [ttl]);

  // 更新访问顺序
  const updateAccessOrder = useCallback((key) => {
    const index = accessOrderRef.current.indexOf(key);
    if (index > -1) {
      accessOrderRef.current.splice(index, 1);
    }
    accessOrderRef.current.push(key);
  }, []);

  // 获取缓存数据
  const getCachedData = useCallback((key) => {
    const cached = cacheRef.current.get(key);
    
    if (cached) {
      // 检查是否过期
      if (cached.timestamp && (Date.now() - cached.timestamp) > ttl) {
        cacheRef.current.delete(key);
        sizeRef.current--;
        
        const index = accessOrderRef.current.indexOf(key);
        if (index > -1) {
          accessOrderRef.current.splice(index, 1);
        }
        return null;
      }
      
      // 更新访问顺序
      updateAccessOrder(key);
      return cached.data;
    }
    
    return null;
  }, [ttl, updateAccessOrder]);

  // 设置缓存数据
  const setCachedData = useCallback((key, data) => {
    // 清理过期缓存
    cleanupExpiredCache();
    
    // 如果缓存已满，移除最久未访问的数据
    if (sizeRef.current >= maxSize && !cacheRef.current.has(key)) {
      const oldestKey = accessOrderRef.current.shift();
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
        sizeRef.current--;
      }
    }
    
    // 添加新数据
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      accessCount: 0
    };
    
    if (!cacheRef.current.has(key)) {
      sizeRef.current++;
    }
    
    cacheRef.current.set(key, cacheEntry);
    updateAccessOrder(key);
  }, [maxSize, ttl, cleanupExpiredCache, updateAccessOrder]);

  // 删除缓存数据
  const removeCachedData = useCallback((key) => {
    if (cacheRef.current.has(key)) {
      cacheRef.current.delete(key);
      sizeRef.current--;
      
      const index = accessOrderRef.current.indexOf(key);
      if (index > -1) {
        accessOrderRef.current.splice(index, 1);
      }
    }
  }, []);

  // 清空所有缓存
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    accessOrderRef.current.length = 0;
    sizeRef.current = 0;
  }, []);

  // 获取缓存统计信息
  const getCacheStats = useCallback(() => {
    return {
      size: sizeRef.current,
      maxSize,
      ttl,
      keys: Array.from(cacheRef.current.keys()),
      accessOrder: [...accessOrderRef.current]
    };
  }, [maxSize, ttl]);

  // 数据去重
  const deduplicateData = useCallback((data, keyField = 'id') => {
    const seen = new Set();
    return data.filter(item => {
      const key = item[keyField];
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, []);

  // 数据排序
  const sortData = useCallback((data, sortField, sortOrder = 'asc') => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, []);

  // 批量设置缓存
  const setBatchCachedData = useCallback((dataMap) => {
    Object.entries(dataMap).forEach(([key, data]) => {
      setCachedData(key, data);
    });
  }, [setCachedData]);

  // 缓存命中率计算
  const getCacheHitRate = useMemo(() => {
    let hits = 0;
    let total = 0;
    
    for (const entry of cacheRef.current.values()) {
      total++;
      if (entry.accessCount > 0) {
        hits++;
      }
    }
    
    return total > 0 ? (hits / total) * 100 : 0;
  }, []);

  return {
    getCachedData,
    setCachedData,
    removeCachedData,
    clearCache,
    getCacheStats,
    deduplicateData,
    sortData,
    setBatchCachedData,
    getCacheHitRate,
    cacheSize: sizeRef.current,
    maxCacheSize: maxSize
  };
};
