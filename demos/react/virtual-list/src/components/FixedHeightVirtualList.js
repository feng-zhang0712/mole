import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useVirtualListData from '../hooks/useVirtualListData';
import throttle from '../utils/throttle';
import debounce from '../utils/debounce';

// DOM节点池 - 用于复用DOM节点
class DOMNodePool {
  constructor() {
    this.pool = new Map();
    this.maxPoolSize = 100; // 最大池大小
  }

  // 获取节点
  get(key) {
    return this.pool.get(key);
  }

  // 存储节点
  set(key, node) {
    if (this.pool.size >= this.maxPoolSize) {
      // 如果池满了，删除最旧的节点
      const firstKey = this.pool.keys().next().value;
      this.pool.delete(firstKey);
    }
    this.pool.set(key, node);
  }

  // 清理池
  clear() {
    this.pool.clear();
  }
}

const FixedHeightVirtualList = ({ itemHeight, visibleCount, bufferSize }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const nodePoolRef = useRef(new DOMNodePool());
  const lastRenderRangeRef = useRef({ startIndex: 0, endIndex: 0 });
  const scrollTimeoutRef = useRef(null);
  
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

  // 使用 useMemo 缓存计算结果，避免不必要的重新计算
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const end = Math.min(start + visibleCount + bufferSize * 2, totalCount);
    const height = totalCount * itemHeight;
    
    return {
      startIndex: start,
      endIndex: end,
      totalHeight: height
    };
  }, [scrollTop, itemHeight, visibleCount, bufferSize, totalCount]);

  // 检查是否需要重新渲染
  const shouldReRender = useMemo(() => {
    const lastRange = lastRenderRangeRef.current;
    return (
      lastRange.startIndex !== startIndex ||
      lastRange.endIndex !== endIndex ||
      isScrolling !== lastRange.isScrolling
    );
  }, [startIndex, endIndex, isScrolling]);

  // 缓存可见数据，避免重复计算
  const visibleData = useMemo(() => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= totalCount) break;
      items.push({
        index: i,
        data: data[i],
        top: i * itemHeight,
        key: `item-${i}`
      });
    }
    return items;
  }, [startIndex, endIndex, totalCount, data, itemHeight]);

  // 处理滚动事件 - 使用节流优化
  const handleScroll = useCallback(
    throttle(e => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);
      
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
      }
    }, 100),
    [totalCount, getVisibleData]
  );

  useEffect(() => {
    if (shouldReRender) {
      debouncedGetVisibleData(startIndex, endIndex);
      lastRenderRangeRef.current = { startIndex, endIndex, isScrolling };
    }
  }, [startIndex, endIndex, shouldReRender, debouncedGetVisibleData, isScrolling]);

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
    nodePoolRef.current.clear(); // 清理节点池
    refresh();
  }, [refresh]);

  // 优化的列表项渲染组件
  const ListItem = useCallback(({ item, index, top, height, backgroundColor }) => {
    const nodeKey = `item-${index}`;
    const cachedNode = nodePoolRef.current.get(nodeKey);
    
    // 只有在非滚动状态且有数据时才使用缓存
    if (cachedNode && !isScrolling && item) {
      return cachedNode;
    }

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
          transition: isScrolling ? 'none' : 'background-color 0.2s ease'
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

    // 只缓存有数据的节点（避免缓存loading状态的节点）
    if (!isScrolling && item) {
      nodePoolRef.current.set(nodeKey, node);
    }

    return node;
  }, [loading, isScrolling]);

  // 渲染可见的列表项 - 使用 useMemo 缓存
  const renderedItems = useMemo(() => {
    return visibleData.map(({ index, data: item, top, key }) => (
      <ListItem
        key={key}
        item={item}
        index={index}
        top={top}
        height={itemHeight}
        backgroundColor={index % 2 === 0 ? '#f9f9f9' : '#ffffff'}
      />
    ));
  }, [visibleData, ListItem, itemHeight]);

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
        优化版固定高度虚拟列表
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

      {/* 状态信息 */}
      <div className="virtual-list__status">
        <div>总数: {totalCount.toLocaleString()}</div>
        <div>可见范围: {startIndex + 1} - {Math.min(endIndex, totalCount)}</div>
        <div>缓存节点数: {nodePoolRef.current.pool.size}</div>
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
            height: `${totalHeight}px`,
            position: 'relative'
          }}
        >
          {renderedItems}
        </div>
      </div>
    </div>
  );
};

export default FixedHeightVirtualList;
