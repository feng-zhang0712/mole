import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes/index.js';
import { AuthProvider } from './contexts/AuthContext.js';
import './styles/index.css';

// 创建浏览器路由器实例
const router = createBrowserRouter(routes);

// 渲染应用
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
