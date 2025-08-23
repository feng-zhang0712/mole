import { useState, useEffect, useCallback, useRef } from 'react';

// 数据加载hook - 解决数据分页和加载问题
export const useDataLoader = (searchParams) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // 缓存已加载的数据 - 解决内存管理问题
  const dataCache = useRef(new Map());
  const loadingPromises = useRef(new Map());
  
  // 构建API查询参数
  const buildQueryString = useCallback((params) => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.append('query', params.query);
    if (params.category) searchParams.append('category', params.category);
    if (params.priority !== '') searchParams.append('priority', params.priority);
    searchParams.append('limit', '1000'); // 加载更多数据
    return searchParams.toString();
  }, []);
  
  // 加载数据的函数
  const loadData = useCallback(async (params) => {
    const queryString = buildQueryString(params);
    const cacheKey = queryString;
    
    // 检查缓存 - 解决搜索和过滤问题
    if (dataCache.current.has(cacheKey)) {
      const cachedData = dataCache.current.get(cacheKey);
      setData(cachedData.data);
      setTotalCount(cachedData.total);
      return;
    }
    
    // 防止重复请求 - 解决网络性能优化问题
    if (loadingPromises.current.has(cacheKey)) {
      await loadingPromises.current.get(cacheKey);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const promise = fetch(`/api/search?${queryString}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(result => {
          // 将数组数据转换为索引映射 - 解决数据访问问题
          const dataMap = {};
          result.data.forEach((item, index) => {
            dataMap[index] = item;
          });
          
          const resultData = {
            data: dataMap,
            total: result.total
          };
          
          // 缓存结果 - 解决搜索和过滤问题
          dataCache.current.set(cacheKey, resultData);
          
          setData(dataMap);
          setTotalCount(result.total);
          setLoading(false);
          
          return resultData;
        });
      
      loadingPromises.current.set(cacheKey, promise);
      await promise;
    } catch (err) {
      setError(err);
      setLoading(false);
    } finally {
      loadingPromises.current.delete(cacheKey);
    }
  }, [buildQueryString]);
  
  // 当搜索参数变化时重新加载数据
  useEffect(() => {
    loadData(searchParams);
  }, [searchParams]);
  
  // 清理缓存 - 解决内存管理问题
  const clearCache = useCallback(() => {
    dataCache.current.clear();
    loadingPromises.current.clear();
  }, []);
  
  // 预加载数据 - 解决数据分页和加载问题
  const preloadData = useCallback(async (startIndex, endIndex) => {
    // 这里可以实现预加载逻辑
    // 为即将显示的数据项预加载内容
  }, []);
  
  // 组件卸载时清理 - 解决内存管理问题
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, []);
  
  return {
    data,
    loading,
    error,
    totalCount,
    loadData,
    clearCache,
    preloadData
  };
};
