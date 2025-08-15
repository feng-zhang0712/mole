# 🚀 React Router Guard Demo 快速开始

## 📋 前置要求

- Node.js 20.0.0 或更高版本
- npm 或 yarn 包管理器

## ⚡ 快速启动

### 1. 克隆项目
```bash
git clone <repository-url>
cd demos
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🔐 测试用户

项目包含三个测试用户，您可以使用以下凭据登录：

| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| `admin` | `password` | 管理员 | read, write, delete, admin |
| `user` | `password` | 普通用户 | read, write |
| `guest` | `password` | 访客 | read |

## 🛡️ 路由守卫演示

### 基本守卫
- **仪表板** (`/dashboard`) - 需要 `read` 权限
- **个人资料** (`/profile`) - 需要 `read` 和 `write` 权限
- **管理面板** (`/admin`) - 需要 `admin` 角色
- **系统设置** (`/settings`) - 需要 `admin` 权限

### 高级守卫
- **高级演示** (`/advanced`) - 展示时间、IP、设备等限制

## 🎯 功能特性

- ✅ 多种路由守卫实现方式
- ✅ 基于角色和权限的访问控制
- ✅ 高级权限控制（时间、IP、设备等）
- ✅ 响应式设计
- ✅ 完整的错误处理
- ✅ 详细的代码注释

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
demos/
├── src/
│   ├── components/guards/     # 路由守卫组件
│   ├── contexts/              # React Context
│   ├── pages/                 # 页面组件
│   ├── routes/                # 路由配置
│   └── styles/                # 样式文件
├── public/                    # 静态资源
├── package.json               # 项目配置
└── webpack.config.js          # Webpack配置
```

## 🚨 注意事项

- 这是一个演示项目，生产环境使用时请调整安全策略
- 所有权限检查都是前端模拟，实际项目中应该在后端实现
- 项目使用 React Router v7 的最新API

## 📞 获取帮助

如果遇到问题，请检查：
1. Node.js 版本是否符合要求
2. 依赖是否正确安装
3. 端口 3000 是否被占用

## 🎉 开始体验

现在您可以：
1. 使用不同用户登录体验权限控制
2. 尝试访问受保护的页面
3. 查看路由守卫的实现代码
4. 体验高级权限控制功能

祝您使用愉快！ 🎊
