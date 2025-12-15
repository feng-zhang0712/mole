# 站点字体切换

## 一、字体切换技术方案概览

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| CSS变量 | 性能好、易维护、动态性强 | IE兼容性差 | 现代浏览器项目 |
| 类名切换 | 兼容性好、实现简单 | 样式冗余、维护困难 | 传统项目、IE支持 |
| 动态字体加载 | 按需加载、减少初始包大小 | 实现复杂、加载延迟 | 多字体项目 |
| Web Font API | 功能强大、云端管理 | 依赖服务、网络要求 | 企业级应用 |
| CSS-in-JS | 组件化、类型安全 | 运行时开销、学习成本 | React/Vue项目 |

## 二、使用 CSS 变量（推荐）

通过 CSS 变量是现代 Web 开发中实现字体切换的最佳选择，具有性能优异、维护简单、动态性强等优点。

### 2.1 基础 CSS 变量定义

```css
/* 在根元素定义全局字体变量，支持所有子元素继承 */
:root {
  --font-family-primary: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  --font-family-secondary: 'Helvetica Neue', Arial, sans-serif;
  --font-size-base: 14px;
  --font-size-large: 16px;
  --font-size-small: 12px;
}

[data-font="chinese"] {
  --font-family-primary: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --font-family-secondary: 'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif;
}

[data-font="english"] {
  --font-family-primary: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
  --font-family-secondary: 'Open Sans', 'Lato', sans-serif;
}

.font-heading {
  font-family: var(--font-family-secondary);
  font-size: var(--font-size-large);
}

.font-text {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
}
```

### 2.2 JavaScript 控制实现

JavaScript 控制部分负责字体切换的逻辑处理，包括字体配置管理、用户偏好存储、事件触发等功能。

```javascript
// 字体配置对象 - 定义所有可用的字体主题
const fontConfigs = {
  default: {
    '--font-family-primary': "'PingFang SC', 'Microsoft YaHei', sans-serif",
    '--font-family-secondary': "'Helvetica Neue', Arial, sans-serif",
  },
  chinese: {
    '--font-family-primary': "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    '--font-family-secondary': "'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif",
  },
  english: {
    '--font-family-primary': "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
    '--font-family-secondary': "'Open Sans', 'Lato', sans-serif",
  },
};

let currentFont = getStoredFont() || 'default';

function applyFont(fontName) {
  const font = fontConfigs[fontName];
  if (!font) {
    return;
  }

  const root = document.documentElement;
  
  Object.keys(fontConfigs).forEach(font => {
    root.classList.remove(`font-${font}`);
  });
  
  root.classList.add(`font-${fontName}`);
  
  Object.entries(font).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  localStorage.setItem('font', fontName);
  currentFont = fontName;
  
  dispatchFontChange(fontName);
}

function getStoredFont() {
  try {
    return localStorage.getItem('font') || 'default';
  } catch (error) {
    return 'default';
  }
}

function dispatchFontChange(fontName) {
  const event = new CustomEvent('fontChange', {
    detail: { font: fontName }
  });
  document.dispatchEvent(event);
}

async function preloadFont(fontFamily) {
  if ('fonts' in document) {
    await document.fonts.load(`16px ${fontFamily}`);
  }
}

async function checkFontAvailability(fontFamily) {
  if ('fonts' in document) {
    try {
      const fontFace = new FontFace(fontFamily, `url(/fonts/${fontFamily}.woff2)`);
      await fontFace.load();
      return true;
    } catch (error) {
      return false;
    }
  }
  return true; // 降级处理
}

document.addEventListener('DOMContentLoaded', () => applyFont(currentFont));
document.getElementById('font-selector')?.addEventListener('change', (e) => {
  applyFont(e.target.value);
});
```

## 动态字体加载

动态字体加载适用于需要按需加载字体文件的场景，可以显著减少初始页面加载时间，特别适合字体资源较多的项目。

### Web Font 动态加载实现

动态字体加载通过 JavaScript API 动态创建和加载字体文件，实现按需加载和缓存管理：

