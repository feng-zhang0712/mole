import React from 'react';
import { useNavigate } from 'react-router-dom';

function UserSettings() {
  const navigate = useNavigate();

  return (
    <div className="page user-settings-page">
      <h2>用户设置</h2>
      <p>这是用户中心的设置页面，展示路由嵌套的效果</p>
      
      {/* 导航选项 */}
      <div className="navigation-options">
        <h3>导航选项：</h3>
        
        <button 
          onClick={() => navigate('/user')} 
          className="nav-btn"
        >
          返回个人资料
        </button>
        
        <button 
          onClick={() => navigate('/products')} 
          className="nav-btn"
        >
          浏览产品
        </button>
        
        <button 
          onClick={() => navigate('/home')} 
          className="nav-btn"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

export default UserSettings;
