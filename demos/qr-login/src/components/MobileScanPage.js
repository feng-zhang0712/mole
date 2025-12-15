import React, { useState, useEffect } from 'react';
import { qrAPI } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import '../styles/MobileScanPage.css';

const MobileScanPage = () => {
  const [qrId, setQrId] = useState('');
  const [mobileToken, setMobileToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [qrStatus, setQrStatus] = useState('');

  useEffect(() => {
    // 从URL参数获取二维码ID
    const urlParams = new URLSearchParams(window.location.search);
    const qrIdFromUrl = urlParams.get('qrId');
    if (qrIdFromUrl) {
      setQrId(qrIdFromUrl);
    }

    // 从本地存储获取移动端Token
    const token = localStorage.getItem('mobileToken');
    if (token) {
      setMobileToken(token);
    }
  }, []);

  const handleScan = async () => {
    if (!qrId || !mobileToken) {
      setError('二维码ID和移动端Token不能为空');
      return;
    }

    setIsScanning(true);
    setError('');
    setSuccess('');

    try {
      const response = await qrAPI.scan(qrId, mobileToken);
      
      if (response.success) {
        setTempToken(response.data.tempToken);
        setQrStatus(response.data.status);
        setSuccess('二维码扫描成功，请确认登录');
      } else {
        setError(response.message || '扫描失败');
      }
    } catch (error) {
      console.error('扫描二维码错误:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirm = async () => {
    if (!tempToken) {
      setError('临时Token不存在');
      return;
    }

    setIsConfirming(true);
    setError('');

    try {
      const response = await qrAPI.confirm(tempToken);
      
      if (response.success) {
        setSuccess('登录确认成功！');
        setQrStatus('confirmed');
        
        // 延迟跳转
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        setError(response.message || '确认失败');
      }
    } catch (error) {
      console.error('确认登录错误:', error);
      setError('网络错误，请稍后重试');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!qrId) return;

    try {
      await qrAPI.cancel(qrId);
      setSuccess('登录已取消');
      setQrStatus('cancelled');
    } catch (error) {
      console.error('取消登录错误:', error);
    }
  };

  const getStatusText = () => {
    switch (qrStatus) {
      case 'pending_confirmation':
        return '等待确认登录';
      case 'confirmed':
        return '登录成功';
      case 'cancelled':
        return '登录已取消';
      default:
        return '准备扫描';
    }
  };

  const getStatusClass = () => {
    return `mobile-scan-page__status mobile-scan-page__status--${qrStatus || 'ready'}`;
  };

  return (
    <div className="mobile-scan-page">
      <div className="mobile-scan-page__container">
        <div className="mobile-scan-page__header">
          <h1 className="mobile-scan-page__title">扫码登录</h1>
          <p className="mobile-scan-page__subtitle">
            扫描PC端二维码完成登录
          </p>
        </div>

        <div className="mobile-scan-page__content">
          <div className="mobile-scan-page__qr-info">
            <div className="mobile-scan-page__field">
              <label className="mobile-scan-page__label">二维码ID:</label>
              <input
                type="text"
                value={qrId}
                onChange={(e) => setQrId(e.target.value)}
                className="mobile-scan-page__input"
                placeholder="请输入二维码ID"
              />
            </div>

            <div className="mobile-scan-page__field">
              <label className="mobile-scan-page__label">移动端Token:</label>
              <input
                type="text"
                value={mobileToken}
                onChange={(e) => setMobileToken(e.target.value)}
                className="mobile-scan-page__input"
                placeholder="请输入移动端Token"
              />
            </div>
          </div>

          <div className={getStatusClass()}>
            {getStatusText()}
          </div>

          {error && (
            <div className="mobile-scan-page__error">
              {error}
            </div>
          )}

          {success && (
            <div className="mobile-scan-page__success">
              {success}
            </div>
          )}

          <div className="mobile-scan-page__actions">
            {!tempToken ? (
              <button
                className="mobile-scan-page__scan-btn"
                onClick={handleScan}
                disabled={isScanning || !qrId || !mobileToken}
              >
                {isScanning ? (
                  <LoadingSpinner size="small" text="" />
                ) : (
                  '扫描二维码'
                )}
              </button>
            ) : (
              <div className="mobile-scan-page__confirm-actions">
                <button
                  className="mobile-scan-page__confirm-btn"
                  onClick={handleConfirm}
                  disabled={isConfirming || qrStatus === 'confirmed'}
                >
                  {isConfirming ? (
                    <LoadingSpinner size="small" text="" />
                  ) : (
                    '确认登录'
                  )}
                </button>
                
                <button
                  className="mobile-scan-page__cancel-btn"
                  onClick={handleCancel}
                  disabled={qrStatus === 'confirmed' || qrStatus === 'cancelled'}
                >
                  取消登录
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mobile-scan-page__footer">
          <p className="mobile-scan-page__help">
            请确保您已在PC端生成了二维码，并且已登录移动端账户
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileScanPage;
