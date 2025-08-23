import { useCallback, useRef } from 'react';

/**
 * 滚动事件节流Hook - 解决滚动性能优化问题
 * 包括滚动事件节流、滚动容器管理、虚拟滚动支持等
 */
export const useScrollThrottle = (callback, delay = 100) => {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const scrollDirectionRef = useRef('none');

  // 节流函数实现
  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    
    // 时间节流
    if (now - lastRunRef.current >= delay) {
      callback(...args);
      lastRunRef.current = now;
    } else {
      // 延迟执行
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRunRef.current = Date.now();
      }, delay - (now - lastRunRef.current));
    }
  }, [callback, delay]);

  // 滚动方向检测
  const detectScrollDirection = useCallback((scrollTop) => {
    const direction = scrollTop > lastScrollTopRef.current ? 'down' : 'up';
    scrollDirectionRef.current = direction;
    lastScrollTopRef.current = scrollTop;
    return direction;
  }, []);

  // 滚动位置检测
  const isNearBottom = useCallback((scrollElement, threshold = 100) => {
    if (!scrollElement) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  const isNearTop = useCallback((scrollElement, threshold = 100) => {
    if (!scrollElement) return false;
    
    const { scrollTop } = scrollElement;
    return scrollTop < threshold;
  }, []);

  // 滚动到指定位置
  const scrollTo = useCallback((scrollElement, position, behavior = 'smooth') => {
    if (!scrollElement) return;
    
    scrollElement.scrollTo({
      top: position,
      behavior
    });
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback((scrollElement, behavior = 'smooth') => {
    if (!scrollElement) return;
    
    scrollElement.scrollTo({
      top: scrollElement.scrollHeight,
      behavior
    });
  }, []);

  // 滚动到顶部
  const scrollToTop = useCallback((scrollElement, behavior = 'smooth') => {
    if (!scrollElement) return;
    
    scrollElement.scrollTo({
      top: 0,
      behavior
    });
  }, []);

  // 清理函数
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 获取滚动信息
  const getScrollInfo = useCallback((scrollElement) => {
    if (!scrollElement) return null;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollBottom = scrollTop + clientHeight;
    const scrollPercentage = scrollHeight > 0 ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0;
    
    return {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollBottom,
      scrollPercentage,
      direction: scrollDirectionRef.current,
      isAtTop: scrollTop === 0,
      isAtBottom: scrollBottom >= scrollHeight
    };
  }, []);

  return {
    throttledCallback,
    detectScrollDirection,
    isNearBottom,
    isNearTop,
    scrollTo,
    scrollToBottom,
    scrollToTop,
    cleanup,
    getScrollInfo,
    getScrollDirection: () => scrollDirectionRef.current
  };
};
