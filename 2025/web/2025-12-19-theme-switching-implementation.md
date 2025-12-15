# 站点一键换肤实现方案详解

## 一、换肤技术方案概览

### 1.1 主流实现方式对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| CSS变量 | 性能好、易维护 | 兼容性要求 | 现代浏览器 |
| 类名切换 | 兼容性好 | 样式冗余 | 传统项目 |
| 动态样式表 | 灵活度高 | 实现复杂 | 复杂主题 |
| CSS-in-JS | 组件化 | 运行时开销 | React项目 |
| 预编译 | 性能最优 | 构建复杂 | 大型项目 |

## 二、CSS变量方案（推荐）

### 2.1 基础实现

```css
/* 定义主题变量 */
:root {
  /* 浅色主题 */
  --primary-color: #1890ff;
  --secondary-color: #52c41a;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #d9d9d9;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

/* 深色主题 */
[data-theme="dark"] {
  --primary-color: #177ddc;
  --secondary-color: #49aa19;
  --background-color: #141414;
  --text-color: #ffffff;
  --border-color: #434343;
  --shadow-color: rgba(255, 255, 255, 0.1);
}

/* 使用变量 */
.theme-button {
  background-color: var(--primary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px var(--shadow-color);
}

.theme-card {
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}
```

### 2.2 JavaScript控制

```javascript
/**
 * 主题切换管理器
 */
class ThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'light';
    this.themes = {
      light: {
        '--primary-color': '#1890ff',
        '--secondary-color': '#52c41a',
        '--background-color': '#ffffff',
        '--text-color': '#333333',
        '--border-color': '#d9d9d9',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)',
      },
      dark: {
        '--primary-color': '#177ddc',
        '--secondary-color': '#49aa19',
        '--background-color': '#141414',
        '--text-color': '#ffffff',
        '--border-color': '#434343',
        '--shadow-color': 'rgba(255, 255, 255, 0.1)',
      },
      blue: {
        '--primary-color': '#1890ff',
        '--secondary-color': '#13c2c2',
        '--background-color': '#f0f8ff',
        '--text-color': '#1a1a1a',
        '--border-color': '#91d5ff',
        '--shadow-color': 'rgba(24, 144, 255, 0.2)',
      },
    };
    
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  }

  /**
   * 应用主题
   */
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) {
      console.warn(`主题 ${themeName} 不存在`);
      return;
    }

    const root = document.documentElement;
    
    // 移除之前的主题类
    Object.keys(this.themes).forEach(theme => {
      root.classList.remove(`theme-${theme}`);
    });
    
    // 添加新主题类
    root.classList.add(`theme-${themeName}`);
    
    // 设置CSS变量
    Object.entries(theme).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    this.currentTheme = themeName;
    this.storeTheme(themeName);
    
    // 触发主题变更事件
    this.dispatchThemeChange(themeName);
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    const themeNames = Object.keys(this.themes);
    const currentIndex = themeNames.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    
    this.applyTheme(themeNames[nextIndex]);
  }

  /**
   * 设置主题
   */
  setTheme(themeName) {
    this.applyTheme(themeName);
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * 获取存储的主题
   */
  getStoredTheme() {
    try {
      return localStorage.getItem('theme') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (error) {
      return 'light';
    }
  }

  /**
   * 存储主题
   */
  storeTheme(themeName) {
    try {
      localStorage.setItem('theme', themeName);
    } catch (error) {
      console.warn('无法存储主题设置:', error);
    }
  }

  /**
   * 设置事件监听
   */
  setupEventListeners() {
    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // 监听主题变更事件
    document.addEventListener('themeChange', (e) => {
      console.log('主题已切换为:', e.detail.theme);
    });
  }

  /**
   * 触发主题变更事件
   */
  dispatchThemeChange(themeName) {
    const event = new CustomEvent('themeChange', {
      detail: { theme: themeName }
    });
    document.dispatchEvent(event);
  }

  /**
   * 添加自定义主题
   */
  addCustomTheme(name, variables) {
    this.themes[name] = variables;
  }

  /**
   * 获取所有可用主题
   */
  getAvailableThemes() {
    return Object.keys(this.themes);
  }
}

// 使用示例
const themeManager = new ThemeManager();

// 切换主题按钮
document.getElementById('theme-toggle').addEventListener('click', () => {
  themeManager.toggleTheme();
});

// 主题选择器
document.getElementById('theme-selector').addEventListener('change', (e) => {
  themeManager.setTheme(e.target.value);
});
```

## 三、类名切换方案

### 3.1 CSS类名定义

