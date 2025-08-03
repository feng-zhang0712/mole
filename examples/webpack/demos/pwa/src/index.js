if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
    .register('/service-worker.js')
    .then(res => {
      console.log('Service worker 注册成功：', res);
    })
    .catch(error => {
      console.log('Service worker 注册失败：', error);
    });
  });
}