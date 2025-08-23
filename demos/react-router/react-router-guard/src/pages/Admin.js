import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import './Admin.css';

/**
 * 管理面板页面组件
 * 需要admin角色才能访问
 */
const Admin = () => {
  const { user, roles, permissions } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [mockData] = useState({
    users: [
      { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active' },
      { id: 2, username: 'user', email: 'user@example.com', role: 'user', status: 'active' },
      { id: 3, username: 'guest', email: 'guest@example.com', role: 'guest', status: 'inactive' }
    ],
    permissions: [
      { id: 1, name: 'read', description: '查看权限', users: 3 },
      { id: 2, name: 'write', description: '编辑权限', users: 2 },
      { id: 3, name: 'delete', description: '删除权限', users: 1 },
      { id: 4, name: 'admin', description: '管理权限', users: 1 }
    ],
    logs: [
      { id: 1, action: '用户登录', user: 'admin', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.100' },
      { id: 2, action: '权限修改', user: 'admin', timestamp: '2024-01-15 09:15:00', ip: '192.168.1.100' },
      { id: 3, action: '用户创建', user: 'admin', timestamp: '2024-01-14 16:45:00', ip: '192.168.1.100' }
    ]
  });

  const tabs = [
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'permissions', label: '权限管理', icon: '🔐' },
    { id: 'logs', label: '系统日志', icon: '📋' },
    { id: 'settings', label: '系统设置', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h3>用户管理</h3>
              <button className="add-btn">添加用户</button>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>用户名</th>
                    <th>邮箱</th>
                    <th>角色</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status === 'active' ? '活跃' : '非活跃'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="action-btn edit">编辑</button>
                          <button className="action-btn delete">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'permissions':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h3>权限管理</h3>
              <button className="add-btn">添加权限</button>
            </div>
            <div className="permissions-grid">
              {mockData.permissions.map(permission => (
                <div key={permission.id} className="permission-card">
                  <div className="permission-header">
                    <h4>{permission.name}</h4>
                    <span className="user-count">{permission.users} 用户</span>
                  </div>
                  <p className="permission-description">{permission.description}</p>
                  <div className="permission-actions">
                    <button className="action-btn edit">编辑</button>
                    <button className="action-btn delete">删除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'logs':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h3>系统日志</h3>
              <button className="export-btn">导出日志</button>
            </div>
            <div className="logs-container">
              {mockData.logs.map(log => (
                <div key={log.id} className="log-item">
                  <div className="log-header">
                    <span className="log-action">{log.action}</span>
                    <span className="log-timestamp">{log.timestamp}</span>
                  </div>
                  <div className="log-details">
                    <span className="log-user">用户: {log.user}</span>
                    <span className="log-ip">IP: {log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="tab-content">
            <div className="content-header">
              <h3>系统设置</h3>
            </div>
            <div className="settings-form">
              <div className="setting-group">
                <label>系统名称</label>
                <input type="text" defaultValue="React Router Guard Demo" />
              </div>
              <div className="setting-group">
                <label>最大用户数</label>
                <input type="number" defaultValue="1000" />
              </div>
              <div className="setting-group">
                <label>日志保留天数</label>
                <input type="number" defaultValue="30" />
              </div>
              <div className="setting-group">
                <label>启用调试模式</label>
                <input type="checkbox" defaultChecked />
              </div>
              <button className="save-btn">保存设置</button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>⚙️ 管理面板</h1>
        <p>系统管理和配置中心</p>
      </div>

      {/* 权限验证提示 */}
      <div className="role-notice">
        <div className="notice-icon">👑</div>
        <div className="notice-content">
          <h3>角色要求</h3>
          <p>此页面需要 <strong>admin</strong> 角色才能访问。</p>
          <div className="role-status">
            <span className={`status ${roles.includes('admin') ? 'granted' : 'denied'}`}>
              admin角色: {roles.includes('admin') ? '✅ 已授权' : '❌ 未授权'}
            </span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* 标签页导航 */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 标签页内容 */}
        {renderTabContent()}
      </div>

      {/* 路由守卫说明 */}
      <div className="guard-explanation">
        <div className="explanation-card">
          <h3>🛡️ 基于角色的路由守卫</h3>
          <p>此页面使用了基于角色的路由守卫：</p>
          <div className="code-example">
            <pre><code>{`<RouteGuard requiredRoles={['admin']}>
  <Admin />
</RouteGuard>`}</code></pre>
          </div>
          <p>只有拥有 <strong>admin</strong> 角色的用户才能访问此页面。</p>
          <div className="guard-features">
            <h4>守卫特性：</h4>
            <ul>
              <li>✅ 角色验证</li>
              <li>✅ 自动重定向</li>
              <li>✅ 权限状态管理</li>
              <li>✅ 用户体验优化</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
