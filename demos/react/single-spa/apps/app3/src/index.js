import React from 'react';
import ReactDOM from 'react-dom/client';
import DataAnalyticsApp from './DataAnalyticsApp';

// 立即执行函数，确保window.app3正确赋值
(function() {
  // 导出到全局作用域，用于微前端集成
  window.app3 = {
    bootstrap: async () => {
      console.log('App3 bootstrap called');
      return Promise.resolve();
    },
    mount: async (props) => {
      console.log('App3 mount called', props);
      return new Promise((resolve) => {
        const container = document.getElementById('app3-container');
        if (container) {
          ReactDOM.createRoot(container).render(<DataAnalyticsApp />);
          resolve();
        } else {
          console.error('App3 container not found');
          resolve();
        }
      });
    },
    unmount: async (props) => {
      console.log('App3 unmount called', props);
      return new Promise((resolve) => {
        const container = document.getElementById('app3-container');
        if (container) {
          ReactDOM.unmountComponentAtNode(container);
        }
        resolve();
      });
    }
  };
  
  console.log('App3 lifecycle functions registered:', window.app3);
})();

// 直接渲染到DOM，用于独立运行
if (document.getElementById('app3-container')) {
  ReactDOM.createRoot(document.getElementById('app3-container')).render(<DataAnalyticsApp />);
}

export default DataAnalyticsApp;
