// 全局状态管理器 - 用于微前端应用间的状态共享
class GlobalStateManager {
  constructor() {
    this.state = new Map();
    this.subscribers = new Map();
    this.history = [];
    this.maxHistorySize = 50;
  }

  // 设置状态
  setState(key, value, options = {}) {
    const oldValue = this.state.get(key);
    const newValue = value;
    
    // 记录历史
    this.addToHistory(key, oldValue, newValue);
    
    // 更新状态
    this.state.set(key, newValue);
    
    // 通知订阅者
    this.notifySubscribers(key, newValue, oldValue);
    
    // 广播状态变化到所有子应用
    if (options.broadcast !== false) {
      this.broadcastStateChange(key, newValue);
    }
    
    console.log(`State updated: ${key}`, { oldValue, newValue });
    
    return newValue;
  }

  // 获取状态
  getState(key, defaultValue = null) {
    return this.state.has(key) ? this.state.get(key) : defaultValue;
  }

  // 获取所有状态
  getAllState() {
    return Object.fromEntries(this.state);
  }

  // 删除状态
  deleteState(key) {
    const oldValue = this.state.get(key);
    this.state.delete(key);
    
    // 记录历史
    this.addToHistory(key, oldValue, undefined);
    
    // 通知订阅者
    this.notifySubscribers(key, undefined, oldValue);
    
    // 广播状态删除
    this.broadcastStateChange(key, undefined, 'deleted');
    
    console.log(`State deleted: ${key}`);
    
    return oldValue;
  }

  // 检查状态是否存在
  hasState(key) {
    return this.state.has(key);
  }

  // 订阅状态变化
  subscribe(key, callback, options = {}) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    
    const subscriber = {
      callback,
      options: {
        immediate: options.immediate || false,
        once: options.once || false,
        ...options
      }
    };
    
    this.subscribers.get(key).push(subscriber);
    
    // 如果设置了立即执行，则立即调用回调
    if (subscriber.options.immediate) {
      callback(this.getState(key), undefined);
    }
    
    // 返回取消订阅函数
    return () => this.unsubscribe(key, callback);
  }

  // 取消订阅
  unsubscribe(key, callback) {
    if (this.subscribers.has(key)) {
      const subscribers = this.subscribers.get(key);
      const index = subscribers.findIndex(sub => sub.callback === callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    }
  }

  // 通知订阅者
  notifySubscribers(key, newValue, oldValue) {
    if (this.subscribers.has(key)) {
      const subscribers = this.subscribers.get(key);
      
      // 过滤出需要执行的回调
      const toExecute = [];
      const toRemove = [];
      
      subscribers.forEach((subscriber, index) => {
        if (subscriber.options.once) {
          toRemove.push(index);
        }
        toExecute.push(subscriber.callback);
      });
      
      // 移除一次性订阅
      toRemove.reverse().forEach(index => {
        subscribers.splice(index, 1);
      });
      
      // 执行回调
      toExecute.forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error('Error in state subscriber callback:', error);
        }
      });
    }
  }

  // 添加历史记录
  addToHistory(key, oldValue, newValue) {
    const historyEntry = {
      key,
      oldValue,
      newValue,
      timestamp: Date.now(),
      action: newValue === undefined ? 'delete' : 'update'
    };
    
    this.history.push(historyEntry);
    
    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  // 获取历史记录
  getHistory(key = null) {
    if (key) {
      return this.history.filter(entry => entry.key === key);
    }
    return [...this.history];
  }

  // 撤销状态变化
  undo(key) {
    const keyHistory = this.getHistory(key);
    if (keyHistory.length > 1) {
      const previousEntry = keyHistory[keyHistory.length - 2];
      this.setState(key, previousEntry.newValue, { broadcast: false });
      return true;
    }
    return false;
  }

  // 广播状态变化到子应用
  broadcastStateChange(key, value, action = 'update') {
    const message = {
      type: 'stateChange',
      key,
      value,
      action,
      timestamp: Date.now()
    };
    
    // 通过postMessage发送到所有iframe
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow.postMessage(message, '*');
      } catch (error) {
        console.warn('Failed to broadcast state change to iframe:', error);
      }
    });
  }

  // 从子应用接收状态变化
  handleStateChangeFromChild(message) {
    const { key, value, action } = message;
    
    if (action === 'delete') {
      this.deleteState(key);
    } else {
      this.setState(key, value, { broadcast: false });
    }
  }

  // 重置状态
  reset() {
    const oldState = this.getAllState();
    
    this.state.clear();
    this.history = [];
    
    // 通知所有订阅者状态被重置
    Object.keys(oldState).forEach(key => {
      this.notifySubscribers(key, undefined, oldState[key]);
    });
    
    console.log('Global state reset');
  }

  // 获取状态统计信息
  getStats() {
    return {
      totalStates: this.state.size,
      totalSubscribers: Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0),
      totalHistory: this.history.length,
      activeKeys: Array.from(this.state.keys())
    };
  }
}

// 创建全局状态管理器实例
const globalState = new GlobalStateManager();

// 导出实例和工具函数
export default globalState;

// 工具函数
export const setGlobalState = (key, value, options) => 
  globalState.setState(key, value, options);

export const getGlobalState = (key, defaultValue) => 
  globalState.getState(key, defaultValue);

export const subscribeToState = (key, callback, options) => 
  globalState.subscribe(key, callback, options);

export const deleteGlobalState = (key) => 
  globalState.deleteState(key);
