# 前端开发中如何实现截图

## 一、概述

前端截图功能在现代Web应用中越来越重要，常用于：
- 用户反馈和bug报告
- 内容分享和保存
- 数据可视化导出
- 在线编辑器的预览功能
- 测试和调试

## 二、浏览器原生API

### 2.1 Screen Capture API

Screen Capture API 允许捕获屏幕、窗口或标签页的内容。

```javascript
// 获取屏幕截图权限
async function captureScreen() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: 'screen',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // 转换为图片
      const imageData = canvas.toDataURL('image/png');
      downloadImage(imageData, 'screenshot.png');
      
      // 停止屏幕共享
      stream.getTracks().forEach(track => track.stop());
    });
  } catch (error) {
    console.error('屏幕截图失败:', error);
  }
}

// 下载图片
function downloadImage(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
```

### 2.2 Canvas API

Canvas API 可以捕获Canvas元素的内容。

```javascript
// 捕获Canvas内容
function captureCanvas(canvasElement) {
  const dataUrl = canvasElement.toDataURL('image/png');
  return dataUrl;
}

// 捕获Canvas为Blob
function captureCanvasAsBlob(canvasElement, type = 'image/png', quality = 0.9) {
  return new Promise((resolve) => {
    canvasElement.toBlob(resolve, type, quality);
  });
}

// 使用示例
const canvas = document.getElementById('myCanvas');
const imageData = captureCanvas(canvas);
downloadImage(imageData, 'canvas-screenshot.png');
```

### 2.3 HTMLCanvasElement.toDataURL()

将Canvas内容转换为Base64编码的图片数据。

```javascript
// 基本用法
function canvasToDataURL(canvas, format = 'image/png', quality = 0.9) {
  return canvas.toDataURL(format, quality);
}

// 支持多种格式
function captureCanvasMultipleFormats(canvas) {
  const formats = {
    png: canvas.toDataURL('image/png'),
    jpeg: canvas.toDataURL('image/jpeg', 0.9),
    webp: canvas.toDataURL('image/webp', 0.9)
  };
  
  return formats;
}
```

## 三、DOM元素截图

### 3.1 html2canvas 库

html2canvas 是最流行的DOM元素截图库。

```javascript
// 安装: npm install html2canvas
import html2canvas from 'html2canvas';

// 基本用法
async function captureElement(element) {
  try {
    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl;
  } catch (error) {
    console.error('截图失败:', error);
  }
}

// 高级配置
async function captureElementAdvanced(element) {
  const options = {
    allowTaint: true,
    backgroundColor: '#ffffff',
    scale: 2, // 提高清晰度
    useCORS: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    scrollX: 0,
    scrollY: 0
  };
  
  const canvas = await html2canvas(element, options);
  return canvas.toDataURL('image/png');
}

// 使用示例
const element = document.getElementById('content');
const screenshot = await captureElement(element);
downloadImage(screenshot, 'element-screenshot.png');
```

### 3.2 dom-to-image 库

dom-to-image 提供更轻量级的DOM截图功能。

```javascript
// 安装: npm install dom-to-image
import domtoimage from 'dom-to-image';

// 转换为PNG
async function captureElementPNG(element) {
  try {
    const dataUrl = await domtoimage.toPng(element);
    return dataUrl;
  } catch (error) {
    console.error('PNG截图失败:', error);
  }
}

// 转换为JPEG
async function captureElementJPEG(element) {
  const options = {
    quality: 0.9,
    bgcolor: '#ffffff'
  };
  
  const dataUrl = await domtoimage.toJpeg(element, options);
  return dataUrl;
}

// 转换为SVG
async function captureElementSVG(element) {
  const dataUrl = await domtoimage.toSvg(element);
  return dataUrl;
}

// 转换为Blob
async function captureElementBlob(element) {
  const blob = await domtoimage.toBlob(element);
  return blob;
}
```

### 3.3 自定义DOM截图实现

不依赖第三方库的DOM截图实现。

