import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { useRouteGuard } from './guards/RouteGuard.js';
import './Layout.css';

/**
 * 主布局组件
 * 展示导航菜单和权限控制
 */
const Layout = () => {
  const { user, isAuthenticated, logout, hasPermission, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 导航菜单项配置
  const menuItems = [
    {
      path: '/dashboard',
      label: '仪表板',
      icon: '📊',
      permissions: ['read']
    },
    {
      path: '/profile',
      label: '个人资料',
      icon: '👤',
      permissions: ['read', 'write']
    },
    {
      path: '/admin',
      label: '管理面板',
      icon: '⚙️',
      roles: ['admin']
    },
    {
      path: '/settings',
      label: '系统设置',
      icon: '🔧',
      permissions: ['admin']
    },
    {
      path: '/advanced',
      label: '高级演示',
      icon: '🔐',
      permissions: ['read']
    }
  ];

  // 过滤有权限访问的菜单项
  const filteredMenuItems = menuItems.filter(item => {
    if (item.roles && item.roles.length > 0) {
      return item.roles.some(role => hasRole(role));
    }
    if (item.permissions && item.permissions.length > 0) {
      return item.permissions.every(permission => hasPermission(permission));
    }
    return true;
  });

  return (
    <div className="layout">
      {/* 顶部导航栏 */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🚀 React Router Guard Demo</h1>
          </div>
          
          {isAuthenticated && (
            <nav className="nav">
              {filteredMenuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="user-section">
            {isAuthenticated ? (
              <div className="user-info">
                <span className="username">
                  👋 {user?.username}
                </span>
                <div className="user-permissions">
                  <span className="permission-badge">
                    角色: {user?.roles?.join(', ')}
                  </span>
                  <span className="permission-badge">
                    权限: {user?.permissions?.join(', ')}
                  </span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  登出
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="footer">
        <div className="footer-content">
          <p>React Router Guard Demo - 展示多种路由守卫实现方式</p>
          <div className="guard-methods">
            <span className="method-tag">组件守卫</span>
            <span className="method-tag">HOC守卫</span>
            <span className="method-tag">Hook守卫</span>
            <span className="method-tag">异步守卫</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
