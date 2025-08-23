import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVirtualList } from '../hooks/useVirtualList';
import { useDataLoader } from '../hooks/useDataLoader';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

const VirtualList = ({ searchParams, onPerformanceUpdate }) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(400);
  
  // 使用自定义hooks解决不同问题
  const { data, loading, error, totalCount } = useDataLoader(searchParams);
  const { renderTime, memoryUsage, frameRate } = usePerformanceMonitor();
  
  // 虚拟列表配置 - 解决DOM节点数量控制问题
  const itemHeight = 60; // 固定高度，简化计算
  const overscan = 5; // 缓冲区大小，解决可视区域判断问题
  
  // 使用虚拟列表hook - 解决滚动位置计算和可视区域判断问题
  const { virtualItems, totalSize, scrollToIndex, setContainerRef } = useVirtualList({
    count: totalCount,
    itemHeight,
    containerHeight,
    overscan
  });
  
  // 响应式容器高度调整 - 解决响应式适配问题
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = Math.min(window.innerHeight * 0.6, 600);
        setContainerHeight(height);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  // 滚动到顶部 - 解决边界情况问题
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);
  
  // 滚动到底部 - 解决边界情况问题
  const scrollToBottom = useCallback(() => {
    scrollToIndex(totalCount - 1);
  }, [scrollToIndex, totalCount]);
  
  // 性能数据更新 - 解决性能监控问题
  useEffect(() => {
    onPerformanceUpdate({
      renderTime,
      memoryUsage,
      frameRate
    });
  }, [renderTime, memoryUsage, frameRate]);
  
  // 错误处理 - 解决错误处理和边界情况问题
  if (error) {
    return (
      <div>
        <p>Error loading data: {error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  
  return (
    <div>
      {/* 控制面板 */}
      <div>
        <button onClick={scrollToTop}>Scroll to Top</button>
        <button onClick={scrollToBottom}>Scroll to Bottom</button>
        <span>Total: {totalCount} items</span>
        <span>Visible: {virtualItems.length} items</span>
      </div>
      
      {/* 虚拟列表容器 */}
      <div
        ref={setContainerRef}
        style={{
          height: containerHeight,
          overflow: 'auto',
          border: '1px solid #ccc',
          position: 'relative'
        }}
      >
        {/* 总高度占位器 - 解决滚动位置计算问题 */}
        <div style={{ height: totalSize }}>
          {/* 虚拟列表项 */}
          {virtualItems.map(virtualItem => {
            const item = data[virtualItem.index];
            if (!item) {
              // 占位符 - 解决DOM节点数量控制问题
              return (
                <div
                  key={`placeholder-${virtualItem.index}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: itemHeight,
                    transform: `translateY(${virtualItem.start}px)`
                  }}
                >
                  Loading...
                </div>
              );
            }
            
            return (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: itemHeight,
                  transform: `translateY(${virtualItem.start}px)`,
                  borderBottom: '1px solid #eee',
                  padding: '8px',
                  boxSizing: 'border-box'
                }}
              >
                <div>
                  <strong>{item.title}</strong>
                  <span> - {item.category} (Priority: {item.priority})</span>
                </div>
                <div>{item.description}</div>
              </div>
            );
          })}
        </div>
        
        {/* 加载状态指示器 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading more data...
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualList;
