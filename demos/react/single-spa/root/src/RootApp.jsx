import React, { useState, useEffect } from 'react';
import { navigateToUrl } from 'single-spa';

const RootApp = () => {
  const [currentApp, setCurrentApp] = useState('home');

  useEffect(() => {
    // 监听路由变化
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/app1')) {
        setCurrentApp('app1');
      } else if (path.startsWith('/app2')) {
        setCurrentApp('app2');
      } else if (path.startsWith('/app3')) {
        setCurrentApp('app3');
      } else {
        setCurrentApp('home');
      }
    };

    handleRouteChange();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const navigateTo = (appName) => {
    if (appName === 'home') {
      navigateToUrl('/');
    } else {
      navigateToUrl(`/${appName}`);
    }
    setCurrentApp(appName);
  };

  return (
    <div className="root-app">
      <header className="header">
        <h1>🚀 Micro Frontend Demo</h1>
        <p>基于 Single-SPA 架构的微前端应用</p>
      </header>
      
      <nav className="nav">
        <button 
          className={currentApp === 'home' ? 'active' : ''}
          onClick={() => navigateTo('home')}
        >
          🏠 首页
        </button>
        <button 
          className={currentApp === 'app1' ? 'active' : ''}
          onClick={() => navigateTo('app1')}
        >
          📱 应用一
        </button>
        <button 
          className={currentApp === 'app2' ? 'active' : ''}
          onClick={() => navigateTo('app2')}
        >
          🛒 应用二
        </button>
        <button 
          className={currentApp === 'app3' ? 'active' : ''}
          onClick={() => navigateTo('app3')}
        >
          📊 应用三
        </button>
      </nav>

      <main className="content">
        {currentApp === 'home' && (
          <div className="home-content">
            <h2>欢迎来到微前端世界！</h2>
            <p>这是一个基于 Single-SPA 架构的微前端项目演示。</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ padding: '1.5rem', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <h3>📱 应用一 - 用户管理</h3>
                <p>负责用户信息的展示、编辑和管理功能。</p>
                <button onClick={() => navigateTo('app1')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                  进入应用
                </button>
              </div>
              
              <div style={{ padding: '1.5rem', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <h3>🛒 应用二 - 商品管理</h3>
                <p>负责商品信息的展示、搜索和购物车功能。</p>
                <button onClick={() => navigateTo('app2')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                  进入应用
                </button>
              </div>
              
              <div style={{ padding: '1.5rem', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <h3>📊 应用三 - 数据分析</h3>
                <p>负责数据统计、图表展示和分析报告。</p>
                <button onClick={() => navigateTo('app3')} style={{ background: '#007bff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                  进入应用
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
              <h3>🔧 技术特性</h3>
              <ul style={{ lineHeight: '1.8' }}>
                <li><strong>独立部署：</strong>每个微应用可以独立开发、测试和部署</li>
                <li><strong>技术栈无关：</strong>支持不同的前端框架和技术栈</li>
                <li><strong>运行时集成：</strong>在浏览器中动态加载和集成微应用</li>
                <li><strong>共享依赖：</strong>通过模块联邦共享公共依赖</li>
                <li><strong>路由管理：</strong>统一的导航和路由管理</li>
              </ul>
            </div>
          </div>
        )}
        
        <div id="app1-container" style={{ display: currentApp === 'app1' ? 'block' : 'none' }}></div>
        <div id="app2-container" style={{ display: currentApp === 'app2' ? 'block' : 'none' }}></div>
        <div id="app3-container" style={{ display: currentApp === 'app3' ? 'block' : 'none' }}></div>
      </main>
    </div>
  );
};

export default RootApp;
