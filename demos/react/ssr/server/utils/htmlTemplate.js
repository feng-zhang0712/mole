import serialize from 'serialize-javascript';

export function createHTMLTemplate(appHtml, initialState, helmet) {
  const htmlAttributes = helmet.htmlAttributes.toString();
  const title = helmet.title.toString();
  const meta = helmet.meta.toString();
  const link = helmet.link.toString();
  const script = helmet.script.toString();
  
  // 序列化状态，防止XSS攻击
  const serializedState = serialize(initialState, { isJSON: true });
  
  return `
<!DOCTYPE html>
<html ${htmlAttributes}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#000000">
  
  ${title}
  ${meta}
  ${link}
  
  <!-- SEO Meta Tags -->
  <meta name="robots" content="index, follow">
  <meta name="author" content="SSR React App">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:site_name" content="SSR React App">
  <meta property="og:type" content="website">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ssrreactapp">
  
  <!-- Preload Critical Resources -->
  <link rel="preload" href="/main.js" as="script">
  <link rel="preload" href="/vendors.js" as="script">
  
  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico">
  
  <!-- Critical CSS -->
  <style>
    /* Critical CSS for above-the-fold content */
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
    .loading { text-align: center; padding: 40px; font-size: 18px; color: #666; }
    .error { color: #dc3545; text-align: center; padding: 20px; }
    .header { background-color: #2c3e50; color: white; padding: 1rem 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 0; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.2rem; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
  </style>
  
  ${script}
</head>
<body>
  <div id="root">${appHtml}</div>
  
  <!-- Preloaded State -->
  <script>
    window.__PRELOADED_STATE__ = ${serializedState};
    
    // 防止XSS攻击的安全检查
    if (typeof window.__PRELOADED_STATE__ === 'string') {
      try {
        window.__PRELOADED_STATE__ = JSON.parse(window.__PRELOADED_STATE__);
      } catch (e) {
        console.error('Failed to parse preloaded state:', e);
        window.__PRELOADED_STATE__ = {};
      }
    }
  </script>
  
  <!-- Client Bundle -->
  <script src="/main.js" defer></script>
  
  <!-- Performance Monitoring -->
  <script>
    // 性能监控
    window.addEventListener('load', function() {
      if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
          console.log('DOM Content Loaded:', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart, 'ms');
        }
      }
    });
    
    // 错误监控
    window.addEventListener('error', function(e) {
      console.error('Global error caught:', e.error);
    });
    
    // 未处理的Promise拒绝
    window.addEventListener('unhandledrejection', function(e) {
      console.error('Unhandled promise rejection:', e.reason);
    });
  </script>
  
  <!-- Service Worker Registration (if available) -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
          .then(function(registration) {
            console.log('SW registered: ', registration);
          })
          .catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  </script>
</body>
</html>`;
}

// 创建错误页面的HTML模板
export function createErrorHTMLTemplate(error, initialState = {}) {
  const serializedState = serialize(initialState, { isJSON: true });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Error - SSR React App</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      margin: 0; 
      padding: 40px; 
      background: #f8f9fa; 
      color: #333; 
    }
    .error-container { 
      max-width: 600px; 
      margin: 0 auto; 
      text-align: center; 
      background: white; 
      padding: 40px; 
      border-radius: 8px; 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
    }
    .error-icon { 
      font-size: 4rem; 
      color: #e74c3c; 
      margin-bottom: 20px; 
    }
    h1 { color: #2c3e50; margin-bottom: 20px; }
    p { color: #666; line-height: 1.6; margin-bottom: 30px; }
    .btn { 
      display: inline-block; 
      padding: 12px 24px; 
      background: #3498db; 
      color: white; 
      text-decoration: none; 
      border-radius: 5px; 
      transition: background 0.3s; 
    }
    .btn:hover { background: #2980b9; }
  </style>
</head>
<body>
  <div class="error-container">
    <div class="error-icon">⚠️</div>
    <h1>Something went wrong</h1>
    <p>We're experiencing technical difficulties. Please try again later.</p>
    <a href="/" class="btn">Go Home</a>
  </div>
  
  <script>
    window.__PRELOADED_STATE__ = ${serializedState};
  </script>
  
  <script src="/main.js"></script>
</body>
</html>`;
}
