import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useVirtualListData from '../hooks/useVirtualListData';
import throttle from '../utils/throttle';
import debounce from '../utils/debounce';
import './AdvancedVirtualList.css';

// 高级DOM节点池 - 支持LRU缓存策略
class AdvancedDOMNodePool {
  constructor(maxSize = 200) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = []; // 访问顺序，用于LRU
  }

  get(key) {
    if (this.cache.has(key)) {
      // 更新访问顺序
      this.updateAccessOrder(key);
      return this.cache.get(key);
    }
    return null;
  }

  set(key, node) {
    if (this.cache.has(key)) {
      this.updateAccessOrder(key);
      return;
    }

    // 如果缓存满了，删除最久未使用的
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, node);
    this.accessOrder.push(key);
  }

  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  get size() {
    return this.cache.size;
  }

  get stats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    };
  }

  // 简单的命中率统计
  hitCount = 0;
  missCount = 0;

  recordHit() {
    this.hitCount++;
  }

  recordMiss() {
    this.missCount++;
  }
}

// 性能监控器
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      renderTime: [],
      scrollEvents: 0,
      dataLoads: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  startTimer() {
    return performance.now();
  }

  endTimer(startTime) {
    const duration = performance.now() - startTime;
    this.metrics.renderTime.push(duration);
    if (this.metrics.renderTime.length > 100) {
      this.metrics.renderTime.shift();
    }
    return duration;
  }

  recordScroll() {
    this.metrics.scrollEvents++;
  }

  recordDataLoad() {
    this.metrics.dataLoads++;
  }

  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }

  getAverageRenderTime() {
    if (this.metrics.renderTime.length === 0) return 0;
    return this.metrics.renderTime.reduce((a, b) => a + b, 0) / this.metrics.renderTime.length;
  }

  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  reset() {
    this.metrics = {
      renderTime: [],
      scrollEvents: 0,
      dataLoads: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }
}

