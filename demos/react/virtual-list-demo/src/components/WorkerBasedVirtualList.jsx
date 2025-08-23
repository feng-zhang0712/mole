import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';

const WorkerBasedVirtualList = ({ data, itemHeight = 60, visibleCount = 10 }) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(visibleCount);
  const [worker, setWorker] = useState(null);

  // 创建 Web Worker
  const createWorker = useMemo(() => {
    const workerCode = `
      self.onmessage = function(e) {
        const { scrollTop, itemHeight, totalCount, visibleCount } = e.data;
        
        // 计算可见区域的起始和结束索引
        const startIndex = Math.floor(scrollTop / itemHeight);
        const endIndex = Math.min(
          startIndex + visibleCount + 1,
          totalCount
        );
        
        // 计算一些额外的统计信息
        const visiblePercentage = ((endIndex - startIndex) / totalCount * 100).toFixed(1);
        const scrollPercentage = (scrollTop / (totalCount * itemHeight) * 100).toFixed(1);
        
        self.postMessage({ 
          startIndex, 
          endIndex, 
          visiblePercentage, 
          scrollPercentage,
          timestamp: Date.now()
        });
      };
    `;

    return new Worker(URL.createObjectURL(new Blob([workerCode])));
  }, []);

  // 设置 Worker
  useEffect(() => {
    if (createWorker) {
      createWorker.onmessage = (e) => {
        const { startIndex, endIndex, visiblePercentage, scrollPercentage } = e.data;
        setStartIndex(startIndex);
        setEndIndex(endIndex);
      };
      setWorker(createWorker);
    }

    return () => {
      if (createWorker) {
        createWorker.terminate();
      }
    };
  }, [createWorker]);

  // 处理滚动事件
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    // 发送计算请求到 Worker
    if (worker) {
      worker.postMessage({
        scrollTop: newScrollTop,
        itemHeight,
        totalCount: data.length,
        visibleCount
      });
    }
  }, [worker, itemHeight, data.length, visibleCount]);

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
              {item.name || item.sender || `Data ${i + 1}`}
            </div>
          </div>
          <div style={{ 
            fontSize: '10px', 
            color: '#2196F3',
            fontWeight: 'bold',
            backgroundColor: '#E3F2FD',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            WORKER
          </div>
        </div>
      );
    }
    return items;
  };

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Web Worker 虚拟列表 ({data.length} 项)</h3>
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
        可见范围: {startIndex + 1} - {endIndex} / {data.length} | 
        计算在后台线程执行
      </div>
    </div>
  );
};

export default WorkerBasedVirtualList;
