import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import './Unauthorized.css';

/**
 * 未授权页面组件
 * 当用户没有权限访问某个页面时显示
 */
const Unauthorized = () => {
  const { user, permissions, roles } = useAuth();
  const location = useLocation();

  return (
    <div className="unauthorized">
      <div className="unauthorized-container">
        <div className="error-icon">🚫</div>
        <h1>访问被拒绝</h1>
        <p className="error-message">
          抱歉，您没有权限访问 <strong>{location.pathname}</strong> 页面
        </p>

        {/* 权限状态信息 */}
        <div className="permission-status">
          <h3>当前用户权限状态</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">用户名:</span>
              <span className="status-value">{user?.username || '未登录'}</span>
            </div>
            <div className="status-item">
              <span className="status-label">角色:</span>
              <div className="status-values">
                {roles.length > 0 ? (
                  roles.map(role => (
                    <span key={role} className="role-badge">{role}</span>
                  ))
                ) : (
                  <span className="no-permission">无角色</span>
                )}
              </div>
            </div>
            <div className="status-item">
              <span className="status-label">权限:</span>
              <div className="status-values">
                {permissions.length > 0 ? (
                  permissions.map(permission => (
                    <span key={permission} className="permission-badge">{permission}</span>
                  ))
                ) : (
                  <span className="no-permission">无权限</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 解决方案建议 */}
        <div className="solutions">
          <h3>可能的解决方案</h3>
          <div className="solution-list">
            <div className="solution-item">
              <span className="solution-icon">🔑</span>
              <div className="solution-content">
                <h4>联系管理员</h4>
                <p>如果您认为应该有权访问此页面，请联系系统管理员申请相应权限。</p>
              </div>
            </div>
            <div className="solution-item">
              <span className="solution-icon">🔄</span>
              <div className="solution-content">
                <h4>重新登录</h4>
                <p>尝试重新登录，可能您的权限已经更新。</p>
              </div>
            </div>
            <div className="solution-item">
              <span className="solution-icon">📧</span>
              <div className="solution-content">
                <h4>权限申请</h4>
                <p>通过邮件或系统内申请功能申请所需权限。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 导航选项 */}
        <div className="navigation-options">
          <h3>您可以访问的页面</h3>
          <div className="nav-buttons">
            <Link to="/dashboard" className="nav-btn primary">
              📊 返回仪表板
            </Link>
            <Link to="/profile" className="nav-btn secondary">
              👤 个人资料
            </Link>
            <Link to="/" className="nav-btn outline">
              🏠 返回首页
            </Link>
          </div>
        </div>

        {/* 路由守卫说明 */}
        <div className="guard-explanation">
          <div className="explanation-card">
            <h3>🛡️ 路由守卫工作原理</h3>
            <p>当您尝试访问受保护的页面时，路由守卫会：</p>
            <ol>
              <li>检查您的认证状态</li>
              <li>验证您的角色和权限</li>
              <li>如果权限不足，自动重定向到此页面</li>
              <li>记录访问尝试日志</li>
            </ol>
            <div className="code-example">
              <pre><code>{`// 路由守卫配置示例
<RouteGuard 
  requiredPermissions={['admin']} 
  requiredRoles={['admin']}
>
  <ProtectedPage />
</RouteGuard>`}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
