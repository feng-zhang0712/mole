# 移动设备检测

## 一、User Agent

```javascript
// 检测是否为移动设备
function isMobile() {
  const ua = navigator.userAgent.toLowerCase();
  
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone', 'ipad', 'ipod', 'mobile safari',
    'windows phone',
    'blackberry',
    'opera mini'
  ];
  
  return mobileKeywords.some(keyword => ua.includes(keyword));
}

// 检测特定设备类型
function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('blackberry')) return 'BlackBerry';
  if (ua.includes('windows phone')) return 'Windows Phone';
  
  return 'Desktop';
}
```

```javascript
function detectMobileDevice() {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  
  const isAndroid = /Android/.test(ua);
  
  const isWindowsPhone = /Windows Phone/.test(ua);
  
  const isBlackBerry = /BlackBerry/.test(ua);
  
  const isOperaMini = /Opera Mini/.test(ua);
  
  const isMobileSafari = /Safari/.test(ua) && /Mobile/.test(ua);
  
  return {
    isMobile: isIOS || isAndroid || isWindowsPhone || isBlackBerry || isOperaMini || isMobileSafari,
    isIOS,
    isAndroid,
    isWindowsPhone,
    isBlackBerry,
    isOperaMini,
    isMobileSafari,
    platform,
    userAgent: ua,
  };
}
```

## 二、屏幕尺寸检测

```javascript
function isMobileByScreen() {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  const mobileBreakpoint = 768; // 平板和手机的分界点
  const phoneBreakpoint = 480;  // 手机的分界点
  
  return {
    isMobile: viewportWidth <= mobileBreakpoint,
    isPhone: viewportWidth <= phoneBreakpoint,
    isTablet: viewportWidth > phoneBreakpoint && viewportWidth <= mobileBreakpoint,
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight
  };
}
```

```javascript
function getResponsiveBreakpoint() {
  const width = window.innerWidth;
  
  if (width < 576) return 'xs';      // 超小屏幕 (手机)
  if (width < 768) return 'sm';      // 小屏幕 (手机)
  if (width < 992) return 'md';      // 中等屏幕 (平板)
  if (width < 1200) return 'lg';     // 大屏幕 (小桌面)
  if (width < 1400) return 'xl';     // 超大屏幕 (大桌面)
  return 'xxl';                      // 超超大屏幕
}

function isMobileByBreakpoint() {
  const breakpoint = getResponsiveBreakpoint();
  return ['xs', 'sm'].includes(breakpoint);
}
```

## 三、触摸能力检测

检测触摸支持

```javascript
function isMobileByTouch() {
  const hasTouchEvents = 'ontouchstart' in window;
  
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  
  const touchEventTypes = [
    'touchstart', 'touchmove', 'touchend', 'touchcancel'
  ].filter(type => `on${type}` in window);
  
  const touchPrecision = navigator.hardwareConcurrency || 'unknown';
  
  return {
    isMobile: hasTouchEvents && maxTouchPoints > 0,
    hasTouchEvents,
    maxTouchPoints,
    touchEventTypes,
    touchPrecision
  };
}
```

触摸精度检测

```javascript
function detectTouchCapabilities() {
  let touchPrecision = 'unknown';
  
  if ('ontouchstart' in window) {
    if (navigator.maxTouchPoints > 0) {
      if (navigator.maxTouchPoints >= 10) {
        touchPrecision = 'high'; // 高精度触摸
      } else if (navigator.maxTouchPoints >= 5) {
        touchPrecision = 'medium'; // 中等精度触摸
      } else {
        touchPrecision = 'low'; // 低精度触摸
      }
    }
  }
  
  // 检测触摸手势支持
  const hasTouchGestures = 'ongesturestart' in window;
  
  return {
    touchPrecision,
    hasTouchGestures,
    maxTouchPoints: navigator.maxTouchPoints || 0
  };
}
```

## 四、设备像素比检测

```javascript
function isMobileByPixelRatio() {
  const devicePixelRatio = window.devicePixelRatio || 1;
  
  const screenResolution = {
    width: window.screen.width * devicePixelRatio,
    height: window.screen.height * devicePixelRatio
  };
  
  const viewportResolution = {
    width: window.innerWidth * devicePixelRatio,
    height: window.innerHeight * devicePixelRatio
  };
  
  // 高分辨率设备通常是移动设备
  const isHighDPI = devicePixelRatio > 1;
  
  return {
    isMobile: isHighDPI && screenResolution.width < 2000,
    devicePixelRatio,
    screenResolution,
    viewportResolution,
    isHighDPI
  };
}
```