```javascript
// 自定义DOM截图
function captureDOMElement(element) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置Canvas尺寸
  const rect = element.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // 获取计算样式
  const computedStyle = window.getComputedStyle(element);
  
  // 绘制背景
  ctx.fillStyle = computedStyle.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制边框
  const borderWidth = parseInt(computedStyle.borderWidth) || 0;
  if (borderWidth > 0) {
    ctx.strokeStyle = computedStyle.borderColor || '#000000';
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }
  
  // 绘制文本内容
  const textContent = element.textContent || element.innerText;
  if (textContent) {
    ctx.fillStyle = computedStyle.color || '#000000';
    ctx.font = computedStyle.font || '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // 简单的文本换行处理
    const words = textContent.split(' ');
    let line = '';
    let y = 10;
    const lineHeight = parseInt(computedStyle.lineHeight) || 20;
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > canvas.width - 20 && i > 0) {
        ctx.fillText(line, 10, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 10, y);
  }
  
  return canvas.toDataURL('image/png');
}
```

## 四、页面截图

### 4.1 整页截图

```javascript
// 使用html2canvas实现整页截图
async function captureFullPage() {
  const element = document.body;
  
  const options = {
    height: window.innerHeight,
    width: window.innerWidth,
    scrollX: 0,
    scrollY: 0,
    scale: 1,
    useCORS: true,
    allowTaint: true
  };
  
  const canvas = await html2canvas(element, options);
  return canvas.toDataURL('image/png');
}

// 滚动截图（长页面）
async function captureScrolledPage() {
  const element = document.body;
  const originalScrollTop = window.pageYOffset;
  
  // 滚动到顶部
  window.scrollTo(0, 0);
  
  const options = {
    height: element.scrollHeight,
    width: element.scrollWidth,
    scrollX: 0,
    scrollY: 0,
    scale: 1,
    useCORS: true,
    allowTaint: true
  };
  
  const canvas = await html2canvas(element, options);
  
  // 恢复滚动位置
  window.scrollTo(0, originalScrollTop);
  
  return canvas.toDataURL('image/png');
}
```

### 4.2 视口截图

```javascript
// 捕获当前视口
async function captureViewport() {
  const element = document.documentElement;
  
  const options = {
    height: window.innerHeight,
    width: window.innerWidth,
    scrollX: window.pageXOffset,
    scrollY: window.pageYOffset,
    scale: 1,
    useCORS: true,
    allowTaint: true
  };
  
  const canvas = await html2canvas(element, options);
  return canvas.toDataURL('image/png');
}
```

## 五、高级截图功能

### 5.1 延迟截图

```javascript
// 等待元素加载完成后截图
async function captureAfterLoad(element, delay = 1000) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const canvas = await html2canvas(element);
      resolve(canvas.toDataURL('image/png'));
    }, delay);
  });
}

// 等待图片加载完成
function waitForImages(element) {
  return new Promise((resolve) => {
    const images = element.querySelectorAll('img');
    let loadedCount = 0;
    
    if (images.length === 0) {
      resolve();
      return;
    }
    
    images.forEach(img => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.addEventListener('load', () => {
          loadedCount++;
          if (loadedCount === images.length) {
            resolve();
          }
        });
      }
    });
    
    if (loadedCount === images.length) {
      resolve();
    }
  });
}

// 使用示例
async function captureWithImages(element) {
  await waitForImages(element);
  const canvas = await html2canvas(element);
  return canvas.toDataURL('image/png');
}
```

### 5.2 批量截图

```javascript
// 批量截图多个元素
async function captureMultipleElements(selectors) {
  const screenshots = [];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const canvas = await html2canvas(element);
      screenshots.push({
        selector,
        dataUrl: canvas.toDataURL('image/png')
      });
    }
  }
  
  return screenshots;
}

// 使用示例
const selectors = ['.header', '.content', '.footer'];
const screenshots = await captureMultipleElements(selectors);

screenshots.forEach((screenshot, index) => {
  downloadImage(screenshot.dataUrl, `screenshot-${index}.png`);
});
```

### 5.3 截图编辑功能

