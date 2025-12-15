# 前端水印技术详解

## 一、概述

前端水印是一种在网页内容上叠加透明或半透明标识的技术，主要用于：

- **版权保护**：标识内容归属
- **防截图**：在截图中显示水印信息
- **用户追踪**：记录用户身份信息
- **内容安全**：防止未授权使用
- **品牌展示**：显示公司或产品标识

## 二、水印类型

### 2.1 文字水印

```javascript
class TextWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Watermark';
    this.fontSize = options.fontSize || 16;
    this.color = options.color || 'rgba(0, 0, 0, 0.1)';
    this.angle = options.angle || -30;
    this.spacing = options.spacing || 200;
  }

  create() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = this.spacing;
    canvas.height = this.spacing;
    
    // 设置文字样式
    ctx.font = `${this.fontSize}px Arial`;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 旋转画布
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(this.angle * Math.PI / 180);
    
    // 绘制文字
    ctx.fillText(this.text, 0, 0);
    
    return canvas.toDataURL();
  }
}

// 使用示例
const watermark = new TextWatermark({
  text: 'Confidential',
  fontSize: 20,
  color: 'rgba(255, 0, 0, 0.3)',
  angle: -45
});

const watermarkDataUrl = watermark.create();
```

### 2.2 图片水印

```javascript
class ImageWatermark {
  constructor(options = {}) {
    this.imageUrl = options.imageUrl;
    this.opacity = options.opacity || 0.3;
    this.size = options.size || { width: 100, height: 100 };
    this.position = options.position || 'bottom-right';
  }

  async create() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.size.width;
        canvas.height = this.size.height;
        
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(img, 0, 0, this.size.width, this.size.height);
        
        resolve(canvas.toDataURL());
      };
      
      img.onerror = reject;
      img.src = this.imageUrl;
    });
  }
}

// 使用示例
const imageWatermark = new ImageWatermark({
  imageUrl: '/logo.png',
  opacity: 0.5,
  size: { width: 80, height: 80 }
});

const imageWatermarkDataUrl = await imageWatermark.create();
```

### 2.3 动态水印

```javascript
class DynamicWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Dynamic Watermark';
    this.interval = options.interval || 1000;
    this.position = options.position || 'random';
  }

  start() {
    this.timer = setInterval(() => {
      this.createWatermark();
    }, this.interval);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  createWatermark() {
    const watermark = document.createElement('div');
    watermark.textContent = this.text;
    watermark.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      color: rgba(0, 0, 0, 0.1);
      font-size: 16px;
      user-select: none;
    `;

    if (this.position === 'random') {
      watermark.style.left = Math.random() * window.innerWidth + 'px';
      watermark.style.top = Math.random() * window.innerHeight + 'px';
    }

    document.body.appendChild(watermark);

    // 3秒后移除
    setTimeout(() => {
      if (watermark.parentNode) {
        watermark.parentNode.removeChild(watermark);
      }
    }, 3000);
  }
}

// 使用示例
const dynamicWatermark = new DynamicWatermark({
  text: 'Live Watermark',
  interval: 2000
});

dynamicWatermark.start();
```

## 三、水印实现方式

### 3.1 CSS 背景水印

```javascript
class CSSWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Watermark';
    this.container = options.container || document.body;
  }

  apply() {
    const watermarkId = 'watermark-' + Date.now();
    const style = document.createElement('style');
    
    style.textContent = `
      .${watermarkId}::before {
        content: '${this.text}';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        color: rgba(0, 0, 0, 0.1);
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: rotate(-45deg);
        user-select: none;
      }
    `;
    
    document.head.appendChild(style);
    this.container.classList.add(watermarkId);
    
    return watermarkId;
  }

  remove(watermarkId) {
    const style = document.querySelector(`style:contains("${watermarkId}")`);
    if (style) {
      style.remove();
    }
    this.container.classList.remove(watermarkId);
  }
}
```

### 3.2 Canvas 水印

```javascript
class CanvasWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Canvas Watermark';
    this.container = options.container || document.body;
    this.opacity = options.opacity || 0.1;
  }

  apply() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布大小
    canvas.width = 300;
    canvas.height = 200;
    
    // 设置样式
    ctx.font = '20px Arial';
    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制文字
    ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);
    
    // 创建背景图片
    const dataUrl = canvas.toDataURL();
    
    // 应用水印
    const watermarkDiv = document.createElement('div');
    watermarkDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background-image: url('${dataUrl}');
      background-repeat: repeat;
      background-size: 300px 200px;
    `;
    
    this.container.appendChild(watermarkDiv);
    return watermarkDiv;
  }
}
```

