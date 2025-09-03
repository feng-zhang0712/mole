import React, { useEffect, useRef, useCallback } from 'react';
import { useVirtualListReducer } from '../hooks/useVirtualListReducer';
import throttle from '../utils/throttle';

const ReducerBasedVirtualList = ({ itemHeight, visibleCount, bufferSize }) => {
  const containerRef = useRef(null);
  const workerRef = useRef(null);
  
  const {
    data,
    totalCount,
    loading,
    error,
    searchError,
    scrollTop,
    computedRange,
    getVisibleData,
    search,
    refresh,
    setScrollTop,
    setComputedRange
  } = useVirtualListReducer();

  // 创建 Web Worker
  useEffect(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const { scrollTop, itemHeight, visibleCount, bufferSize, totalCount } = e.data;
        
        // 计算可见区域
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(startIndex + visibleCount + bufferSize, totalCount);
        
        self.postMessage({
          startIndex: Math.max(0, startIndex - bufferSize),
          endIndex: endIndex
        });
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
  }, [itemHeight, visibleCount, bufferSize, setComputedRange]);

  // 当滚动位置变化时，发送消息给 Worker
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

  // 当计算出的可见区域变化时，加载数据
  useEffect(() => {
    if (totalCount > 0 && computedRange.endIndex > computedRange.startIndex) {
      getVisibleData(computedRange.startIndex, computedRange.endIndex);
    }
  }, [computedRange, totalCount, getVisibleData]);

  // 处理滚动事件
  const handleScroll = useCallback(
    throttle((e) => {
      const newScrollTop = e.target.scrollTop;
      setScrollTop(newScrollTop);
    }, 200),
    [setScrollTop]
  );

  // 处理搜索
  const handleSearch = useCallback((e) => {
    const query = e.target.value;
    search(query);
  }, [search]);

  // 处理刷新
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // 渲染可见的列表项
  const renderVisibleItems = () => {
    const items = [];
    for (let i = computedRange.startIndex; i < computedRange.endIndex; i++) {
      if (i >= totalCount) break;
      
      const item = data[i];
      const top = i * itemHeight;
      
      items.push(
        <div
          key={i}
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

  // 计算容器的总高度
  const totalHeight = totalCount * itemHeight;

  return (
    <div className="virtual-list">
      <h3 className="virtual-list__title">
        useReducer 虚拟列表
      </h3>
      
      {/* 控制面板 */}
      <div className="virtual-list__controls">
        <input
          className="virtual-list__search-input"
          type="text"
          placeholder="搜索..."
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
        <div>可见范围: {computedRange.startIndex + 1} - {Math.min(computedRange.endIndex, totalCount)}</div>
        <div>总高度: {totalHeight.toLocaleString()}px</div>
        <div>加载状态: {loading ? '加载中...' : '就绪'}</div>
        <div>Worker状态: {workerRef.current ? '运行中' : '未启动'}</div>
        {error && <div className="virtual-list__status--error">错误: {error}</div>}
        {searchError && <div className="virtual-list__status--error">搜索错误: {searchError}</div>}
      </div>

      {/* 虚拟列表容器 */}
      <div
        ref={containerRef}
        className="virtual-list__scroll-container"
        style={{ height: `${visibleCount * itemHeight}px` }}
        onScroll={handleScroll}
      >
        <div className="virtual-list__content" style={{ height: `${totalHeight}px` }}>
          {renderVisibleItems()}
        </div>
      </div>
    </div>
  );
};

export default ReducerBasedVirtualList;
