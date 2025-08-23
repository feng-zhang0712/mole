import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import './Dashboard.css';

/**
 * 仪表板页面组件
 * 需要read权限才能访问
 */
const Dashboard = () => {
  const { user, permissions, roles } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 仪表板</h1>
        <p>欢迎回来，{user?.username}！这里是您的数据概览。</p>
      </div>

      <div className="dashboard-grid">
        {/* 用户信息卡片 */}
        <div className="dashboard-card user-info">
          <div className="card-header">
            <h3>👤 用户信息</h3>
          </div>
          <div className="card-content">
            <div className="info-item">
              <span className="label">用户名:</span>
              <span className="value">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="label">邮箱:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="label">角色:</span>
              <span className="value">
                {roles.map(role => (
                  <span key={role} className="role-badge">{role}</span>
                ))}
              </span>
            </div>
            <div className="info-item">
              <span className="label">权限:</span>
              <span className="value">
                {permissions.map(permission => (
                  <span key={permission} className="permission-badge">{permission}</span>
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* 权限说明卡片 */}
        <div className="dashboard-card permissions-info">
          <div className="card-header">
            <h3>🔐 权限说明</h3>
          </div>
          <div className="card-content">
            <p>当前页面需要 <strong>read</strong> 权限才能访问。</p>
            <div className="permission-details">
              <h4>权限级别说明:</h4>
              <ul>
                <li><span className="permission read">read</span> - 查看权限</li>
                <li><span className="permission write">write</span> - 编辑权限</li>
                <li><span className="permission delete">delete</span> - 删除权限</li>
                <li><span className="permission admin">admin</span> - 管理权限</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 路由守卫说明卡片 */}
        <div className="dashboard-card guard-info">
          <div className="card-header">
            <h3>🛡️ 路由守卫说明</h3>
          </div>
          <div className="card-content">
            <p>本页面使用了 <strong>RouteGuard</strong> 组件进行权限控制：</p>
            <div className="code-example">
              <pre><code>{`<RouteGuard requiredPermissions={['read']}>
  <Dashboard />
</RouteGuard>`}</code></pre>
            </div>
            <p>只有拥有 <strong>read</strong> 权限的用户才能访问此页面。</p>
          </div>
        </div>

        {/* 快速导航卡片 */}
        <div className="dashboard-card quick-nav">
          <div className="card-header">
            <h3>🚀 快速导航</h3>
          </div>
          <div className="card-content">
            <div className="nav-buttons">
              <button 
                className="nav-btn profile"
                onClick={() => window.location.href = '/profile'}
                disabled={!permissions.includes('write')}
              >
                👤 个人资料
                {!permissions.includes('write') && <span className="disabled-tip">需要write权限</span>}
              </button>
              <button 
                className="nav-btn admin"
                onClick={() => window.location.href = '/admin'}
                disabled={!roles.includes('admin')}
              >
                ⚙️ 管理面板
                {!roles.includes('admin') && <span className="disabled-tip">需要admin角色</span>}
              </button>
              <button 
                className="nav-btn settings"
                onClick={() => window.location.href = '/settings'}
                disabled={!permissions.includes('admin')}
              >
                🔧 系统设置
                {!permissions.includes('admin') && <span className="disabled-tip">需要admin权限</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="stats-section">
        <h2>📈 数据统计</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{permissions.length}</div>
            <div className="stat-label">总权限数</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{roles.length}</div>
            <div className="stat-label">总角色数</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{permissions.includes('admin') ? '是' : '否'}</div>
            <div className="stat-label">是否管理员</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{permissions.includes('write') ? '是' : '否'}</div>
            <div className="stat-label">可编辑</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
