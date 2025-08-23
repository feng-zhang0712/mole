/**
 * 错误边界组件 - 解决错误处理和优雅降级问题
 * 捕获React组件树中的JavaScript错误
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }
  
  static getDerivedStateFromError(error) {
    // 更新状态以显示错误界面
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // 可以将错误信息发送到日志服务
    console.error('ErrorBoundary捕获到错误:', error, errorInfo);
    
    // 在生产环境中，可以发送错误报告
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }
  
  reportError(error, errorInfo) {
    // 发送错误报告到监控服务
    const errorReport = {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: {
        componentStack: errorInfo.componentStack
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // 这里可以发送到Sentry、LogRocket等服务
    console.warn('生产环境错误报告:', errorReport);
  }
  
  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };
  
  render() {
    if (this.state.hasError) {
      // 错误回退UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2>出现了一个错误</h2>
            <p>抱歉，应用程序遇到了意外错误。</p>
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                重试
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
              
              <button 
                className="btn btn-outline"
                onClick={() => window.location.href = '/'}
              >
                返回首页
              </button>
            </div>
            
            {/* 开发环境显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>错误详情 (仅开发环境显示)</summary>
                <div className="error-stack">
                  <h4>错误信息:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h4>错误堆栈:</h4>
                  <pre>{this.state.error.stack}</pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <h4>组件堆栈:</h4>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
          
          {/* <style jsx>{`
            .error-boundary {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 60vh;
              padding: 20px;
              background-color: #f8f9fa;
            }
            
            .error-content {
              max-width: 600px;
              background: white;
              border-radius: 8px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .error-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            
            .error-content h2 {
              color: #dc3545;
              margin: 0 0 15px 0;
              font-size: 24px;
            }
            
            .error-content p {
              color: #6c757d;
              margin: 0 0 30px 0;
              font-size: 16px;
              line-height: 1.5;
            }
            
            .error-actions {
              display: flex;
              gap: 10px;
              justify-content: center;
              flex-wrap: wrap;
              margin-bottom: 30px;
            }
            
            .btn {
              padding: 10px 20px;
              border: none;
              border-radius: 4px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              text-decoration: none;
              transition: all 0.2s;
              display: inline-block;
            }
            
            .btn-primary {
              background: #007bff;
              color: white;
            }
            
            .btn-primary:hover {
              background: #0056b3;
            }
            
            .btn-secondary {
              background: #6c757d;
              color: white;
            }
            
            .btn-secondary:hover {
              background: #545b62;
            }
            
            .btn-outline {
              background: transparent;
              color: #007bff;
              border: 1px solid #007bff;
            }
            
            .btn-outline:hover {
              background: #007bff;
              color: white;
            }
            
            .error-details {
              text-align: left;
              background: #f8f9fa;
              border-radius: 4px;
              padding: 15px;
              margin-top: 20px;
            }
            
            .error-details summary {
              font-weight: 600;
              cursor: pointer;
              margin-bottom: 15px;
            }
            
            .error-stack h4 {
              color: #495057;
              font-size: 14px;
              margin: 15px 0 5px 0;
            }
            
            .error-stack pre {
              background: #ffffff;
              border: 1px solid #e9ecef;
              border-radius: 4px;
              padding: 10px;
              font-size: 12px;
              overflow-x: auto;
              color: #dc3545;
              white-space: pre-wrap;
              word-break: break-all;
            }
            
            @media (max-width: 768px) {
              .error-content {
                padding: 30px 20px;
              }
              
              .error-actions {
                flex-direction: column;
                align-items: center;
              }
              
              .btn {
                width: 200px;
              }
            }
          `}</style> */}
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;