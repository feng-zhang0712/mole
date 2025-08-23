import React, { useState } from 'react';
import { withAuth } from '../components/guards/RouteGuard.js';
import { useAuth } from '../contexts/AuthContext.js';
import './HocDemo.css';

/**
 * 高阶组件(HOC)路由守卫演示页面
 * 展示如何使用 withAuth HOC 实现权限控制
 */
const HocDemoComponent = () => {
  const { user, permissions, roles } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: '用户信息', icon: '👤' },
    { id: 'permissions', label: '权限详情', icon: '🔐' },
    { id: 'roles', label: '角色管理', icon: '👑' },
    { id: 'settings', label: '高级设置', icon: '⚙️' }
  ];

  const renderUserInfo = () => (
    <div className="tab-content">
      <h3>用户信息</h3>
      <div className="user-card">
        <div className="avatar">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="user-details">
          <h4>{user?.name || 'Unknown User'}</h4>
          <p className="email">{user?.email || 'No email'}</p>
          <p className="status">
            <span className={`status-dot ${user ? 'active' : 'inactive'}`}></span>
            {user ? '已登录' : '未登录'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="tab-content">
      <h3>权限详情</h3>
      <div className="permissions-grid">
        {permissions.map(permission => (
          <div key={permission} className="permission-item">
            <span className="permission-icon">🔐</span>
            <span className="permission-name">{permission}</span>
            <span className="permission-status active">已授权</span>
          </div>
        ))}
        {permissions.length === 0 && (
          <div className="no-permissions">
            <p>暂无权限</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="tab-content">
      <h3>角色管理</h3>
      <div className="roles-list">
        {roles.map(role => (
          <div key={role} className="role-item">
            <span className="role-icon">👑</span>
            <span className="role-name">{role}</span>
            <span className="role-badge">{role}</span>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="no-roles">
            <p>暂无角色</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="tab-content">
      <h3>高级设置</h3>
      <div className="settings-form">
        <div className="form-group">
          <label>通知设置</label>
          <select defaultValue="all">
            <option value="all">所有通知</option>
            <option value="important">仅重要通知</option>
            <option value="none">关闭通知</option>
          </select>
        </div>
        <div className="form-group">
          <label>主题设置</label>
          <select defaultValue="light">
            <option value="light">浅色主题</option>
            <option value="dark">深色主题</option>
            <option value="auto">跟随系统</option>
          </select>
        </div>
        <div className="form-group">
          <label>语言设置</label>
          <select defaultValue="zh">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return renderUserInfo();
      case 'permissions':
        return renderPermissions();
      case 'roles':
        return renderRoles();
      case 'settings':
        return renderSettings();
      default:
        return renderUserInfo();
    }
  };

  return (
    <div className="hoc-demo">
      <div className="demo-header">
        <h2>🔧 HOC 路由守卫演示</h2>
        <p>使用高阶组件(withAuth)实现权限控制，组件被包装后自动进行权限验证</p>
      </div>

      <div className="demo-content">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-panel">
          {renderTabContent()}
        </div>
      </div>

      <div className="demo-footer">
        <div className="guard-info">
          <h4>🔒 当前使用的守卫方式</h4>
          <p><strong>高阶组件(HOC)</strong> - 通过 withAuth 包装组件实现权限控制</p>
          <p>优点：代码复用性高，使用简单，适合批量应用权限控制</p>
        </div>
      </div>
    </div>
  );
};

// 使用 withAuth HOC 包装组件，需要 read 权限
export default withAuth(HocDemoComponent, {
  requiredPermissions: ['read'],
  fallback: <div className="fallback">权限不足，无法访问此页面</div>
});