### 3.3 SVG 水印

```javascript
class SVGWatermark {
  constructor(options = {}) {
    this.text = options.text || 'SVG Watermark';
    this.container = options.container || document.body;
  }

  apply() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
    `;

    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'watermark-pattern');
    pattern.setAttribute('width', '200');
    pattern.setAttribute('height', '200');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '100');
    text.setAttribute('y', '100');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', 'rgba(0, 0, 0, 0.1)');
    text.setAttribute('font-size', '16');
    text.setAttribute('transform', 'rotate(-45 100 100)');
    text.textContent = this.text;

    pattern.appendChild(text);
    svg.appendChild(pattern);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'url(#watermark-pattern)');

    svg.appendChild(rect);
    this.container.appendChild(svg);

    return svg;
  }
}
```

## 四、防移除技术

### 4.1 DOM 监控

```javascript
class ProtectedWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Protected Watermark';
    this.container = options.container || document.body;
    this.checkInterval = options.checkInterval || 1000;
    this.watermarkElement = null;
  }

  apply() {
    this.createWatermark();
    this.startMonitoring();
  }

  createWatermark() {
    this.watermarkElement = document.createElement('div');
    this.watermarkElement.textContent = this.text;
    this.watermarkElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      color: rgba(0, 0, 0, 0.1);
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-45deg);
      user-select: none;
    `;
    
    this.container.appendChild(this.watermarkElement);
  }

  startMonitoring() {
    this.monitorTimer = setInterval(() => {
      this.checkWatermark();
    }, this.checkInterval);
  }

  checkWatermark() {
    if (!this.watermarkElement || !this.watermarkElement.parentNode) {
      console.warn('水印被移除，重新创建');
      this.createWatermark();
    }
  }

  stop() {
    if (this.monitorTimer) {
      clearInterval(this.monitorTimer);
    }
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.watermarkElement.parentNode.removeChild(this.watermarkElement);
    }
  }
}
```

### 4.2 MutationObserver 监控

```javascript
class ObserverWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Observer Watermark';
    this.container = options.container || document.body;
    this.observer = null;
  }

  apply() {
    this.createWatermark();
    this.startObserver();
  }

  createWatermark() {
    this.watermarkElement = document.createElement('div');
    this.watermarkElement.textContent = this.text;
    this.watermarkElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      color: rgba(0, 0, 0, 0.1);
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-45deg);
      user-select: none;
    `;
    
    this.container.appendChild(this.watermarkElement);
  }

  startObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === this.watermarkElement) {
              console.warn('水印被移除，重新创建');
              setTimeout(() => this.createWatermark(), 100);
            }
          });
        }
      });
    });

    this.observer.observe(this.container, {
      childList: true,
      subtree: true
    });
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.watermarkElement.parentNode.removeChild(this.watermarkElement);
    }
  }
}
```

### 4.3 样式保护

```javascript
class StyleProtectedWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Style Protected Watermark';
    this.container = options.container || document.body;
  }

  apply() {
    const watermarkId = 'watermark-' + Date.now();
    const style = document.createElement('style');
    
    // 创建不可删除的样式
    style.setAttribute('data-watermark', 'true');
    style.textContent = `
      .${watermarkId}::before {
        content: '${this.text}';
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        pointer-events: none !important;
        z-index: 9999 !important;
        color: rgba(0, 0, 0, 0.1) !important;
        font-size: 20px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transform: rotate(-45deg) !important;
        user-select: none !important;
      }
    `;
    
    // 保护样式不被删除
    Object.defineProperty(style, 'remove', {
      value: function() {
        console.warn('尝试删除水印样式');
        return false;
      }
    });
    
    document.head.appendChild(style);
    this.container.classList.add(watermarkId);
    
    return watermarkId;
  }
}
```

## 五、内容安全保护

### 5.1 防截图水印

```javascript
class AntiScreenshotWatermark {
  constructor(options = {}) {
    this.text = options.text || 'Anti Screenshot';
    this.userInfo = options.userInfo || 'User ID: Unknown';
    this.timestamp = options.timestamp || new Date().toISOString();
  }

  apply() {
    // 创建水印层
    const watermarkLayer = document.createElement('div');
    watermarkLayer.id = 'anti-screenshot-watermark';
    watermarkLayer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: transparent;
    `;

    // 创建水印内容
    const watermarkContent = document.createElement('div');
    watermarkContent.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      color: rgba(0, 0, 0, 0.1);
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      white-space: nowrap;
      user-select: none;
    `;

    watermarkContent.innerHTML = `
      <div>${this.text}</div>
      <div style="font-size: 16px; margin-top: 10px;">${this.userInfo}</div>
      <div style="font-size: 14px; margin-top: 5px;">${this.timestamp}</div>
    `;

    watermarkLayer.appendChild(watermarkContent);
    document.body.appendChild(watermarkLayer);

    // 监听截图事件
    this.detectScreenshot();
  }

