// MongoDB初始化脚本
db = db.getSiblingDB('qr-login');

// 创建用户
db.createUser({
  user: 'qr-login-user',
  pwd: 'qr-login-password',
  roles: [
    {
      role: 'readWrite',
      db: 'qr-login'
    }
  ]
});

// 创建集合和索引
db.createCollection('users');
db.createCollection('qrcodes');
db.createCollection('sessions');

// 为用户集合创建索引
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ mobileToken: 1 });

// 为二维码集合创建索引
db.qrcodes.createIndex({ qrId: 1 }, { unique: true });
db.qrcodes.createIndex({ status: 1 });
db.qrcodes.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.qrcodes.createIndex({ userId: 1 });

// 为会话集合创建索引
db.sessions.createIndex({ sessionId: 1 }, { unique: true });
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ isActive: 1 });
db.sessions.createIndex({ 'tokens.expiresAt': 1 });

print('MongoDB初始化完成');
