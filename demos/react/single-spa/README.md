# 🚀 微前端项目 - Single-SPA 架构

这是一个基于 **Single-SPA** 架构的完整微前端项目，使用 React、Webpack 和 JavaScript 构建。

## 📋 项目概述

本项目演示了如何构建一个完整的微前端架构，包含：

- **根应用 (Root Application)**: 负责应用注册、路由管理和整体布局
- **微应用 1**: 用户管理系统
- **微应用 2**: 商品管理系统  
- **微应用 3**: 数据分析系统
- **共享包**: 可复用的组件和工具函数
- **工具包**: 通用工具函数库

## 🏗️ 架构特点

### ✨ 技术特性
- **独立部署**: 每个微应用可以独立开发、测试和部署
- **技术栈无关**: 支持不同的前端框架和技术栈
- **运行时集成**: 在浏览器中动态加载和集成微应用
- **共享依赖**: 通过模块联邦共享公共依赖
- **统一路由**: 集中的导航和路由管理

### 🔧 技术栈
- **框架**: React 18
- **构建工具**: Webpack 5
- **微前端框架**: Single-SPA
- **语言**: JavaScript (ES6+)
- **样式**: CSS3 + 响应式设计

## 📁 项目结构

```
spa/
├── root/                    # 根应用
│   ├── src/
│   │   ├── index.js        # 入口文件
│   │   ├── RootApp.jsx     # 主组件
│   │   └── index.css       # 样式文件
│   ├── public/
│   │   └── index.html      # HTML模板
│   ├── webpack.config.js   # Webpack配置
│   └── package.json        # 依赖配置
├── apps/                    # 微应用目录
│   ├── app1/               # 用户管理应用
│   ├── app2/               # 商品管理应用
│   └── app3/               # 数据分析应用
├── packages/                # 共享包
│   ├── shared/             # 共享组件和工具
│   └── utils/              # 工具函数库
├── package.json            # 根目录配置
└── README.md               # 项目文档
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者手动安装
npm install
cd root && npm install
cd ../apps/app1 && npm install
cd ../app2 && npm install
cd ../app3 && npm install
cd ../../packages/shared && npm install
cd ../utils && npm install
```

### 2. 启动开发环境

```bash
# 启动所有应用
npm start

# 或者分别启动
npm run start:root      # 根应用 (端口 9000)
npm run start:app1      # 应用1 (端口 9001)
npm run start:app2      # 应用2 (端口 9002)
npm run start:app3      # 应用3 (端口 9003)
```

### 3. 构建生产版本

```bash
# 构建所有应用
npm run build

# 或者分别构建
npm run build:root
npm run build:app1
npm run build:app2
npm run build:app3
```

## 🌐 访问地址

启动后，可以通过以下地址访问：

- **根应用**: http://localhost:9000
- **应用1 (用户管理)**: http://localhost:9001
- **应用2 (商品管理)**: http://localhost:9002
- **应用3 (数据分析)**: http://localhost:9003

## 📱 功能特性

### 🏠 根应用
- 统一的导航和布局
- 微应用注册和管理
- 路由控制和状态管理
- 响应式设计

### 👥 应用1 - 用户管理
- 用户信息的增删改查
- 角色和权限管理
- 搜索和筛选功能
- 数据统计展示

### 🛒 应用2 - 商品管理
- 商品信息管理
- 购物车功能
- 网格/列表视图切换
- 分类和排序

### 📊 应用3 - 数据分析
- 实时数据监控
- 图表可视化
- 数据洞察分析
- 报告导出功能

## 🔧 开发指南

### 添加新的微应用

1. 在 `apps/` 目录下创建新的应用目录
2. 配置 `package.json` 和 `webpack.config.js`
3. 实现 Single-SPA 生命周期函数
4. 在根应用中注册新应用

### 使用共享组件

```javascript
import { Button, Loading, Modal } from '@micro-frontend/shared';

// 使用组件
<Button variant="primary" size="medium">点击我</Button>
<Loading size="large" text="加载中..." />
<Modal isOpen={true} onClose={handleClose}>内容</Modal>
```

### 使用工具函数

```javascript
import { formatDate, debounce, storage } from '@micro-frontend/utils';

// 格式化日期
const formattedDate = formatDate(new Date(), 'YYYY-MM-DD HH:mm');

// 防抖函数
const debouncedSearch = debounce(searchFunction, 300);

// 本地存储
storage.set('user', { name: 'John' });
const user = storage.get('user');
```

## 📦 部署说明

### 开发环境
- 使用 `npm start` 启动所有服务
- 支持热重载和实时更新
- 跨域配置已预设

### 生产环境
1. 运行 `npm run build` 构建所有应用
2. 将构建产物部署到 Web 服务器
3. 确保所有微应用的路径配置正确
4. 配置适当的 CORS 策略

## 🐛 常见问题

### Q: 微应用无法加载？
A: 检查端口配置和 CORS 设置，确保所有应用都已启动。

### Q: 路由不工作？
A: 确认根应用的路由配置和微应用的路由规则匹配。

### Q: 样式冲突？
A: 使用 CSS 模块或确保样式作用域隔离。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 参与讨论

---

**享受微前端开发的乐趣！** 🎉
