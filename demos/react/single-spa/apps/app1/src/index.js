import React from 'react';
import ReactDOM from 'react-dom/client';
import UserManagementApp from './UserManagementApp';

// 立即执行函数，确保window.app1正确赋值
(function() {
  // 导出到全局作用域，用于微前端集成
  window.app1 = {
    bootstrap: async () => {
      console.log('App1 bootstrap called');
      return Promise.resolve();
    },
    mount: async (props) => {
      console.log('App1 mount called', props);
      return new Promise((resolve, reject) => {
        const container = document.getElementById('app1-container');
        if (container) {
          ReactDOM.createRoot(container).render(<UserManagementApp />);
          resolve();
        } else {
          console.error('App1 container not found');
          resolve();
        }
      });
    },
    unmount: async (props) => {
      console.log('App1 unmount called', props);
      return new Promise((resolve) => {
        const container = document.getElementById('app1-container');
        if (container) {
          ReactDOM.unmountComponentAtNode(container);
        }
        resolve();
      });
    }
  };
  
  console.log('App1 lifecycle functions registered:', window.app1);
})();

// 直接渲染到DOM，用于独立运行
if (document.getElementById('app1-container')) {
  ReactDOM.createRoot(document.getElementById('app1-container')).render(<UserManagementApp />);
}

export default UserManagementApp;
