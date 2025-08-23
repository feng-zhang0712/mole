const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// 生成模拟数据 - 解决数据分页和加载问题
const generateMockData = (count) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: i,
      title: `Item ${i}`,
      description: `This is a description for item ${i}`,
      // 模拟动态高度 - 解决高度计算和缓存问题
      height: Math.random() > 0.5 ? 60 : 80,
      timestamp: Date.now() + i,
      category: `Category ${i % 5}`,
      priority: i % 3
    });
  }
  return data;
};

// 存储所有数据
let allData = generateMockData(10000);

// 搜索和过滤API - 解决搜索和过滤问题
app.get('/api/search', (req, res) => {
  const { query, category, priority, page = 1, limit = 100 } = req.query;
  
  let filteredData = [...allData];
  
  // 文本搜索
  if (query) {
    filteredData = filteredData.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // 分类过滤
  if (category) {
    filteredData = filteredData.filter(item => item.category === category);
  }
  
  // 优先级过滤
  if (priority !== undefined) {
    filteredData = filteredData.filter(item => item.priority === parseInt(priority));
  }
  
  // 分页处理
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  res.json({
    data: paginatedData,
    total: filteredData.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredData.length / limit)
  });
});

// 获取单个数据项 - 解决数据获取问题
app.get('/api/item/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const item = allData.find(item => item.id === id);
  
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// 获取数据统计信息 - 解决性能监控问题
app.get('/api/stats', (req, res) => {
  const categories = [...new Set(allData.map(item => item.category))];
  const priorities = [...new Set(allData.map(item => item.priority))];
  
  res.json({
    totalItems: allData.length,
    categories,
    priorities,
    averageHeight: allData.reduce((sum, item) => sum + item.height, 0) / allData.length
  });
});

// 错误处理中间件 - 解决错误处理和边界情况问题
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404处理 - 解决边界情况问题
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Virtual List Server running on port ${PORT}`);
  console.log(`Mock data generated: ${allData.length} items`);
});
