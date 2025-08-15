import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import './Settings.css';

/**
 * 系统设置页面组件
 * 需要admin权限才能访问
 */
const Settings = () => {
  const { permissions } = useAuth();
  const [settings, setSettings] = useState({
    systemName: 'React Router Guard Demo',
    maxUsers: 1000,
    logRetentionDays: 30,
    debugMode: true,
    maintenanceMode: false,
    emailNotifications: true,
    securityLevel: 'high'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [originalSettings] = useState({ ...settings });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // 模拟保存操作
    console.log('保存系统设置:', settings);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSettings(originalSettings);
    setIsEditing(false);
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>🔧 系统设置</h1>
        <p>配置系统参数和功能选项</p>
      </div>

      {/* 权限验证提示 */}
      <div className="permission-notice">
        <div className="notice-icon">🔐</div>
        <div className="notice-content">
          <h3>权限要求</h3>
          <p>此页面需要 <strong>admin</strong> 权限才能访问。</p>
          <div className="permission-status">
            <span className={`status ${permissions.includes('admin') ? 'granted' : 'denied'}`}>
              admin权限: {permissions.includes('admin') ? '✅ 已授权' : '❌ 未授权'}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* 设置操作栏 */}
        <div className="settings-actions">
          {permissions.includes('admin') && (
            <>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  编辑设置
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleSave} className="save-btn">
                    保存更改
                  </button>
                  <button onClick={handleCancel} className="cancel-btn">
                    取消
                  </button>
                </div>
              )}
              <button onClick={handleReset} className="reset-btn">
                重置设置
              </button>
            </>
          )}
        </div>

        {/* 设置分类 */}
        <div className="settings-sections">
          {/* 基本设置 */}
          <div className="settings-section">
            <h3>📋 基本设置</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>系统名称</label>
                {isEditing && permissions.includes('admin') ? (
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => handleSettingChange('systemName', e.target.value)}
                  />
                ) : (
                  <span className="setting-value">{settings.systemName}</span>
                )}
              </div>
              
              <div className="setting-item">
                <label>最大用户数</label>
                {isEditing && permissions.includes('admin') ? (
                  <input
                    type="number"
                    value={settings.maxUsers}
                    onChange={(e) => handleSettingChange('maxUsers', parseInt(e.target.value))}
                    min="1"
                    max="10000"
                  />
                ) : (
                  <span className="setting-value">{settings.maxUsers}</span>
                )}
              </div>
              
              <div className="setting-item">
                <label>日志保留天数</label>
                {isEditing && permissions.includes('admin') ? (
                  <input
                    type="number"
                    value={settings.logRetentionDays}
                    onChange={(e) => handleSettingChange('logRetentionDays', parseInt(e.target.value))}
                    min="1"
                    max="365"
                  />
                ) : (
                  <span className="setting-value">{settings.logRetentionDays} 天</span>
                )}
              </div>
            </div>
          </div>

          {/* 功能设置 */}
          <div className="settings-section">
            <h3>⚙️ 功能设置</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>调试模式</label>
                {isEditing && permissions.includes('admin') ? (
                  <input
                    type="checkbox"
                    checked={settings.debugMode}
                    onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                  />
                ) : (
                  <span className={`setting-value ${settings.debugMode ? 'enabled' : 'disabled'}`}>
                    {settings.debugMode ? '启用' : '禁用'}
                  </span>
                )}
              </div>
              
              <div className="setting-item">
                <label>维护模式</label>
                {isEditing && permissions.includes('admin') ? (
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                ) : (
                  <span className={`setting-value ${settings.maintenanceMode ? 'enabled' : 'disabled'}`}>
                    {settings.maintenanceMode ? '启用' : '禁用'}
                  </span>
                )}
              </div>
              
              <div className="setting-item">
                <label>邮件通知</label>
                {isEditing && permissions.includes('admin') ? (
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                ) : (
                  <span className={`setting-value ${settings.emailNotifications ? 'enabled' : 'disabled'}`}>
                    {settings.emailNotifications ? '启用' : '禁用'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div className="settings-section">
            <h3>🔒 安全设置</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>安全级别</label>
                {isEditing && permissions.includes('admin') ? (
                  <select
                    value={settings.securityLevel}
                    onChange={(e) => handleSettingChange('securityLevel', e.target.value)}
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="extreme">极高</option>
                  </select>
                ) : (
                  <span className={`setting-value security-${settings.securityLevel}`}>
                    {settings.securityLevel === 'low' && '低'}
                    {settings.securityLevel === 'medium' && '中'}
                    {settings.securityLevel === 'high' && '高'}
                    {settings.securityLevel === 'extreme' && '极高'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 设置预览 */}
        <div className="settings-preview">
          <h3>📊 设置预览</h3>
          <div className="preview-grid">
            <div className="preview-item">
              <span className="preview-label">系统名称</span>
              <span className="preview-value">{settings.systemName}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">最大用户数</span>
              <span className="preview-value">{settings.maxUsers}</span>
            </div>
            <div className="preview-item">
              <span className="preview-label">调试模式</span>
              <span className={`preview-value ${settings.debugMode ? 'enabled' : 'disabled'}`}>
                {settings.debugMode ? '启用' : '禁用'}
              </span>
            </div>
            <div className="preview-item">
              <span className="preview-label">安全级别</span>
              <span className={`preview-value security-${settings.securityLevel}`}>
                {settings.securityLevel}
              </span>
            </div>
          </div>
        </div>

        {/* 路由守卫说明 */}
        <div className="guard-explanation">
          <div className="explanation-card">
            <h3>🛡️ 基于权限的路由守卫</h3>
            <p>此页面使用了基于权限的路由守卫：</p>
            <div className="code-example">
              <pre><code>{`<RouteGuard requiredPermissions={['admin']}>
  <Settings />
</RouteGuard>`}</code></pre>
            </div>
            <p>只有拥有 <strong>admin</strong> 权限的用户才能访问此页面。</p>
            <div className="guard-features">
              <h4>守卫特性：</h4>
              <ul>
                <li>✅ 权限验证</li>
                <li>✅ 自动重定向</li>
                <li>✅ 权限状态管理</li>
                <li>✅ 用户体验优化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
