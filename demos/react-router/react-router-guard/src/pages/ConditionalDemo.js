import React, { useState } from 'react';
import { ConditionalGuard } from '../components/guards/RouteGuard.js';
import { useAuth } from '../contexts/AuthContext.js';
import './ConditionalDemo.css';

const ConditionalDemo = () => {
  const { user, permissions, roles } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [customCondition, setCustomCondition] = useState(true);

  const tabs = [
    { id: 'basic', label: '基础条件', icon: '🔧' },
    { id: 'advanced', label: '高级条件', icon: '⚡' },
    { id: 'custom', label: '自定义条件', icon: '🎨' },
    { id: 'combined', label: '组合条件', icon: '🔗' }
  ];

  const renderBasicConditions = () => (
    <div className="tab-content">
      <h3>基础条件演示</h3>
      <p>展示最基本的条件渲染守卫用法</p>
      
      <div className="condition-examples">
        <div className="condition-item">
          <h4>1. 用户登录状态检查</h4>
          <ConditionalGuard condition={!!user}>
            <div className="success-content">
              <span className="status-icon">✅</span>
              <p>用户已登录，显示受保护内容</p>
              <div className="user-info">
                <strong>用户名:</strong> {user?.name}
              </div>
            </div>
          </ConditionalGuard>
          <ConditionalGuard condition={!user}>
            <div className="fallback-content">
              <span className="status-icon">❌</span>
              <p>用户未登录，显示提示信息</p>
            </div>
          </ConditionalGuard>
        </div>

        <div className="condition-item">
          <h4>2. 权限检查</h4>
          <ConditionalGuard condition={permissions.includes('read')}>
            <div className="success-content">
              <span className="status-icon">✅</span>
              <p>用户具有读取权限，显示内容</p>
            </div>
          </ConditionalGuard>
          <ConditionalGuard condition={!permissions.includes('read')}>
            <div className="fallback-content">
              <span className="status-icon">❌</span>
              <p>用户缺少读取权限</p>
            </div>
          </ConditionalGuard>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicConditions();
      default:
        return renderBasicConditions();
    }
  };

  return (
    <div className="conditional-demo">
      <div className="demo-header">
        <h2>🎯 条件渲染路由守卫演示</h2>
        <p>使用 ConditionalGuard 实现简单的条件权限控制，适合简单的显示/隐藏逻辑</p>
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
          <p><strong>条件渲染路由守卫</strong> - 通过 ConditionalGuard 实现简单的条件权限控制</p>
          <p>优点：使用简单，逻辑清晰，适合简单的显示/隐藏场景</p>
        </div>
      </div>
    </div>
  );
};

export default ConditionalDemo;
