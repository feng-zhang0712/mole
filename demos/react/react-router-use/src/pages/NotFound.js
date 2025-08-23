import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function NotFound () {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="page not-found-page">
      <div className="error-container">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面 <code>{location.pathname}</code> 不存在</p>
        
        {/* 
          404页面处理说明：
          1. 在 App.js 中使用 path="*" 匹配所有未定义的路由
          2. 这是 React Router 的 catch-all 路由机制
          3. 当用户访问不存在的路径时，会显示此页面
          4. 提供了多种返回方式，提升用户体验
        */}
        
        <div className="error-details">
          <h3>错误详情：</h3>
          <ul>
            <li><strong>请求路径:</strong> {location.pathname}</li>
            <li><strong>当前时间:</strong> {new Date().toLocaleString()}</li>
            <li><strong>错误类型:</strong> 路由未匹配</li>
          </ul>
        </div>
        
        <div className="navigation-options">
          <h3>您可以尝试以下操作：</h3>
          
          {/* 方式1：返回上一页 */}
          <button 
            onClick={() => navigate(-1)} 
            className="nav-btn primary"
          >
            ← 返回上一页
          </button>
          
          {/* 方式2：返回首页 */}
          <Link to="/home" className="nav-btn">
            返回首页
          </Link>
          
          {/* 方式3：浏览产品 */}
          <Link to="/products" className="nav-btn">
            浏览产品
          </Link>
          
          {/* 方式4：用户中心 */}
          <Link to="/user" className="nav-btn">
            用户中心
          </Link>
        </div>
      </div>
    </div>
  );
}
