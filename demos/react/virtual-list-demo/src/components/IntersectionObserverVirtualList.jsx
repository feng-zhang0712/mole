import React, { useRef, useState, useCallback, useEffect } from 'react';

const IntersectionObserverVirtualList = ({ data, itemHeight = 60, visibleCount = 10 }) => {
  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const [observer, setObserver] = useState(null);

  // 设置 Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const newObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = parseInt(entry.target.dataset.index);
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
        rootMargin: '50px', // 预加载区域
        threshold: 0.1
      }
    );

    setObserver(newObserver);

    return () => {
      newObserver.disconnect();
    };
  }, []);

  // 渲染所有项，但只观察可见的
  const renderItems = useCallback(() => {
    if (!observer) return [];

    const items = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const top = i * itemHeight;
      
      const itemElement = (
        <div
          key={i}
          data-index={i}
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
            boxSizing: 'border-box',
            opacity: visibleItems.has(i) ? 1 : 0.3,
            transition: 'opacity 0.2s ease'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Item {i + 1}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {item.name || item.sender || `Data ${i + 1}`}
            </div>
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: visibleItems.has(i) ? '#4CAF50' : '#999',
            fontWeight: 'bold'
          }}>
            {visibleItems.has(i) ? 'VISIBLE' : 'HIDDEN'}
          </div>
        </div>
      );

      items.push(itemElement);
      
      // 观察每个项
      setTimeout(() => {
        const element = containerRef.current?.querySelector(`[data-index="${i}"]`);
        if (element) {
          observer.observe(element);
        }
      }, 0);
    }

    return items;
  }, [data, itemHeight, visibleItems, observer]);

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Intersection Observer 虚拟列表 ({data.length} 项)</h3>
      <div
        ref={containerRef}
        style={{
          height: `${visibleCount * itemHeight}px`,
          overflow: 'auto',
          position: 'relative',
          border: '1px solid #ccc'
        }}
      >
        {/* 撑开滚动条的内容容器 */}
        <div style={{ height: `${data.length * itemHeight}px`, position: 'relative' }}>
          {renderItems()}
        </div>
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
        可见项数量: {visibleItems.size} / {data.length} | 
        预加载区域: 50px
      </div>
    </div>
  );
};

export default IntersectionObserverVirtualList;
