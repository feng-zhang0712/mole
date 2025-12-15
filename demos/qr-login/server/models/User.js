const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  mobileToken: {
    type: String,
    default: null,
  },
  mobileTokenExpires: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});


// 生成移动端Token
userSchema.methods.generateMobileToken = function () {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.mobileToken = token;
  this.mobileTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时
  return token;
};

// 验证移动端Token
userSchema.methods.verifyMobileToken = function (token) {
  return this.mobileToken === token && this.mobileTokenExpires > new Date();
};


module.exports = mongoose.model('User', userSchema);