```css
/* 基础样式 */
.theme-button {
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* 浅色主题 */
.theme-light .theme-button {
  background-color: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}

.theme-light .theme-card {
  background-color: #ffffff;
  color: #333333;
  border: 1px solid #d9d9d9;
}

/* 深色主题 */
.theme-dark .theme-button {
  background-color: #177ddc;
  color: #ffffff;
  border: 1px solid #177ddc;
}

.theme-dark .theme-card {
  background-color: #141414;
  color: #ffffff;
  border: 1px solid #434343;
}

/* 蓝色主题 */
.theme-blue .theme-button {
  background-color: #1890ff;
  color: #ffffff;
  border: 1px solid #1890ff;
}

.theme-blue .theme-card {
  background-color: #f0f8ff;
  color: #1a1a1a;
  border: 1px solid #91d5ff;
}
```

### 3.2 JavaScript实现

```javascript
/**
 * 类名切换主题管理器
 */
class ClassThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'light';
    this.themes = ['light', 'dark', 'blue'];
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
  }

  applyTheme(themeName) {
    const body = document.body;
    
    // 移除所有主题类
    this.themes.forEach(theme => {
      body.classList.remove(`theme-${theme}`);
    });
    
    // 添加新主题类
    body.classList.add(`theme-${themeName}`);
    
    this.currentTheme = themeName;
    this.storeTheme(themeName);
    
    // 触发事件
    this.dispatchThemeChange(themeName);
  }

  toggleTheme() {
    const currentIndex = this.themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.applyTheme(this.themes[nextIndex]);
  }

  setTheme(themeName) {
    if (this.themes.includes(themeName)) {
      this.applyTheme(themeName);
    }
  }

  getStoredTheme() {
    return localStorage.getItem('theme') || 'light';
  }

  storeTheme(themeName) {
    localStorage.setItem('theme', themeName);
  }

  dispatchThemeChange(themeName) {
    const event = new CustomEvent('themeChange', {
      detail: { theme: themeName }
    });
    document.dispatchEvent(event);
  }
}
```

## 四、动态样式表方案

### 4.1 动态加载CSS

```javascript
/**
 * 动态样式表主题管理器
 */
class DynamicThemeManager {
  constructor() {
    this.currentTheme = this.getStoredTheme() || 'light';
    this.themeLinks = new Map();
    this.themes = {
      light: '/css/themes/light.css',
      dark: '/css/themes/dark.css',
      blue: '/css/themes/blue.css',
    };
    
    this.init();
  }

  init() {
    this.loadTheme(this.currentTheme);
  }

  /**
   * 加载主题样式表
   */
  loadTheme(themeName) {
    const themeUrl = this.themes[themeName];
    if (!themeUrl) {
      console.warn(`主题 ${themeName} 不存在`);
      return;
    }

    // 移除当前主题样式表
    this.removeCurrentTheme();

    // 创建新的样式表链接
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = themeUrl;
    link.id = `theme-${themeName}`;
    
    // 样式表加载完成回调
    link.onload = () => {
      this.currentTheme = themeName;
      this.storeTheme(themeName);
      this.dispatchThemeChange(themeName);
    };

    // 加载失败处理
    link.onerror = () => {
      console.error(`主题样式表加载失败: ${themeUrl}`);
      // 降级到默认主题
      if (themeName !== 'light') {
        this.loadTheme('light');
      }
    };

    // 添加到页面
    document.head.appendChild(link);
    this.themeLinks.set(themeName, link);
  }

  /**
   * 移除当前主题样式表
   */
  removeCurrentTheme() {
    this.themeLinks.forEach((link, themeName) => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    });
    this.themeLinks.clear();
  }

  /**
   * 切换主题
   */
  toggleTheme() {
    const themeNames = Object.keys(this.themes);
    const currentIndex = themeNames.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    
    this.loadTheme(themeNames[nextIndex]);
  }

  /**
   * 设置主题
   */
  setTheme(themeName) {
    this.loadTheme(themeName);
  }

  getStoredTheme() {
    return localStorage.getItem('theme') || 'light';
  }

  storeTheme(themeName) {
    localStorage.setItem('theme', themeName);
  }

  dispatchThemeChange(themeName) {
    const event = new CustomEvent('themeChange', {
      detail: { theme: themeName }
    });
    document.dispatchEvent(event);
  }
}
```

## 五、React主题方案

### 5.1 Context + CSS变量

