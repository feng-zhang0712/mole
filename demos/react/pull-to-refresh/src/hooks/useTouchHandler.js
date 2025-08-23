import { useState, useCallback, useRef } from 'react';

/**
 * 触摸事件处理Hook - 解决触摸事件处理问题
 * 包括触摸事件冲突、触摸坐标计算、触摸事件节流等
 */
export const useTouchHandler = () => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  
  // 触摸状态管理
  const touchStateRef = useRef({
    isTracking: false,
    startTime: 0,
    lastMoveTime: 0
  });

  // 触摸开始处理
  const handleTouchStart = useCallback((e) => {
    // 防止多点触摸冲突
    if (e.touches.length > 1) {
      return;
    }

    const touch = e.touches[0];
    const now = Date.now();
    
    // 触摸事件节流 - 防止快速连续触摸
    if (now - touchStateRef.current.lastMoveTime < 16) { // 60fps限制
      return;
    }

    setStartY(touch.clientY);
    setCurrentY(touch.clientY);
    
    touchStateRef.current = {
      isTracking: true,
      startTime: now,
      lastMoveTime: now
    };
  }, []);

  // 触摸移动处理
  const handleTouchMove = useCallback((e) => {
    if (!touchStateRef.current.isTracking || e.touches.length > 1) {
      return;
    }

    const touch = e.touches[0];
    const now = Date.now();
    
    // 触摸事件节流 - 防止触摸事件过于频繁触发
    if (now - touchStateRef.current.lastMoveTime < 16) {
      return;
    }

    setCurrentY(touch.clientY);
    touchStateRef.current.lastMoveTime = now;
  }, []);

  // 触摸结束处理
  const handleTouchEnd = useCallback((e) => {
    if (!touchStateRef.current.isTracking) {
      return;
    }

    const now = Date.now();
    const touchDuration = now - touchStateRef.current.startTime;
    
    // 防止异常触摸 - 触摸时间过短或过长
    if (touchDuration < 50 || touchDuration > 10000) {
      touchStateRef.current.isTracking = false;
      return;
    }

    touchStateRef.current.isTracking = false;
  }, []);

  // 触摸取消处理
  const handleTouchCancel = useCallback(() => {
    touchStateRef.current.isTracking = false;
  }, []);

  // 计算触摸距离
  const getTouchDistance = useCallback(() => {
    return Math.abs(currentY - startY);
  }, [currentY, startY]);

  // 计算触摸方向
  const getTouchDirection = useCallback(() => {
    const distance = currentY - startY;
    if (Math.abs(distance) < 10) return 'none'; // 忽略微小移动
    return distance > 0 ? 'down' : 'up';
  }, [currentY, startY]);

  // 触摸速度计算
  const getTouchVelocity = useCallback(() => {
    if (!touchStateRef.current.startTime) return 0;
    
    const duration = Date.now() - touchStateRef.current.startTime;
    const distance = getTouchDistance();
    
    return duration > 0 ? distance / duration : 0;
  }, [getTouchDistance]);

  return {
    startY,
    currentY,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    getTouchDistance,
    getTouchDirection,
    getTouchVelocity,
    isTracking: touchStateRef.current.isTracking
  };
};
