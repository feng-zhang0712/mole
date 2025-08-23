# 🚀 微前端架构快速开始指南

## 📋 项目概述

这是一个完整的基于Iframe的微前端架构演示项目，展示了微前端的核心概念和最佳实践。

## ⚡ 快速启动

### 1. 环境要求
- Node.js 16+ 
- npm 8+

### 2. 安装依赖
```bash
cd demos
npm install
```

### 3. 启动开发服务器
```bash
# 方式1: 使用启动脚本（推荐）
./start.sh

# 方式2: 手动启动所有服务
npm run dev

# 方式3: 分别启动各个应用
npm run dev:main    # 主应用 (端口 3000)
npm run dev:app1    # 用户管理 (端口 3001)
npm run dev:app2    # 产品管理 (端口 3002)
npm run dev:app3    # 数据分析 (端口 3003)
```

### 4. 访问应用
- **主应用**: http://localhost:3000
- **用户管理**: http://localhost:3001
- **产品管理**: http://localhost:3002
- **数据分析**: http://localhost:3003
- **测试页面**: 打开 `test.html` 文件

## 🏗️ 项目结构

```
demos/
├── main-app/              # 主应用（容器应用）
│   ├── index.html        # HTML模板
│   ├── index.js          # React入口
│   ├── App.js            # 主组件
│   └── App.css           # 样式文件
├── app1/                  # 子应用1 - 用户管理
│   ├── index.html        # HTML模板
│   ├── index.js          # React入口
│   ├── UserManagementApp.js  # 主组件
│   └── UserManagementApp.css # 样式文件
├── app2/                  # 子应用2 - 产品管理
│   ├── index.html        # HTML模板
│   ├── index.js          # React入口
│   ├── ProductManagementApp.js  # 主组件
│   └── ProductManagementApp.css # 样式文件
├── app3/                  # 子应用3 - 数据分析
│   ├── index.html        # HTML模板
│   ├── index.js          # React入口
│   ├── DataAnalyticsApp.js     # 主组件
│   └── DataAnalyticsApp.css    # 样式文件
├── shared/                # 共享组件和工具
│   ├── communication.js   # 通信工具
│   ├── iframe-manager.js  # Iframe管理器
│   └── global-state.js    # 全局状态管理
├── webpack.*.config.js    # 各应用的构建配置
├── package.json           # 项目依赖和脚本
├── start.sh              # 启动脚本
├── test.html             # 测试页面
└── README.md             # 项目说明
```

## 🔧 构建和部署

### 开发模式
```bash
npm run dev
```

### 生产构建
```bash
# 构建所有应用
npm run build

# 分别构建
npm run build:main
npm run build:app1
npm run build:app2
npm run build:app3
```

### 启动生产服务
```bash
npm start
```

## 🧪 测试和验证

### 1. 使用测试页面
打开 `test.html` 文件，点击各个测试按钮验证应用功能。

### 2. 手动测试
- 访问各个应用端口，确认页面正常加载
- 在主应用中切换不同子应用
- 检查浏览器控制台的通信日志

### 3. 功能验证
- ✅ 应用独立加载
- ✅ 跨应用通信
- ✅ 状态共享
- ✅ 响应式设计

## 🚨 常见问题

### Q: 启动时报错 "端口被占用"
**A**: 检查端口3000-3003是否被其他服务占用，可以修改webpack配置文件中的端口号。

### Q: 子应用加载失败
**A**: 确保所有子应用都已启动，检查网络连接和防火墙设置。

### Q: 通信不工作
**A**: 检查浏览器控制台是否有错误信息，确认postMessage API正常工作。

### Q: 样式问题
**A**: 确保CSS文件已正确创建，检查webpack配置中的样式加载器。

## 📚 学习资源

- **架构文档**: `ARCHITECTURE.md`
- **项目说明**: `README.md`
- **代码注释**: 查看各个JS文件中的详细注释

## 🎯 下一步

1. **理解架构**: 阅读 `ARCHITECTURE.md` 了解设计思路
2. **修改应用**: 尝试修改子应用的功能和样式
3. **添加新应用**: 按照现有模式创建新的子应用
4. **扩展功能**: 添加更多微前端特性，如路由管理、权限控制等

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**🎉 恭喜！你已经成功启动了一个完整的微前端架构项目！**
