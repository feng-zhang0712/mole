# React 项目首页 index.html 优化指南

## 概述

React 项目首页优化是提升用户体验和性能的关键环节。本文档将详细介绍四个核心优化点：骨架屏实现、React Suspense 配合骨架屏、骨架屏动画优化以及骨架屏与真实内容的平滑过渡。

## 一、实现页面骨架屏

### 1.1 骨架屏的概念和作用

骨架屏（Skeleton Screen）是一种在页面加载过程中显示的占位符界面，它模拟了真实内容的布局结构，为用户提供视觉反馈，减少等待焦虑。

**主要作用：**
- 提升用户感知性能
- 减少用户等待焦虑
- 提供视觉连续性
- 改善用户体验

### 1.2 基础骨架屏组件实现

#### 1.2.1 通用骨架屏组件

```jsx
// components/Skeleton/Skeleton.tsx
import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  animation = 'pulse'
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
  };

  return (
    <div 
      className={`skeleton skeleton--${animation} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
```

#### 1.2.2 骨架屏样式

```css
/* components/Skeleton/Skeleton.css */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  display: inline-block;
  vertical-align: middle;
}

.skeleton--pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton--wave {
  position: relative;
  overflow: hidden;
}

.skeleton--wave::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: wave 1.5s infinite;
}

