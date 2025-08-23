# React Router Guard

一个完整的 React 路由守卫和权限控制演示项目，展示了多种实现方式和最佳实践。

## 项目特性

- 多种路由守卫实现方式：组件守卫、HOC 守卫、Hook 守卫、异步守卫。
- 完整的权限控制系统：基于角色（RBAC）和权限的访问控制。
- React Router v7：使用最新的 React Router API。
- 现代化技术栈：ES 模块、Webpack 5、React 19。
- 响应式设计：支持移动端和桌面端。
- 详细的代码注释：关键代码都有详细说明。

## 路由守卫实现方式

### 1. 组件守卫（RouteGuard）

```jsx
<RouteGuard requiredPermissions={['read', 'write']}>
  <ProtectedComponent />
</RouteGuard>
```

**特点：** 使用简单，适合包装单个组件，支持权限和角色验证。

### 2. 高阶组件守卫（withAuth）

```jsx
const ProtectedComponent = withAuth(Component, {
  requiredPermissions: ['admin'],
  requiredRoles: ['admin']
});
```

**特点：** 代码复用性高，适合批量应用权限控制，使用装饰器模式。

### 3. Hook 守卫（useRouteGuard）

```jsx
const { canAccess, redirectPath } = useRouteGuard(['read'], ['user']);
```

**特点：** 逻辑清晰，易于测试，支持复杂的权限判断逻辑，适合在组件内部使用。

### 4. 异步权限检查守卫（AsyncRouteGuard）

```jsx
<AsyncRouteGuard permissionCheck={asyncPermissionCheck}>
  <Component />
</AsyncRouteGuard>
```

**特点：** 支持异步权限验证，适合复杂权限逻辑，提供加载状态和错误处理。

### 5. 条件渲染守卫（ConditionalGuard）

```jsx
<ConditionalGuard condition={user && user.role === 'admin'}>
  <AdminPanel />
</ConditionalGuard>
```

**特点：** 使用简单，逻辑清晰，适合简单的显示/隐藏场景。

## 权限系统

### 用户角色

- 管理员 (admin)：拥有所有权限
- 普通用户 (user)：拥有读写权限
- 访客 (guest)：只有查看权限

### 权限级别

- read：查看权限
- write：编辑权限
- delete：删除权限
- admin：管理权限

## 项目结构

```text
demos/
├── public/
│   └── index.html          # HTML模板
├── src/
│   ├── components/
│   │   ├── guards/         # 路由守卫组件
│   │   │   └── RouteGuard.js
│   │   └── Layout.js       # 主布局组件
│   ├── contexts/
│   │   └── AuthContext.js  # 认证上下文
│   ├── pages/              # 页面组件
│   │   ├── Login.js        # 登录页面
│   │   ├── Dashboard.js    # 仪表板
│   │   ├── Profile.js      # 个人资料
│   │   ├── Admin.js        # 管理面板
│   │   ├── Settings.js     # 系统设置
│   │   ├── AdvancedDemo.js # 高级演示
│   │   ├── HocDemo.js      # HOC守卫演示
│   │   ├── HookDemo.js     # Hook守卫演示
│   │   ├── AsyncDemo.js    # 异步守卫演示
│   │   ├── ConditionalDemo.js # 条件守卫演示
│   │   ├── Unauthorized.js # 未授权页面
│   │   └── NotFound.js     # 404页面
│   ├── routes/
│   │   └── index.js        # 路由配置
│   ├── styles/
│   │   └── index.css       # 全局样式
│   └── index.js            # 应用入口
├── package.json            # 项目配置
├── webpack.config.js       # Webpack配置
└── README.md               # 项目说明
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 技术栈

- React 19 - 用户界面库
- React Router v7 - 路由管理
- Webpack 5 - 模块打包
- ES模块 - 现代 JavaScript 模块系统
- CSS3 - 样式和动画

## 📱 页面说明

### 公开页面

- 登录页面 (`/login`)：用户认证入口

### 受保护页面

- 仪表板 (`/dashboard`)：需要 `read` 权限
- 个人资料 (`/profile`)：需要 `read` 和 `write` 权限
- 管理面板 (`/admin`)：需要 `admin` 角色
- 系统设置 (`/settings`)：需要 `admin` 权限

### 系统页面

- 未授权页面 (`/unauthorized`)：权限不足时显示
- *04页面 (`/*`)：路由不存在时显示

## 使用示例

### 基本路由守卫

```jsx
import { RouteGuard } from './components/guards/RouteGuard';

// 需要特定权限
<RouteGuard requiredPermissions={['read', 'write']}>
  <ProfilePage />
</RouteGuard>

// 需要特定角色
<RouteGuard requiredRoles={['admin']}>
  <AdminPage />
</RouteGuard>
```

### 动态权限检查

```jsx
import { useRouteGuard } from './components/guards/RouteGuard';

const MyComponent = () => {
  const { canAccess, redirectPath } = useRouteGuard(['admin'], ['admin']);
  
  if (!canAccess) {
    return <Navigate to={redirectPath} />;
  }
  
  return <div>受保护的内容</div>;
};
```

## 安全特性

- 认证状态管理：JWT token和localStorage
- 权限验证：路由级别的权限检查
- 角色控制：基于角色的访问控制
- 自动重定向：权限不足时自动跳转
  状态持久化：页面刷新后保持登录状态

## 性能优化

- 懒加载：路由组件的按需加载
- 权限缓存：避免重复的权限检查
- 状态优化：使用useReducer管理复杂状态
- 响应式设计：移动端友好的用户界面

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 致谢

- React Router 团队提供的优秀路由解决方案
- React 社区的技术支持和贡献
- 所有为开源项目做出贡献的开发者

## 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 Issue
- 发送邮件
- 提交 Pull Request

---

注意，这是一个演示项目，生产环境使用时请根据实际需求调整安全策略和权限配置。