## 五、综合检测方法

```javascript
class MobileDetector {
  constructor() {
    this.cache = new Map();
  }
  
  isMobile() {
    if (this.cache.has('isMobile')) {
      return this.cache.get('isMobile');
    }
    
    const result = this.comprehensiveDetection();
    this.cache.set('isMobile', result);
    return result;
  }
  
  comprehensiveDetection() {
    const userAgentResult = this.detectByUserAgent();
    const screenResult = this.detectByScreen();
    const touchResult = this.detectByTouch();
    const pixelResult = this.detectByPixelRatio();
    
    // 权重计算
    let mobileScore = 0;
    let totalScore = 0;
    
    // User Agent 检测权重 40%
    if (userAgentResult.isMobile) mobileScore += 40;
    totalScore += 40;
    
    // 屏幕尺寸检测权重 30%
    if (screenResult.isMobile) mobileScore += 30;
    totalScore += 30;
    
    // 触摸能力检测权重 20%
    if (touchResult.isMobile) mobileScore += 20;
    totalScore += 20;
    
    // 像素比检测权重 10%
    if (pixelResult.isMobile) mobileScore += 10;
    totalScore += 10;
    
    // 如果得分超过70%，认为是移动设备
    const isMobile = (mobileScore / totalScore) > 0.7;
    
    return {
      isMobile,
      score: mobileScore / totalScore,
      details: {
        userAgent: userAgentResult,
        screen: screenResult,
        touch: touchResult,
        pixel: pixelResult
      }
    };
  }
  
  // User Agent 检测
  detectByUserAgent() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'mobile', 'android', 'iphone', 'ipad', 'ipod', 
      'blackberry', 'windows phone', 'opera mini'
    ];
    
    return {
      isMobile: mobileKeywords.some(keyword => userAgent.includes(keyword)),
      userAgent: navigator.userAgent
    };
  }
  
  // 屏幕尺寸检测
  detectByScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width <= 768,
      width,
      height,
      aspectRatio: width / height
    };
  }
  
  // 触摸能力检测
  detectByTouch() {
    const hasTouch = 'ontouchstart' in window;
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    
    return {
      isMobile: hasTouch && maxTouchPoints > 0,
      hasTouch,
      maxTouchPoints
    };
  }
  
  // 像素比检测
  detectByPixelRatio() {
    const pixelRatio = window.devicePixelRatio || 1;
    
    return {
      isMobile: pixelRatio > 1 && window.screen.width < 2000,
      pixelRatio
    };
  }
  
  // 获取设备详细信息
  getDeviceInfo() {
    return {
      isMobile: this.isMobile(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      devicePixelRatio: window.devicePixelRatio,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }
}
```

## 六、实时检测和响应

监听窗口变化

