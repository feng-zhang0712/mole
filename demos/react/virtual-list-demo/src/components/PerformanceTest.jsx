import React, { useState, useCallback } from 'react';

const PerformanceTest = ({ onTestComplete }) => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  // 性能测试函数
  const runPerformanceTest = useCallback(async (testName, testFunction, dataSize) => {
    const startTime = performance.now();
    const startMemory = performance.memory?.usedJSHeapSize || 0;
    
    try {
      await testFunction();
      
      const endTime = performance.now();
      const endMemory = performance.memory?.usedJSHeapSize || 0;
      
      const duration = endTime - startTime;
      const memoryUsed = endMemory - startMemory;
      
      return {
        testName,
        dataSize,
        duration: duration.toFixed(2),
        memoryUsed: memoryUsed > 0 ? `${(memoryUsed / 1024 / 1024).toFixed(2)} MB` : 'N/A',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testName,
        dataSize,
        duration: 'Error',
        memoryUsed: 'N/A',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // 运行所有测试
  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    const results = {};

    // 测试数据规模
    const testSizes = [100, 500, 1000, 5000, 10000];

    for (const size of testSizes) {
      console.log(`开始测试 ${size} 项数据...`);
      
      // 测试1: 固定高度虚拟列表
      const fixedHeightResult = await runPerformanceTest(
        '固定高度虚拟列表',
        () => {
          return new Promise(resolve => {
            const start = performance.now();
            // 模拟渲染操作
            for (let i = 0; i < size; i++) {
              const element = document.createElement('div');
              element.style.height = '60px';
              element.textContent = `Item ${i}`;
            }
            const end = performance.now();
            console.log(`固定高度渲染 ${size} 项耗时: ${end - start}ms`);
            resolve();
          });
        },
        size
      );
      results[`fixed_${size}`] = fixedHeightResult;

      // 测试2: 动态高度虚拟列表
      const dynamicHeightResult = await runPerformanceTest(
        '动态高度虚拟列表',
        () => {
          return new Promise(resolve => {
            const start = performance.now();
            // 模拟动态高度计算
            const heights = new Map();
            for (let i = 0; i < size; i++) {
              heights.set(i, 60 + Math.random() * 40);
            }
            const end = performance.now();
            console.log(`动态高度计算 ${size} 项耗时: ${end - start}ms`);
            resolve();
          });
        },
        size
      );
      results[`dynamic_${size}`] = dynamicHeightResult;

      // 测试3: Intersection Observer 虚拟列表
      const intersectionResult = await runPerformanceTest(
        'Intersection Observer 虚拟列表',
        () => {
          return new Promise(resolve => {
            const start = performance.now();
            // 模拟 Intersection Observer 操作
            const observer = new IntersectionObserver(() => {});
            for (let i = 0; i < size; i++) {
              const element = document.createElement('div');
              observer.observe(element);
            }
            observer.disconnect();
            const end = performance.now();
            console.log(`Intersection Observer ${size} 项耗时: ${end - start}ms`);
            resolve();
          });
        },
        size
      );
      results[`intersection_${size}`] = intersectionResult;

      // 测试4: Web Worker 虚拟列表
      const workerResult = await runPerformanceTest(
        'Web Worker 虚拟列表',
        () => {
          return new Promise(resolve => {
            const start = performance.now();
            // 模拟 Web Worker 通信
            const worker = new Worker(URL.createObjectURL(new Blob([`
              self.onmessage = function(e) {
                const { data } = e;
                const result = data.map(item => ({ ...item, processed: true }));
                self.postMessage(result);
              };
            `])));
            
            const testData = Array.from({ length: size }, (_, i) => ({ id: i, value: `item_${i}` }));
            
            worker.onmessage = () => {
              worker.terminate();
              const end = performance.now();
              console.log(`Web Worker 处理 ${size} 项耗时: ${end - start}ms`);
              resolve();
            };
            
            worker.postMessage(testData);
          });
        },
        size
      );
      results[`worker_${size}`] = workerResult;

      // 等待一小段时间再进行下一轮测试
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setTestResults(results);
    setIsRunning(false);
    
    if (onTestComplete) {
      onTestComplete(results);
    }
  }, [runPerformanceTest, onTestComplete]);

  // 格式化测试结果
  const formatResults = () => {
    const testTypes = ['fixed', 'dynamic', 'intersection', 'worker'];
    const testSizes = [100, 500, 1000, 5000, 10000];
    
    return (
      <div style={{ marginTop: '20px' }}>
        <h3>性能测试结果</h3>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginTop: '10px',
          fontSize: '12px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>测试类型</th>
              {testSizes.map(size => (
                <th key={size} style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {size} 项
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {testTypes.map(type => (
              <tr key={type}>
                <td style={{ 
                  border: '1px solid #ddd', 
                  padding: '8px', 
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9'
                }}>
                  {type === 'fixed' ? '固定高度' : 
                   type === 'dynamic' ? '动态高度' :
                   type === 'intersection' ? 'Intersection Observer' : 'Web Worker'}
                </td>
                {testSizes.map(size => {
                  const result = testResults[`${type}_${size}`];
                  if (!result) return <td key={size} style={{ border: '1px solid #ddd', padding: '8px' }}>-</td>;
                  
                  return (
                    <td key={size} style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <div>{result.duration}ms</div>
                      {result.memoryUsed !== 'N/A' && (
                        <div style={{ fontSize: '10px', color: '#666' }}>
                          {result.memoryUsed}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '4px', 
      padding: '20px',
      backgroundColor: '#fafafa'
    }}>
      <h3>性能测试</h3>
      <p style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
        运行性能测试来比较不同虚拟列表实现的性能表现
      </p>
      
      <button
        onClick={runAllTests}
        disabled={isRunning}
        style={{
          padding: '10px 20px',
          backgroundColor: isRunning ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          fontSize: '14px'
        }}
      >
        {isRunning ? '测试中...' : '开始性能测试'}
      </button>

      {Object.keys(testResults).length > 0 && formatResults()}
    </div>
  );
};

export default PerformanceTest;
