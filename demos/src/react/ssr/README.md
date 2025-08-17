# SSR React App

一个完整的服务端渲染(SSR) React应用程序，解决了React SSR开发中的所有主要挑战。

## 🚀 特性

### ✅ 已解决的SSR核心问题

1. **数据获取和状态同步**
   - 服务端预取数据，避免客户端重复请求
   - 状态一致性保证，防止水合不匹配
   - 智能数据缓存策略

2. **路由处理**
   - 服务端和客户端路由协调
   - 动态路由参数处理
   - 404页面服务端处理

3. **组件生命周期兼容性**
   - 避免服务端使用浏览器API
   - 平滑的水合过程
   - 组件渲染差异处理

4. **样式处理**
   - 关键CSS内联，防止FOUC
   - CSS-in-JS服务端支持
   - 样式闪烁问题解决

5. **性能优化**
   - 代码分割和懒加载
   - 资源预加载
   - 压缩和缓存策略

6. **SEO和元数据**
   - 动态元标签生成
   - Open Graph和Twitter Card支持
   - 结构化数据处理

7. **错误处理**
   - 服务端错误边界
   - 优雅降级策略
   - 错误监控和报告

8. **构建和部署**
   - 分离的客户端和服务端构建
   - 环境变量配置
   - Docker容器化支持

## 🛠️ 技术栈

- **前端**: React 18, React Router v6, Styled Components
- **后端**: Node.js, Express.js
- **构建工具**: Webpack 5, Babel
- **开发工具**: Nodemon, Concurrently
- **模块系统**: ES Modules (ESM)
- **测试**: Jest, React Testing Library

## 📁 项目结构

```
ssr-react-app/
├── src/                    # 前端源代码
│   ├── components/         # 可复用组件
│   ├── pages/             # 页面组件
│   ├── context/           # React Context
│   ├── App.js             # 主应用组件
│   └── client.js          # 客户端入口
├── server/                 # 服务端代码
│   ├── utils/             # 工具函数
│   └── index.js           # 服务端入口
├── public/                 # 静态资源
├── dist/                   # 构建输出
├── webpack.config.js       # 客户端webpack配置
├── webpack.server.js       # 服务端webpack配置
└── package.json            # 项目配置
```

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将同时启动：
- 服务端开发服务器 (端口 3000)
- 客户端webpack开发服务器
- 热重载支持

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 🔧 开发脚本

- `npm run dev` - 开发模式（同时运行客户端和服务端）
- `npm run dev:server` - 仅启动服务端开发服务器
- `npm run dev:client` - 仅启动客户端webpack开发服务器
- `npm run build` - 构建生产版本
- `npm run build:client` - 构建客户端代码
- `npm run build:server` - 构建服务端代码
- `npm start` - 启动生产服务器
- `npm test` - 运行测试

## 🌐 访问地址

- **开发环境**: http://localhost:3000
- **健康检查**: http://localhost:3000/health
- **API端点**: http://localhost:3000/api/*

## 📊 性能特性

- **服务端渲染**: 首次加载性能优化
- **代码分割**: 按需加载，减少初始包大小
- **资源预加载**: 关键资源预加载
- **压缩**: Gzip压缩响应
- **缓存**: 静态资源缓存策略

## 🔒 安全特性

- **Helmet**: 安全头设置
- **CORS**: 跨域资源共享配置
- **XSS防护**: 状态序列化安全处理
- **内容安全策略**: CSP配置

## 🧪 测试

```bash
npm test                    # 运行所有测试
npm test -- --watch        # 监听模式
npm test -- --coverage     # 生成覆盖率报告
```

## 🐳 Docker支持

### 开发环境

```bash
docker-compose -f docker-compose.dev.yml up
```

### 生产环境

```bash
docker-compose up
```

## 📝 环境变量

复制 `env.example` 到 `.env` 并配置：

```bash
cp env.example .env
```

## 🤝 贡献

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: 为什么选择ESM而不是CommonJS？
A: ESM提供更好的模块系统、tree-shaking支持和现代JavaScript特性。

### Q: 如何处理服务端和客户端的状态同步？
A: 使用`isHydrated`标志和预加载状态，确保服务端数据不会在客户端重复获取。

### Q: 如何优化SEO？
A: 使用React Helmet动态生成元标签，服务端渲染确保搜索引擎可以正确索引内容。

### Q: 如何处理错误？
A: 实现错误边界、服务端错误处理和优雅降级策略。

## 🔗 相关链接

- [React官方文档](https://reactjs.org/)
- [React Router文档](https://reactrouter.com/)
- [Webpack文档](https://webpack.js.org/)
- [Express.js文档](https://expressjs.com/)
- [Jest测试框架](https://jestjs.io/)

---

**注意**: 这是一个完整的SSR React应用程序示例，展示了如何解决React SSR开发中的所有主要挑战。请根据您的具体需求进行调整和优化。