```jsx
/**
 * React主题上下文
 */
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored || 'light';
  });

  const themes = {
    light: {
      '--primary-color': '#1890ff',
      '--secondary-color': '#52c41a',
      '--background-color': '#ffffff',
      '--text-color': '#333333',
      '--border-color': '#d9d9d9',
    },
    dark: {
      '--primary-color': '#177ddc',
      '--secondary-color': '#49aa19',
      '--background-color': '#141414',
      '--text-color': '#ffffff',
      '--border-color': '#434343',
    },
  };

  useEffect(() => {
    const root = document.documentElement;
    const themeVars = themes[theme];
    
    if (themeVars) {
      Object.entries(themeVars).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 主题切换组件
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

// 使用示例
function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header>
          <ThemeToggle />
        </header>
        <main>
          {/* 应用内容 */}
        </main>
      </div>
    </ThemeProvider>
  );
}
```

### 5.2 Styled Components方案

```jsx
/**
 * Styled Components主题方案
 */
import styled, { ThemeProvider } from 'styled-components';

const lightTheme = {
  colors: {
    primary: '#1890ff',
    secondary: '#52c41a',
    background: '#ffffff',
    text: '#333333',
    border: '#d9d9d9',
  },
};

const darkTheme = {
  colors: {
    primary: '#177ddc',
    secondary: '#49aa19',
    background: '#141414',
    text: '#ffffff',
    border: '#434343',
  },
};

const StyledButton = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const StyledCard = styled.div`
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 16px;
  border-radius: 8px;
`;

// 主题切换组件
const ThemeToggle = ({ theme, onToggle }) => (
  <button onClick={onToggle}>
    {theme === 'light' ? '🌙' : '☀️'}
  </button>
);

// 主应用组件
function App() {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <div>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <StyledCard>
          <StyledButton>主题按钮</StyledButton>
        </StyledCard>
      </div>
    </ThemeProvider>
  );
}
```

## 六、Vue主题方案

### 6.1 Vue 3 Composition API

```vue
<!-- ThemeComposable.vue -->
<script setup>
import { ref, watch } from 'vue';

const currentTheme = ref(localStorage.getItem('theme') || 'light');

const themes = {
  light: {
    '--primary-color': '#1890ff',
    '--secondary-color': '#52c41a',
    '--background-color': '#ffffff',
    '--text-color': '#333333',
    '--border-color': '#d9d9d9',
  },
  dark: {
    '--primary-color': '#177ddc',
    '--secondary-color': '#49aa19',
    '--background-color': '#141414',
    '--text-color': '#ffffff',
    '--border-color': '#434343',
  },
};

const applyTheme = (themeName) => {
  const root = document.documentElement;
  const themeVars = themes[themeName];
  
  if (themeVars) {
    Object.entries(themeVars).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }
  
  currentTheme.value = themeName;
  localStorage.setItem('theme', themeName);
};

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
};

const setTheme = (themeName) => {
  if (themes[themeName]) {
    applyTheme(themeName);
  }
};

// 监听主题变化
watch(currentTheme, (newTheme) => {
  applyTheme(newTheme);
}, { immediate: true });

// 导出给组件使用
defineExpose({
  currentTheme,
  toggleTheme,
  setTheme,
});
</script>
```

```vue
<!-- ThemeToggle.vue -->
<template>
  <button 
    class="theme-toggle"
    @click="toggleTheme"
    :aria-label="`切换到${currentTheme === 'light' ? '深色' : '浅色'}主题`"
  >
    {{ currentTheme === 'light' ? '🌙' : '☀️' }}
  </button>
</template>

<script setup>
import { useTheme } from './ThemeComposable.vue';

const { currentTheme, toggleTheme } = useTheme();
</script>

<style scoped>
.theme-toggle {
  background: var(--primary-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  opacity: 0.8;
}
</style>
```

## 七、高级功能实现

### 7.1 主题预览功能

```javascript
/**
 * 主题预览管理器
 */
class ThemePreviewManager {
  constructor() {
    this.previewElement = null;
    this.originalTheme = null;
  }

  /**
   * 开始预览主题
   */
  startPreview(themeName) {
    this.originalTheme = themeManager.getCurrentTheme();
    
    // 创建预览元素
    this.previewElement = document.createElement('div');
    this.previewElement.id = 'theme-preview';
    this.previewElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
    `;
    
    // 应用预览主题
    this.applyPreviewTheme(themeName);
    
    document.body.appendChild(this.previewElement);
  }

  /**
   * 应用预览主题
   */
  applyPreviewTheme(themeName) {
    const theme = themeManager.themes[themeName];
    if (!theme) return;

    Object.entries(theme).forEach(([property, value]) => {
      this.previewElement.style.setProperty(property, value);
    });
  }

  /**
   * 结束预览
   */
  endPreview() {
    if (this.previewElement) {
      document.body.removeChild(this.previewElement);
      this.previewElement = null;
    }
  }

  /**
   * 确认应用主题
   */
  confirmTheme(themeName) {
    this.endPreview();
    themeManager.setTheme(themeName);
  }
}

