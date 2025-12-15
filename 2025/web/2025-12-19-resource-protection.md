# 前端资源防窃取

## 一、概述

本文所说的资源，指的是需要在页面展示，但是又不想让用户通过某种方式对资源进行二次获取的资源。

前端资源保护主要涵盖文字内容、图片资源、音视频和代码保护等方面。

## 文字内容保护

### 禁用选择

```css
.target {
  user-select: 'none';
}
```

### 禁用复制

```javascript
target.addEventListener('copy', (e) => {
  e.preventDefault();
  // 复制时添加水印信息
  const watermarkData = `${this.watermarkText}\n${window.location.href}\n${new Date().toISOString()}`;
  e.clipboardData.setData('text/plain', watermarkData);
});
```

### 水印干扰

## 图片资源保护

图片保护的核心思路是增加获取成本和降低使用价值。

### 水印

在图片上添加可见或不可见的水印，降低盗用价值。

### 操作限制

禁用右键菜单、拖拽、选择等操作。

```javascript
// 禁用右键、拖拽、选择等操作
  ['contextmenu', 'dragstart', 'selectstart'].forEach(event => {
    imgElement.addEventListener(event, (e) => {
      e.preventDefault();
      return false;
    });
  });
```

### 防盗链

防盗链（Hotlink Protection）是一种防止其他网站直接引用本站资源的技术。当其他网站尝试直接链接到受保护的图片、视频、音频等资源时，服务器会检查请求的 `Referer` 头，如果来源不是允许的域名，则拒绝提供资源。

防盗链的处理主要依靠服务器端的校验，下面是一个在 Nodejs 中设置防盗链的例子。

```javascript
// 防盗链中间件
function hotlinkProtection(allowedDomains = []) {
  return (req, res, next) => {
    const referer = req.get('Referer');
    
    if (!referer) {
      return res.status(403).json({ error: 'Referer required' });
    }

    try {
      const refererDomain = new URL(referer).hostname;
      const isAllowed = allowedDomains.some(domain => 
        refererDomain === domain || 
        refererDomain.endsWith('.' + domain)
      );

      if (!isAllowed) {
        return res.status(403).json({ error: 'Hotlinking not allowed' });
      }

      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid referer' });
    }
  };
}
```

注意，仍然可以通过修改 Referer 头、代理服务器、浏览器直接访问或者从浏览器缓存中获取资源来绕过防盗链。

### Canvas 保护

将图片转换为 Canvas 绘制，增加获取难度。

## 音视频资源保护

前端技术无法完全阻止所有形式的盗用。

### 下载保护

防止用户直接下载音视频文件。

```javascript
// 禁用右键、拖拽、选择等操作
 ['contextmenu', 'dragstart', 'selectstart'].forEach(event => {
   videoElement.addEventListener(event, (e) => e.preventDefault());
 });
 
 // 禁用保存快捷键
 videoElement.addEventListener('keydown', (e) => {
   if ((e.ctrlKey || e.metaKey) && e.key === 's') {
     e.preventDefault();
   }
 });
 ```

### 录制保护

阻止屏幕录制和音频录制。

### 添加动态水印

在音视频中添加可见或不可见水印。

### 访问控制

限制音视频的访问权限。

### 服务器端流媒体加密

### DRM 数字版权管理

## 代码保护

### 代码混淆

将可读的代码转换为难以理解的格式。

```javascript
function obfuscateCode(code) {
  if (!this.options.enabled) return code;

  // 变量名混淆
  const variableMap = new Map();
  let variableCounter = 0;

  // 替换变量名
  code = code.replace(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g, (match) => {
    if (variableMap.has(match)) {
      return variableMap.get(match);
    }
    
    const obfuscatedName = `_0x${variableCounter.toString(16)}`;
    variableMap.set(match, obfuscatedName);
    variableCounter++;
    
    return obfuscatedName;
  });

  // 字符串编码
  code = code.replace(/'([^']*)'/g, (match, str) => {
    const encoded = btoa(str);
    return `atob('${encoded}')`;
  });

  return code;
}
```

### 完整性检查

验证代码是否被篡改。

```javascript
async function calculateHash(content) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyIntegrity(scriptElement, expectedHash) {
  const currentHash = await calculateHash(scriptElement.textContent);
  return currentHash === expectedHash;
}
```

### 压缩优化

减少代码体积，增加分析难度。

### 动态加载

将关键代码延迟加载。

### 服务器端验证

在服务器端验证关键逻辑。

## 限制

理论上，页面中的内容并没有办法做到完全保护，比如，很难做到完全禁止通过截图、录屏等操作获取站点内容。

## 参考

- [user-select](https://developer.mozilla.org/en-US/docs/Web/CSS/user-select), MDN
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
