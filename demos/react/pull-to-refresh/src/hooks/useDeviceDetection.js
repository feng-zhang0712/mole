import { useState, useEffect, useCallback } from 'react';

/**
 * 设备检测Hook - 解决移动端兼容性问题
 * 包括不同屏幕尺寸、不同触摸设备、性能差异等
 */
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0,
    pixelRatio: 1,
    isTouchDevice: false,
    isHighDPI: false,
    orientation: 'portrait',
    userAgent: '',
    platform: ''
  });

  // 检测设备类型
  const detectDevice = useCallback(() => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // 移动设备检测
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
    
    // 触摸设备检测
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 屏幕信息
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const pixelRatio = window.devicePixelRatio || 1;
    
    // 高DPI检测
    const isHighDPI = pixelRatio > 1;
    
    // 设备方向
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    
    setDeviceInfo({
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet,
      screenWidth,
      screenHeight,
      pixelRatio,
      isTouchDevice,
      isHighDPI,
      orientation,
      userAgent,
      platform
    });
  }, []);

  // 响应式断点检测
  const getBreakpoint = useCallback(() => {
    const { screenWidth } = deviceInfo;
    
    if (screenWidth < 768) return 'mobile';
    if (screenWidth < 1024) return 'tablet';
    if (screenWidth < 1440) return 'desktop';
    return 'large';
  }, [deviceInfo]);

  // 触摸优化检测
  const getTouchOptimizations = useCallback(() => {
    const { isTouchDevice, isMobile, pixelRatio } = deviceInfo;
    
    return {
      needsTouchOptimization: isTouchDevice,
      shouldUsePassiveEvents: isMobile,
      shouldOptimizeForHighDPI: pixelRatio > 1,
      recommendedTouchTargetSize: isMobile ? 44 : 32, // iOS推荐44px，Android推荐32px
      shouldDisableHover: isTouchDevice
    };
  }, [deviceInfo]);

  // 性能优化建议
  const getPerformanceOptimizations = useCallback(() => {
    const { isMobile, isHighDPI, pixelRatio } = deviceInfo;
    
    return {
      shouldReduceAnimations: isMobile,
      shouldOptimizeImages: isHighDPI,
      shouldUseHardwareAcceleration: !isMobile,
      recommendedFrameRate: isMobile ? 30 : 60,
      shouldOptimizeMemory: isMobile,
      pixelRatioOptimization: Math.round(pixelRatio)
    };
  }, [deviceInfo]);

  // 网络优化建议
  const getNetworkOptimizations = useCallback(() => {
    const { isMobile } = deviceInfo;
    
    return {
      shouldOptimizeForMobile: isMobile,
      shouldUseCompression: true,
      shouldPreloadCritical: !isMobile,
      shouldLazyLoadImages: true,
      shouldOptimizeFonts: isMobile
    };
  }, [deviceInfo]);

  // 屏幕尺寸变化监听
  useEffect(() => {
    const handleResize = () => {
      detectDevice();
    };

    const handleOrientationChange = () => {
      // 延迟检测，等待屏幕旋转完成
      setTimeout(detectDevice, 100);
    };

    // 初始检测
    detectDevice();

    // 事件监听
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 媒体查询监听
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQuery.addEventListener('change', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      mediaQuery.removeEventListener('change', handleOrientationChange);
    };
  }, [detectDevice]);

  // 设备能力检测
  const getDeviceCapabilities = useCallback(() => {
    const { isTouchDevice, isMobile, isHighDPI } = deviceInfo;
    
    return {
      // 触摸能力
      touch: {
        supported: isTouchDevice,
        multiTouch: isTouchDevice && navigator.maxTouchPoints > 1,
        maxTouchPoints: navigator.maxTouchPoints || 0
      },
      
      // 硬件能力
      hardware: {
        highDPI: isHighDPI,
        hardwareAcceleration: 'WebGLRenderingContext' in window,
        webGL: !!window.WebGLRenderingContext,
        webGL2: !!window.WebGL2RenderingContext
      },
      
      // 网络能力
      network: {
        online: navigator.onLine,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null
      },
      
      // 存储能力
      storage: {
        localStorage: !!window.localStorage,
        sessionStorage: !!window.sessionStorage,
        indexedDB: !!window.indexedDB,
        serviceWorker: 'serviceWorker' in navigator
      }
    };
  }, [deviceInfo]);

  return {
    ...deviceInfo,
    getBreakpoint,
    getTouchOptimizations,
    getPerformanceOptimizations,
    getNetworkOptimizations,
    getDeviceCapabilities,
    detectDevice
  };
};
