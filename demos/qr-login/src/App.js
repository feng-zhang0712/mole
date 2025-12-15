import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import QRLoginPage from './components/QRLoginPage';
import Dashboard from './components/Dashboard';
import MobileScanPage from './components/MobileScanPage';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('qr-login');

  // 检查是否是移动端扫描页面
  const isMobileScanPage = window.location.pathname === '/qr-login' && window.location.search.includes('qrId=');

  useEffect(() => {
    // 如果是移动端扫描页面，直接显示
    if (isMobileScanPage) {
      setIsLoading(false);
      return;
    }

    // 检查本地存储中的用户信息
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // 验证token有效性
          const response = await fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
            setCurrentPage('dashboard');
          } else {
            // Token无效，清除本地存储
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('检查认证状态错误:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [isMobileScanPage]);

  const handleLogin = (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('accessToken', tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem('refreshToken', tokens.refreshToken);
    }
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentPage('qr-login');
  };

  // 如果是移动端扫描页面，直接渲染
  if (isMobileScanPage) {
    return <MobileScanPage />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <AuthProvider value={{ user, handleLogin, handleLogout }}>
      <SocketProvider>
        <div className="app">
          {currentPage === 'qr-login' && (
            <QRLoginPage 
              onLogin={handleLogin}
            />
          )}
          {currentPage === 'dashboard' && (
            <Dashboard 
              onLogout={handleLogout}
            />
          )}
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