```javascript
class ResponsiveDetector {
  constructor() {
    this.currentState = this.detectCurrentState();
    this.listeners = new Set();
    
    this.setupEventListeners();
  }
  
  // 检测当前状态
  detectCurrentState() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width <= 768,
      isTablet: width > 768 && width <= 1024,
      isDesktop: width > 1024,
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait'
    };
  }
  
  // 设置事件监听器
  setupEventListeners() {
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // 监听设备方向变化
    window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    
    // 监听媒体查询变化
    this.setupMediaQueryListeners();
  }
  
  // 处理窗口大小变化
  handleResize() {
    const newState = this.detectCurrentState();
    
    if (JSON.stringify(newState) !== JSON.stringify(this.currentState)) {
      const oldState = this.currentState;
      this.currentState = newState;
      
      // 通知所有监听器
      this.notifyListeners(oldState, newState);
    }
  }
  
  // 处理设备方向变化
  handleOrientationChange() {
    // 延迟检测，等待方向变化完成
    setTimeout(() => {
      this.handleResize();
    }, 100);
  }
  
  // 设置媒体查询监听器
  setupMediaQueryListeners() {
    const queries = {
      mobile: '(max-width: 768px)',
      tablet: '(min-width: 769px) and (max-width: 1024px)',
      desktop: '(min-width: 1025px)',
      landscape: '(orientation: landscape)',
      portrait: '(orientation: portrait)'
    };
    
    Object.entries(queries).forEach(([name, query]) => {
      const mediaQuery = window.matchMedia(query);
      
      mediaQuery.addEventListener('change', (event) => {
        this.handleMediaQueryChange(name, event);
      });
    });
  }
  
  // 处理媒体查询变化
  handleMediaQueryChange(name, event) {
    console.log(`Media query "${name}" changed:`, event.matches);
    
    // 可以在这里添加特定的处理逻辑
    if (name === 'mobile' && event.matches) {
      this.onMobileMode();
    } else if (name === 'desktop' && event.matches) {
      this.onDesktopMode();
    }
  }
  
  // 移动端模式处理
  onMobileMode() {
    console.log('Switched to mobile mode');
    // 添加移动端特定的逻辑
    document.body.classList.add('mobile-mode');
    document.body.classList.remove('desktop-mode');
  }
  
  // 桌面端模式处理
  onDesktopMode() {
    console.log('Switched to desktop mode');
    // 添加桌面端特定的逻辑
    document.body.classList.add('desktop-mode');
    document.body.classList.remove('mobile-mode');
  }
  
  // 添加状态变化监听器
  addListener(callback) {
    this.listeners.add(callback);
  }
  
  // 移除监听器
  removeListener(callback) {
    this.listeners.delete(callback);
  }
  
  // 通知所有监听器
  notifyListeners(oldState, newState) {
    this.listeners.forEach(callback => {
      try {
        callback(oldState, newState);
      } catch (error) {
        console.error('Error in responsive detector listener:', error);
      }
    });
  }
  
  // 获取当前状态
  getCurrentState() {
    return this.currentState;
  }
  
  // 检查是否为特定设备类型
  isMobile() {
    return this.currentState.isMobile;
  }
  
  isTablet() {
    return this.currentState.isTablet;
  }
  
  isDesktop() {
    return this.currentState.isDesktop;
  }
  
  // 获取设备方向
  getOrientation() {
    return this.currentState.orientation;
  }
}
```

使用示例

```javascript
// 创建检测器实例
const mobileDetector = new MobileDetector();
const responsiveDetector = new ResponsiveDetector();

// 检测是否为移动设备
if (mobileDetector.isMobile()) {
  console.log('当前是移动设备');
  
  // 加载移动端特定的资源
  loadMobileResources();
  
  // 应用移动端样式
  document.body.classList.add('mobile');
} else {
  console.log('当前是桌面设备');
  
  // 加载桌面端特定的资源
  loadDesktopResources();
  
  // 应用桌面端样式
  document.body.classList.add('desktop');
}

// 监听响应式变化
responsiveDetector.addListener((oldState, newState) => {
  console.log('设备状态变化:', oldState, '->', newState);
  
  if (newState.isMobile && !oldState.isMobile) {
    // 切换到移动端
    switchToMobileLayout();
  } else if (newState.isDesktop && !oldState.isDesktop) {
    // 切换到桌面端
    switchToDesktopLayout();
  }
});

// 获取设备信息
const deviceInfo = mobileDetector.getDeviceInfo();
console.log('设备信息:', deviceInfo);
```

条件加载

```javascript
// 根据设备类型条件加载不同的模块
async function loadAppropriateModule() {
  if (mobileDetector.isMobile()) {
    // 移动端模块
    const mobileModule = await import('./mobile-module.js');
    return mobileModule.default;
  } else {
    // 桌面端模块
    const desktopModule = await import('./desktop-module.js');
    return desktopModule.default;
  }
}

// 根据设备类型设置不同的配置
function getDeviceConfig() {
  const baseConfig = {
    apiEndpoint: 'https://api.example.com',
    timeout: 5000
  };
  
  if (mobileDetector.isMobile()) {
    return {
      ...baseConfig,
      imageQuality: 'low',
      cacheSize: 'small',
      enableTouchGestures: true
    };
  } else {
    return {
      ...baseConfig,
      imageQuality: 'high',
      cacheSize: 'large',
      enableTouchGestures: false
    };
  }
}
```
