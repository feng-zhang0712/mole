import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import './Profile.css';

/**
 * 个人资料页面组件
 * 需要read和write权限才能访问
 */
const Profile = () => {
  const { user, permissions } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: '这是一个示例用户简介，展示用户的基本信息。'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // 模拟保存操作
    console.log('保存用户资料:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: '这是一个示例用户简介，展示用户的基本信息。'
    });
    setIsEditing(false);
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>👤 个人资料</h1>
        <p>管理您的个人信息和账户设置</p>
      </div>

      <div className="profile-content">
        {/* 权限说明 */}
        <div className="permission-notice">
          <div className="notice-icon">🛡️</div>
          <div className="notice-content">
            <h3>权限要求</h3>
            <p>此页面需要 <strong>read</strong> 和 <strong>write</strong> 权限才能访问。</p>
            <div className="permission-status">
              <span className={`status ${permissions.includes('read') ? 'granted' : 'denied'}`}>
                read: {permissions.includes('read') ? '✅ 已授权' : '❌ 未授权'}
              </span>
              <span className={`status ${permissions.includes('write') ? 'granted' : 'denied'}`}>
                write: {permissions.includes('write') ? '✅ 已授权' : '❌ 未授权'}
              </span>
            </div>
          </div>
        </div>

        {/* 用户信息卡片 */}
        <div className="profile-card">
          <div className="card-header">
            <h3>基本信息</h3>
            {permissions.includes('write') && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="edit-btn"
              >
                {isEditing ? '取消编辑' : '编辑资料'}
              </button>
            )}
          </div>
          
          <div className="card-content">
            <div className="profile-avatar">
              <div className="avatar">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="avatar-info">
                <h4>{user?.username}</h4>
                <p>用户ID: {user?.id}</p>
              </div>
            </div>

            <div className="profile-fields">
              <div className="field-group">
                <label>用户名</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!permissions.includes('write')}
                  />
                ) : (
                  <span className="field-value">{formData.username}</span>
                )}
              </div>

              <div className="field-group">
                <label>邮箱地址</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!permissions.includes('write')}
                  />
                ) : (
                  <span className="field-value">{formData.email}</span>
                )}
              </div>

              <div className="field-group">
                <label>个人简介</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!permissions.includes('write')}
                    rows="4"
                  />
                ) : (
                  <span className="field-value">{formData.bio}</span>
                )}
              </div>
            </div>

            {/* 编辑操作按钮 */}
            {isEditing && permissions.includes('write') && (
              <div className="edit-actions">
                <button onClick={handleSave} className="save-btn">
                  保存更改
                </button>
                <button onClick={handleCancel} className="cancel-btn">
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 权限信息卡片 */}
        <div className="profile-card">
          <div className="card-header">
            <h3>权限信息</h3>
          </div>
          <div className="card-content">
            <div className="permissions-grid">
              <div className="permission-item">
                <span className="permission-label">角色</span>
                <div className="permission-values">
                  {user?.roles?.map(role => (
                    <span key={role} className="role-tag">{role}</span>
                  ))}
                </div>
              </div>
              <div className="permission-item">
                <span className="permission-label">权限</span>
                <div className="permission-values">
                  {permissions.map(permission => (
                    <span key={permission} className="permission-tag">{permission}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 路由守卫说明 */}
        <div className="profile-card">
          <div className="card-header">
            <h3>🛡️ 路由守卫实现</h3>
          </div>
          <div className="card-content">
            <p>此页面使用了以下路由守卫配置：</p>
            <div className="code-example">
              <pre><code>{`<RouteGuard requiredPermissions={['read', 'write']}>
  <Profile />
</RouteGuard>`}</code></pre>
            </div>
            <p>只有同时拥有 <strong>read</strong> 和 <strong>write</strong> 权限的用户才能访问此页面。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
