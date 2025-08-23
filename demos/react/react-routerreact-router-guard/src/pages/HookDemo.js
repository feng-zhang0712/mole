import React, { useState, useEffect } from 'react';
import { useRouteGuard } from '../components/guards/RouteGuard.js';
import { useAuth } from '../contexts/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import './HookDemo.css';

const HookDemo = () => {
  const { user, permissions, roles } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  
  const { canAccess, loading, isAuthenticated, redirectPath } = useRouteGuard(['read'], []);
  
  useEffect(() => {
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    }
  }, [redirectPath, navigate]);

  if (loading) {
    return (
      <div className="hook-demo loading">
        <div className="loading-spinner"></div>
        <p>正在检查权限...</p>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="hook-demo unauthorized">
        <div className="unauthorized-content">
          <h2>🚫 访问被拒绝</h2>
          <p>您没有权限访问此页面</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'analytics', label: '数据分析', icon: '📈' },
    { id: 'reports', label: '报表生成', icon: '📋' },
    { id: 'export', label: '数据导出', icon: '📤' }
  ];

  const renderOverview = () => (
    <div className="section-content">
      <h3>数据概览</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h4>总用户数</h4>
            <p className="stat-value">1,234</p>
            <p className="stat-change positive">+12%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-info">
            <h4>活跃用户</h4>
            <p className="stat-value">892</p>
            <p className="stat-change positive">+8%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h4>总收入</h4>
            <p className="stat-value">$45,678</p>
            <p className="stat-change positive">+15%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h4>转化率</h4>
            <p className="stat-value">23.4%</p>
            <p className="stat-change negative">-2%</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="hook-demo">
      <div className="demo-header">
        <h2>🎣 Hook 路由守卫演示</h2>
        <p>使用 useRouteGuard Hook 实现权限控制，提供更灵活的权限管理方式</p>
      </div>

      <div className="demo-content">
        <div className="sidebar">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <h4>{user?.name || 'Unknown User'}</h4>
              <p>{user?.email || 'No email'}</p>
              <div className="user-roles">
                {roles.map(role => (
                  <span key={role} className="role-tag">{role}</span>
                ))}
              </div>
            </div>
          </div>
          
          <nav className="section-nav">
            {sections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="main-content">
          {renderSectionContent()}
        </div>
      </div>

      <div className="demo-footer">
        <div className="guard-info">
          <h4>🔒 当前使用的守卫方式</h4>
          <p><strong>Hook 路由守卫</strong> - 通过 useRouteGuard Hook 实现权限控制</p>
          <p>优点：逻辑清晰，易于测试，支持复杂的权限判断逻辑</p>
          <div className="guard-status">
            <span className="status-item">
              <span className="status-label">认证状态:</span>
              <span className={`status-value ${isAuthenticated ? 'success' : 'error'}`}>
                {isAuthenticated ? '已认证' : '未认证'}
              </span>
            </span>
            <span className="status-item">
              <span className="status-label">访问权限:</span>
              <span className={`status-value ${canAccess ? 'success' : 'error'}`}>
                {canAccess ? '有权限' : '无权限'}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HookDemo;