const AdvancedVirtualList = ({ itemHeight, visibleCount, bufferSize }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const [computedRange, setComputedRange] = useState({ startIndex: 0, endIndex: 0 });
  const [performanceStats, setPerformanceStats] = useState({});
  
  const containerRef = useRef(null);
  const nodePoolRef = useRef(new AdvancedDOMNodePool());
  const performanceMonitorRef = useRef(new PerformanceMonitor());
  const workerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const renderTimerRef = useRef(null);
  
  const {
    data,
    totalCount,
    loading,
    error,
    searchError,
    getVisibleData,
    search,
    refresh
  } = useVirtualListData();

  // 创建Web Worker用于计算可见区域
  useEffect(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const { scrollTop, itemHeight, visibleCount, bufferSize, totalCount } = e.data;
        
        // 计算可见区域
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
        const endIndex = Math.min(startIndex + visibleCount + bufferSize * 2, totalCount);
        
        // 计算性能指标
        const performanceMetrics = {
          startIndex,
          endIndex,
          totalHeight: totalCount * itemHeight,
          visibleItemCount: endIndex - startIndex,
          scrollPosition: scrollTop
        };
        
        self.postMessage(performanceMetrics);
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);

    workerRef.current.onmessage = (e) => {
      setComputedRange(e.data);
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      URL.revokeObjectURL(workerUrl);
    };
  }, [itemHeight, visibleCount, bufferSize]);

  // 当滚动位置变化时，发送消息给Worker
  useEffect(() => {
    if (workerRef.current && totalCount > 0) {
      workerRef.current.postMessage({
        scrollTop,
        itemHeight,
        visibleCount,
        bufferSize,
        totalCount
      });
    }
  }, [scrollTop, itemHeight, visibleCount, bufferSize, totalCount]);

  // 缓存可见数据
  const visibleData = useMemo(() => {
    const startTimer = performanceMonitorRef.current.startTimer();
    
    const items = [];
    for (let i = computedRange.startIndex; i < computedRange.endIndex; i++) {
      if (i >= totalCount) break;
      items.push({
        index: i,
        data: data[i],
        top: i * itemHeight,
        key: `item-${i}`,
        isVisible: true
      });
    }

    performanceMonitorRef.current.endTimer(startTimer);
    return items;
  }, [computedRange.startIndex, computedRange.endIndex, totalCount, data, itemHeight]);

  // 处理滚动事件 - 使用节流优化
  const handleScroll = useCallback(
    throttle(e => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);
      performanceMonitorRef.current.recordScroll();
      
      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // 设置滚动结束检测
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }, 16), // 约60fps
  []);

  // 当可见区域变化时，加载数据 - 使用防抖优化
  const debouncedGetVisibleData = useCallback(
    debounce((start, end) => {
      if (totalCount > 0) {
        getVisibleData(start, end);
        performanceMonitorRef.current.recordDataLoad();
      }
    }, 100),
    [totalCount, getVisibleData]
  );

  useEffect(() => {
    if (computedRange.endIndex > computedRange.startIndex) {
      debouncedGetVisibleData(computedRange.startIndex, computedRange.endIndex);
    }
  }, [computedRange, debouncedGetVisibleData]);

  // 处理搜索 - 使用防抖优化
  const handleSearch = useCallback(
    debounce((query) => {
      search(query);
    }, 300),
    [search]
  );

  const handleSearchInput = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  }, [handleSearch]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    nodePoolRef.current.clear();
    performanceMonitorRef.current.reset();
    refresh();
  }, [refresh]);

  // 优化的列表项渲染组件
  const ListItem = useCallback(({ item, index, top, height, backgroundColor }) => {
    const nodeKey = `item-${index}`;
    const cachedNode = nodePoolRef.current.get(nodeKey);
    
    if (cachedNode && !isScrolling) {
      performanceMonitorRef.current.recordCacheHit();
      return cachedNode;
    }

    performanceMonitorRef.current.recordCacheMiss();

    const node = (
      <div
        key={nodeKey}
        className="virtual-list__item"
        style={{
          position: 'absolute',
          top: `${top}px`,
          height: `${height}px`,
          width: '100%',
          backgroundColor,
          transition: isScrolling ? 'none' : 'background-color 0.2s ease',
          willChange: isScrolling ? 'transform' : 'auto'
        }}
      >
        {item ? (
          <div className="virtual-list__item-content">
            <div className="virtual-list__item-text">
              <div className="virtual-list__item-title">
                {item.name || item.sender || `Item ${index + 1}`}
              </div>
              <div className="virtual-list__item-description">
                {item.email || item.content || item.description || 'No description'}
              </div>
            </div>
          </div>
        ) : (
          <div className="virtual-list__loading-placeholder">
            {loading ? 'Loading...' : 'No data'}
          </div>
        )}
      </div>
    );

    // 缓存节点（仅在非滚动状态下）
    if (!isScrolling) {
      nodePoolRef.current.set(nodeKey, node);
    }

    return node;
  }, [loading, isScrolling]);

  // 渲染可见的列表项 - 使用 useMemo 缓存
  const renderedItems = useMemo(() => {
    const startTimer = performanceMonitorRef.current.startTimer();
    
    const items = visibleData.map(({ index, data: item, top, key }) => (
      <ListItem
        key={key}
        item={item}
        index={index}
        top={top}
        height={itemHeight}
        backgroundColor={index % 2 === 0 ? '#f9f9f9' : '#ffffff'}
      />
    ));

    performanceMonitorRef.current.endTimer(startTimer);
    return items;
  }, [visibleData, ListItem, itemHeight]);

  // 更新性能统计
  useEffect(() => {
    const updateStats = () => {
      const monitor = performanceMonitorRef.current;
      const pool = nodePoolRef.current;
      
      setPerformanceStats({
        averageRenderTime: monitor.getAverageRenderTime().toFixed(2),
        cacheHitRate: (monitor.getCacheHitRate() * 100).toFixed(1),
        cacheSize: pool.size,
        scrollEvents: monitor.metrics.scrollEvents,
        dataLoads: monitor.metrics.dataLoads,
        workerStatus: workerRef.current ? '运行中' : '未启动'
      });
    };

    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="virtual-list">
      <h3 className="virtual-list__title">
        高级虚拟列表（Web Worker + 智能缓存）
      </h3>
      
      {/* 控制面板 */}
      <div className="virtual-list__controls">
        <input
          className="virtual-list__search-input"
          type="text"
          placeholder="搜索..."
          value={searchQuery}
          onChange={handleSearchInput}
        />
        <button
          className="virtual-list__refresh-button"
          disabled={loading}
          onClick={handleRefresh}
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 性能统计 */}
      <div className="virtual-list__performance">
        <h4>性能监控</h4>
        <div className="virtual-list__performance-grid">
          <div>平均渲染时间: {performanceStats.averageRenderTime}ms</div>
          <div>缓存命中率: {performanceStats.cacheHitRate}%</div>
          <div>缓存节点数: {performanceStats.cacheSize}</div>
          <div>滚动事件数: {performanceStats.scrollEvents}</div>
          <div>数据加载次数: {performanceStats.dataLoads}</div>
          <div>Worker状态: {performanceStats.workerStatus}</div>
        </div>
      </div>

      {/* 状态信息 */}
      <div className="virtual-list__status">
        <div>总数: {totalCount.toLocaleString()}</div>
        <div>可见范围: {computedRange.startIndex + 1} - {Math.min(computedRange.endIndex, totalCount)}</div>
        <div>可见项目数: {computedRange.endIndex - computedRange.startIndex}</div>
        <div>滚动状态: {isScrolling ? '滚动中' : '静止'}</div>
        <div>加载状态: {loading ? '加载中...' : '就绪'}</div>
        {error && <div className="virtual-list__status--error">错误: {error}</div>}
        {searchError && <div className="virtual-list__status--error">搜索错误: {searchError}</div>}
      </div>

      {/* 虚拟列表容器 */}
      <div
        ref={containerRef}
        className="virtual-list__scroll-container"
        style={{ 
          height: `${visibleCount * itemHeight}px`,
          overflow: 'auto',
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        <div 
          className="virtual-list__content" 
          style={{ 
            height: `${computedRange.totalHeight || totalCount * itemHeight}px`,
            position: 'relative'
          }}
        >
          {renderedItems}
        </div>
      </div>
    </div>
  );
};

export default AdvancedVirtualList;
