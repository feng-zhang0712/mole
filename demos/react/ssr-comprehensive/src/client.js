/**
 * 客户端入口文件 - 解决客户端激活(Hydration)问题
 * 将服务端渲染的HTML与客户端JavaScript代码结合
 */

import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.js';
import { DataProvider } from './context/DataContext.js';

// 环境检测和错误处理
const isClientSide = typeof window !== 'undefined';

if (!isClientSide) {
  console.error('客户端代码在服务端环境运行，这不应该发生');
  throw new Error('客户端代码不应该在服务端运行');
}

/**
 * 客户端应用启动函数
 */
function startClientApp() {
  console.log('🚀 启动客户端应用...');
  
  // 性能监控
  const startTime = performance.now();
  window.__SSR_METRICS__ = window.__SSR_METRICS__ || {};
  window.__SSR_METRICS__.clientStartTime = startTime;
  
  try {
    // 获取DOM容器
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('找不到根元素 #root');
    }
    
    // 获取服务端传递的初始数据
    const initialData = window.__INITIAL_DATA__ || {};
    console.log('📦 获取到初始数据:', Object.keys(initialData));
    
    // 创建客户端应用
    const ClientApp = () => (
      <DataProvider value={{
        ...initialData,
        isServer: false,
        isHydrated: false // 初始时未激活，将在DataContext中设置为true
      }}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataProvider>
    );
    
    // 执行客户端激活 - 关键步骤
    console.log('💧 开始客户端激活(Hydration)...');
    
    const root = hydrateRoot(rootElement, <ClientApp />);
    
    // 激活成功回调
    const onHydrationComplete = () => {
      const endTime = performance.now();
      const hydrationTime = endTime - startTime;
      
      // 设置激活完成标志
      window.__CLIENT_HYDRATED__ = true;
      window.__SSR_METRICS__.hydrationTime = hydrationTime;
      
      console.log(`✅ 客户端激活完成! 耗时: ${hydrationTime.toFixed(2)}ms`);
      
      // 清理加载状态
      removeLoadingStates();
      
      // 报告性能指标
      reportPerformanceMetrics();
      
      // 启用服务工作者(如果需要)
      registerServiceWorker();
    };
    
    // 监听激活完成 - React 18的新方式
    setTimeout(() => {
      if (window.__CLIENT_HYDRATED__) {
        onHydrationComplete();
      } else {
        // 如果激活时间过长，显示警告
        console.warn('⚠️ 客户端激活时间较长，可能存在问题');
      }
    }, 100);
    
    // 设置激活超时处理
    setTimeout(() => {
      if (!window.__CLIENT_HYDRATED__) {
        console.error('❌ 客户端激活超时');
        handleHydrationTimeout();
      }
    }, 5000); // 5秒超时
    
  } catch (error) {
    console.error('❌ 客户端激活失败:', error);
    handleHydrationError(error);
  }
}

/**
 * 移除加载状态元素
 */
function removeLoadingStates() {
  // 移除服务端渲染的加载状态
  const loadingElements = document.querySelectorAll('.ssr-loading, .loading');
  loadingElements.forEach(element => {
    element.remove();
  });
}

/**
 * 处理激活超时
 */
function handleHydrationTimeout() {
  console.error('客户端激活超时，尝试强制重新渲染');
  
  // 显示用户友好的错误信息
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ffc107;
      color: #856404;
      padding: 15px;
      text-align: center;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      ⚠️ 页面加载遇到问题，<a href="#" onclick="window.location.reload()" style="color: #856404; text-decoration: underline;">点击刷新</a>
    </div>
  `;
  document.body.appendChild(errorDiv);
}

/**
 * 处理激活错误
 */
function handleHydrationError(error) {
  // 尝试降级到客户端渲染
  console.log('🔄 尝试降级到客户端渲染...');
  
  try {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      // 清空服务端内容
      rootElement.innerHTML = '<div class="loading">正在重新加载...</div>';
      
      // 使用createRoot而不是hydrateRoot
      import('react-dom/client').then(({ createRoot }) => {
        const initialData = window.__INITIAL_DATA__ || {};
        
        const ClientApp = () => (
          <DataProvider value={{
            ...initialData,
            isServer: false,
            isHydrated: true
          }}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </DataProvider>
        );
        
        const root = createRoot(rootElement);
        root.render(<ClientApp />);
        
        console.log('✅ 降级到客户端渲染成功');
        window.__CLIENT_HYDRATED__ = true;
      });
    }
  } catch (fallbackError) {
    console.error('❌ 降级渲染也失败了:', fallbackError);
    showFallbackUI();
  }
}

/**
 * 显示最终降级UI
 */
function showFallbackUI() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <h1 style="color: #dc3545; margin-bottom: 20px;">⚠️ 应用启动失败</h1>
        <p style="color: #6c757d; margin-bottom: 30px;">抱歉，应用程序无法正常启动。</p>
        <button onclick="window.location.reload()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
        ">
          刷新页面
        </button>
      </div>
    `;
  }
}

/**
 * 报告性能指标
 */
function reportPerformanceMetrics() {
  const metrics = window.__SSR_METRICS__;
  if (!metrics) return;
  
  const performanceData = {
    hydrationTime: metrics.hydrationTime,
    totalTime: performance.now() - (metrics.serverRenderStart || 0),
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.log('📊 性能指标:', performanceData);
  
  // 在生产环境中，可以发送到分析服务
  if (process.env.NODE_ENV === 'production') {
    // 这里可以发送到Google Analytics、PostHog等服务
    // sendToAnalytics('ssr_performance', performanceData);
  }
}

/**
 * 注册Service Worker（如果需要PWA功能）
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW注册成功:', registration);
        })
        .catch(error => {
          console.log('SW注册失败:', error);
        });
    });
  }
}

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
  console.error('全局JavaScript错误:', event.error);
  
  // 如果是激活过程中的错误，尝试降级处理
  if (!window.__CLIENT_HYDRATED__) {
    handleHydrationError(event.error);
  }
});

/**
 * 处理未捕获的Promise拒绝
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
  event.preventDefault(); // 阻止在控制台显示
});

// 启动应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startClientApp);
} else {
  startClientApp();
}