import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVirtualListData from '../hooks/useVirtualListData';

const DynamicHeightVirtualList = ({ estimatedItemHeight, visibleCount, bufferSize }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemPositions, setItemPositions] = useState(new Map());
  const [itemHeights, setItemHeights] = useState(new Map());
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

  // 计算项目位置
  const calculatePositions = useCallback(() => {
    const positions = new Map();
    const heights = new Map();
    let currentPosition = 0;

    for (let i = 0; i < totalCount; i++) {
      positions.set(i, currentPosition);
      
      // 如果已经加载了数据，使用实际高度，否则使用估算高度
      const item = data[i];
      const height = item ? (item.content && item.content.length > 100 ? 80 : 60) : estimatedItemHeight;
      
      heights.set(i, height);
      currentPosition += height;
    }

    setItemPositions(positions);
    setItemHeights(heights);
  }, [data, totalCount, estimatedItemHeight]);

  // 当数据变化时重新计算位置
  useEffect(() => {
    calculatePositions();
  }, [calculatePositions]);

  // 二分查找找到可见区域的起始索引
  const findStartIndex = useCallback((scrollTop) => {
    let left = 0;
    let right = totalCount - 1;
    let result = 0;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const position = itemPositions.get(mid) || 0;
      const height = itemHeights.get(mid) || estimatedItemHeight;

      if (position <= scrollTop && scrollTop < position + height) {
        result = mid;
        break;
      } else if (position < scrollTop) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return Math.max(0, result - bufferSize);
  }, [itemPositions, itemHeights, totalCount, bufferSize, estimatedItemHeight]);

  // 计算可见区域
  const startIndex = findStartIndex(scrollTop);
  const endIndex = Math.min(startIndex + visibleCount + bufferSize * 2, totalCount);
  
  // 计算总高度
  const totalHeight = itemPositions.get(totalCount - 1) || 0;
  
  // 计算可见区域的偏移量
  const offsetY = itemPositions.get(startIndex) || 0;

  // 处理滚动事件
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

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
      const position = itemPositions.get(i) || 0;
      const height = itemHeights.get(i) || estimatedItemHeight;
      const top = position - offsetY;
      
      items.push(
        <div
          key={i}
          className="virtual-list__item"
          style={{
            top: `${top}px`,
            height: `${height}px`,
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
        动态高度虚拟列表
      </h3>
      
      {/* 控制面板 */}
      <div className="virtual-list__controls">
        <input
          type="text"
          placeholder="搜索..."
          value={searchQuery}
          onChange={handleSearch}
          className="virtual-list__search-input"
        />
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="virtual-list__refresh-button"
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 状态信息 */}
      <div className="virtual-list__status">
        <div>总数: {totalCount.toLocaleString()}</div>
        <div>可见范围: {startIndex + 1} - {Math.min(endIndex, totalCount)}</div>
        <div>总高度: {totalHeight.toLocaleString()}px</div>
        <div>加载状态: {loading ? '加载中...' : '就绪'}</div>
        {error && <div className="virtual-list__status--error">错误: {error}</div>}
        {searchError && <div className="virtual-list__status--error">搜索错误: {searchError}</div>}
      </div>

      {/* 虚拟列表容器 */}
      <div
        ref={containerRef}
        className="virtual-list__scroll-container"
        style={{
          height: `${visibleCount * estimatedItemHeight}px`
        }}
        onScroll={handleScroll}
      >
        <div 
          className="virtual-list__content"
          style={{ height: `${totalHeight}px` }}
        >
          {renderVisibleItems()}
        </div>
      </div>
    </div>
  );
};

export default DynamicHeightVirtualList;

