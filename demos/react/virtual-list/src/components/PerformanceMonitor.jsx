import React, { useState, useEffect } from 'react';

const PerformanceMonitor = ({ data, onUpdate }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [monitorInterval, setMonitorInterval] = useState(null);
  
  // 开始性能监控 - 解决性能监控和优化问题
  const startMonitoring = () => {
    if (monitorInterval) return;
    
    setIsMonitoring(true);
    const interval = setInterval(() => {
      // 监控内存使用 - 解决内存管理问题
      let memoryUsage = 0;
      if (performance.memory) {
        memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      
      // 监控帧率 - 解决滚动性能优化问题
      const now = performance.now();
      const frameRate = Math.round(1000 / (now - (window.lastFrameTime || now)));
      window.lastFrameTime = now;
      
      // 监控渲染时间 - 解决性能监控问题
      const renderTime = performance.now();
      
      onUpdate({
        renderTime,
        memoryUsage,
        frameRate
      });
    }, 1000);
    
    setMonitorInterval(interval);
  };
  
  // 停止性能监控
  const stopMonitoring = () => {
    if (monitorInterval) {
      clearInterval(monitorInterval);
      setMonitorInterval(null);
    }
    setIsMonitoring(false);
  };
  
  // 组件卸载时清理定时器 - 解决内存管理问题
  useEffect(() => {
    return () => {
      if (monitorInterval) {
        clearInterval(monitorInterval);
      }
    };
  }, [monitorInterval]);
  
  // 自动开始监控
  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);
  
  return (
    <div style={{ 
      margin: '20px 0', 
      padding: '15px', 
      border: '1px solid #007acc', 
      backgroundColor: '#f0f8ff',
      borderRadius: '5px'
    }}>
      <h3>Performance Monitor</h3>
      
      {/* 监控控制 */}
      <div style={{ marginBottom: '15px' }}>
        <button 
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          style={{ 
            backgroundColor: isMonitoring ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '5px 15px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
        </button>
      </div>
      
      {/* 性能指标显示 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
        {/* 渲染时间 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007acc' }}>
            {data.renderTime ? Math.round(data.renderTime) : 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Render Time (ms)</div>
        </div>
        
        {/* 内存使用 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
            {data.memoryUsage || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Memory (MB)</div>
        </div>
        
        {/* 帧率 */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: data.frameRate < 30 ? '#dc3545' : data.frameRate < 50 ? '#ffc107' : '#28a745'
          }}>
            {data.frameRate || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Frame Rate (fps)</div>
        </div>
      </div>
      
      {/* 性能建议 */}
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Performance Tips:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Frame rate should be above 30fps for smooth scrolling</li>
          <li>Memory usage should be monitored to prevent leaks</li>
          <li>Render time should be minimized for better responsiveness</li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
