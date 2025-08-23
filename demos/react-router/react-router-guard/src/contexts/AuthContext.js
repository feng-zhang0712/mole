import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 认证状态类型
const AUTH_ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS',
  SET_LOADING: 'SET_LOADING'
};

// 初始状态
const initialState = {
  user: null,
  isAuthenticated: false,
  permissions: [],
  roles: [],
  loading: true
};

// 认证状态reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        permissions: action.payload.permissions || [],
        roles: action.payload.roles || [],
        loading: false
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        permissions: [],
        roles: [],
        loading: false
      };
    case AUTH_ACTIONS.UPDATE_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload.permissions,
        roles: action.payload.roles
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 模拟从localStorage恢复用户会话
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({
          type: AUTH_ACTIONS.LOGIN,
          payload: userData
        });
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('user');
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // 登录方法
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // 模拟 API 调用
      const response = await mockLoginAPI(credentials);
      
      // 保存到 localStorage
      localStorage.setItem('user', JSON.stringify(response));
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN,
        payload: response
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  // 登出方法
  const logout = () => {
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // 检查权限方法
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // 检查角色方法
  const hasRole = (role) => {
    return state.roles.includes(role);
  };

  // 检查多个权限（全部满足）
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => state.permissions.includes(permission));
  };

  // 检查多个权限（满足任一）
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => state.permissions.includes(permission));
  };

  const value = {
    ...state,
    login,
    logout,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 模拟登录API
const mockLoginAPI = async (credentials) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 模拟用户数据
  const users = {
    'admin': {
      user: { id: 1, username: 'admin', email: 'admin@example.com' },
      permissions: ['read', 'write', 'delete', 'admin'],
      roles: ['admin', 'user']
    },
    'user': {
      user: { id: 2, username: 'user', email: 'user@example.com' },
      permissions: ['read', 'write'],
      roles: ['user']
    },
    'guest': {
      user: { id: 3, username: 'guest', email: 'guest@example.com' },
      permissions: ['read'],
      roles: ['guest']
    }
  };

  const user = users[credentials.username];
  if (!user) {
    throw new Error('Invalid credentials');
  }

  return user;
};
