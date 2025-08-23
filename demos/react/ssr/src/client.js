import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.js';

// 获取服务端渲染的状态
const preloadedState = window.__PRELOADED_STATE__;

// 清理全局变量
delete window.__PRELOADED_STATE__;

const root = hydrateRoot(
  document.getElementById('root'),
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// 开发环境下的热重载
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App.js', () => {
    const NextApp = require('./App.js').default;
    root.render(
      <HelmetProvider>
        <NextApp />
      </HelmetProvider>
    );
  });
}
