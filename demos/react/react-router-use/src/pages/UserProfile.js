import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function UserProfile() {
  const location = useLocation();
  
  return (
    <div className="page user-profile-page">
      <h1>用户中心</h1>
      <p>这是一个展示更深层路由嵌套的页面</p>
      
      {/* 用户信息侧边栏 */}
      <div className="user-layout">
        <aside className="user-sidebar">
          <div className="user-info">
            <h3>用户信息</h3>
            <p><strong>用户名:</strong> DemoUser</p>
            <p><strong>邮箱:</strong> demo@example.com</p>
            <p><strong>注册时间:</strong> 2024-01-01</p>
          </div>
          
          {/* 用户中心子导航 */}
          <nav className="user-nav">
            <h4>功能菜单</h4>
            <ul>
              <li className={location.pathname === '/user' ? 'active' : ''}>
                <Link to="/user">个人资料</Link>
              </li>
              <li className={location.pathname === '/user/settings' ? 'active' : ''}>
                <Link to="/user/settings">设置</Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* 主要内容区域 */}
        <main className="user-content">
          {/* 
            路由嵌套说明：
            1. 当前页面路径：/user
            2. 子路由路径：/user/settings
            3. Outlet 会渲染对应的子路由内容
            4. 当访问 /user 时，显示默认内容
            5. 当访问 /user/settings 时，显示 UserSettings 组件
          */}
          <Outlet />
          
          {/* 默认内容 - 当没有子路由匹配时显示 */}
          {location.pathname === '/user' && (
            <div className="default-content">
              <h2>个人资料</h2>
              <p>欢迎来到用户中心！</p>
              <p>点击左侧菜单或使用以下链接查看不同功能：</p>
              
              <div className="quick-links">
                <Link to="/user/settings" className="quick-link-btn">
                  进入设置页面
                </Link>
                <Link to="/products" className="quick-link-btn">
                  浏览产品
                </Link>
                <Link to="/home" className="quick-link-btn">
                  返回首页
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default UserProfile;