.skeleton--none {
  animation: none;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

### 1.3 页面级骨架屏实现

#### 1.3.1 首页骨架屏组件

```jsx
// components/Skeleton/HomePageSkeleton.tsx
import React from 'react';
import Skeleton from './Skeleton';
import './HomePageSkeleton.css';

const HomePageSkeleton: React.FC = () => {
  return (
    <div className="home-page-skeleton">
      {/* 头部骨架屏 */}
      <header className="skeleton-header">
        <div className="skeleton-nav">
          <Skeleton width={120} height={32} className="skeleton-logo" />
          <div className="skeleton-nav-items">
            <Skeleton width={60} height={20} />
            <Skeleton width={60} height={20} />
            <Skeleton width={60} height={20} />
            <Skeleton width={60} height={20} />
          </div>
        </div>
      </header>

      {/* 主要内容区域骨架屏 */}
      <main className="skeleton-main">
        {/* 横幅区域 */}
        <section className="skeleton-banner">
          <Skeleton width="100%" height={400} className="skeleton-banner-image" />
          <div className="skeleton-banner-content">
            <Skeleton width={300} height={40} className="skeleton-title" />
            <Skeleton width={200} height={20} className="skeleton-subtitle" />
            <Skeleton width={120} height={40} className="skeleton-button" />
          </div>
        </section>

        {/* 特色内容区域 */}
        <section className="skeleton-features">
          <Skeleton width={200} height={32} className="skeleton-section-title" />
          <div className="skeleton-feature-grid">
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton-feature-card">
                <Skeleton width={80} height={80} borderRadius={8} className="skeleton-icon" />
                <Skeleton width={120} height={20} className="skeleton-feature-title" />
                <Skeleton width={200} height={16} className="skeleton-feature-desc" />
              </div>
            ))}
          </div>
        </section>

        {/* 内容列表区域 */}
        <section className="skeleton-content">
          <Skeleton width={150} height={28} className="skeleton-section-title" />
          <div className="skeleton-content-list">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton-content-item">
                <Skeleton width={200} height={120} borderRadius={8} className="skeleton-image" />
                <div className="skeleton-content-text">
                  <Skeleton width={180} height={20} className="skeleton-content-title" />
                  <Skeleton width={150} height={16} className="skeleton-content-desc" />
                  <Skeleton width={100} height={16} className="skeleton-content-meta" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 底部骨架屏 */}
      <footer className="skeleton-footer">
        <div className="skeleton-footer-content">
          <Skeleton width={200} height={20} className="skeleton-footer-title" />
          <div className="skeleton-footer-links">
            <Skeleton width={80} height={16} />
            <Skeleton width={80} height={16} />
            <Skeleton width={80} height={16} />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePageSkeleton;
```

#### 1.3.2 骨架屏布局样式

```css
/* components/Skeleton/HomePageSkeleton.css */
.home-page-skeleton {
  min-height: 100vh;
  background-color: #ffffff;
}

.skeleton-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.skeleton-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.skeleton-nav-items {
  display: flex;
  gap: 2rem;
}

.skeleton-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.skeleton-banner {
  position: relative;
  margin-bottom: 3rem;
}

.skeleton-banner-content {
  position: absolute;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-features {
  margin-bottom: 3rem;
}

.skeleton-feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
}

.skeleton-feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.skeleton-content {
  margin-bottom: 3rem;
}

.skeleton-content-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.skeleton-content-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.skeleton-content-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.skeleton-footer {
  background-color: #f8f9fa;
  padding: 2rem;
  margin-top: 3rem;
}

.skeleton-footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-footer-links {
  display: flex;
  gap: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skeleton-nav-items {
    gap: 1rem;
  }
  
  .skeleton-banner-content {
    left: 1rem;
  }
  
  .skeleton-feature-grid {
    grid-template-columns: 1fr;
  }
  
  .skeleton-content-list {
    grid-template-columns: 1fr;
  }
  
  .skeleton-footer-content {
    flex-direction: column;
    gap: 1rem;
  }
}
```

### 1.4 组件级骨架屏

#### 1.4.1 卡片骨架屏组件

```jsx
// components/Skeleton/CardSkeleton.tsx
import React from 'react';
import Skeleton from './Skeleton';
import './CardSkeleton.css';

interface CardSkeletonProps {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showMeta?: boolean;
  imageHeight?: number;
  lines?: number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
  showImage = true,
  showTitle = true,
  showDescription = true,
  showMeta = true,
  imageHeight = 200,
  lines = 2
}) => {
  return (
    <div className="card-skeleton">
      {showImage && (
        <Skeleton 
          width="100%" 
          height={imageHeight} 
          className="card-skeleton-image" 
        />
      )}
      <div className="card-skeleton-content">
        {showTitle && (
          <Skeleton width="80%" height={24} className="card-skeleton-title" />
        )}
        {showDescription && (
          <div className="card-skeleton-description">
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton 
                key={index}
                width={index === lines - 1 ? "60%" : "100%"} 
                height={16} 
                className="card-skeleton-line" 
              />
            ))}
          </div>
        )}
        {showMeta && (
          <div className="card-skeleton-meta">
            <Skeleton width={80} height={16} />
            <Skeleton width={60} height={16} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSkeleton;
```

## 二、使用 React Suspense 配合骨架屏

### 2.1 React Suspense 基础概念

React Suspense 是 React 16.6 引入的新特性，用于处理组件加载状态。它允许组件在等待异步操作（如数据获取、代码分割）完成时显示后备内容。

### 2.2 Suspense 与骨架屏结合

#### 2.2.1 基础 Suspense 实现

```jsx
// App.tsx
import React, { Suspense } from 'react';
import HomePageSkeleton from './components/Skeleton/HomePageSkeleton';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div className="App">
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePage />
      </Suspense>
    </div>
  );
}

export default App;
```

#### 2.2.2 多级 Suspense 实现

```jsx
// pages/HomePage.tsx
import React, { Suspense } from 'react';
import Header from '../components/Header';
import Banner from '../components/Banner';
import Features from '../components/Features';
import ContentList from '../components/ContentList';
import Footer from '../components/Footer';
import { 
  BannerSkeleton, 
  FeaturesSkeleton, 
  ContentListSkeleton 
} from '../components/Skeleton';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* 头部不需要 Suspense，因为通常是静态内容 */}
      <Header />
      
      {/* 横幅区域使用 Suspense */}
      <Suspense fallback={<BannerSkeleton />}>
        <Banner />
      </Suspense>
      
      {/* 特色内容区域 */}
      <Suspense fallback={<FeaturesSkeleton />}>
        <Features />
      </Suspense>
      
      {/* 内容列表区域 */}
      <Suspense fallback={<ContentListSkeleton />}>
        <ContentList />
      </Suspense>
      
      {/* 底部不需要 Suspense */}
      <Footer />
    </div>
  );
};

export default HomePage;
```

### 2.3 数据获取与 Suspense

#### 2.3.1 使用 React Query 配合 Suspense

```jsx
// hooks/useDataWithSuspense.ts
import { useQuery } from '@tanstack/react-query';

export function useDataWithSuspense<T>(
  queryKey: string[],
  queryFn: () => Promise<T>
) {
  const { data, error } = useQuery({
    queryKey,
    queryFn,
    suspense: true, // 启用 Suspense 模式
  });

  if (error) {
    throw error;
  }

  return data as T;
}

// components/Features.tsx
import React from 'react';
import { useDataWithSuspense } from '../hooks/useDataWithSuspense';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const Features: React.FC = () => {
  const features = useDataWithSuspense<Feature[]>(
    ['features'],
    () => fetch('/api/features').then(res => res.json())
  );

  return (
    <section className="features">
      <h2>特色功能</h2>
      <div className="features-grid">
        {features.map(feature => (
          <div key={feature.id} className="feature-card">
            <img src={feature.icon} alt={feature.title} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
```

#### 2.3.2 自定义数据获取 Hook

```jsx
// hooks/useSuspenseData.ts
import { useState, useEffect } from 'react';

interface SuspenseDataState<T> {
  data: T | null;
  error: Error | null;
  promise: Promise<T> | null;
}

export function useSuspenseData<T>(fetchFn: () => Promise<T>): T {
  const [state, setState] = useState<SuspenseDataState<T>>({
    data: null,
    error: null,
    promise: null,
  });

  if (state.error) {
    throw state.error;
  }

  if (state.data) {
    return state.data;
  }

  if (!state.promise) {
    const promise = fetchFn()
      .then(data => {
        setState({ data, error: null, promise: null });
        return data;
      })
      .catch(error => {
        setState({ data: null, error, promise: null });
        throw error;
      });

    setState({ data: null, error: null, promise });
    throw promise;
  }

  throw state.promise;
}

// 使用示例
const Features: React.FC = () => {
  const features = useSuspenseData(() => 
    fetch('/api/features').then(res => res.json())
  );

  return (
    <section className="features">
      {/* 渲染 features 数据 */}
    </section>
  );
};
```

### 2.4 代码分割与 Suspense

#### 2.4.1 路由级代码分割

```jsx
// App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePageSkeleton from './components/Skeleton/HomePageSkeleton';

// 懒加载页面组件
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));

function App() {
  return (
    <Router>
      <div className="App">
        <Suspense fallback={<HomePageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
```

#### 2.4.2 组件级代码分割

```jsx
// components/LazyComponents.tsx
import React, { Suspense } from 'react';
import { CardSkeleton } from './Skeleton';

// 懒加载组件
const HeavyChart = React.lazy(() => import('./HeavyChart'));
const DataTable = React.lazy(() => import('./DataTable'));
const ImageGallery = React.lazy(() => import('./ImageGallery'));

const LazyComponents: React.FC = () => {
  return (
    <div className="lazy-components">
      <Suspense fallback={<CardSkeleton />}>
        <HeavyChart />
      </Suspense>
      
      <Suspense fallback={<CardSkeleton />}>
        <DataTable />
      </Suspense>
      
      <Suspense fallback={<CardSkeleton />}>
        <ImageGallery />
      </Suspense>
    </div>
  );
};

export default LazyComponents;
```

## 三、骨架屏动画优化

### 3.1 动画性能优化

#### 3.1.1 CSS 动画优化

```css
/* 优化的骨架屏动画 */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  will-change: background-position; /* 提示浏览器优化 */
  transform: translateZ(0); /* 启用硬件加速 */
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 脉冲动画优化 */
.skeleton--pulse {
  animation: pulse 1.5s ease-in-out infinite;
  will-change: opacity;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 波浪动画优化 */
.skeleton--wave {
  position: relative;
  overflow: hidden;
}

.skeleton--wave::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: wave 1.5s ease-in-out infinite;
  will-change: left;
}

@keyframes wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
```

#### 3.1.2 动画性能监控

```jsx
// hooks/useAnimationPerformance.ts
import { useEffect, useRef } from 'react';

export function useAnimationPerformance() {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    const checkPerformance = () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;
      
      if (deltaTime > 16.67) { // 60fps = 16.67ms per frame
        console.warn('Animation performance issue detected:', deltaTime);
      }
      
      frameCount.current++;
      lastTime.current = currentTime;
      
      requestAnimationFrame(checkPerformance);
    };

    const animationId = requestAnimationFrame(checkPerformance);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return frameCount.current;
}
```

### 3.2 动画类型和效果

#### 3.2.1 渐进式加载动画

```jsx
// components/Skeleton/ProgressiveSkeleton.tsx
import React, { useState, useEffect } from 'react';
import Skeleton from './Skeleton';
import './ProgressiveSkeleton.css';

interface ProgressiveSkeletonProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

const ProgressiveSkeleton: React.FC<ProgressiveSkeletonProps> = ({
  children,
  delay = 0,
  duration = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`progressive-skeleton ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};

