import { useState, useEffect, useCallback, useRef } from 'react';

// 虚拟列表核心hook - 解决滚动位置计算和可视区域判断问题
export const useVirtualList = ({ count, itemHeight, containerHeight, overscan = 5 }) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const handleScrollRef = useRef(null);
  
  // 计算总高度 - 解决滚动位置计算问题
  const totalSize = count * itemHeight;
  
  // 计算可视区域的起始和结束索引 - 解决可视区域判断问题
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    count - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  // 生成虚拟列表项 - 解决DOM节点数量控制问题
  const virtualItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      index: i,
      start: i * itemHeight,
      end: (i + 1) * itemHeight,
      size: itemHeight
    });
  }
  
  // 滚动到指定索引 - 解决滚动位置计算问题
  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      const newScrollTop = index * itemHeight;
      containerRef.current.scrollTop = newScrollTop;
      setScrollTop(newScrollTop);
    }
  }, [itemHeight]);
  
  // 滚动事件处理 - 解决滚动性能优化问题
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);
  
  // 保存handleScroll引用
  handleScrollRef.current = handleScroll;
  
  // 设置滚动容器引用
  const setContainerRef = useCallback((element) => {
    if (element) {
      containerRef.current = element;
      element.addEventListener('scroll', handleScroll, { passive: true });
    }
  }, []);
  
  // 清理事件监听器 - 解决内存管理问题
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScrollRef.current);
      }
    };
  }, []);
  
  return {
    virtualItems,
    totalSize,
    scrollToIndex,
    setContainerRef,
    scrollTop
  };
};
