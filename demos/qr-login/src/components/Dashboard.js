import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      
      if (response.success) {
        setUser(response.data);
      } else {
        setError(response.message || '获取用户信息失败');
      }
    } catch (error) {
      console.error('获取用户信息错误:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // 清除本地存储
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('登出错误:', error);
    } finally {
      onLogout();
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="加载用户信息..." />;
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <h2>错误</h2>
          <p>{error}</p>
          <button onClick={handleLogout} className="dashboard__logout-btn">
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__header">
          <h1 className="dashboard__title">用户控制台</h1>
          <button onClick={handleLogout} className="dashboard__logout-btn">
            登出
          </button>
        </div>

        <div className="dashboard__content">
          <div className="dashboard__sidebar">
            <nav className="dashboard__nav">
              <button
                className={`dashboard__nav-item ${activeTab === 'profile' ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                个人信息
              </button>
              <button
                className={`dashboard__nav-item ${activeTab === 'security' ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                安全设置
              </button>
              <button
                className={`dashboard__nav-item ${activeTab === 'sessions' ? 'dashboard__nav-item--active' : ''}`}
                onClick={() => setActiveTab('sessions')}
              >
                登录记录
              </button>
            </nav>
          </div>

          <div className="dashboard__main">
            {activeTab === 'profile' && (
              <ProfileTab user={user} onUpdate={fetchUserProfile} />
            )}
            {activeTab === 'security' && (
              <SecurityTab />
            )}
            {activeTab === 'sessions' && (
              <SessionsTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 个人信息标签页
const ProfileTab = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await authAPI.updateProfile(formData);
      
      if (response.success) {
        setMessage('个人信息更新成功');
        setIsEditing(false);
        onUpdate();
      } else {
        setMessage(response.message || '更新失败');
      }
    } catch (error) {
      console.error('更新个人信息错误:', error);
      setMessage('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="dashboard__tab">
      <div className="dashboard__tab-header">
        <h2>个人信息</h2>
        <button
          className="dashboard__edit-btn"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '取消' : '编辑'}
        </button>
      </div>

      {isEditing ? (
        <form className="dashboard__form" onSubmit={handleSubmit}>
          <div className="dashboard__field">
            <label htmlFor="username" className="dashboard__label">
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="dashboard__input"
              required
            />
          </div>

          <div className="dashboard__field">
            <label htmlFor="email" className="dashboard__label">
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="dashboard__input"
              required
            />
          </div>

          {message && (
            <div className={`dashboard__message ${message.includes('成功') ? 'dashboard__message--success' : 'dashboard__message--error'}`}>
              {message}
            </div>
          )}

          <div className="dashboard__form-actions">
            <button
              type="submit"
              className="dashboard__submit-btn"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="small" text="" /> : '保存'}
            </button>
            <button
              type="button"
              className="dashboard__cancel-btn"
              onClick={handleCancel}
            >
              取消
            </button>
          </div>
        </form>
      ) : (
        <div className="dashboard__info">
          <div className="dashboard__info-item">
            <span className="dashboard__info-label">用户ID:</span>
            <span className="dashboard__info-value">{user?.userId}</span>
          </div>
          <div className="dashboard__info-item">
            <span className="dashboard__info-label">用户名:</span>
            <span className="dashboard__info-value">{user?.username}</span>
          </div>
          <div className="dashboard__info-item">
            <span className="dashboard__info-label">邮箱:</span>
            <span className="dashboard__info-value">{user?.email}</span>
          </div>
          <div className="dashboard__info-item">
            <span className="dashboard__info-label">最后登录:</span>
            <span className="dashboard__info-value">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '未知'}
            </span>
          </div>
          <div className="dashboard__info-item">
            <span className="dashboard__info-label">账户状态:</span>
            <span className={`dashboard__info-value ${user?.isActive ? 'dashboard__info-value--active' : 'dashboard__info-value--inactive'}`}>
              {user?.isActive ? '正常' : '已禁用'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 安全设置标签页
const SecurityTab = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('新密码和确认密码不一致');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('新密码长度至少6个字符');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // 模拟密码修改API调用
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage('密码修改成功');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setMessage(data.message || '密码修改失败');
      }
    } catch (error) {
      console.error('修改密码错误:', error);
      setMessage('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard__tab">
      <div className="dashboard__tab-header">
        <h2>安全设置</h2>
      </div>

      <form className="dashboard__form" onSubmit={handleSubmit}>
        <div className="dashboard__field">
          <label htmlFor="currentPassword" className="dashboard__label">
            当前密码
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            className="dashboard__input"
            required
          />
        </div>

        <div className="dashboard__field">
          <label htmlFor="newPassword" className="dashboard__label">
            新密码
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className="dashboard__input"
            required
          />
        </div>

        <div className="dashboard__field">
          <label htmlFor="confirmPassword" className="dashboard__label">
            确认新密码
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="dashboard__input"
            required
          />
        </div>

        {message && (
          <div className={`dashboard__message ${message.includes('成功') ? 'dashboard__message--success' : 'dashboard__message--error'}`}>
            {message}
          </div>
        )}

        <div className="dashboard__form-actions">
          <button
            type="submit"
            className="dashboard__submit-btn"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" text="" /> : '修改密码'}
          </button>
        </div>
      </form>
    </div>
  );
};

// 登录记录标签页
const SessionsTab = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟获取登录记录
    setTimeout(() => {
      setSessions([
        {
          id: '1',
          device: 'Chrome on Windows',
          ip: '192.168.1.100',
          loginTime: new Date().toISOString(),
          loginMethod: 'qr_code',
        },
        {
          id: '2',
          device: 'Safari on iPhone',
          ip: '192.168.1.101',
          loginTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          loginMethod: 'password',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="加载登录记录..." />;
  }

  return (
    <div className="dashboard__tab">
      <div className="dashboard__tab-header">
        <h2>登录记录</h2>
      </div>

      <div className="dashboard__sessions">
        {sessions.length === 0 ? (
          <p className="dashboard__empty">暂无登录记录</p>
        ) : (
          <div className="dashboard__sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="dashboard__session">
                <div className="dashboard__session-info">
                  <div className="dashboard__session-device">{session.device}</div>
                  <div className="dashboard__session-details">
                    <span>IP: {session.ip}</span>
                    <span>方式: {session.loginMethod === 'qr_code' ? '二维码' : '密码'}</span>
                    <span>时间: {new Date(session.loginTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
