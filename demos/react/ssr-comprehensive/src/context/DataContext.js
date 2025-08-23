/**
 * 数据上下文 - 解决状态管理和数据同步问题
 * 提供全局状态管理，处理服务端和客户端数据同步
 */

import { createContext, useContext, useState, useEffect } from 'react';

// 创建数据上下文
const DataContext = createContext(null);

/**
 * 数据提供者组件
 * @param {Object} props 组件属性
 * @param {Object} props.value 初始数据值
 * @param {React.ReactNode} props.children 子组件
 */
export function DataProvider({ value, children }) {
  // 使用useState管理数据状态
  const [data, setData] = useState(value || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 检测环境
  const isServer = typeof window === 'undefined';
  const isClient = !isServer;
  
  // 客户端激活状态
  const [isHydrated, setIsHydrated] = useState(isServer ? false : true);
  
  // 客户端激活效果
  useEffect(() => {
    if (isClient && !isHydrated) {
      // 标记客户端已激活
      setIsHydrated(true);
      window.__CLIENT_HYDRATED__ = true;
      
      // 合并服务端初始数据
      if (window.__INITIAL_DATA__) {
        setData(prevData => ({
          ...window.__INITIAL_DATA__,
          ...prevData,
          isServer: false,
          isHydrated: true
        }));
        
        // 清理全局变量，避免内存泄漏
        delete window.__INITIAL_DATA__;
      }
      
      console.log('🚀 客户端激活完成');
    }
  }, [isClient, isHydrated]);
  
  /**
   * 更新数据的函数
   * @param {Object|Function} newData 新数据或更新函数
   */
  const updateData = (newData) => {
    if (typeof newData === 'function') {
      setData(prevData => ({
        ...prevData,
        ...newData(prevData)
      }));
    } else {
      setData(prevData => ({
        ...prevData,
        ...newData
      }));
    }
  };
  
  /**
   * 异步获取数据的函数
   * @param {string} url 数据URL
   * @param {Object} options 请求选项
   */
  const fetchData = async (url, options = {}) => {
    // 避免服务端重复请求
    if (isServer) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newData = await response.json();
      updateData(newData);
      
      return newData;
    } catch (err) {
      console.error('数据获取失败:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * 重置错误状态
   */
  const clearError = () => {
    setError(null);
  };
  
  // 上下文值
  const contextValue = {
    data,
    loading,
    error,
    isServer,
    isClient,
    isHydrated,
    updateData,
    fetchData,
    clearError,
    
    // 便捷访问器
    users: data.users || [],
    posts: data.posts || [],
    post: data.post || null,
    featuredPosts: data.featuredPosts || [],
    relatedPosts: data.relatedPosts || [],
    aboutInfo: data.aboutInfo || null,
    totalUsers: data.totalUsers || 0,
    totalPosts: data.totalPosts || 0,
    route: data.route || 'home',
    meta: data.meta || {}
  };
  
  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * 使用数据上下文的Hook
 * @returns {Object} 上下文数据和方法
 */
export function useData() {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData必须在DataProvider内部使用');
  }
  
  return context;
}

/**
 * 用于特定数据的Hook
 */
export function useUsers() {
  const { users, loading, error, fetchData } = useData();
  
  const refreshUsers = () => {
    return fetchData('/api/users');
  };
  
  return { users, loading, error, refreshUsers };
}

export function usePosts() {
  const { posts, loading, error, fetchData } = useData();
  
  const refreshPosts = () => {
    return fetchData('/api/posts');
  };
  
  return { posts, loading, error, refreshPosts };
}

export function usePost(id) {
  const { post, loading, error, fetchData } = useData();
  
  const refreshPost = () => {
    return fetchData(`/api/posts/${id}`);
  };
  
  return { post, loading, error, refreshPost };
}

/**
 * 路由数据Hook - 处理路由切换时的数据获取
 * @param {string} path 路由路径
 */
export function useRouteData(path) {
  const { data, loading, error, updateData, isHydrated } = useData();
  const [routeLoading, setRouteLoading] = useState(false);
  
  const fetchRouteData = async (routePath) => {
    // 服务端不执行
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      setRouteLoading(true);
      
      // 检查是否需要重新获取数据
      const currentRoute = data.route;
      const newRoute = routePath.split('/').filter(Boolean)[0] || 'home';
      
      if (currentRoute === newRoute) {
        return data; // 相同路由，不重新获取
      }
      
      // 获取新路由数据
      const response = await fetch(`/api/route-data?path=${encodeURIComponent(routePath)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const routeData = await response.json();
      updateData(routeData);
      
      return routeData;
    } catch (err) {
      console.error('路由数据获取失败:', err);
      throw err;
    } finally {
      setRouteLoading(false);
    }
  };
  
  return {
    data,
    loading: loading || routeLoading,
    error,
    fetchRouteData,
    isHydrated
  };
}