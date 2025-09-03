import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../services/api';

const useVirtualListData = () => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState(new Map());
  const [loadedRanges, setLoadedRanges] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // 用于取消请求的AbortController
  const abortControllerRef = useRef(null);

  // 初始化数据总数
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError(null);
        const count = await apiService.getTotalCount();
        setTotalCount(count);
        
        // 初始化空数组
        setData(new Array(count).fill(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // 加载指定范围的数据
  const loadDataRange = useCallback(async (start, count) => {
    const rangeKey = `${start}-${start + count - 1}`;
    
    // 如果已经加载过，直接返回缓存的数据
    if (loadedRanges.has(rangeKey)) {
      return cache.get(rangeKey);
    }

    // 如果正在加载，等待
    if (loading) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 创建新的AbortController
      abortControllerRef.current = new AbortController();

      const result = await apiService.getData(start, count);

      // 更新缓存
      setCache(prev => new Map(prev.set(rangeKey, result.data)));
      setLoadedRanges(prev => new Set([...prev, rangeKey]));
      setTotalCount(result.totalCount);

      return result.data;
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading, loadedRanges, cache]);

  // 更新数据数组中的指定范围
  const updateDataRange = useCallback((start, newData) => {
    setData(prev => {
      const newDataArray = [...prev];
      for (let i = 0; i < newData.length; i++) {
        newDataArray[start + i] = newData[i];
      }
      return newDataArray;
    });
  }, []);

  // 获取可见区域的数据
  const getVisibleData = useCallback(async (startIndex, endIndex) => {
    const dataIndexToLoad = [];

    // 检查哪些数据需要加载
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= totalCount) break;
      if (data[i] === null) {
        dataIndexToLoad.push(i);
      }
    }

    if (dataIndexToLoad.length === 0) {
      return;
    }

    // 按范围分组加载数据
    const ranges = [];
    let currentRange = { start: dataIndexToLoad[0], end: dataIndexToLoad[0] };
    
    for (let i = 1; i < dataIndexToLoad.length; i++) {
      if (dataIndexToLoad[i] === dataIndexToLoad[i - 1] + 1) {
        currentRange.end = dataIndexToLoad[i];
      } else {
        ranges.push(currentRange);
        currentRange = { start: dataIndexToLoad[i], end: dataIndexToLoad[i] };
      }
    }
    ranges.push(currentRange);

    // 并行加载所有范围的数据
    const loadPromises = ranges.map(async range => {
      const count = range.end - range.start + 1;
      const result = await loadDataRange(range.start, count);
      return { range, data: result };
    });

    const results = await Promise.all(loadPromises);

    // 更新数据数组
    results.forEach(({ range, data: resultData }) => {
      if (resultData) {
        updateDataRange(range.start, resultData);
      }
    });
  }, [totalCount, loadDataRange, updateDataRange]);

  // 搜索功能
  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchQuery('');
      setSearchError(null);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      
      const result = await apiService.searchData(query, 0, 100);
      
      setData(result.data);
      setTotalCount(result.totalCount);
      setLoadedRanges(new Set(['0-100']));
      setCache(new Map([['0-100', result.data]]));
      setSearchQuery(query);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // 刷新当前数据
  const refresh = useCallback(async () => {
    setCache(new Map());
    setLoadedRanges(new Set());
    setData(new Array(totalCount).fill(null));
    setError(null);
    setSearchQuery('');
    setSearchError(null);
  }, [totalCount]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    totalCount,
    loading,
    error,
    searchQuery,
    searchLoading,
    searchError,
    getVisibleData,
    search,
    refresh
  };
};

export default useVirtualListData;

/** 

### 1. 函数定义和参数
```javascript
const getVisibleData = useCallback(async (startIndex, endIndex) => {
```
- 定义了一个异步函数，接收可见区域的起始和结束索引
- 使用 `useCallback` 缓存函数，避免不必要的重新创建

### 2. 初始化需要加载的数据数组
```javascript
const dataToLoad = [];
```
- 创建一个空数组，用来存储需要加载的数据索引

### 3. 检查哪些数据需要加载
```javascript
for (let i = startIndex; i < endIndex; i++) {
  if (i >= totalCount) break;
  if (data[i] === null) {
    dataToLoad.push(i);
  }
}
```
- 遍历可见区域的所有索引
- 如果索引超出总数，跳出循环
- 如果某个位置的数据是 `null`（未加载），就把这个索引加入待加载列表

### 4. 提前返回优化
```javascript
if (dataToLoad.length === 0) {
  return;
}
```
- 如果没有需要加载的数据，直接返回，避免不必要的操作

### 5. 按范围分组准备
```javascript
const ranges = [];
let currentRange = { start: dataToLoad[0], end: dataToLoad[0] };
```
- 创建范围数组，用于存储连续的数据范围
- 初始化当前范围为第一个需要加载的索引

### 6. 将连续的索引分组
```javascript
for (let i = 1; i < dataToLoad.length; i++) {
  if (dataToLoad[i] === dataToLoad[i - 1] + 1) {
    currentRange.end = dataToLoad[i];
  } else {
    ranges.push(currentRange);
    currentRange = { start: dataToLoad[i], end: dataToLoad[i] };
  }
}
ranges.push(currentRange);
```
- 遍历所有需要加载的索引
- 如果当前索引是前一个索引+1（连续的），就扩展当前范围
- 如果不连续，就保存当前范围，开始新的范围
- 最后保存最后一个范围

### 7. 并行加载所有范围的数据
```javascript
const loadPromises = ranges.map(async range => {
  const count = range.end - range.start + 1;
  const result = await loadDataRange(range.start, count);
  return { range, data: result };
});

const results = await Promise.all(loadPromises);
```
- 为每个范围创建一个加载Promise
- 计算每个范围需要加载的数据数量
- 调用 `loadDataRange` 加载指定范围的数据
- 使用 `Promise.all` 并行执行所有加载操作

### 8. 更新数据数组
```javascript
results.forEach(({ range, data: resultData }) => {
  if (resultData) {
    updateDataRange(range.start, resultData);
  }
});
```
- 遍历所有加载结果
- 如果有数据返回，就调用 `updateDataRange` 更新对应位置的数据

## 举个例子

假设：
- `startIndex = 10, endIndex = 20`
- `data[10] = null, data[11] = null, data[12] = 已有数据, data[13] = null, data[14] = null`

执行过程：
1. `dataToLoad = [10, 11, 13, 14]`（找出所有null的位置）
2. `ranges = [{start: 10, end: 11}, {start: 13, end: 14}]`（分组连续索引）
3. 并行加载两个范围：`[10,11]` 和 `[13,14]`
4. 将加载的数据更新到对应位置

这样设计的好处是：
- **按需加载**：只加载可见区域需要的数据
- **批量优化**：将连续的索引合并成一个请求，减少网络请求次数
- **并行加载**：多个不连续的范围可以同时加载，提高效率

**/
