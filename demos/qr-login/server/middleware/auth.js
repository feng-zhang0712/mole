const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');

// 验证JWT Token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，未提供有效的认证令牌',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024');

    // 检查会话是否有效
    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      isActive: true,
    }).populate('userId');

    if (!session) {
      return res.status(401).json({
        success: false,
        message: '会话已失效，请重新登录',
      });
    }

    // 更新最后活动时间
    await session.updateActivity();

    req.user = session.userId;
    req.session = session;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期',
      });
    }
    
    console.error('Token验证错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 验证移动端Token
const verifyMobileToken = async (req, res, next) => {
  try {
    const { mobileToken } = req.body;
    
    if (!mobileToken) {
      return res.status(400).json({
        success: false,
        message: '移动端Token不能为空',
      });
    }

    const user = await User.findOne({ mobileToken });
    
    if (!user || !user.verifyMobileToken(mobileToken)) {
      return res.status(401).json({
        success: false,
        message: '无效的移动端Token',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('移动端Token验证错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 验证临时Token
const verifyTempToken = async (req, res, next) => {
  try {
    const { tempToken } = req.body;
    
    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: '临时Token不能为空',
      });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024');
    
    if (decoded.type !== 'temp') {
      return res.status(401).json({
        success: false,
        message: '无效的临时Token类型',
      });
    }

    const qrCode = await require('../models/QRCode').findOne({
      qrId: decoded.qrId,
      tempToken,
    });

    if (!qrCode || qrCode.isExpired()) {
      return res.status(401).json({
        success: false,
        message: '临时Token已过期或无效',
      });
    }

    req.qrCode = qrCode;
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的临时Token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '临时Token已过期',
      });
    }
    
    console.error('临时Token验证错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
};

// 可选的身份验证（用于某些不需要强制登录的接口）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024');

    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      isActive: true,
    }).populate('userId');

    if (session) {
      await session.updateActivity();
      req.user = session.userId;
      req.session = session;
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  verifyToken,
  verifyMobileToken,
  verifyTempToken,
  optionalAuth,
};
