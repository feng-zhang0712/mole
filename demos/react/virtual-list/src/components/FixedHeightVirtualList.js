import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVirtualListData from '../hooks/useVirtualListData';
import throttle from '../utils/throttle';

const FixedHeightVirtualList = ({ itemHeight, visibleCount, bufferSize }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  
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

  // 计算可见区域的起始和结束索引
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + bufferSize, totalCount);
  
  // 计算容器的总高度
  const totalHeight = totalCount * itemHeight;

  // 处理滚动事件 - 使用节流优化
  const handleScroll = useCallback(
    throttle((e) => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);
    }, 200),
  []);

  // 当可见区域变化时，加载数据
  useEffect(() => {
    if (totalCount > 0) {
      getVisibleData(startIndex, endIndex);
    }
  }, [startIndex, endIndex, totalCount, getVisibleData]);

  // 处理搜索
  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    search(query);
  }, [search]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // 渲染可见的列表项
  const renderVisibleItems = () => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= totalCount) break;
      
      const item = data[i];
      const top = i * itemHeight;
      
      items.push(
        <div
          key={i}
          className="virtual-list__item"
          style={{
            top: `${top}px`,
            height: `${itemHeight}px`,
            backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff'
          }}
        >
          {item ? (
            <div className="virtual-list__item-content">
              <div className="virtual-list__item-text">
                <div className="virtual-list__item-title">
                  {item.name || item.sender || `Item ${i + 1}`}
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
    }
    return items;
  };

  return (
    <div className="virtual-list">
      <h3 className="virtual-list__title">
        固定高度虚拟列表
      </h3>
      
      {/* 控制面板 */}
      <div className="virtual-list__controls">
        <input
          className="virtual-list__search-input"
          type="text"
          placeholder="搜索..."
          value={searchQuery}
          onChange={handleSearch}
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
        <div>加载状态: {loading ? '加载中...' : '就绪'}</div>
        {error && <div className="virtual-list__status--error">错误: {error}</div>}
        {searchError && <div className="virtual-list__status--error">搜索错误: {searchError}</div>}
      </div>

      {/* 虚拟列表容器 */}
      <div
        ref={containerRef}
        className="virtual-list__scroll-container"
        style={{ height: `${visibleCount * itemHeight}px` }}
        onScroll={handleScroll}
        onScrollEnd={handleScroll}
      >
        <div className="virtual-list__content" style={{ height: `${totalHeight}px` }}>
          {renderVisibleItems()}
        </div>
      </div>
    </div>
  );
};

export default FixedHeightVirtualList;