// 使用示例
const previewManager = new ThemePreviewManager();

// 鼠标悬停预览
document.querySelectorAll('.theme-option').forEach(option => {
  option.addEventListener('mouseenter', () => {
    const themeName = option.dataset.theme;
    previewManager.startPreview(themeName);
  });
  
  option.addEventListener('mouseleave', () => {
    previewManager.endPreview();
  });
  
  option.addEventListener('click', () => {
    const themeName = option.dataset.theme;
    previewManager.confirmTheme(themeName);
  });
});
```

### 7.2 主题动画过渡

```css
/* 主题切换动画 */
.theme-transition {
  transition: 
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* 页面切换动画 */
@keyframes themeFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.theme-change {
  animation: themeFadeIn 0.3s ease-out;
}

/* 按钮切换动画 */
.theme-toggle {
  position: relative;
  overflow: hidden;
}

.theme-toggle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.theme-toggle:active::before {
  width: 200px;
  height: 200px;
}
```

### 7.3 主题持久化

```javascript
/**
 * 主题持久化管理器
 */
class ThemePersistenceManager {
  constructor() {
    this.storageKey = 'theme-settings';
    this.settings = this.loadSettings();
  }

  /**
   * 保存主题设置
   */
  saveSettings(settings) {
    try {
      const data = {
        ...this.settings,
        ...settings,
        timestamp: Date.now(),
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      this.settings = data;
    } catch (error) {
      console.warn('无法保存主题设置:', error);
    }
  }

  /**
   * 加载主题设置
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {
        theme: 'light',
        autoSwitch: false,
        switchTime: { start: '18:00', end: '08:00' },
        customThemes: {},
      };
    } catch (error) {
      console.warn('无法加载主题设置:', error);
      return {
        theme: 'light',
        autoSwitch: false,
        switchTime: { start: '18:00', end: '08:00' },
        customThemes: {},
      };
    }
  }

  /**
   * 自动主题切换
   */
  setupAutoSwitch() {
    if (!this.settings.autoSwitch) return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this.parseTime(this.settings.switchTime.start);
      const endTime = this.parseTime(this.settings.switchTime.end);

      let shouldBeDark = false;
      
      if (startTime < endTime) {
        // 同一天内的时间段
        shouldBeDark = currentTime >= startTime && currentTime < endTime;
      } else {
        // 跨天的时间段
        shouldBeDark = currentTime >= startTime || currentTime < endTime;
      }

      const targetTheme = shouldBeDark ? 'dark' : 'light';
      if (themeManager.getCurrentTheme() !== targetTheme) {
        themeManager.setTheme(targetTheme);
      }
    };

    // 立即检查一次
    checkTime();
    
    // 每分钟检查一次
    setInterval(checkTime, 60000);
  }

  /**
   * 解析时间字符串
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * 同步到云端
   */
  async syncToCloud() {
    try {
      const response = await fetch('/api/user/theme-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.settings),
      });
      
      if (response.ok) {
        console.log('主题设置已同步到云端');
      }
    } catch (error) {
      console.error('同步主题设置失败:', error);
    }
  }

  /**
   * 从云端同步
   */
  async syncFromCloud() {
    try {
      const response = await fetch('/api/user/theme-settings');
      if (response.ok) {
        const cloudSettings = await response.json();
        this.saveSettings(cloudSettings);
        return cloudSettings;
      }
    } catch (error) {
      console.error('从云端同步主题设置失败:', error);
    }
    return null;
  }
}
```

## 八、最佳实践建议

### 8.1 性能优化

1. **CSS变量方案**：性能最佳，推荐使用
2. **避免频繁切换**：添加防抖机制
3. **预加载主题**：关键主题提前加载
4. **缓存策略**：合理使用localStorage

### 8.2 用户体验

1. **平滑过渡**：添加过渡动画
2. **即时预览**：鼠标悬停预览效果
3. **记住选择**：持久化用户偏好
4. **系统跟随**：跟随系统主题设置

### 8.3 兼容性考虑

1. **渐进增强**：基础功能优先
2. **降级方案**：不支持时的备选方案
3. **测试覆盖**：多浏览器测试
4. **性能监控**：监控主题切换性能

这套完整的换肤方案涵盖了从基础实现到高级功能的各个方面，可以根据项目需求选择合适的实现方式！
