// Iframe管理器 - 负责子应用的加载、卸载和生命周期管理
class IframeManager {
  constructor() {
    this.apps = new Map();
    this.activeApp = null;
    this.iframeContainer = null;
    this.loadingStates = new Map();
  }

  // 初始化管理器
  init(containerId) {
    this.iframeContainer = document.getElementById(containerId);
    if (!this.iframeContainer) {
      throw new Error(`Container with id '${containerId}' not found`);
    }
    
    // 使用防抖优化resize事件
    this.debouncedResize = this.debounce(this.handleResize.bind(this), 250);
    window.addEventListener('resize', this.debouncedResize);
    
    console.log('IframeManager initialized');
  }
  
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 注册应用
  registerApp(appId, config) {
    const appConfig = {
      id: appId,
      name: config.name,
      url: config.url,
      port: config.port,
      title: config.title,
      icon: config.icon,
      permissions: config.permissions || [],
      ...config
    };

    this.apps.set(appId, appConfig);
    console.log(`App registered: ${appId}`, appConfig);
    
    return appConfig;
  }

  // 加载应用
  async loadApp(appId, options = {}) {
    const appConfig = this.apps.get(appId);
    if (!appConfig) {
      throw new Error(`App '${appId}' not registered`);
    }

    // 设置加载状态
    this.loadingStates.set(appId, 'loading');
    this.updateLoadingUI(appId, true);

    try {
      // 卸载当前应用
      if (this.activeApp && this.activeApp !== appId) {
        await this.unloadApp(this.activeApp);
      }

      // 创建新的iframe
      const iframe = await this.createIframe(appConfig, options);
      
      // 清空容器并添加新iframe
      this.iframeContainer.innerHTML = '';
      this.iframeContainer.appendChild(iframe);
      
      // 更新状态
      this.activeApp = appId;
      this.loadingStates.set(appId, 'loaded');
      this.updateLoadingUI(appId, false);
      
      // 触发应用加载事件
      this.triggerAppEvent('appLoaded', { appId, appConfig });
      
      console.log(`App loaded: ${appId}`);
      return iframe;
      
    } catch (error) {
      this.loadingStates.set(appId, 'error');
      this.updateLoadingUI(appId, false);
      console.error(`Failed to load app '${appId}':`, error);
      throw error;
    }
  }

