import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { lazyLoadWithErrorBoundary } from './utils/lazyLoad';
import { PageLoading } from './components/LoadingSpinner';

// 懒加载页面组件
const Home = lazyLoadWithErrorBoundary(() => import('./pages/Home'), <PageLoading title="首页加载中" />);
const About = lazyLoadWithErrorBoundary(() => import('./pages/About'), <PageLoading title="关于页面加载中" />);
const Products = lazyLoadWithErrorBoundary(() => import('./pages/Products'), <PageLoading title="产品列表加载中" />);
const ProductDetail = lazyLoadWithErrorBoundary(() => import('./pages/ProductDetail'), <PageLoading title="产品详情加载中" />);
const UserProfile = lazyLoadWithErrorBoundary(() => import('./pages/UserProfile'), <PageLoading title="用户中心加载中" />);
const UserSettings = lazyLoadWithErrorBoundary(() => import('./pages/UserSettings'), <PageLoading title="设置页面加载中" />);
const NotFound = lazyLoadWithErrorBoundary(() => import('./pages/NotFound'), <PageLoading title="404页面加载中" />);

function App() {
  return (
    <div className="app">
      {/* 
        路由配置说明：
        1. 使用 Routes 和 Route 进行路由配置
        2. 通过嵌套 Route 实现路由嵌套
        3. 使用 :id 等参数实现动态路由
        4. 使用 Navigate 进行重定向
        5. 使用 * 路径匹配所有未匹配的路由，实现404页面
        6. 所有页面组件都使用懒加载，提升首屏加载性能
        7. 支持代码分割，按需加载页面资源
      */}
      <Routes>
        {/* 根路径重定向到首页 */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* 主布局路由 - 展示路由嵌套 */}
        <Route path="/" element={<Layout />}>
          {/* 首页路由 */}
          <Route path="home" element={<Home />} />
          
          {/* 关于页面路由 */}
          <Route path="about" element={<About />} />
          
          {/* 产品相关路由 - 展示路由嵌套 */}
          <Route path="products" element={<Products />} />
          {/* 动态路由：产品详情页，:id 是动态参数 */}
          <Route path="products/:id" element={<ProductDetail />} />
          
          {/* 用户相关路由 - 展示更深层的路由嵌套 */}
          <Route path="user" element={<UserProfile />}>
            {/* 用户设置子路由 */}
            <Route path="settings" element={<UserSettings />} />
          </Route>
        </Route>
        
        {/* 404页面 - 匹配所有未定义的路由 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
