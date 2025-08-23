/**
 * API工具函数 - 处理数据请求和错误处理
 * 包括网络异常、数据异常、用户操作异常等
 */

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟网络错误
const simulateNetworkError = () => {
  const random = Math.random();
  if (random < 0.1) { // 10%概率网络错误
    throw new Error('网络连接失败');
  }
  if (random < 0.2) { // 10%概率请求超时
    throw new Error('请求超时');
  }
};

// 模拟数据生成
const generateMockData = (page, pageSize = 10) => {
  const startId = (page - 1) * pageSize + 1;
  const data = [];
  
  for (let i = 0; i < pageSize; i++) {
    data.push({
      id: startId + i,
      title: `标题 ${startId + i}`,
      content: `这是第 ${page} 页的第 ${i + 1} 条内容，包含一些示例文本用于演示上拉加载和下拉刷新功能。`,
      timestamp: Date.now() - Math.random() * 86400000, // 随机时间戳
      author: `作者 ${Math.floor(Math.random() * 100)}`,
      tags: ['示例', '演示', 'React']
    });
  }
  
  return data;
};

// 主数据获取函数
export const fetchData = async (page = 1, pageSize = 10) => {
  try {
    // 模拟网络延迟
    await delay(500 + Math.random() * 1000);
    
    // 模拟网络错误
    simulateNetworkError();
    
    // 模拟分页逻辑：最多生成100条数据（10页）
    const maxPages = 10;
    if (page > maxPages) {
      return [];
    }
    
    // 模拟数据
    const data = generateMockData(page, pageSize);
    
    // 确保返回的数据量正确
    console.log(`获取第${page}页数据，共${data.length}条`);
    
    return data;
  } catch (error) {
    console.error('数据获取失败:', error);
    throw error;
  }
};

// 刷新数据
export const refreshData = async () => {
  try {
    await delay(800 + Math.random() * 500);
    simulateNetworkError();
    
    // 生成新的第一页数据
    return generateMockData(1, 10);
  } catch (error) {
    console.error('数据刷新失败:', error);
    throw error;
  }
};

// 搜索数据
export const searchData = async (query, page = 1, pageSize = 10) => {
  try {
    await delay(300 + Math.random() * 500);
    simulateNetworkError();
    
    if (!query || query.trim() === '') {
      return generateMockData(page, pageSize);
    }
    
    // 模拟搜索逻辑
    const allData = generateMockData(1, 100); // 生成更多数据用于搜索
    const filteredData = allData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.author.toLowerCase().includes(query.toLowerCase())
    );
    
    // 分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  } catch (error) {
    console.error('搜索失败:', error);
    throw error;
  }
};

// 错误处理工具
export const handleApiError = (error) => {
  let userMessage = '操作失败，请稍后重试';
  let shouldRetry = false;
  
  if (error.message.includes('网络连接失败')) {
    userMessage = '网络连接失败，请检查网络设置';
    shouldRetry = true;
  } else if (error.message.includes('请求超时')) {
    userMessage = '请求超时，请稍后重试';
    shouldRetry = true;
  } else if (error.message.includes('服务器错误')) {
    userMessage = '服务器暂时不可用，请稍后重试';
    shouldRetry = true;
  } else if (error.message.includes('权限不足')) {
    userMessage = '权限不足，请重新登录';
    shouldRetry = false;
  }
  
  return {
    userMessage,
    shouldRetry,
    originalError: error
  };
};

// 重试机制
export const retryRequest = async (requestFn, maxRetries = 3, delayMs = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 指数退避延迟
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// 批量请求
export const batchRequest = async (requests, concurrency = 3) => {
  const results = [];
  const errors = [];
  
  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = await request();
        return { index: i + index, result, error: null };
      } catch (error) {
        return { index: i + index, result: null, error };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ index, result, error }) => {
      if (error) {
        errors.push({ index, error });
      } else {
        results[index] = result;
      }
    });
  }
  
  return { results, errors };
};

// 请求缓存
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

export const cachedRequest = async (key, requestFn, ttl = CACHE_TTL) => {
  const cached = requestCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await requestFn();
  
  requestCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
};

// 清理过期缓存
export const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
};

// 定期清理缓存
setInterval(cleanupCache, CACHE_TTL);
