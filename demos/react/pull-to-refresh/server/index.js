const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// 模拟数据存储
let mockData = [];
let dataIdCounter = 1;

// 生成模拟数据
const generateMockData = (count = 10) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: dataIdCounter++,
      title: `服务器标题 ${dataIdCounter - 1}`,
      content: `这是从服务器返回的第 ${dataIdCounter - 1} 条内容，用于演示上拉加载和下拉刷新功能。`,
      timestamp: Date.now() - Math.random() * 86400000,
      author: `服务器作者 ${Math.floor(Math.random() * 100)}`,
      tags: ['服务器', '演示', 'API'],
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100)
    });
  }
  return data;
};

// 初始化数据
const initializeData = () => {
  mockData = generateMockData(50); // 生成50条初始数据
  console.log(`初始化了 ${mockData.length} 条模拟数据`);
};

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟网络延迟和错误
const simulateNetworkConditions = async () => {
  // 随机延迟 200-1000ms
  const randomDelay = 200 + Math.random() * 800;
  await delay(randomDelay);
  
  // 5% 概率模拟网络错误
  if (Math.random() < 0.05) {
    throw new Error('服务器暂时不可用');
  }
  
  // 10% 概率模拟请求超时
  if (Math.random() < 0.1) {
    await delay(5000); // 延迟5秒模拟超时
    throw new Error('请求超时');
  }
};

// API路由

// 获取分页数据
app.get('/api/data', async (req, res) => {
  try {
    await simulateNetworkConditions();
    
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const search = req.query.search || '';
    
    let filteredData = [...mockData];
    
    // 搜索过滤
    if (search) {
      filteredData = filteredData.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // 计算分页信息
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取数据失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 刷新数据
app.post('/api/refresh', async (req, res) => {
  try {
    await simulateNetworkConditions();
    
    // 生成新的第一页数据
    const newData = generateMockData(10);
    
    // 替换前10条数据
    mockData.splice(0, 10, ...newData);
    
    res.json({
      success: true,
      data: newData,
      message: '数据刷新成功',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('刷新数据失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 搜索数据
app.get('/api/search', async (req, res) => {
  try {
    await simulateNetworkConditions();
    
    const query = req.query.q || '';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    if (!query.trim()) {
      return res.status(400).json({
        success: false,
        error: '搜索关键词不能为空',
        timestamp: new Date().toISOString()
      });
    }
    
    // 搜索逻辑
    const searchResults = mockData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.content.toLowerCase().includes(query.toLowerCase()) ||
      item.author.toLowerCase().includes(query.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = searchResults.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedResults,
      query,
      totalResults: searchResults.length,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(searchResults.length / pageSize)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 获取数据统计
app.get('/api/stats', async (req, res) => {
  try {
    await simulateNetworkConditions();
    
    const totalItems = mockData.length;
    const totalViews = mockData.reduce((sum, item) => sum + item.views, 0);
    const totalLikes = mockData.reduce((sum, item) => sum + item.likes, 0);
    
    // 按作者统计
    const authorStats = {};
    mockData.forEach(item => {
      if (authorStats[item.author]) {
        authorStats[item.author]++;
      } else {
        authorStats[item.author] = 1;
      }
    });
    
    // 按标签统计
    const tagStats = {};
    mockData.forEach(item => {
      item.tags.forEach(tag => {
        if (tagStats[tag]) {
          tagStats[tag]++;
        } else {
          tagStats[tag] = 1;
        }
      });
    });
    
    res.json({
      success: true,
      stats: {
        totalItems,
        totalViews,
        totalLikes,
        averageViews: Math.round(totalViews / totalItems),
        averageLikes: Math.round(totalLikes / totalItems),
        authorCount: Object.keys(authorStats).length,
        tagCount: Object.keys(tagStats).length,
        topAuthors: Object.entries(authorStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([author, count]) => ({ author, count })),
        topTags: Object.entries(tagStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }))
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    timestamp: new Date().toISOString()
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据
    initializeData();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器启动成功!`);
      console.log(`📍 地址: http://localhost:${PORT}`);
      console.log(`📊 API文档: http://localhost:${PORT}/api/health`);
      console.log(`🌐 前端应用: http://localhost:3000`);
      console.log(`📝 模拟数据: ${mockData.length} 条`);
    });
    
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer();
