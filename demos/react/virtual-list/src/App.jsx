import React, { useState, useEffect, useCallback } from 'react';
import VirtualList from './components/VirtualList';
import SearchPanel from './components/SearchPanel';
import PerformanceMonitor from './components/PerformanceMonitor';

const App = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    priority: ''
  });
  
  const [performanceData, setPerformanceData] = useState({
    renderTime: 0,
    memoryUsage: 0,
    frameRate: 0
  });

  // 更新搜索参数 - 解决搜索和过滤问题
  const handleSearchChange = useCallback((newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // 性能监控回调 - 解决性能监控和优化问题
  const handlePerformanceUpdate = useCallback((data) => {
    setPerformanceData(data);
  }, []);

  return (
    <div>
      <h1>Virtual List Optimization Demo</h1>
      
      {/* 性能监控面板 */}
      <PerformanceMonitor 
        data={performanceData} 
        onUpdate={handlePerformanceUpdate} 
      />
      
      {/* 搜索和过滤面板 */}
      <SearchPanel 
        searchParams={searchParams}
        onSearchChange={handleSearchChange}
      />
      
      {/* 虚拟列表组件 */}
      <VirtualList 
        searchParams={searchParams}
        onPerformanceUpdate={handlePerformanceUpdate}
      />
    </div>
  );
};

export default App;
