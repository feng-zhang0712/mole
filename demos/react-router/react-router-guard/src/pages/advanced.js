import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

/**
 * 高级路由守卫演示页面
 * 展示各种高级权限控制功能
 */
const AdvancedDemo = () => {
  const { user, permissions, roles } = useAuth();
  const [activeDemo, setActiveDemo] = useState('time');

  const demos = [
    {
      id: 'time',
      title: '时间限制',
      description: '基于时间的访问控制',
    },
    {
      id: 'ip',
      title: 'IP限制',
      description: '基于IP地址的访问控制',
    },
    {
      id: 'device',
      title: '设备限制',
      description: '基于设备类型的访问控制',
    },
    {
      id: 'group',
      title: '用户组限制',
      description: '基于用户组的访问控制',
    },
    {
      id: 'combined',
      title: '组合限制',
      description: '多种限制条件的组合',
    }
  ];

  const renderTimeDemo = () => (
    <div className="demo-section">
      <h3>时间限制演示</h3>
      <p>此区域演示基于时间的访问控制功能</p>
      
      <div className="time-info">
        <div className="time-item">
          <span className="label">当前时间:</span>
          <span className="value">{new Date().toLocaleString('zh-CN')}</span>
        </div>
        <div className="time-item">
          <span className="label">当前星期:</span>
          <span className="value">{new Date().toLocaleDateString('zh-CN', { weekday: 'long' })}</span>
        </div>
        <div className="time-item">
          <span className="label">当前小时:</span>
          <span className="value">{new Date().getHours()}:00</span>
        </div>
      </div>

      <div className="restriction-examples">
        <h4>限制规则示例:</h4>
        <ul>
          <li>仅工作日可访问 (周一至周五)</li>
          <li>仅工作时间可访问 (9:00 - 18:00)</li>
          <li>特定时间段限制</li>
        </ul>
      </div>
    </div>
  );

  const renderIpDemo = () => (
    <div className="demo-section">
      <h3>IP限制演示</h3>
      <p>此区域演示基于IP地址的访问控制功能</p>
      
      <div className="ip-info">
        <div className="ip-item">
          <span className="label">当前IP:</span>
          <span className="value">正在获取...</span>
        </div>
        <div className="ip-item">
          <span className="label">IP类型:</span>
          <span className="value">公网IP</span>
        </div>
      </div>

      <div className="restriction-examples">
        <h4>限制规则示例:</h4>
        <ul>
          <li>仅允许特定IP地址访问</li>
          <li>阻止特定IP地址访问</li>
          <li>基于IP段的范围限制</li>
        </ul>
      </div>
    </div>
  );

  const renderDeviceDemo = () => (
    <div className="demo-section">
      <h3>设备限制演示</h3>
      <p>此区域演示基于设备类型的访问控制功能</p>
      
      <div className="device-info">
        <div className="device-item">
          <span className="label">设备类型:</span>
          <span className="value">
            {/Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? '移动设备' : '桌面设备'}
          </span>
        </div>
        <div className="device-item">
          <span className="label">用户代理:</span>
          <span className="value">{navigator.userAgent.substring(0, 50)}...</span>
        </div>
        <div className="device-item">
          <span className="label">屏幕尺寸:</span>
          <span className="value">{window.screen.width} x {window.screen.height}</span>
        </div>
      </div>

      <div className="restriction-examples">
        <h4>限制规则示例:</h4>
        <ul>
          <li>仅移动设备可访问</li>
          <li>仅桌面设备可访问</li>
          <li>基于屏幕尺寸的限制</li>
        </ul>
      </div>
    </div>
  );

  const renderGroupDemo = () => (
    <div className="demo-section">
      <h3>用户组限制演示</h3>
      <p>此区域演示基于用户组的访问控制功能</p>
      
      <div className="group-info">
        <div className="group-item">
          <span className="label">当前用户:</span>
          <span className="value">{user?.username}</span>
        </div>
        <div className="group-item">
          <span className="label">用户角色:</span>
          <span className="value">{roles.join(', ')}</span>
        </div>
        <div className="group-item">
          <span className="label">用户权限:</span>
          <span className="value">{permissions.join(', ')}</span>
        </div>
      </div>

      <div className="restriction-examples">
        <h4>限制规则示例:</h4>
        <ul>
          <li>仅特定用户组可访问</li>
          <li>基于部门的访问控制</li>
          <li>基于项目组的权限管理</li>
        </ul>
      </div>
    </div>
  );

  const renderCombinedDemo = () => (
    <div className="demo-section">
      <h3>组合限制演示</h3>
      <p>此区域演示多种限制条件的组合使用</p>
      
      <div className="combined-info">
        <div className="combined-item">
          <span className="label">综合检查:</span>
          <span className="value">时间 + IP + 设备 + 用户组</span>
        </div>
        <div className="combined-item">
          <span className="label">检查顺序:</span>
          <span className="value">认证 → 权限 → 角色 → 用户组 → 时间 → IP → 设备</span>
        </div>
      </div>

      <div className="restriction-examples">
        <h4>组合规则示例:</h4>
        <ul>
          <li>工作日 + 工作时间 + 特定IP段</li>
          <li>管理员角色 + 移动设备 + 工作时间</li>
          <li>特定用户组 + 桌面设备 + 内网IP</li>
        </ul>
      </div>
    </div>
  );

  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'time':
        return renderTimeDemo();
      case 'ip':
        return renderIpDemo();
      case 'device':
        return renderDeviceDemo();
      case 'group':
        return renderGroupDemo();
      case 'combined':
        return renderCombinedDemo();
      default:
        return renderTimeDemo();
    }
  };

  return (
    <div className="advanced-demo">
      {/* 权限验证提示 */}
      <div className="permission-notice">
        <div className="notice-content">
          <h3>高级权限控制</h3>
          <p>此页面展示了多种高级路由守卫功能，包括时间、IP、设备、用户组等限制。</p>
        </div>
      </div>

      <div className="demo-content">
        {/* 演示选择器 */}
        <div className="demo-selector">
          {demos.map(demo => (
            <button
              key={demo.id}
              className={`demo-tab ${activeDemo === demo.id ? 'active' : ''}`}
              onClick={() => setActiveDemo(demo.id)}
            >
              <div className="demo-info">
                <span className="demo-title">{demo.title}</span>
                <span className="demo-description">{demo.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* 演示内容区域 */}
        <div className="demo-content-area">
          {renderDemoContent()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedDemo;
