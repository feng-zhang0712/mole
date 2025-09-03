import { useReducer, useCallback } from 'react';

// 初始状态
const initialState = {
  data: [],
  totalCount: 0,
  loading: false,
  error: null,
  cache: new Map(),
  loadedRanges: new Set(),
  searchQuery: '',
  searchLoading: false,
  searchError: null,
  scrollTop: 0,
  computedRange: { startIndex: 0, endIndex: 0 }
};

// Action 类型常量
export const ACTIONS = {
  SET_DATA: 'SET_DATA',
  SET_TOTAL_COUNT: 'SET_TOTAL_COUNT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CACHE: 'SET_CACHE',
  ADD_LOADED_RANGE: 'ADD_LOADED_RANGE',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_LOADING: 'SET_SEARCH_LOADING',
  SET_SEARCH_ERROR: 'SET_SEARCH_ERROR',
  SET_SCROLL_TOP: 'SET_SCROLL_TOP',
  SET_COMPUTED_RANGE: 'SET_COMPUTED_RANGE',
  RESET_SEARCH: 'RESET_SEARCH',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_SEARCH_ERROR: 'CLEAR_SEARCH_ERROR'
};

// Reducer 函数
function virtualListReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_DATA:
      return {
        ...state,
        data: action.payload
      };

    case ACTIONS.SET_TOTAL_COUNT:
      return {
        ...state,
        totalCount: action.payload
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ACTIONS.SET_CACHE:
      return {
        ...state,
        cache: action.payload
      };

    case ACTIONS.ADD_LOADED_RANGE:
      const newLoadedRanges = new Set(state.loadedRanges);
      newLoadedRanges.add(action.payload);
      return {
        ...state,
        loadedRanges: newLoadedRanges
      };

    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };

    case ACTIONS.SET_SEARCH_LOADING:
      return {
        ...state,
        searchLoading: action.payload
      };

    case ACTIONS.SET_SEARCH_ERROR:
      return {
        ...state,
        searchError: action.payload
      };

    case ACTIONS.SET_SCROLL_TOP:
      return {
        ...state,
        scrollTop: action.payload
      };

    case ACTIONS.SET_COMPUTED_RANGE:
      return {
        ...state,
        computedRange: action.payload
      };

    case ACTIONS.RESET_SEARCH:
      return {
        ...state,
        searchQuery: '',
        searchLoading: false,
        searchError: null,
        data: [],
        totalCount: 0,
        cache: new Map(),
        loadedRanges: new Set()
      };

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ACTIONS.CLEAR_SEARCH_ERROR:
      return {
        ...state,
        searchError: null
      };

    default:
      return state;
  }
}

// 自定义 Hook
export function useVirtualListReducer() {
  const [state, dispatch] = useReducer(virtualListReducer, initialState);

  // Action creators
  const setData = useCallback((data) => {
    dispatch({ type: ACTIONS.SET_DATA, payload: data });
  }, []);

  const setTotalCount = useCallback((count) => {
    dispatch({ type: ACTIONS.SET_TOTAL_COUNT, payload: count });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  }, []);

  const setCache = useCallback((cache) => {
    dispatch({ type: ACTIONS.SET_CACHE, payload: cache });
  }, []);

  const addLoadedRange = useCallback((range) => {
    dispatch({ type: ACTIONS.ADD_LOADED_RANGE, payload: range });
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
  }, []);

  const setSearchLoading = useCallback((loading) => {
    dispatch({ type: ACTIONS.SET_SEARCH_LOADING, payload: loading });
  }, []);

  const setSearchError = useCallback((error) => {
    dispatch({ type: ACTIONS.SET_SEARCH_ERROR, payload: error });
  }, []);

  const setScrollTop = useCallback((scrollTop) => {
    dispatch({ type: ACTIONS.SET_SCROLL_TOP, payload: scrollTop });
  }, []);

  const setComputedRange = useCallback((range) => {
    dispatch({ type: ACTIONS.SET_COMPUTED_RANGE, payload: range });
  }, []);

  const resetSearch = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_SEARCH });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  }, []);

  const clearSearchError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SEARCH_ERROR });
  }, []);

  // 数据操作方法
  const getVisibleData = useCallback(async (startIndex, endIndex) => {
    const rangeKey = `${startIndex}-${endIndex}`;
    
    // 检查是否已经加载过这个范围
    if (state.loadedRanges.has(rangeKey)) {
      return;
    }

    setLoading(true);
    clearError();

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newData = [];
      for (let i = startIndex; i < endIndex; i++) {
        newData.push({
          id: i,
          name: `Item ${i + 1}`,
          email: `item${i + 1}@example.com`,
          description: `This is item ${i + 1} with some description text.`
        });
      }

      // 更新数据，保持现有数据不变
      const updatedData = [...state.data];
      for (let i = 0; i < newData.length; i++) {
        updatedData[startIndex + i] = newData[i];
      }

      setData(updatedData);
      addLoadedRange(rangeKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [state.data, state.loadedRanges, setLoading, setData, addLoadedRange, clearError, setError]);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      resetSearch();
      return;
    }

    setSearchLoading(true);
    clearSearchError();

    try {
      // 模拟搜索API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const searchResults = [];
      const resultCount = Math.floor(Math.random() * 1000) + 100; // 100-1100个结果
      
      for (let i = 0; i < Math.min(50, resultCount); i++) {
        searchResults.push({
          id: i,
          name: `Search Result ${i + 1}`,
          email: `search${i + 1}@example.com`,
          description: `This is a search result for "${query}" - item ${i + 1}`
        });
      }

      setData(searchResults);
      setTotalCount(resultCount);
      setSearchQuery(query);
      setCache(new Map());
      setLoadedRanges(new Set());
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  }, [setSearchLoading, clearSearchError, setData, setTotalCount, setSearchQuery, setCache, setLoadedRanges, setSearchError, resetSearch]);

  const refresh = useCallback(async () => {
    setLoading(true);
    clearError();

    try {
      // 模拟刷新API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const totalCount = Math.floor(Math.random() * 10000) + 1000; // 1000-11000个数据
      setTotalCount(totalCount);
      setData([]);
      setCache(new Map());
      setLoadedRanges(new Set());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setLoading, clearError, setTotalCount, setData, setCache, setLoadedRanges, setError]);

  return {
    // 状态
    ...state,
    
    // 操作方法
    getVisibleData,
    search,
    refresh,
    
    // 直接设置方法
    setData,
    setTotalCount,
    setLoading,
    setError,
    setCache,
    addLoadedRange,
    setSearchQuery,
    setSearchLoading,
    setSearchError,
    setScrollTop,
    setComputedRange,
    resetSearch,
    clearError,
    clearSearchError
  };
}
