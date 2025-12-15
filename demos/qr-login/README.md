# QR登录系统

一个基于二维码的登录系统，支持PC端和移动端之间的安全登录。

## 功能特性

- 🔐 安全的二维码登录流程
- 📱 移动端扫码确认
- 🔄 实时状态同步（WebSocket）
- 🛡️ 全面的安全机制
- 📊 用户管理控制台
- 🎨 现代化的UI设计

## 技术栈

### 前端
- React 18
- Webpack 5
- Socket.IO Client
- QRCode.js
- CSS3 (BEM命名规范)

### 后端
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO
- JWT认证
- bcryptjs密码加密

## 安全特性

- ✅ 二维码生命周期管理（5分钟过期）
- ✅ 实时状态同步
- ✅ JWT Token认证
- ✅ 防重放攻击（nonce + timestamp）
- ✅ 密码加密存储
- ✅ 登录尝试限制
- ✅ 会话管理
- ✅ HTTPS支持
- ✅ 安全头设置
- ✅ 输入验证

## 项目结构

```
qr-login/
├── server/                 # 服务器端代码
│   ├── models/            # 数据模型
│   ├── routes/            # API路由
│   ├── middleware/        # 中间件
│   └── index.js          # 服务器入口
├── src/                   # 客户端代码
│   ├── components/        # React组件
│   ├── contexts/          # React Context
│   ├── services/          # API服务
│   └── styles/           # CSS样式
├── public/                # 静态文件
├── package.json           # 依赖配置
├── webpack.config.js      # Webpack配置
└── README.md             # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境配置文件：
```bash
cp env.example .env
```

2. 修改 `.env` 文件中的配置：
```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/qr-login

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
TEMP_TOKEN_EXPIRES_IN=5m

# 二维码配置
QR_CODE_EXPIRES_IN=300000
QR_CODE_POLLING_INTERVAL=2000

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

### 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run server:dev  # 启动后端服务器
npm run client:dev  # 启动前端开发服务器
```

### 访问应用

- PC端：http://localhost:3000
- 移动端扫描页面：http://localhost:3000/qr-login?qrId=xxx

## 使用流程

### 1. PC端生成二维码
1. 访问 http://localhost:3000
2. 选择"使用二维码登录"
3. 点击"生成二维码"
4. 等待移动端扫描

### 2. 移动端扫描确认
1. 在手机上访问二维码中的URL
2. 输入移动端Token（需要先登录获取）
3. 点击"扫描二维码"
4. 确认登录

### 3. PC端自动登录
- PC端会自动检测到登录状态变化
- 跳转到用户控制台

## API文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 修改密码
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新Token

### 二维码接口

- `POST /api/qr/generate` - 生成二维码
- `GET /api/qr/status/:qrId` - 查询二维码状态
- `POST /api/qr/scan` - 扫描二维码
- `POST /api/qr/confirm` - 确认登录
- `POST /api/qr/cancel/:qrId` - 取消登录
- `GET /api/qr/details/:qrId` - 获取二维码详情

### WebSocket事件

- `join-qr-room` - 加入二维码房间
- `leave-qr-room` - 离开二维码房间
- `qr-status-update` - 二维码状态更新

## 部署

### 生产环境构建

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

### Docker部署

```bash
# 构建镜像
docker build -t qr-login .

# 运行容器
docker run -p 3001:3001 qr-login
```

## 开发规范

### 代码规范
- 使用Airbnb ESLint配置
- BEM CSS命名规范
- 组件化开发
- 函数式编程

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 安全注意事项

1. **生产环境配置**
   - 修改默认的JWT密钥
   - 使用HTTPS
   - 配置防火墙规则
   - 定期更新依赖

2. **数据库安全**
   - 使用强密码
   - 限制网络访问
   - 定期备份数据

3. **监控和日志**
   - 启用访问日志
   - 监控异常登录
   - 设置告警机制

## 故障排除

### 常见问题

1. **MongoDB连接失败**
   - 检查MongoDB服务是否启动
   - 验证连接字符串是否正确

2. **Socket连接失败**
   - 检查防火墙设置
   - 验证CORS配置

3. **二维码生成失败**
   - 检查网络连接
   - 验证API接口状态

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发者。
