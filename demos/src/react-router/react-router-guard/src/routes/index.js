import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteGuard, withAuth } from '../components/guards/RouteGuard.js';

// 页面组件
import Login from '../pages/Login.js';
import Dashboard from '../pages/Dashboard.js';
import Profile from '../pages/Profile.js';
import Admin from '../pages/Admin.js';
import Settings from '../pages/Settings.js';
import AdvancedDemo from '../pages/AdvancedDemo.js';
import Unauthorized from '../pages/Unauthorized.js';
import NotFound from '../pages/NotFound.js';

// 布局组件
import Layout from '../components/Layout.js';

/**
 * 路由配置
 * 展示多种路由守卫的使用方式
 */
export const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'dashboard',
        element: (
          // 方式1: 使用 RouteGuard 组件
          <RouteGuard requiredPermissions={['read']}>
            <Dashboard />
          </RouteGuard>
        )
      },
      {
        path: 'profile',
        element: (
          // 方式1: 使用 RouteGuard 组件，需要读写权限
          <RouteGuard requiredPermissions={['read', 'write']}>
            <Profile />
          </RouteGuard>
        )
      },
      {
        path: 'admin',
        element: (
          // 方式1: 使用 RouteGuard 组件，需要 admin 角色
          <RouteGuard requiredRoles={['admin']}>
            <Admin />
          </RouteGuard>
        )
      },
      {
        path: 'settings',
        element: (
          // 方式1: 使用 RouteGuard 组件，需要 admin 权限
          <RouteGuard requiredPermissions={['admin']}>
            <Settings />
          </RouteGuard>
        )
      },
      {
        path: 'advanced',
        element: (
          // 方式1: 使用 RouteGuard 组件，需要 read 权限
          <RouteGuard requiredPermissions={['read']}>
            <AdvancedDemo />
          </RouteGuard>
        )
      },
      {
        path: 'unauthorized',
        element: <Unauthorized />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
];

/**
 * 动态路由生成器
 * 根据用户权限动态生成路由
 */
export const generateDynamicRoutes = (userPermissions, userRoles) => {
  const baseRoutes = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: 'login',
          element: <Login />
        }
      ]
    }
  ];

  // 根据权限动态添加路由
  if (userPermissions.includes('read')) {
    baseRoutes[0].children.push({
      path: 'dashboard',
      element: <Dashboard />
    });
  }

  if (userPermissions.includes('write')) {
    baseRoutes[0].children.push({
      path: 'profile',
      element: <Profile />
    });
  }

  if (userRoles.includes('admin')) {
    baseRoutes[0].children.push(
      {
        path: 'admin',
        element: <Admin />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    );
  }

  // 添加通用路由
  baseRoutes[0].children.push(
    {
      path: 'unauthorized',
      element: <Unauthorized />
    },
    {
      path: '*',
      element: <NotFound />
    }
  );

  return baseRoutes;
};

/**
 * 路由权限配置
 * 集中管理路由权限规则
 */
export const routePermissions = {
  '/dashboard': {
    permissions: ['read'],
    roles: [],
    fallback: '/login'
  },
  '/profile': {
    permissions: ['read', 'write'],
    roles: [],
    fallback: '/login'
  },
  '/admin': {
    permissions: [],
    roles: ['admin'],
    fallback: '/unauthorized'
  },
  '/settings': {
    permissions: ['admin'],
    roles: [],
    fallback: '/unauthorized'
  }
};

/**
 * 检查路由权限的工具函数
 */
export const checkRoutePermission = (pathname, userPermissions, userRoles) => {
  const routeConfig = routePermissions[pathname];
  
  if (!routeConfig) {
    return { canAccess: true, redirectTo: null };
  }

  const { permissions, roles, fallback } = routeConfig;

  // 检查角色权限
  if (roles.length > 0 && !roles.some(role => userRoles.includes(role))) {
    return { canAccess: false, redirectTo: fallback };
  }

  // 检查具体权限
  if (permissions.length > 0 && !permissions.every(permission => userPermissions.includes(permission))) {
    return { canAccess: false, redirectTo: fallback };
  }

  return { canAccess: true, redirectTo: null };
};
