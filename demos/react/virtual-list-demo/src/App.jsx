import React, { useState, useEffect } from 'react';
import FixedHeightVirtualList from './components/FixedHeightVirtualList';
import DynamicHeightVirtualList from './components/DynamicHeightVirtualList';
import IntersectionObserverVirtualList from './components/IntersectionObserverVirtualList';
import WorkerBasedVirtualList from './components/WorkerBasedVirtualList';
import PerformanceTest from './components/PerformanceTest';
import './app.css'

const App = () => {
  const [data, setData] = useState({ users: [], products: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDataType, setSelectedDataType] = useState('users');
  const [dataCount, setDataCount] = useState(1000);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 尝试从 public 目录加载数据
        let response = await fetch('/mock-data.json');
        const jsonData = await response.json();
        setData(jsonData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 生成大量测试数据
  const generateTestData = (baseData, count) => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const baseItem = baseData[i % baseData.length];
      result.push({
        ...baseItem,
        id: i + 1,
        name: `${baseItem.name || baseItem.sender} ${i + 1}`,
        email: baseItem.email ? `${i + 1}_${baseItem.email}` : undefined,
        price: baseItem.price ? baseItem.price + (i * 0.01) : undefined
      });
    }
    return result;
  };

  // 获取当前选中的数据类型
  const getCurrentData = () => {
    const baseData = data[selectedDataType] || [];
    return generateTestData(baseData, dataCount);
  };

  if (loading) {
    return (
      <div className="loading">
        加载数据中...
      </div>
    );
  }

  if (error) {
    return (
      <div className='error'>
        加载失败: {error}
      </div>
    );
  }

  const currentData = getCurrentData();

  return (
    <div className='container'>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        虚拟列表实现方式演示
      </h1>

      {/* 控制面板 */}
      <div className='control-board'>
        <div>
          <label style={{ marginRight: '8px' }}>数据类型:</label>
          <select 
            value={selectedDataType} 
            onChange={(e) => setSelectedDataType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="users">用户数据</option>
            <option value="products">产品数据</option>
            <option value="messages">消息数据</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '8px' }}>数据量:</label>
          <select 
            value={dataCount} 
            onChange={(e) => setDataCount(parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value={100}>100 项</option>
            <option value={500}>500 项</option>
            <option value={1000}>1000 项</option>
            <option value={5000}>5000 项</option>
            <option value={10000}>10000 项</option>
          </select>
        </div>

        <div style={{ fontSize: '14px', color: '#666' }}>
          当前数据: {currentData.length} 项
        </div>
      </div>

      {/* 虚拟列表组件 */}
      <div style={{ display: 'grid', gap: '30px' }}>
        <FixedHeightVirtualList 
          data={currentData} 
          itemHeight={60} 
          visibleCount={8} 
        />

        <DynamicHeightVirtualList 
          data={currentData} 
          estimatedItemHeight={60} 
          visibleCount={6} 
        />

        <IntersectionObserverVirtualList 
          data={currentData} 
          itemHeight={60} 
          visibleCount={8} 
        />

        <WorkerBasedVirtualList 
          data={currentData} 
          itemHeight={60} 
          visibleCount={8} 
        />
      </div>

      {/* 性能测试 */}
      <PerformanceTest 
        onTestComplete={(results) => {
          console.log('性能测试完成:', results);
        }}
      />
    </div>
  );
};

export default App;
