import { useState, useEffect } from 'react';

// 防抖hook - 解决滚动性能优化问题
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    // 设置定时器延迟更新值
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // 清理定时器 - 解决内存管理问题
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