```javascript
// 截图后添加水印
function addWatermark(canvas, watermarkText) {
  const ctx = canvas.getContext('2d');
  
  // 设置水印样式
  ctx.font = '20px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // 添加水印
  ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 30);
  
  return canvas.toDataURL('image/png');
}

// 截图后添加边框
function addBorder(canvas, borderWidth = 2, borderColor = '#000000') {
  const ctx = canvas.getContext('2d');
  
  // 绘制边框
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/png');
}

// 截图后调整大小
function resizeCanvas(canvas, newWidth, newHeight) {
  const newCanvas = document.createElement('canvas');
  const ctx = newCanvas.getContext('2d');
  
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  
  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  
  return newCanvas.toDataURL('image/png');
}
```

## 六、移动端截图

### 6.1 移动端适配

```javascript
// 移动端截图适配
async function captureMobileElement(element) {
  const options = {
    scale: window.devicePixelRatio || 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: element.offsetWidth,
    height: element.offsetHeight,
    scrollX: 0,
    scrollY: 0
  };
  
  const canvas = await html2canvas(element, options);
  return canvas.toDataURL('image/png');
}

// 处理移动端触摸事件
function setupMobileScreenshot() {
  let startX, startY, endX, endY;
  
  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  });
  
  document.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;
    
    // 检测滑动方向
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // 水平滑动
      if (deltaX > 0) {
        console.log('向右滑动');
      } else {
        console.log('向左滑动');
      }
    } else {
      // 垂直滑动
      if (deltaY > 0) {
        console.log('向下滑动');
      } else {
        console.log('向上滑动');
      }
    }
  });
}
```

### 6.2 移动端长截图

```javascript
// 移动端长截图实现
async function captureMobileLongPage() {
  const element = document.body;
  const originalScrollTop = window.pageYOffset;
  
  // 分段截图
  const viewportHeight = window.innerHeight;
  const totalHeight = element.scrollHeight;
  const segments = Math.ceil(totalHeight / viewportHeight);
  
  const canvases = [];
  
  for (let i = 0; i < segments; i++) {
    const scrollTop = i * viewportHeight;
    window.scrollTo(0, scrollTop);
    
    // 等待滚动完成
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(element, {
      height: viewportHeight,
      width: window.innerWidth,
      scrollX: 0,
      scrollY: 0,
      scale: 1,
      useCORS: true,
      allowTaint: true
    });
    
    canvases.push(canvas);
  }
  
  // 恢复滚动位置
  window.scrollTo(0, originalScrollTop);
  
  // 合并Canvas
  return mergeCanvases(canvases);
}

// 合并多个Canvas
function mergeCanvases(canvases) {
  const totalHeight = canvases.reduce((sum, canvas) => sum + canvas.height, 0);
  const width = canvases[0].width;
  
  const mergedCanvas = document.createElement('canvas');
  const ctx = mergedCanvas.getContext('2d');
  
  mergedCanvas.width = width;
  mergedCanvas.height = totalHeight;
  
  let y = 0;
  canvases.forEach(canvas => {
    ctx.drawImage(canvas, 0, y);
    y += canvas.height;
  });
  
  return mergedCanvas.toDataURL('image/png');
}
```

## 七、截图库和工具

### 7.1 常用截图库

```javascript
// html2canvas 配置选项
const html2canvasOptions = {
  allowTaint: true,           // 允许跨域图片
  backgroundColor: '#ffffff', // 背景色
  scale: 2,                  // 缩放比例
  useCORS: true,             // 使用CORS
  logging: false,             // 关闭日志
  width: 800,                // 宽度
  height: 600,               // 高度
  scrollX: 0,                // X轴滚动位置
  scrollY: 0,                // Y轴滚动位置
  windowWidth: 1024,          // 窗口宽度
  windowHeight: 768,          // 窗口高度
  ignoreElements: (element) => {
    // 忽略特定元素
    return element.classList.contains('ignore-screenshot');
  },
  onclone: (clonedDoc) => {
    // 克隆文档时的回调
    console.log('文档已克隆');
  }
};

// dom-to-image 配置选项
const domToImageOptions = {
  quality: 0.9,              // 图片质量
  bgcolor: '#ffffff',         // 背景色
  width: 800,                // 宽度
  height: 600,               // 高度
  style: {                   // 自定义样式
    transform: 'scale(1)',
    transformOrigin: 'top left'
  },
  filter: (node) => {        // 过滤节点
    return !node.classList.contains('no-screenshot');
  }
};
```

