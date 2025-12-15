const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    platform: String,
  },
  tokens: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  loginMethod: {
    type: String,
    enum: ['password', 'qr_code'],
    required: true,
  },
  qrId: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// 生成会话ID
sessionSchema.statics.generateSessionId = function () {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
};

// 生成访问Token
sessionSchema.methods.generateAccessToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      sessionId: this.sessionId,
      userId: this.userId,
      type: 'access',
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024',
    { expiresIn: '1h' }
  );
};

// 生成刷新Token
sessionSchema.methods.generateRefreshToken = function () {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    {
      sessionId: this.sessionId,
      userId: this.userId,
      type: 'refresh',
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024',
    { expiresIn: '7d' }
  );
};

// 更新最后活动时间
sessionSchema.methods.updateActivity = function () {
  this.lastActivity = new Date();
  return this.save();
};

// 使会话失效
sessionSchema.methods.invalidate = function () {
  this.isActive = false;
  return this.save();
};

// 清理过期会话
sessionSchema.statics.cleanupExpired = async function () {
  const expiredCount = await this.deleteMany({
    $or: [
      { 'tokens.expiresAt': { $lt: new Date() } },
      { isActive: false },
    ],
  });
  return expiredCount.deletedCount;
};

module.exports = mongoose.model('Session', sessionSchema);
