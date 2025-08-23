import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useRoutePreload } from '../utils/preload';

function Layout() {
  const location = useLocation();
  const { preloadRoute } = useRoutePreload();
  
  // 鼠标悬停时预加载路由
  const handleMouseEnter = (routePath) => {
    preloadRoute(routePath);
  };
  
  return (
    <div className="layout">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="nav-brand">React Router Demo</div>
        <ul className="nav-menu">
          <li className={location.pathname === '/home' ? 'active' : ''}>
            <Link 
              to="/home" 
              onMouseEnter={() => handleMouseEnter('/home')}
            >
              首页
            </Link>
          </li>
          <li className={location.pathname === '/about' ? 'active' : ''}>
            <Link 
              to="/about" 
              onMouseEnter={() => handleMouseEnter('/about')}
            >
              关于
            </Link>
          </li>
          <li className={location.pathname.startsWith('/products') ? 'active' : ''}>
            <Link 
              to="/products" 
              onMouseEnter={() => handleMouseEnter('/products')}
            >
              产品
            </Link>
          </li>
          <li className={location.pathname.startsWith('/user') ? 'active' : ''}>
            <Link 
              to="/user" 
              onMouseEnter={() => handleMouseEnter('/user')}
            >
              用户中心
            </Link>
          </li>
        </ul>
      </nav>
      
              {/* 主要内容区域 */}
        <main className="main-content">
          {/* 
            Outlet 组件的作用：
            1. 渲染当前路由的子路由内容
            2. 实现路由嵌套的关键组件
            3. 当访问 /home 时，Outlet 会渲染 Home 组件
            4. 当访问 /products/123 时，Outlet 会渲染 ProductDetail 组件
            
            性能优化特性：
            5. 鼠标悬停导航链接时预加载对应页面
            6. 支持智能路由预测和预加载
            7. 所有页面组件都使用懒加载和代码分割
          */}
          <Outlet />
        </main>
      
      {/* 页脚 */}
      <footer className="footer">
        <p>React Router 路由嵌套与动态路由示例</p>
      </footer>
    </div>
  );
}

export default Layout;