### 7.2 截图工具类

```javascript
// 截图工具类
class ScreenshotTool {
  constructor(options = {}) {
    this.options = {
      format: 'png',
      quality: 0.9,
      scale: 1,
      backgroundColor: '#ffffff',
      ...options
    };
  }
  
  // 截图元素
  async captureElement(element, customOptions = {}) {
    const options = { ...this.options, ...customOptions };
    
    try {
      const canvas = await html2canvas(element, options);
      return canvas.toDataURL(`image/${this.options.format}`);
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  }
  
  // 截图页面
  async capturePage(customOptions = {}) {
    return this.captureElement(document.body, customOptions);
  }
  
  // 截图视口
  async captureViewport(customOptions = {}) {
    const options = {
      ...this.options,
      height: window.innerHeight,
      width: window.innerWidth,
      scrollX: window.pageXOffset,
      scrollY: window.pageYOffset,
      ...customOptions
    };
    
    return this.captureElement(document.documentElement, options);
  }
  
  // 批量截图
  async captureMultiple(selectors, customOptions = {}) {
    const results = [];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const screenshot = await this.captureElement(element, customOptions);
        results.push({ selector, screenshot });
      }
    }
    
    return results;
  }
  
  // 下载截图
  download(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
  
  // 复制到剪贴板
  async copyToClipboard(dataUrl) {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (error) {
      console.error('复制失败:', error);
      return false;
    }
  }
}

// 使用示例
const screenshotTool = new ScreenshotTool({
  format: 'png',
  quality: 0.9,
  scale: 2
});

// 截图元素
const element = document.getElementById('content');
const screenshot = await screenshotTool.captureElement(element);
screenshotTool.download(screenshot, 'content.png');

// 复制到剪贴板
await screenshotTool.copyToClipboard(screenshot);
```

## 八、性能优化

### 8.1 截图性能优化

```javascript
// 性能优化的截图函数
async function optimizedCapture(element) {
  // 1. 预加载图片
  await preloadImages(element);
  
  // 2. 使用Web Worker（如果支持）
  if (window.Worker) {
    return await captureWithWorker(element);
  }
  
  // 3. 分块处理大元素
  if (element.scrollHeight > 5000) {
    return await captureInChunks(element);
  }
  
  // 4. 使用requestIdleCallback
  return new Promise((resolve) => {
    requestIdleCallback(async () => {
      const canvas = await html2canvas(element);
      resolve(canvas.toDataURL('image/png'));
    });
  });
}

// 预加载图片
async function preloadImages(element) {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map(img => {
    return new Promise((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
      }
    });
  });
  
  await Promise.all(promises);
}

// 分块截图
async function captureInChunks(element) {
  const chunkHeight = 2000;
  const totalHeight = element.scrollHeight;
  const chunks = Math.ceil(totalHeight / chunkHeight);
  
  const canvases = [];
  
  for (let i = 0; i < chunks; i++) {
    const startY = i * chunkHeight;
    const endY = Math.min(startY + chunkHeight, totalHeight);
    
    const canvas = await html2canvas(element, {
      height: endY - startY,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: startY,
      scale: 1,
      useCORS: true,
      allowTaint: true
    });
    
    canvases.push(canvas);
  }
  
  return mergeCanvases(canvases);
}
```

### 8.2 内存管理

```javascript
// 内存管理
class ScreenshotManager {
  constructor() {
    this.canvasCache = new Map();
    this.maxCacheSize = 10;
  }
  
  // 清理缓存
  clearCache() {
    this.canvasCache.clear();
  }
  
  // 获取缓存的截图
  getCachedScreenshot(key) {
    return this.canvasCache.get(key);
  }
  
  // 缓存截图
  cacheScreenshot(key, dataUrl) {
    if (this.canvasCache.size >= this.maxCacheSize) {
      const firstKey = this.canvasCache.keys().next().value;
      this.canvasCache.delete(firstKey);
    }
    
    this.canvasCache.set(key, dataUrl);
  }
  
  // 截图并缓存
  async captureAndCache(element, key) {
    const cached = this.getCachedScreenshot(key);
    if (cached) {
      return cached;
    }
    
    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL('image/png');
    
    this.cacheScreenshot(key, dataUrl);
    
    // 清理Canvas内存
    canvas.width = 0;
    canvas.height = 0;
    
    return dataUrl;
  }
}
```

