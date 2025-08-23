import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import App from '../src/App.js';
import { DataProvider } from '../src/context/DataContext.js';
import { fetchProducts, fetchProduct } from './utils/dataFetcher.js';
import { createHTMLTemplate } from './utils/htmlTemplate.js';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(compression()); // 压缩响应
app.use(helmet({
  contentSecurityPolicy: false, // 开发环境禁用CSP
  crossOriginEmbedderPolicy: false
})); // 安全头
app.use(cors()); // CORS支持
app.use(morgan('combined')); // 日志记录

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist')));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API路由
app.get('/api/products', async (req, res) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await fetchProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// 服务端渲染中间件
app.get('*', async (req, res) => {
  try {
    const context = {};
    let initialState = {};
    
    // 根据路由预取数据
    if (req.path === '/' || req.path === '/products') {
      try {
        const products = await fetchProducts();
        initialState = { products, loading: false, error: null, isHydrated: false };
      } catch (error) {
        console.error('Error pre-fetching products:', error);
        initialState = { products: [], loading: false, error: error.message, isHydrated: false };
      }
    } else if (req.path.startsWith('/products/') && req.path !== '/products') {
      const productId = req.path.split('/').pop();
      try {
        const product = await fetchProduct(productId);
        if (product) {
          initialState = { currentProduct: product, loading: false, error: null, isHydrated: false };
        } else {
          // 产品不存在，设置404状态
          context.statusCode = 404;
          initialState = { currentProduct: null, loading: false, error: 'Product not found', isHydrated: false };
        }
      } catch (error) {
        console.error('Error pre-fetching product:', error);
        initialState = { currentProduct: null, loading: false, error: error.message, isHydrated: false };
      }
    }

    // 渲染React应用
    const app = React.createElement(
      HelmetProvider,
      {},
      React.createElement(
        DataProvider,
        { initialState },
        React.createElement(App)
      )
    );

    const router = React.createElement(StaticRouter, {
      location: req.url,
      context
    });

    const appWithRouter = React.cloneElement(app, {}, router);
    
    const appHtml = renderToString(appWithRouter);
    
    // 获取Helmet数据
    const helmetContext = {};
    const helmetApp = React.createElement(
      HelmetProvider,
      { context: helmetContext },
      appWithRouter
    );
    
    renderToString(helmetApp);
    const { helmet } = helmetContext;

    // 创建HTML模板
    const html = createHTMLTemplate(appHtml, initialState, helmet);

    // 设置状态码
    if (context.statusCode) {
      res.status(context.statusCode);
    }

    res.send(html);
  } catch (error) {
    console.error('SSR Error:', error);
    
    // 错误降级：返回基本的HTML结构
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - SSR React App</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <h1>Something went wrong</h1>
            <p>We're experiencing technical difficulties. Please try again later.</p>
          </div>
          <script>
            window.__PRELOADED_STATE__ = {
              products: [],
              currentProduct: null,
              loading: false,
              error: "Server error occurred",
              isHydrated: false
            };
          </script>
          <script src="/main.js"></script>
        </body>
      </html>
    `;
    
    res.status(500).send(errorHtml);
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} in your browser`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});
