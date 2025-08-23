import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * 404页面组件
 * 当用户访问不存在的路由时显示
 */
const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-container">
        <div className="error-icon">🔍</div>
        <h1>页面未找到</h1>
        <p className="error-message">
          抱歉，您访问的页面不存在或已被移动
        </p>

        {/* 常见页面链接 */}
        <div className="common-pages">
          <h3>您可能想要访问的页面</h3>
          <div className="page-links">
            <Link to="/dashboard" className="page-link">
              <span className="link-icon">📊</span>
              <div className="link-content">
                <h4>仪表板</h4>
                <p>查看您的数据概览</p>
              </div>
            </Link>
            <Link to="/profile" className="page-link">
              <span className="link-icon">👤</span>
              <div className="link-content">
                <h4>个人资料</h4>
                <p>管理您的账户信息</p>
              </div>
            </Link>
            <Link to="/admin" className="page-link">
              <span className="link-icon">⚙️</span>
              <div className="link-content">
                <h4>管理面板</h4>
                <p>系统管理功能</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 导航选项 */}
        <div className="navigation-options">
          <div className="nav-buttons">
            <Link to="/" className="nav-btn primary">
              🏠 返回首页
            </Link>
            <button onClick={() => window.history.back()} className="nav-btn secondary">
              ⬅️ 返回上页
            </button>
          </div>
        </div>

        {/* 帮助信息 */}
        <div className="help-section">
          <h3>需要帮助？</h3>
          <div className="help-options">
            <div className="help-item">
              <span className="help-icon">📚</span>
              <span>查看用户手册</span>
            </div>
            <div className="help-item">
              <span className="help-icon">📧</span>
              <span>联系技术支持</span>
            </div>
            <div className="help-item">
              <span className="help-icon">💬</span>
              <span>在线客服</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