export default ProgressiveSkeleton;
```

```css
/* ProgressiveSkeleton.css */
.progressive-skeleton {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.progressive-skeleton.visible {
  opacity: 1;
  transform: translateY(0);
}
```

#### 3.2.2 交错动画效果

```jsx
// components/Skeleton/StaggeredSkeleton.tsx
import React from 'react';
import Skeleton from './Skeleton';
import './StaggeredSkeleton.css';

interface StaggeredSkeletonProps {
  count: number;
  delay: number;
  children: (index: number) => React.ReactNode;
}

const StaggeredSkeleton: React.FC<StaggeredSkeletonProps> = ({
  count,
  delay,
  children
}) => {
  return (
    <div className="staggered-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="staggered-item"
          style={{ animationDelay: `${index * delay}ms` }}
        >
          {children(index)}
        </div>
      ))}
    </div>
  );
};

export default StaggeredSkeleton;
```

```css
/* StaggeredSkeleton.css */
.staggered-item {
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3.3 动画配置和自定义

#### 3.3.1 动画配置 Hook

```jsx
// hooks/useSkeletonAnimation.ts
import { useState, useEffect } from 'react';

interface AnimationConfig {
  type: 'pulse' | 'wave' | 'loading' | 'none';
  duration: number;
  delay: number;
  easing: string;
}

export function useSkeletonAnimation(config: AnimationConfig) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, config.delay);

    return () => clearTimeout(timer);
  }, [config.delay]);

  const animationStyle = {
    animationDuration: `${config.duration}ms`,
    animationTimingFunction: config.easing,
  };

  return {
    isAnimating,
    animationStyle,
    className: `skeleton skeleton--${config.type}`,
  };
}
```

#### 3.3.2 自定义动画组件

```jsx
// components/Skeleton/CustomSkeleton.tsx
import React from 'react';
import { useSkeletonAnimation } from '../../hooks/useSkeletonAnimation';
import './CustomSkeleton.css';

interface CustomSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  animation?: 'pulse' | 'wave' | 'loading' | 'none';
  duration?: number;
  delay?: number;
  easing?: string;
}

const CustomSkeleton: React.FC<CustomSkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  animation = 'loading',
  duration = 1500,
  delay = 0,
  easing = 'ease-in-out'
}) => {
  const { isAnimating, animationStyle, className } = useSkeletonAnimation({
    type: animation,
    duration,
    delay,
    easing,
  });

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    ...animationStyle,
  };

  return (
    <div 
      className={`${className} ${isAnimating ? 'animating' : ''}`}
      style={style}
    />
  );
};

export default CustomSkeleton;
```

## 四、骨架屏与真实内容的平滑过渡

### 4.1 过渡策略设计

#### 4.1.1 渐进式内容显示

```jsx
// components/TransitionWrapper.tsx
import React, { useState, useEffect } from 'react';
import './TransitionWrapper.css';

interface TransitionWrapperProps {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  isLoading: boolean;
  transitionDuration?: number;
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  skeleton,
  isLoading,
  transitionDuration = 300
}) => {
  const [showContent, setShowContent] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // 先隐藏骨架屏
      setShowSkeleton(false);
      
      // 延迟显示真实内容，确保过渡平滑
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      setShowSkeleton(true);
    }
  }, [isLoading]);

  return (
    <div className="transition-wrapper">
      {showSkeleton && (
        <div 
          className={`skeleton-container ${showSkeleton ? 'visible' : 'hidden'}`}
          style={{ transitionDuration: `${transitionDuration}ms` }}
        >
          {skeleton}
        </div>
      )}
      
      {showContent && (
        <div 
          className={`content-container ${showContent ? 'visible' : 'hidden'}`}
          style={{ transitionDuration: `${transitionDuration}ms` }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default TransitionWrapper;
```

#### 4.1.2 过渡样式实现

```css
/* TransitionWrapper.css */
.transition-wrapper {
  position: relative;
  min-height: 200px; /* 确保容器有足够高度 */
}

.skeleton-container,
.content-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.skeleton-container.hidden {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.skeleton-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.content-container.hidden {
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
}

.content-container.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 4.2 内容预加载策略

#### 4.2.1 预加载数据

```jsx
// hooks/usePreloadData.ts
import { useState, useEffect } from 'react';

interface PreloadDataOptions {
  preloadDelay?: number;
  cacheTime?: number;
}

export function usePreloadData<T>(
  fetchFn: () => Promise<T>,
  options: PreloadDataOptions = {}
) {
  const { preloadDelay = 1000, cacheTime = 5 * 60 * 1000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await fetchFn();
        
        if (isMounted) {
          setData(result);
          setIsPreloaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // 延迟预加载，避免阻塞初始渲染
    timeoutId = setTimeout(loadData, preloadDelay);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchFn, preloadDelay]);

  return { data, isLoading, error, isPreloaded };
}
```

#### 4.2.2 渐进式内容加载

```jsx
// components/ProgressiveContent.tsx
import React, { useState, useEffect } from 'react';
import TransitionWrapper from './TransitionWrapper';
import { CardSkeleton } from './Skeleton';

interface ProgressiveContentProps {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  loadDelay?: number;
  transitionDelay?: number;
}

const ProgressiveContent: React.FC<ProgressiveContentProps> = ({
  children,
  skeleton,
  loadDelay = 500,
  transitionDelay = 200
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, loadDelay);

    const transitionTimer = setTimeout(() => {
      setShowContent(true);
    }, loadDelay + transitionDelay);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(transitionTimer);
    };
  }, [loadDelay, transitionDelay]);

  return (
    <TransitionWrapper
      skeleton={skeleton}
      isLoading={!isLoaded}
      transitionDuration={300}
    >
      <div className={`progressive-content ${showContent ? 'loaded' : ''}`}>
        {children}
      </div>
    </TransitionWrapper>
  );
};

