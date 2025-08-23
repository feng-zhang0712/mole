# 🚀 快速开始指南

## 📋 前置要求

确保您的系统已安装：
- **Node.js** (版本 16 或更高)
- **npm** (通常随 Node.js 一起安装)

## ⚡ 一键启动

### macOS/Linux 用户
```bash
./start.sh
```

### Windows 用户
```cmd
start.bat
```

## 🔧 手动启动

### 1. 安装依赖
```bash
# 安装所有依赖
npm run install:all
```

### 2. 启动应用
```bash
# 启动所有应用
npm start
```

## 🌐 访问应用

启动成功后，在浏览器中访问：

- **主应用**: http://localhost:9000
- **用户管理**: http://localhost:9001
- **商品管理**: http://localhost:9002
- **数据分析**: http://localhost:9003

## 📱 功能演示

### 🏠 主应用
- 统一的导航界面
- 微应用切换
- 响应式设计

### 👥 用户管理
- 用户列表展示
- 添加/编辑/删除用户
- 角色权限管理
- 搜索和筛选

### 🛒 商品管理
- 商品信息管理
- 购物车功能
- 网格/列表视图
- 分类和排序

### 📊 数据分析
- 实时数据监控
- 图表可视化
- 数据洞察
- 报告导出

## 🛠️ 开发模式

### 单独启动应用
```bash
# 启动根应用
npm run start:root

# 启动特定微应用
npm run start:app1
npm run start:app2
npm run start:app3
```

### 构建生产版本
```bash
# 构建所有应用
npm run build

# 构建特定应用
npm run build:root
npm run build:app1
npm run build:app2
npm run build:app3
```

## 🔍 故障排除

### 端口被占用
如果某个端口被占用，可以修改对应应用的 `webpack.config.js` 文件中的端口配置。

### 依赖安装失败
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
npm run clean
npm run install:all
```

### 微应用无法加载
1. 确保所有应用都已启动
2. 检查浏览器控制台是否有错误
3. 确认 CORS 配置正确

## 📚 学习资源

- [Single-SPA 官方文档](https://single-spa.js.org/)
- [React 官方文档](https://reactjs.org/)
- [Webpack 官方文档](https://webpack.js.org/)

## 🤝 获取帮助

如果遇到问题：
1. 查看浏览器控制台错误信息
2. 检查 README.md 中的常见问题
3. 提交 Issue 描述问题

---

**开始您的微前端之旅！** 🎉
