import React, { useRef, useState, useCallback, useEffect } from 'react';

const DynamicHeightVirtualList = ({ data, estimatedItemHeight = 60, visibleCount = 8 }) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [itemHeights, setItemHeights] = useState(new Map());
  const [itemPositions, setItemPositions] = useState([0]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(visibleCount);

  // 计算每个项的位置
  const calculatePositions = useCallback(() => {
    const positions = [0];
    for (let i = 0; i < data.length; i++) {
      const height = itemHeights.get(i) || estimatedItemHeight;
      positions[i + 1] = positions[i] + height;
    }
    setItemPositions(positions);
  }, [data.length, itemHeights, estimatedItemHeight]);

  // 二分查找可见区域的起始索引
  const findStartIndex = useCallback((scrollTop) => {
    let left = 0;
    let right = data.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (itemPositions[mid] <= scrollTop && 
          itemPositions[mid + 1] > scrollTop) {
        return mid;
      }
      if (itemPositions[mid] > scrollTop) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    return left;
  }, [itemPositions, data.length]);

  // 处理滚动事件
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    const start = findStartIndex(newScrollTop);
    const end = Math.min(start + visibleCount + 2, data.length);
    
    setStartIndex(start);
    setEndIndex(end);
  }, [findStartIndex, visibleCount, data.length]);

  // 测量列表项高度
  const measureItemHeight = useCallback((index, element) => {
    if (element) {
      const height = element.getBoundingClientRect().height;
      if (itemHeights.get(index) !== height) {
        setItemHeights(prev => {
          const newHeights = new Map(prev);
          newHeights.set(index, height);
          return newHeights;
        });
      }
    }
  }, [itemHeights]);

  // 当高度变化时重新计算位置
  useEffect(() => {
    calculatePositions();
  }, [calculatePositions]);

  // 渲染可见的列表项
  const renderVisibleItems = () => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= data.length) break;
      
      const item = data[i];
      const top = itemPositions[i];
      const height = itemHeights.get(i) || estimatedItemHeight;
      
      items.push(
        <div
          key={i}
          ref={(el) => measureItemHeight(i, el)}
          style={{
            position: 'absolute',
            top: `${top}px`,
            left: 0,
            right: 0,
            minHeight: `${estimatedItemHeight}px`,
            padding: '12px 16px',
            borderBottom: '1px solid #eee',
            background: i % 2 === 0 ? '#f9f9f9' : '#fff',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Item {i + 1}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>
            {item.name || item.sender || `Data ${i + 1}`}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {item.description || item.content || item.email || 'No description'}
          </div>
          {item.price && (
            <div style={{ 
              fontSize: '16px', 
              color: '#e44d26', 
              fontWeight: 'bold',
              marginTop: '4px'
            }}>
              ${item.price}
            </div>
          )}
        </div>
      );
    }
    return items;
  };

  const totalHeight = itemPositions[data.length] || data.length * estimatedItemHeight;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>动态高度虚拟列表 ({data.length} 项)</h3>
      <div
        ref={containerRef}
        style={{
          height: `${visibleCount * estimatedItemHeight}px`,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid #ccc'
        }}
        onScroll={handleScroll}
      >
        {/* 撑开滚动条的内容容器 */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {renderVisibleItems()}
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        可见范围: {startIndex + 1} - {endIndex} / {data.length} | 
        总高度: {Math.round(totalHeight)}px
      </div>
    </div>
  );
};

export default DynamicHeightVirtualList;
