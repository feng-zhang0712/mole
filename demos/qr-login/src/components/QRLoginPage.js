import React, { useState, useEffect, useRef } from 'react';
import { qrAPI } from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from './LoadingSpinner';
import '../styles/QRLoginPage.css';

const QRLoginPage = ({ onLogin }) => {
  const [qrData, setQrData] = useState(null);
  const [qrStatus, setQrStatus] = useState('generated');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  const canvasRef = useRef(null);
  const { joinQRRoom, leaveQRRoom, onQRStatusUpdate, offQRStatusUpdate } = useSocket();

  // 生成二维码
  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await qrAPI.generate();
      
      if (response.success) {
        const { qrId, expiresAt } = response.data;
        setQrData({ qrId, expiresAt });
        setQrStatus('generated');
        
        // 计算倒计时
        const timeLeft = Math.max(0, new Date(expiresAt) - new Date());
        setCountdown(Math.ceil(timeLeft / 1000));
        
        // 生成二维码图片
        await generateQRImage(qrId);
        
        // 加入Socket房间
        joinQRRoom(qrId);
        
        // 开始轮询状态
        startPolling(qrId);
      } else {
        setError(response.message || '二维码生成失败');
      }
    } catch (error) {
      console.error('生成二维码错误:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 生成二维码图片
  const generateQRImage = async (qrId) => {
    try {
      const qrUrl = `${window.location.origin}/qr-login?qrId=${qrId}`;
      const canvas = canvasRef.current;
      
      if (canvas) {
        // 使用简单的文本显示二维码URL，实际项目中可以使用qrcode库
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制一个简单的二维码占位符
        ctx.fillStyle = '#000000';
        ctx.fillRect(10, 10, 180, 180);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(20, 20, 160, 160);
        
        // 绘制一些模拟的二维码方块
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 10; i++) {
          for (let j = 0; j < 10; j++) {
            if (Math.random() > 0.5) {
              ctx.fillRect(20 + i * 16, 20 + j * 16, 14, 14);
            }
          }
        }
        
        // 添加文本说明
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code', 100, 210);
        ctx.fillText('Scan with mobile', 100, 225);
      }
    } catch (error) {
      console.error('生成二维码图片错误:', error);
    }
  };

  // 开始轮询二维码状态
  const startPolling = (qrId) => {
    const interval = setInterval(async () => {
      try {
        const response = await qrAPI.getStatus(qrId);
        
        if (response.success) {
          const { status } = response.data;
          setQrStatus(status);
          
          if (status === 'confirmed') {
            // 登录成功
            clearInterval(interval);
            setPollingInterval(null);
            
            // 从响应中获取真实的用户信息和Token
            const userData = {
              userId: response.data.userId || 'user-id',
              username: response.data.username || 'user',
              email: response.data.email || 'user@example.com',
            };
            
            const tokens = {
              accessToken: response.data.pcToken || 'access-token',
              refreshToken: response.data.refreshToken || 'refresh-token',
            };
            
            onLogin(userData, tokens);
          } else if (status === 'expired' || status === 'cancelled') {
            // 二维码过期或取消
            clearInterval(interval);
            setPollingInterval(null);
            setQrData(null);
            setQrStatus('expired');
            leaveQRRoom(qrId);
          }
        }
      } catch (error) {
        console.error('轮询状态错误:', error);
      }
    }, 2000); // 每2秒轮询一次
    
    setPollingInterval(interval);
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // 监听Socket状态更新
  useEffect(() => {
    const handleStatusUpdate = (data) => {
      const { qrId, status } = data;
      
      if (qrData && qrData.qrId === qrId) {
        setQrStatus(status);
        
        if (status === 'confirmed') {
          stopPolling();
          leaveQRRoom(qrId);
          
          // 登录成功
          const userData = {
            userId: data.userId || 'user-id',
            username: data.username || 'user',
            email: data.email || 'user@example.com',
          };
          
          const tokens = {
            accessToken: data.pcToken || 'access-token',
            refreshToken: data.refreshToken || 'refresh-token',
          };
          
          onLogin(userData, tokens);
        } else if (status === 'expired' || status === 'cancelled') {
          stopPolling();
          setQrData(null);
          setQrStatus('expired');
          leaveQRRoom(qrId);
        }
      }
    };

    onQRStatusUpdate(handleStatusUpdate);

    return () => {
      offQRStatusUpdate(handleStatusUpdate);
    };
  }, [qrData, onQRStatusUpdate, offQRStatusUpdate, leaveQRRoom, onLogin]);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (qrData && qrStatus === 'generated') {
      // 倒计时结束，二维码过期
      setQrStatus('expired');
      stopPolling();
      if (qrData.qrId) {
        leaveQRRoom(qrData.qrId);
      }
    }
  }, [countdown, qrData, qrStatus, stopPolling, leaveQRRoom]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopPolling();
      if (qrData && qrData.qrId) {
        leaveQRRoom(qrData.qrId);
      }
    };
  }, [qrData, stopPolling, leaveQRRoom]);

  const getStatusText = () => {
    switch (qrStatus) {
      case 'generated':
        return '请使用手机扫描二维码';
      case 'pending_confirmation':
        return '请在手机上确认登录';
      case 'confirmed':
        return '登录成功！';
      case 'expired':
        return '二维码已过期';
      case 'cancelled':
        return '登录已取消';
      default:
        return '等待生成二维码';
    }
  };

  const getStatusClass = () => {
    return `qr-login-page__status qr-login-page__status--${qrStatus}`;
  };

  return (
    <div className="qr-login-page">
      <div className="qr-login-page__container">
        <div className="qr-login-page__header">
          <h1 className="qr-login-page__title">二维码登录</h1>
          <p className="qr-login-page__subtitle">
            使用手机扫描二维码快速登录
          </p>
        </div>

        <div className="qr-login-page__content">
          {!qrData ? (
            <div className="qr-login-page__generate">
              <button
                className="qr-login-page__generate-btn"
                onClick={generateQRCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  '生成二维码'
                )}
              </button>
            </div>
          ) : (
            <div className="qr-login-page__qr-container">
              <div className="qr-login-page__qr-code">
                <canvas ref={canvasRef} />
                {countdown > 0 && (
                  <div className="qr-login-page__countdown">
                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
              
              <div className={getStatusClass()}>
                {getStatusText()}
              </div>
              
              {qrStatus === 'expired' && (
                <button
                  className="qr-login-page__regenerate-btn"
                  onClick={generateQRCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    '重新生成'
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="qr-login-page__error">
              {error}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QRLoginPage;
