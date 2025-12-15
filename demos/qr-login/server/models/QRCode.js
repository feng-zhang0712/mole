const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  pcDeviceInfo: {
    userAgent: String,
    ip: String,
    timestamp: Date,
  },
  status: {
    type: String,
    enum: ['generated', 'pending_confirmation', 'confirmed', 'expired', 'cancelled'],
    default: 'generated',
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  mobileToken: {
    type: String,
    default: null,
  },
  tempToken: {
    type: String,
    default: null,
  },
  pcToken: {
    type: String,
    default: null,
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + parseInt(process.env.QR_CODE_EXPIRES_IN, 10) || 300000); // 5分钟
    },
    index: { expireAfterSeconds: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: {
    type: Date,
    default: null,
  },
  lastPolledAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// 生成唯一QR ID
qrCodeSchema.statics.generateQRId = function () {
  const { v4: uuidv4 } = require('uuid');
  return uuidv4();
};

// 生成临时Token
qrCodeSchema.methods.generateTempToken = function () {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { 
      qrId: this.qrId, 
      userId: this.userId,
      type: 'temp',
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024',
    { expiresIn: process.env.TEMP_TOKEN_EXPIRES_IN || '5m' }
  );
  this.tempToken = token;
  return token;
};

// 生成PC端Token
qrCodeSchema.methods.generatePCToken = function () {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { 
      qrId: this.qrId, 
      userId: this.userId,
      type: 'pc',
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
  this.pcToken = token;
  return token;
};

// 验证Token
qrCodeSchema.methods.verifyToken = function (token, type) {
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024');
    return decoded.type === type && decoded.qrId === this.qrId;
  } catch (error) {
    return false;
  }
};

// 更新状态
qrCodeSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  if (newStatus === 'confirmed') {
    this.confirmedAt = new Date();
  }
  return this.save();
};

// 检查是否过期
qrCodeSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// 更新轮询时间
qrCodeSchema.methods.updatePollTime = function () {
  this.lastPolledAt = new Date();
  return this.save();
};

// 清理过期的二维码
qrCodeSchema.statics.cleanupExpired = async function () {
  const expiredCount = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: 'expired' },
    ],
  });
  return expiredCount.deletedCount;
};

module.exports = mongoose.model('QRCode', qrCodeSchema);
