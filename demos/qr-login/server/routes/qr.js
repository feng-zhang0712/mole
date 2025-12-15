const express = require('express');
const mongoose = require('mongoose');
const QRCode = require('../models/QRCode');
const Session = require('../models/Session');
const { verifyMobileToken, verifyTempToken } = require('../middleware/auth');
const { 
  qrCodeLimiter, 
  validateQRScan, 
  validateQRConfirm,
  antiReplay,
} = require('../middleware/security');

const router = express.Router();

// 生成二维码
router.post('/generate', qrCodeLimiter, async (req, res) => {
  try {
    const pcDeviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date(),
    };

    // 生成唯一的QR ID
    const qrId = QRCode.generateQRId();

    // 检查数据库连接状态
    if (mongoose.connection.readyState !== 1) {
      // 数据库未连接，返回模拟数据
      const expiresAt = new Date(Date.now() + 300000); // 5分钟后过期
      return res.json({
        success: true,
        message: '二维码生成成功（演示模式）',
        data: {
          qrId,
          expiresAt,
          status: 'generated',
        },
      });
    }

    // 创建二维码记录
    const qrCode = new QRCode({
      qrId,
      pcDeviceInfo,
      status: 'generated',
    });

    await qrCode.save();

    res.json({
      success: true,
      message: '二维码生成成功',
      data: {
        qrId,
        expiresAt: qrCode.expiresAt,
        status: qrCode.status,
      },
    });
  } catch (error) {
    console.error('二维码生成错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 查询二维码状态
router.get('/status/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;

    if (!qrId) {
      return res.status(400).json({
        success: false,
        message: '二维码ID不能为空',
      });
    }

    // 检查数据库连接状态
    if (mongoose.connection.readyState !== 1) {
      // 数据库未连接，返回模拟状态
      return res.json({
        success: true,
        message: '二维码状态查询成功（演示模式）',
        data: {
          qrId,
          status: 'generated',
          expiresAt: new Date(Date.now() + 300000),
          createdAt: new Date(),
        },
      });
    }

    const qrCode = await QRCode.findOne({ qrId });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: '二维码不存在',
      });
    }

    // 检查是否过期
    if (qrCode.isExpired()) {
      await qrCode.updateStatus('expired');
      return res.status(410).json({
        success: false,
        message: '二维码已过期',
        data: {
          qrId,
          status: 'expired',
          expiresAt: qrCode.expiresAt,
        },
      });
    }

    // 更新轮询时间
    await qrCode.updatePollTime();

    res.json({
      success: true,
      data: {
        qrId,
        status: qrCode.status,
        expiresAt: qrCode.expiresAt,
        lastPolledAt: qrCode.lastPolledAt,
      },
    });
  } catch (error) {
    console.error('查询二维码状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 移动端扫描二维码
router.post('/scan', validateQRScan, verifyMobileToken, async (req, res) => {
  try {
    const { qrId } = req.body;
    const user = req.user;

    // 查找二维码
    const qrCode = await QRCode.findOne({ qrId });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: '二维码不存在',
      });
    }

    // 检查二维码状态
    if (qrCode.status !== 'generated') {
      return res.status(400).json({
        success: false,
        message: `二维码状态无效，当前状态：${qrCode.status}`,
      });
    }

    // 检查是否过期
    if (qrCode.isExpired()) {
      await qrCode.updateStatus('expired');
      return res.status(410).json({
        success: false,
        message: '二维码已过期',
      });
    }

    // 绑定用户和生成临时Token
    qrCode.userId = user._id;
    qrCode.mobileToken = user.mobileToken;
    qrCode.status = 'pending_confirmation';
    
    const tempToken = qrCode.generateTempToken();
    await qrCode.save();

    res.json({
      success: true,
      message: '二维码扫描成功，请确认登录',
      data: {
        qrId,
        tempToken,
        status: qrCode.status,
        expiresAt: qrCode.expiresAt,
      },
    });
  } catch (error) {
    console.error('二维码扫描错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 移动端确认登录
router.post('/confirm', validateQRConfirm, verifyTempToken, antiReplay, async (req, res) => {
  try {
    const qrCode = req.qrCode;
    const user = req.user;

    // 检查二维码状态
    if (qrCode.status !== 'pending_confirmation') {
      return res.status(400).json({
        success: false,
        message: `二维码状态无效，当前状态：${qrCode.status}`,
      });
    }

    // 检查是否过期
    if (qrCode.isExpired()) {
      await qrCode.updateStatus('expired');
      return res.status(410).json({
        success: false,
        message: '二维码已过期',
      });
    }

    // 更新状态为已确认
    await qrCode.updateStatus('confirmed');

    // 生成PC端Token
    const pcToken = qrCode.generatePCToken();
    await qrCode.save();

    // 广播状态更新
    const broadcastQRStatusUpdate = req.app.get('broadcastQRStatusUpdate');
    if (broadcastQRStatusUpdate) {
      await broadcastQRStatusUpdate(qrCode.qrId, 'confirmed', {
        pcToken,
        userId: user._id,
        username: user.username,
      });
    }

    // 创建PC端会话
    const sessionId = Session.generateSessionId();
    const session = new Session({
      sessionId,
      userId: user._id,
      deviceInfo: qrCode.pcDeviceInfo,
      tokens: {
        accessToken: pcToken,
        refreshToken: Session.prototype.generateRefreshToken.call({ sessionId, userId: user._id }),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时
      },
      loginMethod: 'qr_code',
      qrId: qrCode.qrId,
    });

    await session.save();

    res.json({
      success: true,
      message: '登录确认成功',
      data: {
        qrId: qrCode.qrId,
        status: qrCode.status,
        confirmedAt: qrCode.confirmedAt,
        pcToken,
        sessionId,
      },
    });
  } catch (error) {
    console.error('登录确认错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 取消二维码登录
router.post('/cancel/:qrId', verifyMobileToken, async (req, res) => {
  try {
    const { qrId } = req.params;
    const user = req.user;

    const qrCode = await QRCode.findOne({ 
      qrId, 
      userId: user._id,
      status: { $in: ['generated', 'pending_confirmation'] },
    });

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: '二维码不存在或无权取消',
      });
    }

    // 更新状态为已取消
    await qrCode.updateStatus('cancelled');

    res.json({
      success: true,
      message: '二维码登录已取消',
      data: {
        qrId,
        status: qrCode.status,
      },
    });
  } catch (error) {
    console.error('取消二维码登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 获取二维码详情（用于调试）
router.get('/details/:qrId', async (req, res) => {
  try {
    const { qrId } = req.params;

    const qrCode = await QRCode.findOne({ qrId }).populate('userId', 'username email');

    if (!qrCode) {
      return res.status(404).json({
        success: false,
        message: '二维码不存在',
      });
    }

    res.json({
      success: true,
      data: {
        qrId: qrCode.qrId,
        status: qrCode.status,
        pcDeviceInfo: qrCode.pcDeviceInfo,
        userId: qrCode.userId,
        expiresAt: qrCode.expiresAt,
        createdAt: qrCode.createdAt,
        confirmedAt: qrCode.confirmedAt,
        lastPolledAt: qrCode.lastPolledAt,
      },
    });
  } catch (error) {
    console.error('获取二维码详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 清理过期的二维码
router.post('/cleanup', async (req, res) => {
  try {
    const deletedCount = await QRCode.cleanupExpired();
    
    res.json({
      success: true,
      message: `清理完成，删除了 ${deletedCount} 个过期二维码`,
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error('清理过期二维码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

module.exports = router;
