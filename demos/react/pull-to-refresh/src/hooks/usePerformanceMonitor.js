import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 性能监控Hook - 解决性能监控问题
 * 包括滚动帧率、内存使用、网络请求等性能指标
 */
export const usePerformanceMonitor = () => {
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    memoryUsage: null,
    networkRequests: 0,
    domNodes: 0,
    scrollPerformance: 0,
    renderTime: 0
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef(null);
  const performanceObserverRef = useRef(null);
  const networkRequestsRef = useRef(0);

  // FPS监控
  const measureFPS = useCallback(() => {
    frameCountRef.current++;
    const currentTime = performance.now();
    
    if (currentTime - lastTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
      
      // 修复FPS计算：避免初始化和异常情况下的0值
      const validFps = fps > 0 ? fps : 60; // 如果计算出的FPS为0或负数，默认为60
      
      setPerformanceMetrics(prev => ({
        ...prev,
        fps: validFps
      }));
      
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(measureFPS);
  }, []);

  // 内存使用监控
  const measureMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      setPerformanceMetrics(prev => ({
        ...prev,
        memoryUsage: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        }
      }));
    }
  }, []);

  // DOM节点数量监控
  const measureDOMNodes = useCallback(() => {
    const nodeCount = document.querySelectorAll('*').length;
    setPerformanceMetrics(prev => ({
      ...prev,
      domNodes: nodeCount
    }));
  }, []);

  // 滚动性能监控
  const measureScrollPerformance = useCallback(() => {
    let scrollStartTime = 0;
    let scrollEndTime = 0;
    let scrollDistance = 0;
    
    const handleScrollStart = () => {
      scrollStartTime = performance.now();
    };
    
    const handleScrollEnd = () => {
      scrollEndTime = performance.now();
      const scrollTime = scrollEndTime - scrollStartTime;
      
      if (scrollTime > 0) {
        const scrollPerformance = scrollDistance / scrollTime;
        setPerformanceMetrics(prev => ({
          ...prev,
          scrollPerformance: Math.round(scrollPerformance)
        }));
      }
    };
    
    // 使用节流来监控滚动
    let scrollTimeout;
    const throttledScrollHandler = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      scrollTimeout = setTimeout(() => {
        handleScrollEnd();
      }, 150);
    };
    
    document.addEventListener('scroll', handleScrollStart, { passive: true });
    document.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    return () => {
      document.removeEventListener('scroll', handleScrollStart);
      document.removeEventListener('scroll', throttledScrollHandler);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  // 渲染时间监控
  const measureRenderTime = useCallback(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              setPerformanceMetrics(prev => ({
                ...prev,
                renderTime: Math.round(entry.duration)
              }));
            }
          });
        });
        
        observer.observe({ entryTypes: ['measure'] });
        performanceObserverRef.current = observer;
        
        return () => {
          if (observer) {
            observer.disconnect();
          }
        };
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }, []);

  // 网络请求监控
  const measureNetworkRequests = useCallback(() => {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              networkRequestsRef.current++;
              setPerformanceMetrics(prev => ({
                ...prev,
                networkRequests: networkRequestsRef.current
              }));
            }
          });
        });
        
        observer.observe({ entryTypes: ['resource'] });
        
        return () => {
          if (observer) {
            observer.disconnect();
          }
        };
      } catch (error) {
        console.warn('Network monitoring not supported:', error);
      }
    }
  }, []);

  // 性能警告检测
  const checkPerformanceWarnings = useCallback(() => {
    const warnings = [];
    
    // 修复FPS警告：只有当FPS真正过低时才警告，避免初始化时的误报
    if (performanceMetrics.fps > 0 && performanceMetrics.fps < 30) {
      warnings.push(`帧率过低: ${performanceMetrics.fps} FPS`);
    }
    
    if (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage.usagePercentage > 80) {
      warnings.push(`内存使用过高: ${Math.round(performanceMetrics.memoryUsage.usagePercentage)}%`);
    }
    
    if (performanceMetrics.domNodes > 1000) {
      warnings.push(`DOM节点过多: ${performanceMetrics.domNodes} 个`);
    }
    
    if (performanceMetrics.renderTime > 16) {
      warnings.push(`渲染时间过长: ${performanceMetrics.renderTime}ms`);
    }
    
    return warnings;
  }, [performanceMetrics]);

  // 性能报告生成
  const generatePerformanceReport = useCallback(() => {
    const warnings = checkPerformanceWarnings();
    
    return {
      timestamp: new Date().toISOString(),
      metrics: performanceMetrics,
      warnings,
      recommendations: warnings.map(warning => {
        if (warning.includes('帧率过低')) {
          return '建议减少动画复杂度或使用requestAnimationFrame优化';
        }
        if (warning.includes('内存使用过高')) {
          return '建议检查内存泄漏或减少对象创建';
        }
        if (warning.includes('DOM节点过多')) {
          return '建议使用虚拟滚动或减少DOM操作';
        }
        if (warning.includes('渲染时间过长')) {
          return '建议优化CSS选择器或减少重排重绘';
        }
        return '建议进行性能分析';
      })
    };
  }, [performanceMetrics, checkPerformanceWarnings]);

  // 性能优化建议
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = [];
    
    // 修复FPS建议：只有当FPS真正过低时才给出建议，避免初始化时的误报
    if (performanceMetrics.fps > 0 && performanceMetrics.fps < 60) {
      recommendations.push({
        type: 'fps',
        priority: 'high',
        message: '帧率优化',
        suggestions: [
          '使用requestAnimationFrame替代setTimeout',
          '减少DOM操作频率',
          '使用CSS transform替代top/left',
          '避免在scroll事件中执行复杂计算'
        ]
      });
    }
    
    if (performanceMetrics.memoryUsage && performanceMetrics.memoryUsage.usagePercentage > 70) {
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        message: '内存优化',
        suggestions: [
          '及时清理事件监听器',
          '避免闭包引用大对象',
          '使用WeakMap/WeakSet',
          '定期清理定时器'
        ]
      });
    }
    
    return recommendations;
  }, [performanceMetrics]);

  // 启动性能监控
  useEffect(() => {
    // 启动FPS监控
    animationFrameRef.current = requestAnimationFrame(measureFPS);
    
    // 启动其他监控
    const cleanupMemory = measureMemoryUsage();
    const cleanupDOM = measureDOMNodes();
    const cleanupScroll = measureScrollPerformance();
    const cleanupRender = measureRenderTime();
    const cleanupNetwork = measureNetworkRequests();
    
    // 定期更新内存使用
    const memoryInterval = setInterval(measureMemoryUsage, 5000);
    const domInterval = setInterval(measureDOMNodes, 10000);
    
    return () => {
      // 清理所有监控
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
      }
      
      if (cleanupMemory) cleanupMemory();
      if (cleanupDOM) cleanupDOM();
      if (cleanupScroll) cleanupScroll();
      if (cleanupRender) cleanupRender();
      if (cleanupNetwork) cleanupNetwork();
      
      clearInterval(memoryInterval);
      clearInterval(domInterval);
    };
  }, [measureFPS, measureMemoryUsage, measureDOMNodes, measureScrollPerformance, measureRenderTime, measureNetworkRequests]);

  return {
    ...performanceMetrics,
    checkPerformanceWarnings,
    generatePerformanceReport,
    getPerformanceRecommendations
  };
};
