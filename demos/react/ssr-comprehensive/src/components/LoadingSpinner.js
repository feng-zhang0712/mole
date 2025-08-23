/**
 * 加载spinner组件 - 通用加载状态显示
 */

function LoadingSpinner({ message = '加载中...', size = 'medium' }) {
  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };
  
  return (
    <div className="loading-container">
      <div className={`loading-spinner ${sizeClasses[size]}`}></div>
      {message && (
        <div className="loading-message">
          {message}
        </div>
      )}
      
      {/* <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .spinner-small {
          width: 20px;
          height: 20px;
          border-width: 2px;
        }
        
        .spinner-medium {
          width: 40px;
          height: 40px;
          border-width: 4px;
        }
        
        .spinner-large {
          width: 60px;
          height: 60px;
          border-width: 6px;
        }
        
        .loading-message {
          margin-top: 15px;
          font-size: 16px;
          color: #6c757d;
          text-align: center;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style> */}
    </div>
  );
}

export default LoadingSpinner;