```javascript
// 字体加载状态管理
const loadedFonts = new Set(); // 已加载的字体
const loadingFonts = new Map(); // 正在加载的字体

// 字体配置文件
const fontConfigs = {
  'chinese-elegant': {
    name: 'Chinese Elegant',
    files: [
      { url: '/fonts/chinese-elegant-regular.woff2', weight: '400' },
      { url: '/fonts/chinese-elegant-bold.woff2', weight: '700' },
    ],
    fallback: "'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  'english-modern': {
    name: 'English Modern',
    files: [
      { url: '/fonts/english-modern-regular.woff2', weight: '400' },
      { url: '/fonts/english-modern-bold.woff2', weight: '700' },
    ],
    fallback: "'Inter', 'Helvetica Neue', sans-serif",
  },
  'mono-code': {
    name: 'Mono Code',
    files: [
      { url: '/fonts/mono-code-regular.woff2', weight: '400' },
      { url: '/fonts/mono-code-bold.woff2', weight: '700' },
    ],
    fallback: "'JetBrains Mono', 'Monaco', monospace",
  },
};

async function loadFont(fontKey) {
  const config = fontConfigs[fontKey];
  if (!config) {
    throw new Error(`字体配置 ${fontKey} 不存在`);
  }

  if (loadedFonts.has(fontKey)) {
    return Promise.resolve();
  }

  if (loadingFonts.has(fontKey)) {
    return loadingFonts.get(fontKey);
  }

  const loadPromise = doLoadFont(config);
  loadingFonts.set(fontKey, loadPromise);

  try {
    await loadPromise;
    loadedFonts.add(fontKey);
    loadingFonts.delete(fontKey);
  } catch (error) {
    loadingFonts.delete(fontKey);
    throw error;
  }
}

async function doLoadFont(config) {
  const fontFaces = [];

  for (const file of config.files) {
    try {
      const fontFace = new FontFace(config.name, `url(${file.url})`, {
        weight: file.weight,
        style: file.style || 'normal',
      });

      await fontFace.load();
      document.fonts.add(fontFace);
      fontFaces.push(fontFace);
    } catch (error) {
    }
  }

  if (fontFaces.length === 0) {
    throw new Error(`字体 ${config.name} 所有文件加载失败`);
  }

  return fontFaces;
}

async function preloadFonts() {
  const commonFonts = ['chinese-elegant', 'english-modern'];
  try {
    const promises = commonFonts.map(key => loadFont(key));
    await Promise.allSettled(promises);
  } catch (error) {
    console.warn('预加载字体失败:', error);
  }
}

document.addEventListener('DOMContentLoaded', preloadFonts);
```

### CSS @font-face 动态注入

CSS 动态注入方案通过 JavaScript 动态创建和插入 @font-face 规则，实现字体的按需加载和样式管理。

```javascript
const injectedStyles = new Map();

function injectFontCSS(fontKey, fontConfig) {
  if (injectedStyles.has(fontKey)) {
    return;
  }

  const css = generateFontCSS(fontConfig);
  const styleId = `font-${fontKey}`;
  
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = css;
  
  document.head.appendChild(styleElement);
  
  injectedStyles.set(fontKey, styleElement);
}

function generateFontCSS(config) {
  let css = '';
  
  config.files.forEach(file => {
    css += `
      @font-face {
        font-family: "${config.name}";
        src: url("${file.url}") format("woff2");
        font-weight: ${file.weight || '400'};
        font-style: ${file.style || 'normal'};
        font-display: swap;
      }
    `;
  });

  return css;
}

function removeFontCSS(fontKey) {
  const styleElement = injectedStyles.get(fontKey);
  if (styleElement && document.head.contains(styleElement)) {
    document.head.removeChild(styleElement);
    injectedStyles.delete(fontKey);
  }
}

function cleanupInjectedStyles() {
  injectedStyles.forEach((styleElement, fontKey) => {
    if (document.head.contains(styleElement)) {
      document.head.removeChild(styleElement);
    }
  });
  injectedStyles.clear();
}

function isStyleInjected(fontKey) {
  return injectedStyles.has(fontKey);
}
```

## 类名切换方案

类名切换方案是最传统和兼容性最好的字体切换方式，通过CSS类名控制不同字体主题的显示。虽然会产生样式冗余，但在需要支持老版本浏览器的项目中仍然是最可靠的选择。

### CSS 类名定义

类名切换方案通过为不同字体主题定义对应的CSS类，实现字体样式的切换：

