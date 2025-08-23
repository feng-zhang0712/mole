import React, { useState } from 'react';
import { AsyncRouteGuard } from '../components/guards/RouteGuard.js';
import { useAuth } from '../contexts/AuthContext.js';
import './AsyncDemo.css';

/**
 * 异步路由守卫演示页面
 * 展示如何使用 AsyncRouteGuard 实现异步权限验证
 */
const AsyncDemo = () => {
  const { user, permissions, roles } = useAuth();
  const [simulateDelay, setSimulateDelay] = useState(2000);
  const [simulateError, setSimulateError] = useState(false);

  // 模拟异步权限检查函数
  const mockAsyncPermissionCheck = async () => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, simulateDelay));
    
    // 模拟权限检查错误
    if (simulateError) {
      throw new Error('权限检查失败：网络错误');
    }
    
    // 模拟复杂的权限验证逻辑
    const hasComplexPermission = await checkComplexPermissions();
    return hasComplexPermission;
  };

  // 模拟复杂的权限验证逻辑
  const checkComplexPermissions = async () => {
    // 模拟多个异步权限检查
    const checks = [
      checkUserRole(),
      checkUserPermissions(),
      checkTimeRestrictions(),
      checkIpRestrictions()
    ];
    
    const results = await Promise.all(checks);
    return results.every(result => result);
  };

  const checkUserRole = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return roles.includes('admin') || roles.includes('manager');
  };

  const checkUserPermissions = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return permissions.includes('read') && permissions.includes('write');
  };

  const checkTimeRestrictions = async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 18; // 工作时间限制
  };

  const checkIpRestrictions = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    // 模拟IP检查（实际项目中可能调用API）
    return true; // 简化处理
  };

  const renderPermissionDetails = () => (
    <div className="permission-details">
      <h3>🔍 权限检查详情</h3>
      <div className="permission-grid">
        <div className="permission-item">
          <div className="permission-header">
            <span className="permission-icon">👤</span>
            <span className="permission-name">用户角色检查</span>
          </div>
          <div className="permission-status">
            <span className={`status-badge ${roles.includes('admin') || roles.includes('manager') ? 'success' : 'error'}`}>
              {roles.includes('admin') || roles.includes('manager') ? '通过' : '失败'}
            </span>
          </div>
        </div>
        
        <div className="permission-item">
          <div className="permission-header">
            <span className="permission-icon">🔐</span>
            <span className="permission-name">用户权限检查</span>
          </div>
          <div className="permission-status">
            <span className={`status-badge ${permissions.includes('read') && permissions.includes('write') ? 'success' : 'error'}`}>
              {permissions.includes('read') && permissions.includes('write') ? '通过' : '失败'}
            </span>
          </div>
        </div>
        
        <div className="permission-item">
          <div className="permission-header">
            <span className="permission-icon">⏰</span>
            <span className="permission-name">时间限制检查</span>
          </div>
          <div className="permission-status">
            <span className={`status-badge ${new Date().getHours() >= 9 && new Date().getHours() <= 18 ? 'success' : 'error'}`}>
              {new Date().getHours() >= 9 && new Date().getHours() <= 18 ? '通过' : '失败'}
            </span>
          </div>
        </div>
        
        <div className="permission-item">
          <div className="permission-header">
            <span className="permission-icon">🌐</span>
            <span className="permission-name">IP地址检查</span>
          </div>
          <div className="permission-status">
            <span className="status-badge success">通过</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSimulationControls = () => (
    <div className="simulation-controls">
      <h3>⚙️ 模拟控制</h3>
      <div className="control-group">
        <label>
          模拟延迟时间 (毫秒):
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={simulateDelay}
            onChange={(e) => setSimulateDelay(parseInt(e.target.value))}
          />
          <span>{simulateDelay}ms</span>
        </label>
      </div>
      
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
          />
          模拟权限检查错误
        </label>
      </div>
      
      <div className="control-info">
        <p><strong>当前设置:</strong></p>
        <ul>
          <li>延迟时间: {simulateDelay}ms</li>
          <li>错误模拟: {simulateError ? '开启' : '关闭'}</li>
          <li>权限检查: 4项异步检查</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="async-demo">
      <div className="demo-header">
        <h2>⚡ 异步路由守卫演示</h2>
        <p>使用 AsyncRouteGuard 实现异步权限验证，支持复杂的权限检查逻辑</p>
      </div>

      <div className="demo-content">
        <div className="content-left">
          <AsyncRouteGuard
            permissionCheck={mockAsyncPermissionCheck}
            loadingComponent={
              <div className="loading-section">
                <div className="loading-spinner"></div>
                <h3>正在检查权限...</h3>
                <p>请稍候，系统正在验证您的访问权限</p>
                <div className="loading-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <p>预计需要 {simulateDelay / 1000} 秒</p>
                </div>
              </div>
            }
            fallback={
              <div className="fallback-section">
                <div className="fallback-icon">🚫</div>
                <h3>权限验证失败</h3>
                <p>很抱歉，您没有权限访问此页面</p>
                <div className="fallback-reasons">
                  <h4>可能的原因:</h4>
                  <ul>
                    <li>用户角色权限不足</li>
                    <li>缺少必要的操作权限</li>
                    <li>访问时间限制</li>
                    <li>网络权限检查失败</li>
                  </ul>
                </div>
              </div>
            }
          >
            <div className="success-section">
              <div className="success-icon">✅</div>
              <h3>权限验证成功</h3>
              <p>恭喜！您已通过所有权限检查，可以访问此页面</p>
              
              {renderPermissionDetails()}
              {renderSimulationControls()}
              
              <div className="demo-features">
                <h3>🚀 异步路由守卫特性</h3>
                <div className="features-grid">
                  <div className="feature-item">
                    <span className="feature-icon">⏱️</span>
                    <h4>异步处理</h4>
                    <p>支持异步权限验证，不阻塞UI渲染</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🔄</span>
                    <h4>加载状态</h4>
                    <p>提供友好的加载状态展示</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">❌</span>
                    <h4>错误处理</h4>
                    <p>完善的错误处理和用户提示</p>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <h4>性能优化</h4>
                    <p>支持复杂的权限检查逻辑</p>
                  </div>
                </div>
              </div>
            </div>
          </AsyncRouteGuard>
        </div>
      </div>

      <div className="demo-footer">
        <div className="guard-info">
          <h4>🔒 当前使用的守卫方式</h4>
          <p><strong>异步路由守卫</strong> - 通过 AsyncRouteGuard 实现异步权限验证</p>
          <p>优点：支持复杂权限逻辑，提供加载状态，用户体验更好</p>
        </div>
      </div>
    </div>
  );
};

export default AsyncDemo;
