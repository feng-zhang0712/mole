import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerApplication, start } from 'single-spa';
import RootApp from './RootApp';
import './index.css';

// 注册微应用 - 使用更简单的方式
registerApplication({
  name: 'app1',
  app: () => {
    console.log('开始加载应用1...');
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'http://localhost:9001/app1.js';
      
      script.onload = () => {
        console.log('应用1脚本加载完成');
        console.log('window.app1:', window.app1);
        
        // 等待一小段时间确保window.app1已经赋值
        setTimeout(() => {
          if (window.app1 && window.app1.bootstrap && window.app1.mount && window.app1.unmount) {
            console.log('应用1生命周期函数已找到，注册成功');
            resolve({
              bootstrap: window.app1.bootstrap,
              mount: window.app1.mount,
              unmount: window.app1.unmount
            });
          } else {
            console.error('应用1生命周期函数未找到:', window.app1);
            reject(new Error('应用1生命周期函数未找到'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('应用1脚本加载失败:', error);
        reject(new Error('应用1脚本加载失败'));
      };
      
      document.head.appendChild(script);
    });
  },
  activeWhen: (location) => location.pathname.startsWith('/app1')
});

registerApplication({
  name: 'app2',
  app: () => {
    console.log('开始加载应用2...');
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'http://localhost:9002/app2.js';
      
      script.onload = () => {
        console.log('应用2脚本加载完成');
        console.log('window.app2:', window.app2);
        
        setTimeout(() => {
          if (window.app2 && window.app2.bootstrap && window.app2.mount && window.app2.unmount) {
            console.log('应用2生命周期函数已找到，注册成功');
            resolve({
              bootstrap: window.app2.bootstrap,
              mount: window.app2.mount,
              unmount: window.app2.unmount
            });
          } else {
            console.error('应用2生命周期函数未找到:', window.app2);
            reject(new Error('应用2生命周期函数未找到'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('应用2脚本加载失败:', error);
        reject(new Error('应用2脚本加载失败'));
      };
      
      document.head.appendChild(script);
    });
  },
  activeWhen: (location) => location.pathname.startsWith('/app2')
});

registerApplication({
  name: 'app3',
  app: () => {
    console.log('开始加载应用3...');
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'http://localhost:9003/app3.js';
      
      script.onload = () => {
        console.log('应用3脚本加载完成');
        console.log('window.app3:', window.app3);
        
        setTimeout(() => {
          if (window.app3 && window.app3.bootstrap && window.app3.mount && window.app3.unmount) {
            console.log('应用3生命周期函数已找到，注册成功');
            resolve({
              bootstrap: window.app3.bootstrap,
              mount: window.app3.mount,
              unmount: window.app3.unmount
            });
          } else {
            console.error('应用3生命周期函数未找到:', window.app3);
            reject(new Error('应用3生命周期函数未找到'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('应用3脚本加载失败:', error);
        reject(new Error('应用3脚本加载失败'));
      };
      
      document.head.appendChild(script);
    });
  },
  activeWhen: (location) => location.pathname.startsWith('/app3')
});

// 启动Single-SPA
console.log('启动Single-SPA...');
start();

// 渲染根应用
ReactDOM.createRoot(document.getElementById('root')).render(<RootApp />);
