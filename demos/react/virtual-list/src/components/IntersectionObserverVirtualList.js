import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVirtualListData from '../hooks/useVirtualListData';

const IntersectionObserverVirtualList = ({ itemHeight, visibleCount, bufferSize }) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  
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

  // 初始化 Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          if (entry.isIntersecting) {
            setVisibleItems(prev => new Set([...prev, index]));
          } else {
            setVisibleItems(prev => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: `${bufferSize * itemHeight}px`,
        threshold: 0
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [itemHeight, bufferSize]);

  // 当可见项变化时，加载数据
  useEffect(() => {
    if (visibleItems.size > 0 && totalCount > 0) {
      const visibleArray = Array.from(visibleItems).sort((a, b) => a - b);
      const startIndex = Math.max(0, visibleArray[0] - bufferSize);
      const endIndex = Math.min(totalCount, visibleArray[visibleArray.length - 1] + bufferSize + 1);
      
      getVisibleData(startIndex, endIndex);
    }
  }, [visibleItems, totalCount, bufferSize, getVisibleData]);

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

  // 渲染所有列表项（使用 Intersection Observer 控制可见性）
  const renderAllItems = () => {
    if (!observerRef.current) return [];

    const items = [];
    for (let i = 0; i < totalCount; i++) {
      const item = data[i];
      const top = i * itemHeight;
      
      items.push(
        <div
          key={i}
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          data-index={i}
          className="virtual-list__item"
          style={{
            position: 'absolute',
            top: `${top}px`,
            height: `${itemHeight}px`,
            width: '100%',
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

  // 计算总高度
  const totalHeight = totalCount * itemHeight;

  return (
    <div className="virtual-list">
      <h3 className="virtual-list__title">
        Intersection Observer 虚拟列表
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
        <div>可见项: {visibleItems.size}</div>
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
          height: `${visibleCount * itemHeight}px`
        }}
      >
        <div 
          className="virtual-list__content"
          style={{ height: `${totalHeight}px` }}
        >
          {renderAllItems()}
        </div>
      </div>
    </div>
  );
};

export default IntersectionObserverVirtualList;
