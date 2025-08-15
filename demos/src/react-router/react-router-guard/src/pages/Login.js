import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import './Login.css';

/**
 * 登录页面组件
 * 展示登录表单和权限控制
 */
const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 如果已经登录，重定向到目标页面或仪表板
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(credentials);
      
      if (result.success) {
        // 登录成功，重定向到目标页面或仪表板
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error || '登录失败');
      }
    } catch (err) {
      setError('登录过程中发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 快速登录按钮（演示用）
  const handleQuickLogin = (username) => {
    setCredentials({ username, password: 'password' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🔐 用户登录</h1>
          <p>请选择用户角色进行登录演示</p>
        </div>

        {/* 快速登录按钮 */}
        <div className="quick-login">
          <h3>快速登录（演示用）</h3>
          <div className="quick-buttons">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="quick-btn admin"
              disabled={isLoading}
            >
              👑 管理员
            </button>
            <button
              onClick={() => handleQuickLogin('user')}
              className="quick-btn user"
              disabled={isLoading}
            >
              👤 普通用户
            </button>
            <button
              onClick={() => handleQuickLogin('guest')}
              className="quick-btn guest"
              disabled={isLoading}
            >
              🎭 访客
            </button>
          </div>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="输入用户名"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              placeholder="输入密码"
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={isLoading || !credentials.username || !credentials.password}
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 用户权限说明 */}
        <div className="permissions-info">
          <h3>用户权限说明</h3>
          <div className="permission-list">
            <div className="permission-item">
              <span className="role admin">👑 管理员</span>
              <span className="permissions">权限: read, write, delete, admin | 角色: admin, user</span>
            </div>
            <div className="permission-item">
              <span className="role user">👤 普通用户</span>
              <span className="permissions">权限: read, write | 角色: user</span>
            </div>
            <div className="permission-item">
              <span className="role guest">🎭 访客</span>
              <span className="permissions">权限: read | 角色: guest</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
