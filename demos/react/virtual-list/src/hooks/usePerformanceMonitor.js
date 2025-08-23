import { useState, useEffect, useRef, useCallback } from 'react';

// 性能监控hook - 解决性能监控和优化问题
export const usePerformanceMonitor = () => {
  const [renderTime, setRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [frameRate, setFrameRate] = useState(0);
  
  // 性能监控的引用
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);
  const memoryCheckIntervalRef = useRef(null);
  
  // 帧率计算 - 解决滚动性能优化问题
  const measureFrameRate = useCallback(() => {
    frameCountRef.current++;
    const now = performance.now();
    
    if (now - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
      setFrameRate(fps);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
    
    rafIdRef.current = requestAnimationFrame(measureFrameRate);
  }, []);
  
  // 内存使用监控 - 解决内存管理问题
  const checkMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
      
      setMemoryUsage(used);
      
      // 内存警告 - 解决内存管理问题
      if (used > limit * 0.8) {
        console.warn('Memory usage is high:', used, 'MB');
      }
    }
  }, []);
  
  // 渲染时间监控 - 解决性能监控问题
  const measureRenderTime = useCallback(() => {
    const startTime = performance.now();
    
    // 使用setTimeout确保在下一个事件循环中测量
    setTimeout(() => {
      const endTime = performance.now();
      const renderDuration = endTime - startTime;
      setRenderTime(renderDuration);
    }, 0);
  }, []);
  
  // 开始性能监控
  const startMonitoring = useCallback(() => {
    // 开始帧率监控
    rafIdRef.current = requestAnimationFrame(measureFrameRate);
    
    // 开始内存监控
    memoryCheckIntervalRef.current = setInterval(checkMemoryUsage, 2000);
    
    // 开始渲染时间监控
    measureRenderTime();
  }, [measureFrameRate, checkMemoryUsage, measureRenderTime]);
  
  // 停止性能监控
  const stopMonitoring = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    if (memoryCheckIntervalRef.current) {
      clearInterval(memoryCheckIntervalRef.current);
      memoryCheckIntervalRef.current = null;
    }
  }, []);
  
  // 获取性能指标
  const getPerformanceMetrics = useCallback(() => {
    return {
      renderTime,
      memoryUsage,
      frameRate,
      timestamp: Date.now()
    };
  }, [renderTime, memoryUsage, frameRate]);
  
  // 性能警告检查 - 解决性能监控问题
  const checkPerformanceWarnings = useCallback(() => {
    const warnings = [];
    
    if (frameRate < 30) {
      warnings.push('Low frame rate detected. Consider optimizing rendering.');
    }
    
    if (renderTime > 16) {
      warnings.push('Render time exceeds 16ms. Consider optimizing component updates.');
    }
    
    if (memoryUsage > 100) {
      warnings.push('High memory usage detected. Check for memory leaks.');
    }
    
    return warnings;
  }, [frameRate, renderTime, memoryUsage]);
  
  // 自动开始监控
  useEffect(() => {
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, []);
  
  // 定期检查性能警告
  useEffect(() => {
    const warningInterval = setInterval(() => {
      const warnings = checkPerformanceWarnings();
      if (warnings.length > 0) {
        console.warn('Performance warnings:', warnings);
      }
    }, 10000);
    
    return () => clearInterval(warningInterval);
  }, []);
  
  return {
    renderTime,
    memoryUsage,
    frameRate,
    startMonitoring,
    stopMonitoring,
    getPerformanceMetrics,
    checkPerformanceWarnings
  };
};