  detectScreenshot() {
    // 监听键盘事件
    document.addEventListener('keydown', (e) => {
      // 检测截图快捷键
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        this.onScreenshotDetected();
      }
    });

    // 监听右键菜单
    document.addEventListener('contextmenu', (e) => {
      this.onScreenshotDetected();
    });

    // 监听开发者工具
    this.detectDevTools();
  }

  onScreenshotDetected() {
    console.warn('检测到截图行为');
    // 可以在这里添加额外的保护措施
  }

  detectDevTools() {
    let devtools = { open: false, orientation: null };
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('检测到开发者工具');
          this.onScreenshotDetected();
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }
}
```

### 5.2 防复制保护

```javascript
class CopyProtection {
  constructor(options = {}) {
    this.watermarkText = options.watermarkText || 'Protected Content';
    this.enabled = true;
  }

  enable() {
    this.enabled = true;
    this.addProtection();
  }

  disable() {
    this.enabled = false;
    this.removeProtection();
  }

  addProtection() {
    // 禁用右键菜单
    document.addEventListener('contextmenu', this.preventContextMenu);
    
    // 禁用选择
    document.addEventListener('selectstart', this.preventSelection);
    
    // 禁用拖拽
    document.addEventListener('dragstart', this.preventDrag);
    
    // 禁用复制
    document.addEventListener('copy', this.preventCopy);
    
    // 禁用打印
    document.addEventListener('beforeprint', this.preventPrint);
    
    // 禁用保存
    document.addEventListener('keydown', this.preventSave);
  }

  removeProtection() {
    document.removeEventListener('contextmenu', this.preventContextMenu);
    document.removeEventListener('selectstart', this.preventSelection);
    document.removeEventListener('dragstart', this.preventDrag);
    document.removeEventListener('copy', this.preventCopy);
    document.removeEventListener('beforeprint', this.preventPrint);
    document.removeEventListener('keydown', this.preventSave);
  }

  preventContextMenu = (e) => {
    if (this.enabled) {
      e.preventDefault();
      return false;
    }
  }

  preventSelection = (e) => {
    if (this.enabled) {
      e.preventDefault();
      return false;
    }
  }

  preventDrag = (e) => {
    if (this.enabled) {
      e.preventDefault();
      return false;
    }
  }

  preventCopy = (e) => {
    if (this.enabled) {
      e.preventDefault();
      
      // 添加水印到剪贴板
      const watermarkData = `
${this.watermarkText}
${window.location.href}
${new Date().toISOString()}
      `;
      
      e.clipboardData.setData('text/plain', watermarkData);
      return false;
    }
  }

  preventPrint = (e) => {
    if (this.enabled) {
      e.preventDefault();
      return false;
    }
  }

  preventSave = (e) => {
    if (this.enabled && (e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      return false;
    }
  }
}
```

## 六、资源防窃取

### 6.1 图片防盗链

```javascript
class ImageProtection {
  constructor(options = {}) {
    this.watermarkText = options.watermarkText || 'Protected Image';
    this.opacity = options.opacity || 0.3;
  }

  protectImage(imgElement) {
    // 创建水印层
    const watermarkLayer = document.createElement('div');
    watermarkLayer.style.cssText = `
      position: relative;
      display: inline-block;
    `;

    // 包装原图片
    const wrapper = imgElement.parentNode;
    wrapper.insertBefore(watermarkLayer, imgElement);
    watermarkLayer.appendChild(imgElement);

    // 添加水印
    const watermark = document.createElement('div');
    watermark.textContent = this.watermarkText;
    watermark.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, ${this.opacity});
      color: rgba(0, 0, 0, 0.7);
      font-size: 18px;
      font-weight: bold;
      pointer-events: none;
      user-select: none;
    `;

    watermarkLayer.appendChild(watermark);

    // 禁用右键
    imgElement.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // 禁用拖拽
    imgElement.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
  }

  protectAllImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => this.protectImage(img));
  }
}
```

### 6.2 文字内容保护

```javascript
class TextProtection {
  constructor(options = {}) {
    this.watermarkText = options.watermarkText || 'Protected Text';
    this.enabled = true;
  }

  protectText(element) {
    if (!this.enabled) return;

    // 添加水印样式
    element.style.position = 'relative';
    
    const watermark = document.createElement('div');
    watermark.textContent = this.watermarkText;
    watermark.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(0, 0, 0, 0.3);
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      user-select: none;
      z-index: 1;
    `;

