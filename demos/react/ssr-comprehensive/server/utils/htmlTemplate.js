/**
 * HTML模板生成工具 - 解决HTML模板和资源注入问题
 * 生成完整的HTML文档，包含SEO元标签、预加载资源等
 */

/**
 * 生成完整的HTML文档
 * @param {Object} options 配置选项
 * @param {string} options.content 渲染的React内容
 * @param {string} options.initialData 序列化的初始数据
 * @param {string} options.url 当前URL
 * @param {string} options.title 页面标题
 * @param {string} options.description 页面描述
 * @returns {string} 完整的HTML文档
 */
export function generateHTML({ 
  content, 
  initialData, 
  url, 
  title = 'SSR React Demo', 
  description = 'React服务端渲染演示应用' 
}) {
  
  // 生成资源链接（生产环境需要从webpack manifest读取）
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const cssLinks = isDevelopment 
    ? '' // 开发环境CSS通过JS注入
    : `<link rel="stylesheet" href="/static/client.css">`; // 生产环境预加载CSS
    
  const scriptSrc = isDevelopment 
    ? '/static/client.js'
    : '/static/client.[contenthash].js'; // 生产环境需要动态获取hash
  
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  
  <!-- SEO 元标签 -->
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="keywords" content="React, SSR, 服务端渲染, Webpack, JavaScript">
  <meta name="author" content="SSR Demo">
  
  <!-- Open Graph 元标签 (社交媒体分享) -->
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:site_name" content="SSR React Demo">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  
  <!-- DNS预解析 -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/static/client.js" as="script">
  ${cssLinks}
  
  <!-- 防止FOUC的关键CSS -->
  <style>
    /* 重置和基础样式 */
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
    }
    
    #root {
      min-height: 100vh;
    }
    
    /* 加载状态样式 */
    .ssr-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-size: 16px;
      color: #666;
    }
    
    /* 导航栏基础样式 */
    .navbar {
      background-color: #ffffff;
      border-bottom: 1px solid #e9ecef;
      padding: 0;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .navbar-nav {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-link {
      display: block;
      padding: 15px 20px;
      text-decoration: none;
      color: #495057;
      transition: all 0.2s;
      border-bottom: 3px solid transparent;
    }
    
    .nav-link:hover {
      color: #007bff;
      background-color: #f8f9fa;
    }
    
    .nav-link.active {
      color: #007bff;
      border-bottom-color: #007bff;
    }
    
    /* 容器样式 */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 15px;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .navbar-nav {
        flex-direction: column;
      }
      
      .nav-link {
        padding: 10px 15px;
      }
      
      .container {
        padding: 0 10px;
      }
    }
  </style>
  
  <!-- 结构化数据 (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SSR React Demo",
    "description": "${escapeHtml(description)}",
    "url": "${escapeHtml(url)}"
  }
  </script>
</head>
<body>
  <!-- React应用挂载点 -->
  <div id="root">${content}</div>
  
  <!-- 初始状态注入 - 解决状态同步问题 -->
  <script>
    // 全局状态，供客户端激活使用
    window.__INITIAL_DATA__ = ${initialData};
    
    // 环境标识
    window.__SSR_ENV__ = {
      isDevelopment: ${isDevelopment},
      timestamp: "${new Date().toISOString()}",
      url: "${escapeHtml(url)}"
    };
    
    // 性能监控
    window.__SSR_METRICS__ = {
      serverRenderStart: performance.now()
    };
  </script>
  
  <!-- 客户端应用脚本 -->
  <script src="${scriptSrc}" defer></script>
  
  <!-- 错误处理脚本 -->
  <script>
    // 全局错误处理
    window.addEventListener('error', function(e) {
      console.error('全局错误:', e.error);
      
      // 可以发送错误到监控服务
      if (typeof window.errorReporter !== 'undefined') {
        window.errorReporter.report(e.error);
      }
    });
    
    // Promise错误处理
    window.addEventListener('unhandledrejection', function(e) {
      console.error('未处理的Promise拒绝:', e.reason);
      e.preventDefault();
    });
    
    // 客户端激活超时处理
    setTimeout(function() {
      if (!window.__CLIENT_HYDRATED__) {
        console.warn('客户端激活超时，可能存在JavaScript错误');
        
        // 显示降级提示
        var warningDiv = document.createElement('div');
        warningDiv.innerHTML = '⚠️ 页面交互功能可能受限，请刷新页面重试';
        warningDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ffc107;color:#856404;padding:10px;text-align:center;z-index:9999;';
        document.body.appendChild(warningDiv);
      }
    }, 10000); // 10秒超时
  </script>
</body>
</html>`.trim();
}

/**
 * HTML转义函数，防止XSS攻击
 * @param {string} text 需要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  if (typeof text !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  
  return text.replace(/[&<>"']/g, function(m) {
    return map[m];
  });
}

/**
 * 生成资源清单
 * 在生产环境中，这个函数应该读取webpack生成的manifest.json
 * @returns {Object} 资源映射对象
 */
export function getAssetManifest() {
  // 开发环境返回静态路径
  if (process.env.NODE_ENV !== 'production') {
    return {
      'client.js': '/static/client.js',
      'client.css': '/static/client.css'
    };
  }
  
  // 生产环境应该读取manifest.json文件
  try {
    // const manifestPath = path.resolve(__dirname, '../../dist/public/manifest.json');
    // const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    // return manifest;
    
    // 暂时返回静态路径，实际项目中需要实现manifest读取
    return {
      'client.js': '/static/client.[contenthash].js',
      'client.css': '/static/client.[contenthash].css'
    };
  } catch (error) {
    console.error('无法读取资源清单:', error);
    return {
      'client.js': '/static/client.js',
      'client.css': '/static/client.css'
    };
  }
}