import React from 'react';

// 加载状态组件
function LoadingSpinner({ size = 'medium', text = '加载中...', type = 'spinner' }) {
  const sizeClass = `loading-${size}`;
  const typeClass = `loading-${type}`;
  
  return (
    <div className={`loading-container ${sizeClass}`}>
      {type === 'spinner' && (
        <div className={`loading-spinner ${typeClass}`}>
          <div className="spinner-ring"></div>
        </div>
      )}
      
      {type === 'dots' && (
        <div className={`loading-dots ${typeClass}`}>
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      )}
      
      {type === 'skeleton' && (
        <div className={`loading-skeleton ${typeClass}`}>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      )}
      
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}

// 页面级加载组件
export function PageLoading({ title = '页面加载中' }) {
  return (
    <div className="page-loading">
      <div className="page-loading-content">
        <LoadingSpinner size="large" text={title} type="spinner" />
        <div className="loading-tips">
          <p>正在为您准备页面内容...</p>
          <p>请稍候片刻</p>
        </div>
      </div>
    </div>
  );
}

// 组件级加载组件
export function ComponentLoading({ size = 'small', text = '加载中' }) {
  return <LoadingSpinner size={size} text={text} type="dots" />;
}

// 骨架屏加载组件
export function SkeletonLoading({ lines = 3, title = true }) {
  return (
    <div className="skeleton-container">
      {title && <div className="skeleton-title"></div>}
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index} 
          className={`skeleton-line ${index === lines - 1 ? 'short' : ''}`}
        ></div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
