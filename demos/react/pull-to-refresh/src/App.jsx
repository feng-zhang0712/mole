import React, { useState, useEffect } from 'react';
import PullToRefresh from './components/PullToRefresh';
import { fetchData } from './utils/api';

function App() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  // 初始数据加载
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const initialData = await fetchData(1);
      setData(initialData);
      setPage(1);
      // 修复hasMore逻辑：第一页有数据且数据量等于页面大小，说明可能还有更多数据
      setHasMore(initialData.length >= 10);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // 下拉刷新处理
  const handleRefresh = async () => {
    try {
      const refreshedData = await fetchData(1);
      setData(refreshedData);
      setPage(1);
      // 修复hasMore逻辑：刷新后重新判断是否还有更多数据
      setHasMore(refreshedData.length >= 10);
      setError(null);
      return true; // 刷新成功
    } catch (err) {
      setError(err.message);
      return false; // 刷新失败
    }
  };

  // 上拉加载更多
  const handleLoadMore = async () => {
    if (!hasMore) return;
    
    try {
      const nextPage = page + 1;
      console.log(`🔄 加载第${nextPage}页数据...`);
      
      const moreData = await fetchData(nextPage);
      console.log(`📄 第${nextPage}页获取到${moreData.length}条数据`);
      
      if (moreData.length > 0) {
        setData(prev => [...prev, ...moreData]);
        setPage(nextPage);
        // 修复hasMore逻辑：如果返回的数据量等于页面大小，说明可能还有更多数据
        const newHasMore = moreData.length >= 10;
        setHasMore(newHasMore);
        console.log(`✅ 数据加载成功，当前共${data.length + moreData.length}条，hasMore: ${newHasMore}`);
      } else {
        setHasMore(false);
        console.log('🏁 没有更多数据了');
      }
      setError(null);
    } catch (err) {
      console.error('❌ 加载更多数据失败:', err);
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>React上拉加载和下拉刷新演示</h1>
      
      {/* 调试信息 */}
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '10px', 
        margin: '10px 0', 
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <strong>调试信息:</strong> 当前第{page}页，共{data.length}条数据，hasMore: {hasMore.toString()}
      </div>
      
      {error && (
        <div style={{ color: 'red', padding: '10px' }}>
          错误: {error}
        </div>
      )}
      
      <PullToRefresh
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      >
        <div>
          {data.map((item, index) => (
            <div key={item.id || index} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
              <h3>{item.title}</h3>
              <p>{item.content}</p>
              <small>ID: {item.id} | 索引: {index}</small>
            </div>
          ))}
          
          {!hasMore && data.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              没有更多数据了 (共{data.length}条)
            </div>
          )}
          
          {data.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              加载中...
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
}

export default App;
