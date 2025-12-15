const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// 安全头设置
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// 通用限流
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // 限制每个IP 100次请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// 二维码生成限流
const qrCodeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 10, // 限制每个IP每分钟10次二维码生成
  message: {
    success: false,
    message: '二维码生成过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 输入验证中间件
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.array(),
    });
  }
  next();
};


// 二维码扫描验证
const validateQRScan = [
  body('qrId')
    .isUUID()
    .withMessage('无效的二维码ID'),
  body('mobileToken')
    .notEmpty()
    .withMessage('移动端Token不能为空'),
  validateInput,
];

// 二维码确认验证
const validateQRConfirm = [
  body('tempToken')
    .notEmpty()
    .withMessage('临时Token不能为空'),
  validateInput,
];

// 防重放攻击中间件
const nonceStore = new Map();

const antiReplay = (req, res, next) => {
  const nonce = req.headers['x-nonce'];
  const timestamp = req.headers['x-timestamp'];
  
  if (!nonce || !timestamp) {
    return res.status(400).json({
      success: false,
      message: '缺少防重放攻击参数',
    });
  }

  const now = Date.now();
  const requestTime = parseInt(timestamp, 10);
  
  // 检查时间戳是否在合理范围内（5分钟内）
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return res.status(400).json({
      success: false,
      message: '请求时间戳无效',
    });
  }

  // 检查nonce是否已使用
  if (nonceStore.has(nonce)) {
    return res.status(400).json({
      success: false,
      message: '请求已被处理过',
    });
  }

  // 存储nonce（5分钟后自动清理）
  nonceStore.set(nonce, requestTime);
  setTimeout(() => {
    nonceStore.delete(nonce);
  }, 5 * 60 * 1000);

  next();
};

// 清理过期的nonce
setInterval(() => {
  const now = Date.now();
  for (const [nonce, timestamp] of nonceStore.entries()) {
    if (now - timestamp > 5 * 60 * 1000) {
      nonceStore.delete(nonce);
    }
  }
}, 60 * 1000); // 每分钟清理一次

// IP白名单检查（可选）
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (allowedIPs.length === 0) {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: '访问被拒绝',
      });
    }
    
    next();
  };
};

module.exports = {
  securityHeaders,
  generalLimiter,
  qrCodeLimiter,
  validateQRScan,
  validateQRConfirm,
  antiReplay,
  ipWhitelist,
};
