import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';

/**
 * 方式1: 基于组件的路由守卫
 * 通过包装组件实现权限控制
 */
export const RouteGuard = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [],
  fallback = null,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, hasPermission, hasRole, loading } = useAuth();
  const location = useLocation();

  // 加载状态处理
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // 检查认证状态
  if (!isAuthenticated) {
    // 保存当前路径，登录后可以重定向回来
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 检查角色权限
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  // 检查具体权限
  if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
    return fallback || <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * 方式2: 高阶组件(HOC)路由守卫
 * 通过包装组件实现权限控制，更灵活
 */
export const withAuth = (WrappedComponent, options = {}) => {
  const {
    requiredPermissions = [],
    requiredRoles = [],
    fallback = null,
    redirectTo = '/login'
  } = options;

  return function AuthenticatedComponent(props) {
    const { isAuthenticated, hasPermission, hasRole, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (!isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }

    if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
      return fallback || <Navigate to="/unauthorized" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * 方式3: 权限检查Hook
 * 提供权限检查逻辑，可以在组件中灵活使用
 */
export const useRouteGuard = (requiredPermissions = [], requiredRoles = []) => {
  const { isAuthenticated, hasPermission, hasRole, loading } = useAuth();
  const location = useLocation();

  const canAccess = () => {
    if (loading || !isAuthenticated) return false;
    
    if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
      return false;
    }
    
    if (requiredPermissions.length > 0 && !requiredPermissions.every(permission => hasPermission(permission))) {
      return false;
    }
    
    return true;
  };

  const getRedirectPath = () => {
    if (!isAuthenticated) return '/login';
    if (!canAccess()) return '/unauthorized';
    return null;
  };

  return {
    canAccess: canAccess(),
    loading,
    isAuthenticated,
    redirectPath: getRedirectPath(),
    location
  };
};

/**
 * 方式4: 异步权限检查守卫
 * 支持异步权限验证，适合复杂权限逻辑
 */
export const AsyncRouteGuard = ({ 
  children, 
  permissionCheck, 
  fallback = null,
  loadingComponent = <div className="loading">Checking permissions...</div>
}) => {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        const result = await permissionCheck();
        setHasPermission(result);
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permissionCheck]);

  if (loading) {
    return loadingComponent;
  }

  if (!hasPermission) {
    return fallback;
  }

  return children;
};

/**
 * 方式5: 条件渲染路由守卫
 * 通过条件渲染实现权限控制，适合简单场景
 */
export const ConditionalGuard = ({ 
  children, 
  condition, 
  fallback = null 
}) => {
  if (!condition) {
    return fallback;
  }
  return children;
};

