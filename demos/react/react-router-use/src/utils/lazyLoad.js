import React, { Suspense } from 'react';

// 懒加载组件包装器，提供加载状态和错误处理
export function lazyLoad(importFunc, fallback = null) {
  const LazyComponent = React.lazy(importFunc);
  
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// 默认加载状态组件
function DefaultFallback() {
  return (
    <div className="loading-fallback">
      <div className="loading-spinner"></div>
      <p>页面加载中...</p>
    </div>
  );
}

// 带错误边界的懒加载组件
export function lazyLoadWithErrorBoundary(importFunc, fallback = null) {
  const LazyComponent = React.lazy(importFunc);
  
  return function LazyWrapper(props) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback || <DefaultFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>页面加载失败</h2>
          <p>抱歉，页面加载时出现了错误</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-btn"
          >
            重新加载
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
