// 微前端应用间通信工具
class MicroFrontendCommunication {
  constructor() {
    this.listeners = new Map();
    this.messageId = 0;
    this.pendingMessages = new Map();
  }

  // 发送消息到指定应用
  sendMessage(targetApp, type, data, options = {}) {
    const messageId = ++this.messageId;
    const message = {
      id: messageId,
      type,
      data,
      timestamp: Date.now(),
      source: 'main-app',
      target: targetApp,
      ...options
    };

    // 如果设置了需要响应，则等待响应
    if (options.requireResponse) {
      return new Promise((resolve, reject) => {
        this.pendingMessages.set(messageId, { resolve, reject });
        
        // 设置超时
        setTimeout(() => {
          if (this.pendingMessages.has(messageId)) {
            this.pendingMessages.delete(messageId);
            reject(new Error('Message timeout'));
          }
        }, options.timeout || 5000);
      });
    }

    // 发送消息
    this.broadcastMessage(message);
    return Promise.resolve();
  }

  // 广播消息到所有应用
  broadcastMessage(message) {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage(message, '*');
      } catch (error) {
        console.warn('Failed to send message to iframe:', error);
      }
    });
  }

  // 监听消息
  onMessage(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  // 移除消息监听
  offMessage(type, callback) {
    if (this.listeners.has(type)) {
      const callbacks = this.listeners.get(type);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 处理接收到的消息
  handleMessage(event) {
    const { data: message } = event;
    
    // 处理响应消息
    if (message.isResponse && this.pendingMessages.has(message.originalId)) {
      const { resolve } = this.pendingMessages.get(message.originalId);
      this.pendingMessages.delete(message.originalId);
      resolve(message.data);
      return;
    }

    // 触发监听器
    if (this.listeners.has(message.type)) {
      this.listeners.get(message.type).forEach(callback => {
        try {
          callback(message.data, message);
        } catch (error) {
          console.error('Error in message handler:', error);
        }
      });
    }
  }

  // 响应消息
  respondToMessage(originalMessage, data) {
    const response = {
      id: ++this.messageId,
      isResponse: true,
      originalId: originalMessage.id,
      data,
      timestamp: Date.now(),
      source: 'main-app',
      target: originalMessage.source
    };

    this.broadcastMessage(response);
  }

  // 初始化通信
  init() {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  // 销毁通信
  destroy() {
    window.removeEventListener('message', this.handleMessage.bind(this));
    this.listeners.clear();
    this.pendingMessages.clear();
  }
}

// 创建全局通信实例
const communication = new MicroFrontendCommunication();

// 导出通信实例和工具函数
export default communication;

// 工具函数
export const sendMessage = (targetApp, type, data, options) => 
  communication.sendMessage(targetApp, type, data, options);

export const onMessage = (type, callback) => 
  communication.onMessage(type, callback);

export const broadcastMessage = (type, data) => 
  communication.broadcastMessage({ type, data, timestamp: Date.now() });
