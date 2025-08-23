import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductManagementApp from './ProductManagementApp';

// 立即执行函数，确保window.app2正确赋值
(function() {
  // 导出到全局作用域，用于微前端集成
  window.app2 = {
    bootstrap: async () => {
      console.log('App2 bootstrap called');
      return Promise.resolve();
    },
    mount: async (props) => {
      console.log('App2 mount called', props);
      return new Promise((resolve) => {
        const container = document.getElementById('app2-container');
        if (container) {
          ReactDOM.createRoot(container).render(<ProductManagementApp />);
          resolve();
        } else {
          console.error('App2 container not found');
          resolve();
        }
      });
    },
    unmount: async (props) => {
      console.log('App2 unmount called', props);
      return new Promise((resolve) => {
        const container = document.getElementById('app2-container');
        if (container) {
          ReactDOM.unmountComponentAtNode(container);
        }
        resolve();
      });
    }
  };
  
  console.log('App2 lifecycle functions registered:', window.app2);
})();

// 直接渲染到DOM，用于独立运行
if (document.getElementById('app2-container')) {
  ReactDOM.createRoot(document.getElementById('app2-container')).render(<ProductManagementApp />);
}

export default ProductManagementApp;
