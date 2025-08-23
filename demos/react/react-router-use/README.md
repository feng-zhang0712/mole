# React Router 路由嵌套与动态路由示例

这是一个专门展示 React Router 核心功能的示例项目，重点演示：

- 🚀 **路由嵌套和层级管理**
- 🔗 **动态路由参数处理**
- ❌ **404页面处理**
- 🧭 **多种导航方式**
- ⚡ **路由懒加载和代码分割**
- 🎯 **智能预加载和性能优化**

## 项目特性

### 1. 路由嵌套 (Nested Routes)
- 使用 `Outlet` 组件实现布局复用
- 三层嵌套路由：Layout → UserProfile → UserSettings
- 公共导航栏和页脚在所有页面保持一致

### 2. 动态路由参数 (Dynamic Route Parameters)
- 产品详情页使用 `:id` 参数
- 通过 `useParams()` hook 获取参数值
- 支持参数验证和错误处理

### 3. 404页面处理 (Catch-all Routes)
- 使用 `path="*"` 匹配所有未定义路由
- 提供多种返回方式，提升用户体验
- 包含详细的错误信息和调试数据

### 4. 多种导航方式
- **声明式导航**: `Link` 组件
- **编程式导航**: `useNavigate()` hook
- **相对导航**: `navigate(-1)` 返回上一页
- **带状态导航**: 传递额外数据

### 5. 路由懒加载和代码分割
- **React.lazy()**: 使用Suspense实现组件懒加载
- **代码分割**: Webpack自动将代码拆分为多个chunk
- **智能预加载**: 鼠标悬停时预加载对应路由
- **错误边界**: 优雅处理懒加载错误

### 6. 性能优化特性
- **加载状态**: 美观的加载动画和骨架屏
- **性能监控**: 实时显示加载时间和chunk数量
- **Bundle优化**: 第三方库和公共代码分离
- **缓存策略**: 基于内容哈希的文件命名

## 项目结构

```
src/
├── components/
│   ├── Layout.js              # 主布局组件，包含导航栏和页脚
│   ├── LoadingSpinner.js      # 加载状态组件
│   └── PerformanceMonitor.js  # 性能监控组件
├── pages/
│   ├── Home.js                # 首页
│   ├── About.js               # 关于页面
│   ├── Products.js            # 产品列表页
│   ├── ProductDetail.js       # 产品详情页（动态路由）
│   ├── UserProfile.js         # 用户中心（嵌套路由）
│   ├── UserSettings.js        # 用户设置（子路由）
│   └── NotFound.js            # 404页面
├── utils/
│   ├── lazyLoad.js            # 懒加载工具函数
│   └── preload.js             # 路由预加载工具
├── App.js                     # 主应用组件，路由配置
├── index.js                   # 应用入口
└── styles.css                 # 样式文件
```

## 路由配置说明

### 主要路由结构
```jsx
<Routes>
  {/* 根路径重定向 */}
  <Route path="/" element={<Navigate to="/home" replace />} />
  
  {/* 主布局路由 */}
  <Route path="/" element={<Layout />}>
    <Route path="home" element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="products" element={<Products />} />
    <Route path="products/:id" element={<ProductDetail />} />
    <Route path="user" element={<UserProfile />}>
      <Route path="settings" element={<UserSettings />} />
    </Route>
  </Route>
  
  {/* 404页面 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 关键概念

1. **Outlet 组件**: 渲染子路由内容，实现路由嵌套
2. **动态参数**: `:id` 等占位符捕获URL中的值
3. **Catch-all 路由**: `path="*"` 匹配所有未定义路由
4. **重定向**: `Navigate` 组件实现页面重定向

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

## 功能演示

### 路由嵌套测试
1. 访问 `/user` - 查看用户中心主页面
2. 访问 `/user/settings` - 查看设置页面（嵌套路由）
3. 观察侧边栏和导航的一致性

### 动态路由测试
1. 访问 `/products` - 查看产品列表
2. 点击"查看详情" - 跳转到 `/products/1` 等动态路由
3. 尝试访问 `/products/999` - 测试不存在的产品

### 404页面测试
1. 访问任意不存在的路径，如 `/invalid-path`
2. 观察404页面的显示
3. 测试各种返回方式

## 技术栈

- **React 18** - 最新版本的React
- **React Router 6** - 最新版本的路由库
- **Webpack 5** - 模块打包工具
- **Babel** - JavaScript编译器
- **ES6+** - 现代JavaScript语法

## 学习要点

1. **路由嵌套**: 理解 `Outlet` 组件的作用和嵌套路由的配置
2. **动态参数**: 掌握 `useParams()` hook 的使用和参数处理
3. **错误处理**: 学习404页面的实现和用户体验优化
4. **导航方式**: 了解不同导航方式的适用场景
5. **状态管理**: 理解路由状态和组件状态的关系

## 扩展建议

- 添加路由守卫（权限控制）
- 实现路由懒加载
- 添加路由动画效果
- 集成状态管理库（Redux/Zustand）
- 添加单元测试

---

这个项目展示了 React Router 的核心功能，代码简洁但功能完整，是学习现代前端路由的绝佳示例。
