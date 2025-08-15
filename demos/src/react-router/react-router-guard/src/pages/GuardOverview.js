import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import './GuardOverview.css';

/**
 * 路由守卫概览页面
 * 展示所有可用的路由守卫方式
 */
const GuardOverview = () => {
  const { user, permissions, roles } = useAuth();

  const guardMethods = [
    {
      id: 'routeguard',
      title: '组件守卫 (RouteGuard)',
      description: '通过包装组件实现权限控制，使用简单，适合包装单个组件',
      icon: '🛡️',
      path: '/advanced',
      features: [
        '支持权限和角色验证',
        '使用简单，适合包装单个组件',
        '内置重定向和fallback支持',
        '支持嵌套路由权限控制'
      ],
      codeExample: `<RouteGuard requiredPermissions={['read']}>
  <ProtectedComponent />
</RouteGuard>`
    },
    {
      id: 'hoc',
      title: '高阶组件守卫 (withAuth)',
      description: '通过高阶组件实现权限控制，代码复用性高，适合批量应用',
      icon: '🔧',
      path: '/hoc-demo',
      features: [
        '代码复用性高，适合批量应用权限控制',
        '使用装饰器模式，代码更清晰',
        '支持复杂的权限配置选项',
        '易于测试和维护'
      ],
      codeExample: `const ProtectedComponent = withAuth(Component, {
  requiredPermissions: ['admin'],
  requiredRoles: ['admin']
});`
    },
    {
      id: 'hook',
      title: 'Hook守卫 (useRouteGuard)',
      description: '通过自定义Hook实现权限控制，逻辑清晰，易于测试',
      icon: '🎣',
      path: '/hook-demo',
      features: [
        '逻辑清晰，易于测试',
        '支持复杂的权限判断逻辑',
        '可以在组件中灵活使用',
        '支持异步权限检查'
      ],
      codeExample: `const { canAccess, redirectPath } = useRouteGuard(['read'], ['user']);`
    },
    {
      id: 'async',
      title: '异步守卫 (AsyncRouteGuard)',
      description: '支持异步权限验证，适合复杂权限逻辑，提供加载状态',
      icon: '⚡',
      path: '/async-demo',
      features: [
        '支持异步权限验证',
        '适合复杂权限逻辑',
        '提供加载状态和错误处理',
        '支持多个异步权限检查'
      ],
      codeExample: `<AsyncRouteGuard permissionCheck={asyncPermissionCheck}>
  <Component />
</AsyncRouteGuard>`
    },
    {
      id: 'conditional',
      title: '条件守卫 (ConditionalGuard)',
      description: '通过条件渲染实现权限控制，适合简单的显示/隐藏逻辑',
      icon: '🎯',
      path: '/conditional-demo',
      features: [
        '使用简单，逻辑清晰',
        '适合简单的显示/隐藏场景',
        '支持复杂的条件组合',
        '性能开销最小'
      ],
      codeExample: `<ConditionalGuard condition={user && user.role === 'admin'}>
  <AdminPanel />
</ConditionalGuard>`
    }
  ];

  const renderGuardMethod = (method) => (
    <div key={method.id} className="guard-method">
      <div className="method-header">
        <span className="method-icon">{method.icon}</span>
        <h3>{method.title}</h3>
      </div>
      
      <p className="method-description">{method.description}</p>
      
      <div className="method-features">
        <h4>主要特性:</h4>
        <ul>
          {method.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
      
      <div className="method-code">
        <h4>使用示例:</h4>
        <pre><code>{method.codeExample}</code></pre>
      </div>
      
      <div className="method-actions">
        <Link to={method.path} className="btn-primary">
          查看演示
        </Link>
      </div>
    </div>
  );

  return (
    <div className="guard-overview">
      <div className="overview-header">
        <h1>🛡️ React Router 路由守卫概览</h1>
        <p>本项目展示了5种不同的路由守卫实现方式，每种方式都有其适用场景和优势</p>
      </div>

      <div className="user-status">
        <div className="status-card">
          <h3>👤 当前用户状态</h3>
          <div className="status-info">
            <p><strong>用户名:</strong> {user?.name || '未登录'}</p>
            <p><strong>角色:</strong> {roles.join(', ') || '无'}</p>
            <p><strong>权限:</strong> {permissions.join(', ') || '无'}</p>
          </div>
        </div>
      </div>

      <div className="guard-methods">
        {guardMethods.map(renderGuardMethod)}
      </div>

      <div className="overview-footer">
        <div className="comparison-table">
          <h3>📊 路由守卫方式对比</h3>
          <table>
            <thead>
              <tr>
                <th>方式</th>
                <th>复杂度</th>
                <th>复用性</th>
                <th>性能</th>
                <th>适用场景</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>组件守卫</td>
                <td>低</td>
                <td>中</td>
                <td>高</td>
                <td>单个组件权限控制</td>
              </tr>
              <tr>
                <td>高阶组件</td>
                <td>中</td>
                <td>高</td>
                <td>高</td>
                <td>批量权限控制</td>
              </tr>
              <tr>
                <td>Hook守卫</td>
                <td>中</td>
                <td>中</td>
                <td>高</td>
                <td>复杂权限逻辑</td>
              </tr>
              <tr>
                <td>异步守卫</td>
                <td>高</td>
                <td>中</td>
                <td>中</td>
                <td>异步权限验证</td>
              </tr>
              <tr>
                <td>条件守卫</td>
                <td>低</td>
                <td>低</td>
                <td>最高</td>
                <td>简单显示/隐藏</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="best-practices">
          <h3>💡 最佳实践建议</h3>
          <ul>
            <li><strong>简单场景:</strong> 使用组件守卫或条件守卫</li>
            <li><strong>批量控制:</strong> 使用高阶组件守卫</li>
            <li><strong>复杂逻辑:</strong> 使用Hook守卫</li>
            <li><strong>异步验证:</strong> 使用异步守卫</li>
            <li><strong>性能优先:</strong> 优先考虑条件守卫</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GuardOverview;
