const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Session = require('../models/Session');
const { verifyToken } = require('../middleware/auth');
const { 
  antiReplay,
} = require('../middleware/security');

const router = express.Router();


// 获取用户信息
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -mobileToken');
    
    res.json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

// 更新用户信息
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (username && username !== user.username) {
      // 检查用户名是否已被使用
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已被使用',
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      // 检查邮箱是否已被使用
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被使用',
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});


// 刷新Token
router.post('/refresh', antiReplay, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '刷新Token不能为空',
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-qr-login-2024');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: '无效的刷新Token类型',
      });
    }

    const session = await Session.findOne({
      sessionId: decoded.sessionId,
      isActive: true,
    }).populate('userId');

    if (!session) {
      return res.status(401).json({
        success: false,
        message: '会话已失效',
      });
    }

    // 生成新的访问Token
    const newAccessToken = session.generateAccessToken();
    
    // 更新会话
    session.tokens.accessToken = newAccessToken;
    session.tokens.expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1小时
    await session.save();

    res.json({
      success: true,
      message: 'Token刷新成功',
      data: {
        accessToken: newAccessToken,
        expiresAt: session.tokens.expiresAt,
      },
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的刷新Token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '刷新Token已过期',
      });
    }
    
    console.error('Token刷新错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    });
  }
});

module.exports = router;