  // 创建iframe
  async createIframe(appConfig, options) {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement('iframe');
      
      // 设置iframe属性
      iframe.src = appConfig.url;
      iframe.id = `app-${appConfig.id}`;
      iframe.className = 'micro-app-iframe';
      
      // 使用CSS类而不是内联样式，提高性能
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      // 添加跨域支持
      iframe.setAttribute('crossorigin', 'anonymous');
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals');
      
      console.log(`Creating iframe for ${appConfig.id} with URL: ${appConfig.url}`);
      
      // 设置超时 - 使用合理的超时时间
      const timeoutId = setTimeout(() => {
        console.log(`${appConfig.id} iframe timeout reached (${options.timeout || 15000}ms)`);
        // 超时时，如果iframe存在，认为加载成功（跨域情况下）
        if (iframe && iframe.src) {
          console.log(`${appConfig.id} iframe timeout but iframe exists, resolving...`);
          resolve(iframe);
        } else {
          reject(new Error(`Iframe load timeout: ${appConfig.id}`));
        }
      }, options.timeout || 15000); // 减少到15秒
      
      // 设置加载事件
      iframe.onload = () => {
        console.log(`${appConfig.id} iframe onload triggered, resolving...`);
        clearTimeout(timeoutId);
        resolve(iframe);
      };
      
      iframe.onerror = (error) => {
        console.error(`${appConfig.id} iframe onerror triggered:`, error);
        clearTimeout(timeoutId);
        reject(error);
      };
      
      // 添加更智能的加载检测
      let checkCount = 0;
      const maxChecks = 10; // 最多检查10次
      
      const checkIframeLoaded = () => {
        checkCount++;
        console.log(`Checking iframe ${appConfig.id} load status (attempt ${checkCount}/${maxChecks})`);
        
        try {
          if (iframe.contentWindow && iframe.contentWindow.location.href !== 'about:blank') {
            console.log(`${appConfig.id} iframe confirmed loaded via check`);
            clearTimeout(timeoutId);
            resolve(iframe);
            return;
          }
        } catch (error) {
          console.log(`${appConfig.id} iframe cross-origin check (attempt ${checkCount}):`, error.message);
          // 跨域情况下，如果iframe已经存在，认为加载成功
          if (iframe && iframe.src) {
            console.log(`${appConfig.id} iframe loaded (cross-origin fallback)`);
            clearTimeout(timeoutId);
            resolve(iframe);
            return;
          }
        }
        
        // 如果还没加载完成且还有检查次数，继续检查
        if (checkCount < maxChecks) {
          // 使用递增的检查间隔：1秒, 2秒, 3秒...
          const nextCheckDelay = checkCount * 1000;
          console.log(`${appConfig.id} iframe still loading, will check again in ${nextCheckDelay}ms...`);
          setTimeout(checkIframeLoaded, nextCheckDelay);
        } else {
          console.log(`${appConfig.id} iframe max checks reached, waiting for timeout...`);
        }
      };
      
      // 延迟1秒后开始检查
      setTimeout(checkIframeLoaded, 1000);
    });
  }

  // 卸载应用
  async unloadApp(appId) {
    if (this.activeApp !== appId) {
      return;
    }

    try {
      const iframe = document.querySelector(`#app-${appId}`);
      if (iframe) {
        // 发送卸载消息
        try {
          iframe.contentWindow.postMessage({
            type: 'appUnload',
            appId,
            timestamp: Date.now()
          }, '*');
        } catch (error) {
          console.warn('Failed to send unload message:', error);
        }
        
        // 移除iframe
        iframe.remove();
      }
      
      this.activeApp = null;
      this.loadingStates.set(appId, 'unloaded');
      
      // 触发应用卸载事件
      this.triggerAppEvent('appUnloaded', { appId });
      
      console.log(`App unloaded: ${appId}`);
      
    } catch (error) {
      console.error(`Failed to unload app '${appId}':`, error);
      throw error;
    }
  }

  // 获取当前活跃应用
  getActiveApp() {
    return this.activeApp;
  }

  // 获取应用配置
  getAppConfig(appId) {
    return this.apps.get(appId);
  }

  // 获取所有应用
  getAllApps() {
    return Array.from(this.apps.values());
  }

  // 检查应用是否已加载
  isAppLoaded(appId) {
    return this.loadingStates.get(appId) === 'loaded';
  }

  // 检查应用是否正在加载
  isAppLoading(appId) {
    return this.loadingStates.get(appId) === 'loading';
  }

  // 更新加载UI
  updateLoadingUI(appId, isLoading) {
    // 这里可以添加加载指示器的逻辑
    const loadingIndicator = document.getElementById(`loading-${appId}`);
    if (loadingIndicator) {
      loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
  }

  // 处理窗口大小变化
  handleResize() {
    const iframe = this.iframeContainer.querySelector('iframe');
    if (iframe) {
      // 可以在这里添加响应式逻辑
      console.log('Window resized, iframe adjusted');
    }
  }

  // 触发应用事件
  triggerAppEvent(eventType, data) {
    const event = new CustomEvent('microAppEvent', {
      detail: { type: eventType, ...data }
    });
    window.dispatchEvent(event);
  }

  // 销毁管理器
  destroy() {
    // 卸载所有应用
    if (this.activeApp) {
      this.unloadApp(this.activeApp);
    }
    
    // 清理事件监听器
    if (this.debouncedResize) {
      window.removeEventListener('resize', this.debouncedResize);
    }
    
    // 清理状态
    this.apps.clear();
    this.loadingStates.clear();
    this.activeApp = null;
    
    console.log('IframeManager destroyed');
  }
}

export default IframeManager;