```css
.font-text {
  font-size: 14px;
  line-height: 1.5;
  transition: font-family 0.3s ease; /* 添加平滑过渡效果 */
}

.font-heading {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  transition: font-family 0.3s ease;
}

.font-default .font-text {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.font-default .font-heading {
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.font-chinese .font-text {
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

.font-chinese .font-heading {
  font-family: 'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif;
}

.font-english .font-text {
  font-family: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;
}

.font-english .font-heading {
  font-family: 'Open Sans', 'Lato', sans-serif;
}

/* 等宽字体主题 */
.font-mono .font-text {
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
}

.font-mono .font-heading {
  font-family: 'Source Code Pro', 'Consolas', monospace;
}
```

### JavaScript 实现

类名切换的 JavaScript 实现相对简单，主要通过操作 DOM 元素的 classList 来切换字体主题：

```javascript
// 可用字体列表
const availableFonts = ['default', 'chinese', 'english', 'mono'];

// 当前字体状态
let currentFont = getStoredFont() || 'default';

// 应用字体类名到body元素
function applyFontClass(fontName) {
  const body = document.body;
  
  // 移除所有字体类名
  availableFonts.forEach(font => {
    body.classList.remove(`font-${font}`);
  });
  
  // 添加新字体类名
  body.classList.add(`font-${fontName}`);
  
  currentFont = fontName;
  storeFont(fontName);
  
  // 触发字体变更事件
  dispatchFontChange(fontName);
}

// 循环切换字体
function toggleFontClass() {
  const currentIndex = availableFonts.indexOf(currentFont);
  const nextIndex = (currentIndex + 1) % availableFonts.length;
  applyFontClass(availableFonts[nextIndex]);
}

// 设置指定字体
function setFontClass(fontName) {
  if (availableFonts.includes(fontName)) {
    applyFontClass(fontName);
  }
}

// 从本地存储获取字体设置
function getStoredFont() {
  return localStorage.getItem('font') || 'default';
}

// 保存字体设置到本地存储
function storeFont(fontName) {
  localStorage.setItem('font', fontName);
}

// 触发字体变更事件
function dispatchFontChange(fontName) {
  const event = new CustomEvent('fontChange', {
    detail: { font: fontName }
  });
  document.dispatchEvent(event);
}

// 初始化字体设置
function initFontClass() {
  applyFontClass(currentFont);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initFontClass);

// 字体切换按钮事件绑定
document.getElementById('font-toggle')?.addEventListener('click', toggleFontClass);

// 字体选择器事件绑定
document.getElementById('font-selector')?.addEventListener('change', (e) => {
  setFontClass(e.target.value);
});
```

## React 字体方案

React项目中的字体切换可以通过Context API结合CSS变量实现，提供组件化的字体管理方案。

### Context + CSS 变量实现

