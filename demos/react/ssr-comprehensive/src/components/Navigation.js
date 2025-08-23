/**
 * 导航组件 - 解决路由导航和状态同步问题
 */

import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext.js';

function Navigation() {
  const location = useLocation();
  const { route, isHydrated } = useData();
  
  // 导航项配置
  const navItems = [
    { path: '/', label: '首页', key: 'home' },
    { path: '/users', label: '用户管理', key: 'users' },
    { path: '/posts', label: '文章列表', key: 'posts' },
    { path: '/about', label: '关于', key: 'about' }
  ];
  
  /**
   * 判断链接是否为当前激活状态
   * @param {string} path 链接路径
   * @returns {boolean} 是否激活
   */
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <h2>SSR React Demo</h2>
          </Link>
        </div>
        
        <ul className="navbar-nav">
          {navItems.map(item => (
            <li key={item.key} className="nav-item">
              <Link 
                to={item.path}
                className={`nav-link ${isActiveLink(item.path) ? 'active' : ''}`}
                onClick={(e) => {
                  // 处理导航点击事件 - 解决事件处理问题
                  if (!isHydrated) {
                    // 如果还未激活，阻止导航并显示提示
                    e.preventDefault();
                    alert('页面正在加载中，请稍候...');
                    return;
                  }
                  
                  // 可以在这里添加页面切换的loading状态
                  console.log(`导航到: ${item.path}`);
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* 状态指示器 - 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="nav-debug">
            <span className={`status-indicator ${isHydrated ? 'active' : 'loading'}`}>
              {isHydrated ? '🟢' : '🟡'}
            </span>
            <span className="current-route">
              {route}
            </span>
          </div>
        )}
      </div>
      
      {/* <style jsx>{`
        .navbar {
          background-color: #ffffff;
          border-bottom: 1px solid #e9ecef;
          padding: 0;
          margin-bottom: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .navbar .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 15px;
        }
        
        .navbar-brand {
          margin: 0;
        }
        
        .brand-link {
          text-decoration: none;
          color: #007bff;
        }
        
        .brand-link h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .navbar-nav {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          align-items: center;
        }
        
        .nav-item {
          margin: 0;
        }
        
        .nav-link {
          display: block;
          padding: 20px 15px;
          text-decoration: none;
          color: #495057;
          transition: all 0.2s;
          border-bottom: 3px solid transparent;
          font-weight: 500;
        }
        
        .nav-link:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }
        
        .nav-link.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }
        
        .nav-debug {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #6c757d;
          font-family: monospace;
        }
        
        .status-indicator {
          font-size: 14px;
        }
        
        .current-route {
          background: #f8f9fa;
          padding: 2px 6px;
          border-radius: 3px;
        }
        
        @media (max-width: 768px) {
          .navbar .container {
            flex-direction: column;
            padding: 15px;
          }
          
          .navbar-nav {
            margin-top: 15px;
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .nav-link {
            padding: 10px 15px;
          }
          
          .nav-debug {
            margin-top: 10px;
          }
        }
      `}</style> */}
    </nav>
  );
}

export default Navigation;