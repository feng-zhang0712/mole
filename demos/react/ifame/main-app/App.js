import React, { useState, useEffect, useCallback, useMemo } from 'react';
import IframeManager from '../shared/iframe-manager';
import communication from '../shared/communication';
import globalState from '../shared/global-state';
import './App.css';

const App = () => {
  const [currentApp, setCurrentApp] = useState('app1');
  const [appStatus, setAppStatus] = useState('online');
  const [isLoading, setIsLoading] = useState(false);
  const [globalStateData, setGlobalStateData] = useState({});

  // 应用配置 - 使用useMemo优化
  const appConfigs = useMemo(() => ({
    app1: {
      id: 'app1',
      name: '用户管理',
      url: 'http://localhost:3001',
      port: 3001,
      title: '用户管理',
      icon: '👥',
      description: '用户信息管理、权限控制、角色分配'
    },
    app2: {
      id: 'app2',
      name: '产品管理',
      url: 'http://localhost:3002',
      port: 3002,
      title: '产品管理',
      icon: '📦',
      description: '产品信息管理、库存控制、价格管理'
    },
    app3: {
      id: 'app3',
      name: '数据分析',
      url: 'http://localhost:3003',
      port: 3003,
      title: '数据分析',
      icon: '📊',
      description: '数据可视化、报表生成、趋势分析'
    }
  }), []);

  // 初始化应用
  useEffect(() => {
    initializeApp();
    return () => {
      // 清理
      if (window.iframeManager) {
        window.iframeManager.destroy();
      }
      communication.destroy();
    };
  }, []);

  // 初始化应用
  const initializeApp = useCallback(async () => {
    try {
      // 初始化iframe管理器
      window.iframeManager = new IframeManager();
      window.iframeManager.init('iframe-container');

      // 注册所有应用
      Object.values(appConfigs).forEach(config => {
        window.iframeManager.registerApp(config.id, config);
      });

      // 初始化通信
      communication.init();

      // 设置全局状态监听
      setupGlobalStateListeners();

      // 设置通信监听
      setupCommunicationListeners();

      // 加载默认应用
      await loadApp('app1');

      console.log('主应用初始化完成');
    } catch (error) {
      console.error('主应用初始化失败:', error);
      setAppStatus('error');
    }
  }, []);

  // 设置全局状态监听
  const setupGlobalStateListeners = useCallback(() => {
    // 监听全局状态变化
    globalState.subscribe('userInfo', (newValue) => {
      console.log('用户信息更新:', newValue);
    });

    globalState.subscribe('theme', (newValue) => {
      console.log('主题更新:', newValue);
      document.body.className = newValue || '';
    });

    // 设置初始状态
    globalState.setState('theme', 'light');
    globalState.setState('userInfo', {
      id: 1,
      name: '管理员',
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    });
  }, []);

  // 设置通信监听
  const setupCommunicationListeners = useCallback(() => {
    // 监听子应用消息
    communication.onMessage('appReady', (data) => {
      console.log('子应用就绪:', data);
      setAppStatus('online');
    });

    communication.onMessage('appError', (data) => {
      console.error('子应用错误:', data);
      setAppStatus('error');
    });

    communication.onMessage('stateChange', (data) => {
      console.log('子应用状态变化:', data);
      // 同步到全局状态
      if (data.key && data.value !== undefined) {
        globalState.setState(data.key, data.value, { broadcast: false });
      }
    });

    communication.onMessage('navigation', (data) => {
      console.log('子应用导航请求:', data);
      // 处理子应用的导航请求
      if (data.targetApp && appConfigs[data.targetApp]) {
        loadApp(data.targetApp);
      }
    });
  }, []);

  // 加载应用
  const loadApp = useCallback(async (appId) => {
    if (!window.iframeManager) return;

    try {
      setIsLoading(true);
      setAppStatus('loading');
      
      await window.iframeManager.loadApp(appId);
      
      setCurrentApp(appId);
      setAppStatus('online');
      
      // 更新UI状态
      updateNavigationState(appId);
      
      // 发送应用加载完成消息
      communication.broadcastMessage('appLoaded', {
        appId,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(`加载应用失败: ${appId}`, error);
      setAppStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 更新导航状态
  const updateNavigationState = useCallback((activeAppId) => {
    // 等待DOM渲染完成后再更新状态
    setTimeout(() => {
      // 更新导航项状态
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        const appId = item.dataset.app;
        if (appId === activeAppId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });

      // 更新移动端导航
      const mobileNav = document.getElementById('mobile-nav');
      if (mobileNav) {
        mobileNav.value = activeAppId;
      }

      // 更新状态栏
      const currentAppSpan = document.getElementById('current-app');
      if (currentAppSpan) {
        currentAppSpan.textContent = appConfigs[activeAppId]?.name || '未知应用';
      }
    }, 100);
  }, []);

  // 处理导航点击
  const handleNavigation = useCallback((appId) => {
    if (appId === currentApp) return;
    loadApp(appId);
  }, [currentApp, loadApp]);

  // 处理移动端导航
  const handleMobileNavigation = useCallback((event) => {
    const appId = event.target.value;
    handleNavigation(appId);
  }, [handleNavigation]);

  // 发送消息到子应用
  const sendMessageToApp = useCallback((type, data) => {
    communication.sendMessage(currentApp, type, data);
  }, [currentApp]);

  // 获取全局状态
  const getGlobalState = useCallback((key) => {
    return globalState.getState(key);
  }, []);

  // 设置全局状态
  const setGlobalState = useCallback((key, value) => {
    globalState.setState(key, value);
  }, []);

  // 添加事件监听器
  useEffect(() => {
    // 等待DOM渲染完成后再添加事件监听器
    const timer = setTimeout(() => {
      // 桌面端导航
      const navItems = document.querySelectorAll('.nav-item');
      const clickHandlers = new Map();
      
      navItems.forEach(item => {
        const appId = item.dataset.app;
        const clickHandler = () => handleNavigation(appId);
        clickHandlers.set(item, clickHandler);
        item.addEventListener('click', clickHandler);
      });

      // 移动端导航
      const mobileNav = document.getElementById('mobile-nav');
      if (mobileNav) {
        mobileNav.addEventListener('change', handleMobileNavigation);
      }
      
      // 清理事件监听器
      return () => {
        clearTimeout(timer);
        navItems.forEach(item => {
          const handler = clickHandlers.get(item);
          if (handler) {
            item.removeEventListener('click', handler);
          }
        });
        
        if (mobileNav) {
          mobileNav.removeEventListener('change', handleMobileNavigation);
        }
      };
    }, 100);
  }, [handleNavigation, handleMobileNavigation]);

  // 暴露全局方法供子应用调用
  useEffect(() => {
    window.mainApp = {
      loadApp,
      sendMessage: sendMessageToApp,
      getGlobalState,
      setGlobalState,
      navigateTo: handleNavigation
    };
  }, [loadApp, sendMessageToApp, getGlobalState, setGlobalState, handleNavigation]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <a href="#" className="logo">🚀 微前端架构演示</a>
          <nav className="nav">
            {Object.values(appConfigs).map(config => (
              <div
                key={config.id}
                className={`nav-item ${currentApp === config.id ? 'active' : ''}`}
                data-app={config.id}
              >
                {config.icon} {config.name}
              </div>
            ))}
          </nav>
          <div className="responsive-nav">
            <select id="mobile-nav" value={currentApp}>
              {Object.values(appConfigs).map(config => (
                <option key={config.id} value={config.id}>
                  {config.icon} {config.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="iframe-container">
          {isLoading && (
            <div id="loading-indicator" className="loading-indicator">
              <div className="spinner"></div>
              <p>正在加载 {appConfigs[currentApp]?.name}...</p>
            </div>
          )}
          <div id="iframe-container"></div>
        </div>
      </main>
      
      <footer className="status-bar">
        <div className="status-content">
          <div className="app-info">
            <span>当前应用: <span id="current-app">{appConfigs[currentApp]?.name}</span></span>
            <span className={`app-status status-${appStatus}`} id="app-status">
              {appStatus === 'online' ? '在线' : 
               appStatus === 'loading' ? '加载中' : 
               appStatus === 'error' ? '错误' : '离线'}
            </span>
          </div>
          <div>
            <span>微前端架构演示 | 基于Iframe实现</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