export default ProgressiveContent;
```

### 4.3 用户体验优化

#### 4.3.1 加载状态管理

```jsx
// hooks/useLoadingState.ts
import { useState, useEffect, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  progress: number;
  message: string;
}

export function useLoadingState(initialMessage = '加载中...') {
  const [state, setState] = useState<LoadingState>({
    isLoading: true,
    progress: 0,
    message: initialMessage,
  });

  const updateProgress = useCallback((progress: number, message?: string) => {
    setState(prev => ({
      ...prev,
      progress,
      message: message || prev.message,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
      progress: isLoading ? 0 : 100,
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      message,
    }));
  }, []);

  return {
    ...state,
    updateProgress,
    setLoading,
    setMessage,
  };
}
```

#### 4.3.2 错误处理和重试

```jsx
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>出错了</h2>
          <p>页面加载失败，请刷新重试</p>
          <button onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 4.4 性能监控和优化

#### 4.4.1 加载性能监控

```jsx
// hooks/usePerformanceMonitor.ts
import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef(performance.now());
  const metrics = useRef<PerformanceMetrics | null>(null);

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;

    metrics.current = {
      startTime: startTime.current,
      endTime,
      duration,
      timestamp: Date.now(),
    };

    // 记录性能指标
    if (duration > 1000) {
      console.warn(`${componentName} 加载时间过长: ${duration.toFixed(2)}ms`);
    }

    // 发送性能数据到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以发送到性能监控服务
      // sendPerformanceMetrics(componentName, metrics.current);
    }
  }, [componentName]);

  return metrics.current;
}
```

#### 4.4.2 用户体验指标

```jsx
// hooks/useUserExperience.ts
import { useEffect, useRef } from 'react';

interface UXMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

export function useUserExperience() {
  const metrics = useRef<UXMetrics>({
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
  });

  useEffect(() => {
    // 监听 First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          metrics.current.firstContentfulPaint = entry.startTime;
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // 监听 Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          metrics.current.largestContentfulPaint = entry.startTime;
        }
      }
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);

  return metrics.current;
}
```

## 总结

通过以上四个方面的详细实现，我们可以构建一个完整的 React 首页优化方案：

1. **骨架屏实现**：提供了完整的骨架屏组件体系，包括通用组件、页面级组件和组件级骨架屏
2. **React Suspense 配合**：展示了如何与 React Suspense 结合使用，实现更好的加载体验
3. **动画优化**：提供了多种动画效果和性能优化策略
4. **平滑过渡**：实现了骨架屏与真实内容之间的平滑过渡效果

这些优化措施将显著提升用户的首屏加载体验，减少用户等待焦虑，提高页面的整体性能和用户满意度。
