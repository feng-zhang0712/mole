import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

/**
 * 高级路由守卫组件
 * 支持多种高级权限控制功能
 */
export const AdvancedGuard = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  requiredGroups = [],
  timeRestrictions = null,
  ipRestrictions = null,
  deviceRestrictions = null,
  fallback = null,
  redirectTo = '/login',
  onAccessDenied = null,
  onAccessGranted = null,
  showPermissionModal = false
}) => {
  const { isAuthenticated, hasPermission, hasRole, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [accessCheck, setAccessCheck] = useState({
    loading: true,
    hasAccess: false,
    reason: null,
    details: {}
  });

  // 检查时间限制
  const checkTimeRestrictions = () => {
    if (!timeRestrictions) return { allowed: true };
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // 检查工作日限制
    if (timeRestrictions.workdaysOnly && currentDay === 0 || currentDay === 6) {
      return { 
        allowed: false, 
        reason: '仅工作日可访问',
        details: { currentDay, restriction: 'workdaysOnly' }
      };
    }
    
    // 检查时间范围限制
    if (timeRestrictions.timeRange) {
      const { start, end } = timeRestrictions.timeRange;
      if (currentHour < start || currentHour >= end) {
        return { 
          allowed: false, 
          reason: `仅 ${start}:00 - ${end}:00 可访问`,
          details: { currentHour, start, end }
        };
      }
    }
    
    return { allowed: true };
  };

  // 检查IP限制（模拟）
  const checkIpRestrictions = async () => {
    if (!ipRestrictions) return { allowed: true };
    
    try {
      // 模拟IP检查API调用
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const userIp = data.ip;
      
      if (ipRestrictions.allowedIps && !ipRestrictions.allowedIps.includes(userIp)) {
        return { 
          allowed: false, 
          reason: 'IP地址不在允许列表中',
          details: { userIp, allowedIps: ipRestrictions.allowedIps }
        };
      }
      
      if (ipRestrictions.blockedIps && ipRestrictions.blockedIps.includes(userIp)) {
        return { 
          allowed: false, 
          reason: 'IP地址被阻止',
          details: { userIp, blockedIps: ipRestrictions.blockedIps }
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.warn('IP检查失败，允许访问:', error);
      return { allowed: true };
    }
  };

  // 检查设备限制
  const checkDeviceRestrictions = () => {
    if (!deviceRestrictions) return { allowed: true };
    
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isDesktop = !isMobile;
    
    if (deviceRestrictions.mobileOnly && !isMobile) {
      return { 
        allowed: false, 
        reason: '仅移动设备可访问',
        details: { userAgent, isMobile, restriction: 'mobileOnly' }
      };
    }
    
    if (deviceRestrictions.desktopOnly && !isDesktop) {
      return { 
        allowed: false, 
        reason: '仅桌面设备可访问',
        details: { userAgent, isDesktop, restriction: 'desktopOnly' }
      };
    }
    
    return { allowed: true };
  };

  // 检查用户组权限
  const checkGroupPermissions = () => {
    if (!requiredGroups || requiredGroups.length === 0) return { allowed: true };
    
    // 这里应该从用户信息中获取用户组
    // 模拟用户组检查
    const userGroups = ['default']; // 实际应该从用户信息中获取
    
    const hasRequiredGroup = requiredGroups.some(group => userGroups.includes(group));
    
    if (!hasRequiredGroup) {
      return { 
        allowed: false, 
        reason: '用户组权限不足',
        details: { userGroups, requiredGroups }
      };
    }
    
    return { allowed: true };
  };

  // 执行所有权限检查
  useEffect(() => {
    const performAccessCheck = async () => {
      if (loading) return;
      
      if (!isAuthenticated) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: '用户未认证',
          details: { type: 'authentication' }
        });
        return;
      }

      // 检查基本权限
      if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: '权限不足',
          details: { 
            type: 'permissions',
            required: requiredPermissions,
            current: [] // 实际应该从用户信息中获取
          }
        });
        return;
      }

      // 检查角色权限
      if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: '角色权限不足',
          details: { 
            type: 'roles',
            required: requiredRoles,
            current: [] // 实际应该从用户信息中获取
          }
        });
        return;
      }

      // 检查用户组权限
      const groupCheck = checkGroupPermissions();
      if (!groupCheck.allowed) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: groupCheck.reason,
          details: groupCheck.details
        });
        return;
      }

      // 检查时间限制
      const timeCheck = checkTimeRestrictions();
      if (!timeCheck.allowed) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: timeCheck.reason,
          details: timeCheck.details
        });
        return;
      }

      // 检查IP限制
      const ipCheck = await checkIpRestrictions();
      if (!ipCheck.allowed) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: ipCheck.reason,
          details: ipCheck.details
        });
        return;
      }

      // 检查设备限制
      const deviceCheck = checkDeviceRestrictions();
      if (!deviceCheck.allowed) {
        setAccessCheck({
          loading: false,
          hasAccess: false,
          reason: deviceCheck.reason,
          details: deviceCheck.details
        });
        return;
      }

      // 所有检查通过
      setAccessCheck({
        loading: false,
        hasAccess: true,
        reason: null,
        details: {}
      });

      // 触发访问成功回调
      if (onAccessGranted) {
        onAccessGranted({
          user: {}, // 实际应该传递用户信息
          timestamp: new Date(),
          location: location.pathname
        });
      }
    };

    performAccessCheck();
  }, [loading, isAuthenticated, hasPermission, hasRole, location.pathname]);

  // 处理访问被拒绝
  const handleAccessDenied = () => {
    if (onAccessDenied) {
      onAccessDenied({
        reason: accessCheck.reason,
        details: accessCheck.details,
        timestamp: new Date(),
        location: location.pathname
      });
    }

    // 记录访问尝试
    console.warn('访问被拒绝:', {
      path: location.pathname,
      reason: accessCheck.reason,
      details: accessCheck.details,
      timestamp: new Date()
    });
  };

  // 渲染加载状态
  if (loading || accessCheck.loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>正在检查访问权限...</p>
      </div>
    );
  }

  // 检查认证状态
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 检查访问权限
  if (!accessCheck.hasAccess) {
    handleAccessDenied();
    
    if (fallback) {
      return fallback;
    }
    
    // 根据拒绝原因选择重定向目标
    let redirectTarget = redirectTo;
    if (accessCheck.details.type === 'permissions' || accessCheck.details.type === 'roles') {
      redirectTarget = '/unauthorized';
    }
    
    return <Navigate to={redirectTarget} replace />;
  }

  // 权限检查通过，渲染子组件
  return children;
};