    element.appendChild(watermark);

    // 禁用选择
    element.addEventListener('selectstart', (e) => {
      e.preventDefault();
      return false;
    });
  }

  protectAllText() {
    const textElements = document.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');
    textElements.forEach(element => this.protectText(element));
  }
}
```

## 七、综合水印系统

```javascript
class ComprehensiveWatermarkSystem {
  constructor(options = {}) {
    this.options = {
      text: options.text || 'Confidential',
      userInfo: options.userInfo || 'User ID: Unknown',
      timestamp: options.timestamp || new Date().toISOString(),
      opacity: options.opacity || 0.1,
      fontSize: options.fontSize || 16,
      angle: options.angle || -45,
      spacing: options.spacing || 200,
      ...options
    };
    
    this.watermarkElement = null;
    this.observer = null;
    this.protection = null;
  }

  init() {
    this.createWatermark();
    this.startProtection();
    this.startMonitoring();
  }

  createWatermark() {
    // 创建水印元素
    this.watermarkElement = document.createElement('div');
    this.watermarkElement.id = 'comprehensive-watermark';
    this.watermarkElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background: transparent;
    `;

    // 创建水印内容
    const watermarkContent = document.createElement('div');
    watermarkContent.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(${this.options.angle}deg);
      color: rgba(0, 0, 0, ${this.options.opacity});
      font-size: ${this.options.fontSize}px;
      font-weight: bold;
      text-align: center;
      white-space: nowrap;
      user-select: none;
    `;

    watermarkContent.innerHTML = `
      <div>${this.options.text}</div>
      <div style="font-size: ${this.options.fontSize * 0.8}px; margin-top: 10px;">${this.options.userInfo}</div>
      <div style="font-size: ${this.options.fontSize * 0.7}px; margin-top: 5px;">${this.options.timestamp}</div>
    `;

    this.watermarkElement.appendChild(watermarkContent);
    document.body.appendChild(this.watermarkElement);
  }

  startProtection() {
    this.protection = new CopyProtection({
      watermarkText: this.options.text
    });
    this.protection.enable();
  }

  startMonitoring() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === this.watermarkElement) {
              console.warn('水印被移除，重新创建');
              setTimeout(() => this.createWatermark(), 100);
            }
          });
        }
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    if (this.protection) {
      this.protection.disable();
    }
    
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.watermarkElement.parentNode.removeChild(this.watermarkElement);
    }
  }
}

// 使用示例
const watermarkSystem = new ComprehensiveWatermarkSystem({
  text: 'Confidential Document',
  userInfo: 'User ID: 12345',
  timestamp: new Date().toISOString(),
  opacity: 0.15,
  fontSize: 18,
  angle: -30
});

watermarkSystem.init();
```

## 八、最佳实践

### 8.1 性能优化

```javascript
// 使用 requestAnimationFrame 优化水印更新
class OptimizedWatermark {
  constructor(options = {}) {
    this.options = options;
    this.animationId = null;
  }

  start() {
    const update = () => {
      this.updateWatermark();
      this.animationId = requestAnimationFrame(update);
    };
    update();
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  updateWatermark() {
    // 水印更新逻辑
  }
}
```

### 8.2 响应式设计

```javascript
// 响应式水印
class ResponsiveWatermark {
  constructor(options = {}) {
    this.options = options;
    this.resizeHandler = this.handleResize.bind(this);
  }

  init() {
    window.addEventListener('resize', this.resizeHandler);
    this.updateWatermark();
  }

  handleResize() {
    this.updateWatermark();
  }

  updateWatermark() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // 根据屏幕大小调整水印
    if (width < 768) {
      this.options.fontSize = 12;
      this.options.spacing = 150;
    } else if (width < 1024) {
      this.options.fontSize = 16;
      this.options.spacing = 200;
    } else {
      this.options.fontSize = 20;
      this.options.spacing = 250;
    }
  }
}
```

## 九、总结

前端水印技术是保护内容安全的重要手段，通过合理的设计和实现，可以有效防止内容被未授权使用。关键要点：

1. **多层次保护**：结合DOM监控、样式保护、事件拦截等多种技术
2. **性能考虑**：使用高效的水印实现方式，避免影响页面性能
3. **用户体验**：在保护内容的同时，不影响正常用户的使用体验
4. **持续监控**：实时监控水印状态，确保保护措施持续有效

## 参考

- [前端水印技术实现](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MutationObserver API](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [CSS 水印实现](https://developer.mozilla.org/en-US/docs/Web/CSS/::before)
