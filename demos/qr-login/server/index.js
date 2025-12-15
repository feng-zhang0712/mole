require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// 导入中间件
const { securityHeaders, generalLimiter } = require('./middleware/security');

// 导入路由
const authRoutes = require('./routes/auth');
const qrRoutes = require('./routes/qr');

// 导入模型
const QRCode = require('./models/QRCode');
const Session = require('./models/Session');

const app = express();
const server = http.createServer(app);

// Socket.IO 配置
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 中间件配置
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// 静态文件服务
app.use(express.static(path.join(__dirname, '../dist')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/qr', qrRoutes);

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log(`客户端连接: ${socket.id}`);

  // 加入二维码房间
  socket.on('join-qr-room', (qrId) => {
    socket.join(`qr-${qrId}`);
    console.log(`客户端 ${socket.id} 加入二维码房间: qr-${qrId}`);
  });

  // 离开二维码房间
  socket.on('leave-qr-room', (qrId) => {
    socket.leave(`qr-${qrId}`);
    console.log(`客户端 ${socket.id} 离开二维码房间: qr-${qrId}`);
  });

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`客户端断开连接: ${socket.id}`);
  });
});

// 二维码状态更新广播
const broadcastQRStatusUpdate = async (qrId, status, data = {}) => {
  try {
    io.to(`qr-${qrId}`).emit('qr-status-update', {
      qrId,
      status,
      timestamp: new Date(),
      ...data,
    });
    console.log(`广播二维码状态更新: ${qrId} -> ${status}`);
  } catch (error) {
    console.error('广播二维码状态更新错误:', error);
  }
};

// 将广播函数添加到app对象，供路由使用
app.set('broadcastQRStatusUpdate', broadcastQRStatusUpdate);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务器运行正常',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

// 404处理
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在',
  });
});

// SPA路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 数据库连接
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-login';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB连接成功');
    return true;
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    console.log('警告: 在没有数据库的情况下运行，某些功能可能不可用');
    // 不退出进程，允许在没有数据库的情况下运行
    return false;
  }
};

// 定期清理任务
const startCleanupTasks = (dbConnected) => {
  if (!dbConnected) {
    console.log('数据库未连接，跳过清理任务');
    return;
  }
  
  // 每5分钟清理一次过期的二维码
  setInterval(async () => {
    try {
      const deletedCount = await QRCode.cleanupExpired();
      if (deletedCount > 0) {
        console.log(`清理了 ${deletedCount} 个过期二维码`);
      }
    } catch (error) {
      console.error('清理过期二维码错误:', error);
    }
  }, 5 * 60 * 1000);

  // 每小时清理一次过期的会话
  setInterval(async () => {
    try {
      const deletedCount = await Session.cleanupExpired();
      if (deletedCount > 0) {
        console.log(`清理了 ${deletedCount} 个过期会话`);
      }
    } catch (error) {
      console.error('清理过期会话错误:', error);
    }
  }, 60 * 60 * 1000);
};

// 优雅关闭处理
const gracefulShutdown = () => {
  console.log('收到关闭信号，开始优雅关闭...');
  
  server.close(() => {
    console.log('HTTP服务器已关闭');
    process.exit(0);
  });

  // 强制关闭超时
  setTimeout(() => {
    console.error('强制关闭服务器');
    process.exit(1);
  }, 5000);
};

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  gracefulShutdown();
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// 启动服务器
const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    startCleanupTasks(dbConnected);
    
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`MongoDB: ${dbConnected ? '已连接' : '未连接'}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
