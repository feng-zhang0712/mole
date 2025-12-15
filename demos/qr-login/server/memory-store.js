// 内存存储，用于演示（生产环境请使用数据库）
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.qrcodes = new Map();
    this.sessions = new Map();
  }

  // 用户相关操作
  async createUser(userData) {
    const user = {
      _id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user._id, user);
    return user;
  }

  async findUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id) {
    return this.users.get(id) || null;
  }

  async updateUser(id, updateData) {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return null;
  }

  // 二维码相关操作
  async createQRCode(qrData) {
    const qrcode = {
      _id: this.generateId(),
      ...qrData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.qrcodes.set(qrcode._id, qrcode);
    return qrcode;
  }

  async findQRCodeById(id) {
    return this.qrcodes.get(id) || null;
  }

  async updateQRCode(id, updateData) {
    const qrcode = this.qrcodes.get(id);
    if (qrcode) {
      const updatedQRCode = { ...qrcode, ...updateData, updatedAt: new Date() };
      this.qrcodes.set(id, updatedQRCode);
      return updatedQRCode;
    }
    return null;
  }

  async deleteQRCode(id) {
    return this.qrcodes.delete(id);
  }

  // 会话相关操作
  async createSession(sessionData) {
    const session = {
      _id: this.generateId(),
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sessions.set(session._id, session);
    return session;
  }

  async findSessionById(id) {
    return this.sessions.get(id) || null;
  }

  async updateSession(id, updateData) {
    const session = this.sessions.get(id);
    if (session) {
      const updatedSession = { ...session, ...updateData, updatedAt: new Date() };
      this.sessions.set(id, updatedSession);
      return updatedSession;
    }
    return null;
  }

  async deleteSession(id) {
    return this.sessions.delete(id);
  }

  // 清理过期数据
  async cleanupExpiredData() {
    const now = new Date();
    
    // 清理过期的二维码
    for (const [id, qrcode] of this.qrcodes.entries()) {
      if (qrcode.expiresAt && qrcode.expiresAt < now) {
        this.qrcodes.delete(id);
      }
    }

    // 清理过期的会话
    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt && session.expiresAt < now) {
        this.sessions.delete(id);
      }
    }
  }

  // 生成ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

module.exports = new MemoryStore();