/**
 * 使用高级守卫的Hook
 */
export const useAdvancedGuard = (options = {}) => {
  const [guardState, setGuardState] = useState({
    loading: true,
    hasAccess: false,
    reason: null,
    details: {}
  });

  const checkAccess = async () => {
    // 实现高级权限检查逻辑
    // 这里可以包含复杂的权限验证逻辑
  };

  useEffect(() => {
    checkAccess();
  }, []);

  return guardState;
};

/**
 * 权限检查工具函数
 */
export const checkAdvancedPermissions = {
  // 检查时间权限
  time: (timeRestrictions) => {
    if (!timeRestrictions) return { allowed: true };
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // 检查工作日限制
    if (timeRestrictions.workdaysOnly && currentDay === 0 || currentDay === 6) {
      return { 
        allowed: false, 
        reason: '仅工作日可访问',
        details: { currentDay, restriction: 'workdaysOnly' }
      };
    }
    
    // 检查时间范围限制
    if (timeRestrictions.timeRange) {
      const { start, end } = timeRestrictions.timeRange;
      if (currentHour < start || currentHour >= end) {
        return { 
          allowed: false, 
          reason: `仅 ${start}:00 - ${end}:00 可访问`,
          details: { currentHour, start, end }
        };
      }
    }
    
    return { allowed: true };
  },
  
  // 检查IP权限
  ip: async (ipRestrictions) => {
    if (!ipRestrictions) return { allowed: true };
    
    try {
      // 模拟IP检查API调用
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const userIp = data.ip;
      
      if (ipRestrictions.allowedIps && !ipRestrictions.allowedIps.includes(userIp)) {
        return { 
          allowed: false, 
          reason: 'IP地址不在允许列表中',
          details: { userIp, allowedIps: ipRestrictions.allowedIps }
        };
      }
      
      if (ipRestrictions.blockedIps && ipRestrictions.blockedIps.includes(userIp)) {
        return { 
          allowed: false, 
          reason: 'IP地址被阻止',
          details: { userIp, blockedIps: ipRestrictions.blockedIps }
        };
      }
      
      return { allowed: true };
    } catch (error) {
      console.warn('IP检查失败，允许访问:', error);
      return { allowed: true };
    }
  },
  
  // 检查设备权限
  device: (deviceRestrictions) => {
    if (!deviceRestrictions) return { allowed: true };
    
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const isDesktop = !isMobile;
    
    if (deviceRestrictions.mobileOnly && !isMobile) {
      return { 
        allowed: false, 
        reason: '仅移动设备可访问',
        details: { userAgent, isMobile, restriction: 'mobileOnly' }
      };
    }
    
    if (deviceRestrictions.desktopOnly && !isDesktop) {
      return { 
        allowed: false, 
        reason: '仅桌面设备可访问',
        details: { userAgent, isDesktop, restriction: 'desktopOnly' }
      };
    }
    
    return { allowed: true };
  },
  
  // 检查用户组权限
  group: (requiredGroups) => {
    if (!requiredGroups || requiredGroups.length === 0) return { allowed: true };
    
    // 这里应该从用户信息中获取用户组
    // 模拟用户组检查
    const userGroups = ['default']; // 实际应该从用户信息中获取
    
    const hasRequiredGroup = requiredGroups.some(group => userGroups.includes(group));
    
    if (!hasRequiredGroup) {
      return { 
        allowed: false, 
        reason: '用户组权限不足',
        details: { userGroups, requiredGroups }
      };
    }
    
    return { allowed: true };
  }
};
