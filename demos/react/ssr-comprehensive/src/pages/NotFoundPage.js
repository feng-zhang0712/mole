/**
 * 404页面组件
 */

import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.js';

function NotFoundPage() {
  const { isHydrated } = useData();
  
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-display">
          <h1 className="error-code">404</h1>
          <div className="error-message">
            <h2>页面不存在</h2>
            <p>抱歉，您访问的页面不存在或已被移除。</p>
          </div>
        </div>
        
        <div className="suggestions">
          <h3>您可以尝试:</h3>
          <ul>
            <li>检查URL地址是否正确</li>
            <li>返回首页重新导航</li>
            <li>查看我们的文章列表</li>
            <li>联系网站管理员</li>
          </ul>
        </div>
        
        <div className="quick-links">
          <h3>快速导航</h3>
          <div className="links-grid">
            <Link to="/" className="quick-link">
              <div className="link-icon">🏠</div>
              <div className="link-info">
                <h4>首页</h4>
                <p>返回网站首页</p>
              </div>
            </Link>
            
            <Link to="/posts" className="quick-link">
              <div className="link-icon">📝</div>
              <div className="link-info">
                <h4>文章列表</h4>
                <p>浏览技术文章</p>
              </div>
            </Link>
            
            <Link to="/users" className="quick-link">
              <div className="link-icon">👥</div>
              <div className="link-info">
                <h4>用户管理</h4>
                <p>查看用户信息</p>
              </div>
            </Link>
            
            <Link to="/about" className="quick-link">
              <div className="link-icon">ℹ️</div>
              <div className="link-info">
                <h4>关于项目</h4>
                <p>了解技术细节</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!isHydrated) {
                alert('页面还未完全加载，请稍候');
                return;
              }
              window.history.back();
            }}
          >
            ← 返回上一页
          </button>
          
          <Link to="/" className="btn btn-secondary">
            回到首页
          </Link>
          
          <button
            className="btn btn-outline"
            onClick={() => {
              if (!isHydrated) {
                alert('页面还未完全加载，请稍候');
                return;
              }
              window.location.reload();
            }}
          >
            刷新页面
          </button>
        </div>
        
        <div className="debug-info">
          <details>
            <summary>调试信息</summary>
            <div className="debug-content">
              <div className="debug-item">
                <span className="label">当前路径:</span>
                <span className="value">{typeof window !== 'undefined' ? window.location.pathname : '未知'}</span>
              </div>
              <div className="debug-item">
                <span className="label">激活状态:</span>
                <span className="value">{isHydrated ? '✅ 已激活' : '⏳ 激活中'}</span>
              </div>
              <div className="debug-item">
                <span className="label">环境:</span>
                <span className="value">{typeof window !== 'undefined' ? '客户端' : '服务端'}</span>
              </div>
              <div className="debug-item">
                <span className="label">时间戳:</span>
                <span className="value">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </details>
        </div>
      </div>
      
      {/* <style jsx>{`
        .not-found-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        
        .not-found-content {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .error-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }
        
        .error-code {
          font-size: 120px;
          font-weight: 900;
          color: #dc3545;
          margin: 0;
          line-height: 1;
          background: linear-gradient(135deg, #dc3545, #c82333);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .error-message {
          text-align: left;
        }
        
        .error-message h2 {
          font-size: 28px;
          color: #495057;
          margin: 0 0 15px 0;
          font-weight: 600;
        }
        
        .error-message p {
          font-size: 16px;
          color: #6c757d;
          margin: 0;
          line-height: 1.5;
        }
        
        .suggestions {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 30px;
          text-align: left;
        }
        
        .suggestions h3 {
          color: #495057;
          margin: 0 0 15px 0;
          font-size: 18px;
        }
        
        .suggestions ul {
          margin: 0;
          padding-left: 20px;
          color: #6c757d;
        }
        
        .suggestions li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .quick-links {
          margin-bottom: 30px;
        }
        
        .quick-links h3 {
          color: #495057;
          margin-bottom: 20px;
          font-size: 18px;
        }
        
        .links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
        }
        
        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        
        .quick-link:hover {
          background: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          color: inherit;
          text-decoration: none;
        }
        
        .link-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .link-info h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #495057;
          font-weight: 600;
        }
        
        .link-info p {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
        }
        
        .actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }
        
        .debug-info {
          border-top: 1px solid #e9ecef;
          padding-top: 20px;
          text-align: left;
        }
        
        .debug-info details {
          font-size: 14px;
          color: #6c757d;
        }
        
        .debug-info summary {
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 10px;
        }
        
        .debug-content {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 15px;
          font-family: monospace;
        }
        
        .debug-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .debug-item:last-child {
          margin-bottom: 0;
        }
        
        .debug-item .label {
          font-weight: 500;
          color: #495057;
        }
        
        .debug-item .value {
          color: #007bff;
        }
        
        @media (max-width: 768px) {
          .not-found-content {
            padding: 30px 20px;
          }
          
          .error-display {
            flex-direction: column;
            gap: 20px;
          }
          
          .error-code {
            font-size: 80px;
          }
          
          .error-message {
            text-align: center;
          }
          
          .error-message h2 {
            font-size: 24px;
          }
          
          .links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          
          .quick-link {
            padding: 15px 10px;
          }
          
          .link-icon {
            font-size: 24px;
          }
          
          .actions {
            flex-direction: column;
            align-items: center;
          }
          
          .debug-item {
            flex-direction: column;
            gap: 2px;
          }
        }
        
        @media (max-width: 480px) {
          .links-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style> */}
    </div>
  );
}

export default NotFoundPage;