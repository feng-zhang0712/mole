import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VirtualRenderer, RenderOptimizer } from '../utils/virtualRenderer';
import { PredictiveCache } from '../utils/smartCache';
import apiService from '../services/api';

const UltraOptimizedVirtualList = ({ itemHeight, visibleCount, bufferSize }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const contentRef = useRef(null);
  const rendererRef = useRef(null);
  const cacheRef = useRef(null);
  const optimizerRef = useRef(null);
  const rafRef = useRef(null);

  // 初始化
  useEffect(() => {
    // 初始化智能缓存
    cacheRef.current = new PredictiveCache(2000);
    
    // 初始化渲染优化器
    optimizerRef.current = new RenderOptimizer();
    
    // 获取总数
    const initData = async () => {
      try {
        setLoading(true);
        const count = await apiService.getTotalCount();
        setTotalCount(count);
        
        // 初始化虚拟渲染器
        if (contentRef.current) {
          rendererRef.current = new VirtualRenderer({
            content: contentRef.current,
            itemHeight,
            visibleCount,
            bufferSize,
            totalCount: count
          });
          
          // 设置数据提供者
          rendererRef.current.setDataProvider(async (index) => {
            const start = Math.floor(index / 50) * 50;
            const rangeKey = `${start}-${start + 49}`;
            
            // 检查缓存
            let data = cacheRef.current.get(rangeKey);
            if (!data) {
              const result = await apiService.getData(start, 50);
              data = result.data;
              cacheRef.current.set(rangeKey, data);
            } else {
              cacheRef.current.recordAccess(rangeKey);
            }
            
            return data[index - start];
          });
          
          // 设置渲染函数
          rendererRef.current.setRenderItem((element, data, index) => {
            element.innerHTML = `
              <div style="padding: 10px; border-bottom: 1px solid #eee; background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'}">
                <div style="font-weight: bold; margin-bottom: 5px;">${data?.name || `Item ${index + 1}`}</div>
                <div style="font-size: 12px; color: #666;">${data?.email || data?.description || 'No description'}</div>
              </div>
            `;
          });
          
          // 初始渲染
          const initialRange = { start: 0, end: visibleCount + bufferSize * 2 };
          rendererRef.current.renderRange(initialRange, rendererRef.current.dataProvider, rendererRef.current.renderItem);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    initData();
    
    // 定期清理和更新性能统计
    const cleanupInterval = setInterval(() => {
      cacheRef.current.cleanup();
    }, 5000);
    
    return () => {
      clearInterval(cleanupInterval);
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
      if (optimizerRef.current) {
        optimizerRef.current.destroy();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [itemHeight, visibleCount, bufferSize]);

  // 优化的滚动处理
  const handleScroll = useCallback((e) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    console.log('handleScroll');
    
    
    rafRef.current = requestAnimationFrame(() => {
      const newScrollTop = e.target.scrollTop;
      
      if (rendererRef.current) {
        rendererRef.current.updateScroll(newScrollTop);
      }
    });
  }, []);

  // 优化的搜索处理
  const handleSearch = useCallback(async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      // 重置到初始状态
      if (rendererRef.current) {
        const initialRange = { start: 0, end: visibleCount + bufferSize * 2 };
        rendererRef.current.renderRange(initialRange, rendererRef.current.dataProvider, rendererRef.current.renderItem);
      }
      return;
    }
    
    try {
      setLoading(true);
      const result = await apiService.searchData(query, 0, 100);
      setTotalCount(result.totalCount);
      
      // 更新渲染器
      if (rendererRef.current) {
        rendererRef.current.setDataProvider(async (index) => {
          return result.data[index] || null;
        });
        
        const searchRange = { start: 0, end: Math.min(100, result.totalCount) };
        rendererRef.current.renderRange(searchRange, rendererRef.current.dataProvider, rendererRef.current.renderItem);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [visibleCount, bufferSize]);

  // 优化的刷新处理
  const handleRefresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 清空缓存
      cacheRef.current.clear();
      
      // 重新获取总数
      const count = await apiService.getTotalCount();
      setTotalCount(count);
      
      // 重新初始化渲染器
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = new VirtualRenderer({
          container: contentRef.current,
          itemHeight,
          visibleCount,
          bufferSize,
          totalCount: count
        });
        
        rendererRef.current.setDataProvider(async (index) => {
          const start = Math.floor(index / 50) * 50;
          const rangeKey = `${start}-${start + 49}`;
          
          let data = cacheRef.current.get(rangeKey);
          if (!data) {
            const result = await apiService.getData(start, 50);
            data = result.data;
            cacheRef.current.set(rangeKey, data);
          }
          
          return data[index - start];
        });
        
        rendererRef.current.setRenderItem((element, data, index) => {
          element.innerHTML = `
            <div style="padding: 10px; border-bottom: 1px solid #eee; background-color: ${index % 2 === 0 ? '#f9f9f9' : '#ffffff'}">
              <div style="font-weight: bold; margin-bottom: 5px;">${data?.name || `Item ${index + 1}`}</div>
              <div style="font-size: 12px; color: #666;">${data?.email || data?.description || 'No description'}</div>
            </div>
          `;
        });
        
        const initialRange = { start: 0, end: visibleCount + bufferSize * 2 };
        rendererRef.current.renderRange(initialRange, rendererRef.current.dataProvider, rendererRef.current.renderItem);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemHeight, visibleCount, bufferSize]);

  return (
    <div className="virtual-list">
      <h3 className="virtual-list__title">
        极致优化虚拟列表 ⚡
      </h3>
      
      {/* 控制面板 */}
      <div className="virtual-list__controls">
        <input
          type="text"
          placeholder="搜索..."
          value={searchQuery}
          onChange={handleSearch}
          className="virtual-list__search-input"
        />
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="virtual-list__refresh-button"
        >
          {loading ? '刷新中...' : '刷新'}
        </button>
      </div>

      {/* 性能统计 */}
      <div className="virtual-list__status">
        <div>总数: {totalCount.toLocaleString()}</div>
        <div>加载状态: {loading ? '加载中...' : '就绪'}</div>
        {error && <div className="virtual-list__status--error">错误: {error}</div>}
      </div>

      {/* 虚拟列表容器 */}
      <div
        className="virtual-list__scroll-container"
        style={{
          height: `${visibleCount * itemHeight}px`
        }}
        onScroll={handleScroll}
      >
        <div ref={contentRef} className="virtual-list__content" style={{ height: `${totalCount * itemHeight}px` }} />
      </div>
    </div>
  );
};

export default UltraOptimizedVirtualList;
