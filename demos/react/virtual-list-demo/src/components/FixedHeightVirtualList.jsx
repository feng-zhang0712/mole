import React, { useRef, useEffect, useState, useCallback } from 'react';

const FixedHeightVirtualList = ({ data, itemHeight = 60, visibleCount = 10 }) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(visibleCount);

  // 计算可见区域的起始和结束索引
  const calculateVisibleRange = useCallback((scrollTop) => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(start + visibleCount + 1, data.length);
    return { start, end };
  }, [itemHeight, visibleCount, data.length]);

  // 处理滚动事件
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    const { start, end } = calculateVisibleRange(newScrollTop);
    setStartIndex(start);
    setEndIndex(end);
  }, [calculateVisibleRange]);

  // 渲染可见的列表项
  const renderVisibleItems = () => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= data.length) break;
      
      const item = data[i];
      const top = i * itemHeight;
      
      items.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${top}px`,
            left: 0,
            right: 0,
            height: `${itemHeight}px`,
            padding: '0 16px',
            borderBottom: '1px solid #eee',
            background: i % 2 === 0 ? '#f9f9f9' : '#fff',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Item {i + 1}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {JSON.stringify(item).substring(0, 50)}...
            </div>
          </div>
        </div>
      );
    }
    return items;
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>固定高度虚拟列表 ({data.length} 项)</h3>
      <div
        ref={containerRef}
        style={{
          height: `${visibleCount * itemHeight}px`,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid #ccc'
        }}
        onScroll={handleScroll}
      >
        {/* 撑开滚动条的内容容器 */}
        <div style={{ height: `${data.length * itemHeight}px`, position: 'relative' }}>
          {renderVisibleItems()}
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        可见范围: {startIndex + 1} - {endIndex} / {data.length}
      </div>
    </div>
  );
};

export default FixedHeightVirtualList;
