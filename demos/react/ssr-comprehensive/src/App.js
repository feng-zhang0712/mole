/**
 * 主应用组件 - React路由和页面渲染
 * 解决前端路由处理、组件渲染、错误边界等问题
 */

import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useData } from './context/DataContext.js';

// 页面组件导入
import HomePage from './pages/HomePage.js';
import UsersPage from './pages/UsersPage.js';
import PostsPage from './pages/PostsPage.js';
import PostDetailPage from './pages/PostDetailPage.js';
import AboutPage from './pages/AboutPage.js';
import NotFoundPage from './pages/NotFoundPage.js';

// 组件导入
import Navigation from './components/Navigation.js';
import LoadingSpinner from './components/LoadingSpinner.js';
import ErrorBoundary from './components/ErrorBoundary.js';

// 样式
import './App.css';

function App() {
  const { loading, error, isHydrated } = useData();
  const location = useLocation();
  
  // 服务端渲染或客户端激活中显示加载状态
  if (!isHydrated) {
    return (
      <div className="app-loading">
        <LoadingSpinner message="应用初始化中..." />
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="app">
        {/* 导航栏 */}
        <Navigation />
        
        {/* 全局加载状态 */}
        {loading && (
          <div className="global-loading">
            <LoadingSpinner message="加载中..." />
          </div>
        )}
        
        {/* 全局错误显示 */}
        {error && (
          <div className="global-error">
            <div className="error-content">
              <h3>⚠️ 出现错误</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                刷新页面
              </button>
            </div>
          </div>
        )}
        
        {/* 主内容区域 */}
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        
        {/* 页面底部 */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-info">
                <h4>SSR React Demo</h4>
                <p>完整的服务端渲染演示项目</p>
              </div>
              
              <div className="footer-links">
                <h5>功能特性</h5>
                <ul>
                  <li>服务端路由处理</li>
                  <li>数据预取和同步</li>
                  <li>客户端激活</li>
                  <li>性能优化</li>
                </ul>
              </div>
              
              <div className="footer-tech">
                <h5>技术栈</h5>
                <ul>
                  <li>React 18</li>
                  <li>React Router v6</li>
                  <li>Express.js</li>
                  <li>Webpack 5</li>
                </ul>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; 2024 SSR React Demo. 演示项目.</p>
              <div className="debug-info">
                路由: {location.pathname} | 
                激活状态: {isHydrated ? '✅' : '⏳'} |
                环境: {typeof window !== 'undefined' ? '客户端' : '服务端'}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;