if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/webpack/pwa/' // 限制作用域
      });
      
      console.log('Service Worker 注册成功：', registration);
      
      // 监听 Service Worker 更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('Service Worker 更新中...');
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('新版本可用，请刷新页面');
          }
        });
      });
    } catch (error) {
      console.error('Service Worker 注册失败：', error);
    }
  });
  
  // 监听 Service Worker 消息
  navigator.serviceWorker.addEventListener('message', event => {
    console.log('收到 Service Worker 消息：', event.data);
  });
} else {
  console.log('浏览器不支持 Service Worker');
}