React 字体方案通过 Context 提供全局字体状态管理，结合 CSS 变量实现动态字体切换：

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [font, setFont] = useState(() => {
    const stored = localStorage.getItem('font');
    return stored || 'default';
  });

  const fonts = {
    default: {
      '--font-family-primary': "'PingFang SC', 'Microsoft YaHei', sans-serif",
      '--font-family-secondary': "'Helvetica Neue', Arial, sans-serif",
      '--font-family-mono': "'Monaco', 'Consolas', monospace",
    },
    chinese: {
      '--font-family-primary': "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      '--font-family-secondary': "'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif",
      '--font-family-mono': "'JetBrains Mono', 'Source Code Pro', monospace",
    },
    english: {
      '--font-family-primary': "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
      '--font-family-secondary': "'Open Sans', 'Lato', sans-serif",
      '--font-family-mono': "'Fira Code', 'Monaco', monospace",
    },
  };

  useEffect(() => {
    const root = document.documentElement;
    const fontVars = fonts[font];
    
    if (fontVars) {
      Object.entries(fontVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
    
    localStorage.setItem('font', font);
  }, [font]);

  const changeFont = (newFont) => {
    if (fonts[newFont]) {
      setFont(newFont);
    }
  };

  return (
    <FontContext.Provider value={{ font, changeFont }}>
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error('useFont must be used within a FontProvider');
  }
  return context;
};

export const FontSelector = () => {
  const { font, changeFont } = useFont();
  
  const fontOptions = [
    { value: 'default', label: '默认字体' },
    { value: 'chinese', label: '中文字体' },
    { value: 'english', label: '英文字体' },
  ];
  
  return (
    <select 
      value={font} 
      onChange={(e) => changeFont(e.target.value)}
      className="font-selector"
    >
      {fontOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
```

### Styled Components 方案

使用 Styled Components 的 ThemeProvider 可以实现更灵活的字体主题管理：

```jsx
import styled, { ThemeProvider } from 'styled-components';
import { useState } from 'react';

const fontThemes = {
  default: {
    primary: "'PingFang SC', 'Microsoft YaHei', sans-serif",
    secondary: "'Helvetica Neue', Arial, sans-serif",
    mono: "'Monaco', 'Consolas', monospace",
  },
  chinese: {
    primary: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    secondary: "'Source Han Sans CN', 'Noto Sans CJK SC', sans-serif",
    mono: "'JetBrains Mono', 'Source Code Pro', monospace",
  },
  english: {
    primary: "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
    secondary: "'Open Sans', 'Lato', sans-serif",
    mono: "'Fira Code', 'Monaco', monospace",
  },
};

// 样式化组件定义
const StyledText = styled.p`
  font-family: ${props => props.theme.fonts.primary};
  font-size: 14px;
  line-height: 1.5;
  transition: font-family 0.3s ease;
`;

const StyledHeading = styled.h1`
  font-family: ${props => props.theme.fonts.secondary};
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  transition: font-family 0.3s ease;
`;

const StyledCode = styled.code`
  font-family: ${props => props.theme.fonts.mono};
  font-size: 13px;
  line-height: 1.6;
  transition: font-family 0.3s ease;
`;

// 字体切换按钮组件
const FontToggle = ({ font, onToggle }) => (
  <button onClick={onToggle}>
    当前字体: {font}
  </button>
);

// 主应用组件
function App() {
  const [font, setFont] = useState('default');
  
  // 循环切换字体
  const toggleFont = () => {
    const fontNames = Object.keys(fontThemes);
    const currentIndex = fontNames.indexOf(font);
    const nextIndex = (currentIndex + 1) % fontNames.length;
    setFont(fontNames[nextIndex]);
  };
  
  // 构建主题对象
  const theme = {
    fonts: fontThemes[font],
  };
  
  return (
    <ThemeProvider theme={theme}>
      <div>
        <FontToggle font={font} onToggle={toggleFont} />
        <StyledHeading>标题文本</StyledHeading>
        <StyledText>正文内容</StyledText>
        <StyledCode>代码片段</StyledCode>
      </div>
    </ThemeProvider>
  );
}
```

## 七、高级功能实现

高级功能实现部分提供了字体预览、性能优化、监控等增强功能，提升用户体验和开发效率。

### 7.1 字体预览功能

字体预览功能允许用户在应用字体前先预览效果，提供更好的交互体验：

```javascript
// 字体预览状态管理
let previewElement = null;
let originalFont = null;

// 开始字体预览
function startFontPreview(fontName) {
  originalFont = currentFont;
  
  // 创建预览遮罩层
  previewElement = document.createElement('div');
  previewElement.id = 'font-preview';
  previewElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.1);
  `;
  
  applyPreviewFont(fontName);
  
  document.body.appendChild(previewElement);
}

function applyPreviewFont(fontName) {
  const font = fontConfigs[fontName];
  if (!font) return;

  // 将预览字体应用到所有元素
  Object.entries(font).forEach(([property, value]) => {
    previewElement.style.setProperty(property, value);
  });
}

function endFontPreview() {
  if (previewElement) {
    document.body.removeChild(previewElement);
    previewElement = null;
  }
}

// 确认应用字体
function confirmFont(fontName) {
  endFontPreview();
  setFont(fontName);
}

// 字体选项事件绑定
document.querySelectorAll('.font-option').forEach(option => {
  option.addEventListener('mouseenter', () => {
    const fontName = option.dataset.font;
    startFontPreview(fontName);
  });
  
  option.addEventListener('mouseleave', () => {
    endFontPreview();
  });
  
  option.addEventListener('click', () => {
    const fontName = option.dataset.font;
    confirmFont(fontName);
  });
});
```

### 字体加载优化

字体加载优化通过预加载、显示策略优化等方式提升字体加载性能和用户体验。

```javascript
// 字体加载状态管理
const preloadFonts = new Set(); // 已预加载的字体
const loadedFonts = new Set(); // 已加载完成的字体
const loadingStrategy = 'swap'; // 字体显示策略

// 预加载关键字体
function preloadCriticalFonts() {
  const criticalFonts = [
    { family: 'PingFang SC', url: '/fonts/pingfang-sc.woff2' },
    { family: 'Inter', url: '/fonts/inter.woff2' },
  ];

  criticalFonts.forEach(font => {
    preloadFont(font.family, font.url);
  });
}

// 预加载单个字体
function preloadFont(fontFamily, fontUrl) {
  if (preloadFonts.has(fontFamily)) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = fontUrl;
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  
  // 加载成功回调
  link.onload = () => {
    loadedFonts.add(fontFamily);
    console.log(`字体 ${fontFamily} 预加载完成`);
  };
  
  // 加载失败回调
  link.onerror = () => {
    console.warn(`字体 ${fontFamily} 预加载失败`);
  };

  document.head.appendChild(link);
  preloadFonts.add(fontFamily);
}

// 优化字体显示策略
function optimizeFontDisplay() {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'PingFang SC';
      font-display: ${loadingStrategy};
    }
  `;
  document.head.appendChild(style);
}

// 检测字体加载状态
async function checkFontLoadStatus(fontFamily) {
  if ('fonts' in document) {
    try {
      await document.fonts.load(`16px ${fontFamily}`);
      return true;
    } catch (error) {
      return false;
    }
  }
  return true;
}

// 获取字体回退策略
function getFontFallback(fontFamily) {
  const fallbacks = {
    'PingFang SC': "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    'Inter': "'Inter', 'Roboto', 'Helvetica Neue', sans-serif",
    'JetBrains Mono': "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
  };
  
  return fallbacks[fontFamily] || 'sans-serif';
}

// 页面加载时预加载关键字体
document.addEventListener('DOMContentLoaded', () => {
  preloadCriticalFonts();
  optimizeFontDisplay();
});
```

### 字体性能监控

字体性能监控通过监听字体加载和渲染过程，收集性能数据并进行分析。

```javascript
// 性能监控数据存储
const performanceMetrics = {
  fontLoadTime: new Map(), // 字体加载时间
  fontRenderTime: new Map(), // 字体渲染时间
  fontSwapTime: new Map(), // 字体切换时间
};

// 初始化性能监控
function initFontPerformanceMonitoring() {
  // 监控字体加载事件
  if ('fonts' in document) {
    document.fonts.addEventListener('loading', (event) => {
      recordFontLoading(event.font);
    });
    
    document.fonts.addEventListener('loadingdone', (event) => {
      recordFontLoaded(event.font);
    });
  }

  // 监控字体渲染
  monitorFontRendering();
}

// 记录字体开始加载
function recordFontLoading(fontFace) {
  const fontFamily = fontFace.family;
  performanceMetrics.fontLoadTime.set(fontFamily, {
    startTime: performance.now(),
    fontFace,
  });
}

// 记录字体加载完成
function recordFontLoaded(fontFace) {
  const fontFamily = fontFace.family;
  const loadInfo = performanceMetrics.fontLoadTime.get(fontFamily);
  
  if (loadInfo) {
    const loadTime = performance.now() - loadInfo.startTime;
    console.log(`字体 ${fontFamily} 加载耗时: ${loadTime.toFixed(2)}ms`);
    
    // 发送性能数据到服务器
    sendPerformanceData({
      type: 'font-load',
      fontFamily,
      loadTime,
    });
  }
}

// 监控字体渲染过程
function monitorFontRendering() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            checkFontRendering(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// 检查元素字体渲染
function checkFontRendering(element) {
  const computedStyle = window.getComputedStyle(element);
  const fontFamily = computedStyle.fontFamily;
  
  if (fontFamily && fontFamily !== 'serif' && fontFamily !== 'sans-serif') {
    const renderTime = performance.now();
    performanceMetrics.fontRenderTime.set(element, {
      fontFamily,
      renderTime,
    });
  }
}

// 发送性能数据到服务器
async function sendPerformanceData(data) {
  try {
    await fetch('/api/analytics/font-performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.warn('字体性能数据上报失败:', error);
  }
}

// 获取性能报告
function getFontPerformanceReport() {
  return {
    fontLoadTimes: Array.from(performanceMetrics.fontLoadTime.entries()),
    fontRenderTimes: Array.from(performanceMetrics.fontRenderTime.entries()),
    timestamp: Date.now(),
  };
}

// 页面加载时初始化监控
document.addEventListener('DOMContentLoaded', initFontPerformanceMonitoring);
```