## 九、错误处理和兼容性

### 9.1 错误处理

```javascript
// 错误处理
async function safeCapture(element, options = {}) {
  try {
    // 检查元素是否存在
    if (!element) {
      throw new Error('元素不存在');
    }
    
    // 检查浏览器支持
    if (!window.html2canvas) {
      throw new Error('html2canvas 未加载');
    }
    
    // 检查元素是否可见
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new Error('元素不可见');
    }
    
    const canvas = await html2canvas(element, options);
    return canvas.toDataURL('image/png');
    
  } catch (error) {
    console.error('截图失败:', error);
    
    // 返回错误信息
    return {
      error: true,
      message: error.message,
      fallback: createFallbackImage(element)
    };
  }
}

// 创建备用图片
function createFallbackImage(element) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = 400;
  canvas.height = 300;
  
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('截图失败', canvas.width / 2, canvas.height / 2);
  
  return canvas.toDataURL('image/png');
}
```

### 9.2 浏览器兼容性

```javascript
// 浏览器兼容性检查
function checkBrowserSupport() {
  const support = {
    html2canvas: typeof html2canvas !== 'undefined',
    canvas: !!document.createElement('canvas').getContext,
    blob: !!window.Blob,
    fileReader: !!window.FileReader,
    clipboard: !!navigator.clipboard,
    screenCapture: !!navigator.mediaDevices?.getDisplayMedia
  };
  
  return support;
}

// 根据支持情况选择截图方法
async function adaptiveCapture(element) {
  const support = checkBrowserSupport();
  
  if (support.html2canvas) {
    return await html2canvas(element);
  } else if (support.canvas) {
    return await fallbackCanvasCapture(element);
  } else {
    throw new Error('浏览器不支持截图功能');
  }
}

// 备用Canvas截图
async function fallbackCanvasCapture(element) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const rect = element.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // 简单的文本截图
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#000000';
  ctx.font = '14px Arial';
  ctx.fillText(element.textContent || '内容', 10, 20);
  
  return canvas.toDataURL('image/png');
}
```

## 十、实际应用示例

```javascript
// React截图组件
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

function ScreenshotComponent() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const targetRef = useRef(null);
  
  const captureScreenshot = async () => {
    setIsCapturing(true);
    
    try {
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setScreenshot(dataUrl);
    } catch (error) {
      console.error('截图失败:', error);
    } finally {
      setIsCapturing(false);
    }
  };
  
  const downloadScreenshot = () => {
    if (screenshot) {
      const link = document.createElement('a');
      link.download = 'screenshot.png';
      link.href = screenshot;
      link.click();
    }
  };
  
  const copyToClipboard = async () => {
    if (screenshot) {
      try {
        const response = await fetch(screenshot);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('已复制到剪贴板');
      } catch (error) {
        console.error('复制失败:', error);
      }
    }
  };
  
  return (
    <div>
      <div ref={targetRef} className="screenshot-target">
        <h2>这是要截图的内容</h2>
        <p>这里可以包含任何HTML内容</p>
        <img src="example.jpg" alt="示例图片" />
      </div>
      
      <div className="screenshot-controls">
        <button 
          onClick={captureScreenshot} 
          disabled={isCapturing}
        >
          {isCapturing ? '截图中...' : '截图'}
        </button>
        
        {screenshot && (
          <>
            <button onClick={downloadScreenshot}>
              下载
            </button>
            <button onClick={copyToClipboard}>
              复制
            </button>
          </>
        )}
      </div>
      
      {screenshot && (
        <div className="screenshot-preview">
          <img src={screenshot} alt="截图预览" />
        </div>
      )}
    </div>
  );
}

export default ScreenshotComponent;
```
