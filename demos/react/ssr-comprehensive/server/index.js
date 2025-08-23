import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { LRUCache } from 'lru-cache';

// React SSR相关导入
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server.js';
import serialize from 'serialize-javascript';

// 应用组件导入
import App from '../src/App.js';
import { DataProvider } from '../src/context/DataContext.js';
import { fetchInitialData } from './utils/dataFetcher.js';
import { generateHTML } from './utils/htmlTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// 创建缓存实例 - 解决缓存和性能优化问题
const renderCache = new LRUCache({
  max: 500, // 最多缓存500个页面
  ttl: 1000 * 60 * 5 // 5分钟TTL
});

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // 允许内联样式
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(compression()); // Gzip压缩
app.use(cors());
app.use(morgan('combined'));

// 静态文件服务
app.use('/static', express.static(path.resolve(__dirname, 'public'), {
  maxAge: isDevelopment ? 0 : '1y', // 生产环境缓存1年
  etag: true
}));

// API路由 - 解决数据获取问题
app.use('/api', express.json());

// 模拟API数据
app.get('/api/users', (req, res) => {
  // 模拟异步数据获取
  setTimeout(() => {
    res.json({
      users: [
        { id: 1, name: '张三', role: 'admin' },
        { id: 2, name: '李四', role: 'user' },
        { id: 3, name: '王五', role: 'user' }
      ]
    });
  }, 100);
});

app.get('/api/posts', (req, res) => {
  setTimeout(() => {
    res.json({
      posts: [
        { id: 1, title: 'React SSR 完整指南', content: 'SSR的实现细节...', author: '张三' },
        { id: 2, title: 'Webpack配置优化', content: 'Webpack的最佳实践...', author: '李四' },
        { id: 3, title: '状态管理最佳实践', content: '状态管理的选择...', author: '王五' }
      ]
    });
  }, 150);
});

app.get('/api/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  
  setTimeout(() => {
    const posts = [
      { id: 1, title: 'React SSR 完整指南', content: 'React服务端渲染(SSR)是一项重要技术，它可以显著提升应用的首屏加载性能和SEO效果。本文将深入探讨SSR的实现原理和最佳实践。', author: '张三', publishDate: '2024-01-15' },
      { id: 2, title: 'Webpack配置优化', content: 'Webpack是现代前端开发不可或缺的工具。通过合理的配置优化，我们可以显著提升构建速度和产出质量。', author: '李四', publishDate: '2024-01-10' },
      { id: 3, title: '状态管理最佳实践', content: '在复杂的React应用中，状态管理是一个关键问题。本文将比较不同状态管理方案的优缺点。', author: '王五', publishDate: '2024-01-05' }
    ];
    
    const post = posts.find(p => p.id === postId);
    if (post) {
      res.json({ post });
    } else {
      res.status(404).json({ error: '文章不存在' });
    }
  }, 120);
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// SSR路由处理器 - 解决路由处理和服务端渲染问题
app.get('*', async (req, res) => {
  try {
    const url = req.url;
    const cacheKey = url;
    
    // 检查缓存 - 性能优化
    if (renderCache.has(cacheKey) && !isDevelopment) {
      console.log(`缓存命中: ${url}`);
      return res.send(renderCache.get(cacheKey));
    }
    
    console.log(`服务端渲染: ${url}`);
    
    // 获取初始数据 - 解决数据预取问题
    const initialData = await fetchInitialData(url);
    
    // 创建服务端渲染上下文
    const context = {};
    
    // 渲染React应用到字符串 - 解决服务端渲染问题
    const appString = renderToString(
      React.createElement(DataProvider, { 
        value: { 
          ...initialData, 
          isServer: true, // 标识服务端环境
          isHydrated: false 
        } 
      },
        React.createElement(StaticRouter, { 
          location: req.url,
          context: context
        },
          React.createElement(App)
        )
      )
    );
    
    // 检查路由重定向
    if (context.url) {
      return res.redirect(301, context.url);
    }
    
    // 检查404
    if (context.notFound) {
      res.status(404);
    }
    
    // 生成完整的HTML - 解决HTML模板和状态注入问题
    const html = generateHTML({
      content: appString,
      initialData: serialize(initialData, { isJSON: true }), // 安全序列化状态
      url: req.url,
      title: initialData.meta?.title || 'SSR React Demo',
      description: initialData.meta?.description || 'React SSR演示应用'
    });
    
    // 缓存渲染结果
    if (!isDevelopment) {
      renderCache.set(cacheKey, html);
    }
    
    res.send(html);
    
  } catch (error) {
    console.error('SSR错误:', error);
    
    // 错误处理 - 优雅降级
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>服务器错误</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <div id="root">
            <h1>服务器暂时不可用</h1>
            <p>请稍后重试，或者<a href="/">返回首页</a></p>
          </div>
          ${isDevelopment ? `<pre>${error.stack}</pre>` : ''}
        </body>
      </html>
    `);
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ 
    error: isDevelopment ? error.message : '内部服务器错误' 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`
🚀 SSR服务器已启动
📍 地址: http://localhost:${PORT}
🔧 环境: ${isDevelopment ? 'development' : 'production'}
💾 缓存: ${isDevelopment ? '关闭' : '开启'}
  `);
});