/**
 * 关于页面组件
 */

import { useData } from '../context/DataContext.js';

function AboutPage() {
  const { aboutInfo, isHydrated } = useData();
  
  return (
    <div className="about-page fade-in">
      <div className="about-content">
        <div className="about-header">
          <h1 className="page-title">关于项目</h1>
          <p className="page-description">
            了解这个SSR React演示项目的技术实现和设计理念
          </p>
        </div>
        
        {aboutInfo && (
          <section className="about-section">
            <div className="section-content">
              <h2>{aboutInfo.title}</h2>
              <p>{aboutInfo.content}</p>
              
              {aboutInfo.features && (
                <div className="features-list">
                  <h3>核心特性</h3>
                  <ul>
                    {aboutInfo.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}
        
        <section className="tech-stack">
          <h2>技术栈</h2>
          <div className="tech-grid">
            <div className="tech-category">
              <h3>前端技术</h3>
              <ul>
                <li>React 18</li>
                <li>React Router v6</li>
                <li>ES6+ JavaScript</li>
                <li>CSS-in-JS</li>
              </ul>
            </div>
            
            <div className="tech-category">
              <h3>构建工具</h3>
              <ul>
                <li>Webpack 5</li>
                <li>Babel</li>
                <li>ESM Modules</li>
                <li>代码分割</li>
              </ul>
            </div>
            
            <div className="tech-category">
              <h3>服务端</h3>
              <ul>
                <li>Node.js</li>
                <li>Express.js</li>
                <li>SSR渲染</li>
                <li>缓存策略</li>
              </ul>
            </div>
            
            <div className="tech-category">
              <h3>性能优化</h3>
              <ul>
                <li>LRU缓存</li>
                <li>Gzip压缩</li>
                <li>资源预加载</li>
                <li>错误边界</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="solved-problems">
          <h2>解决的SSR问题</h2>
          <div className="problems-grid">
            <div className="problem-card">
              <div className="problem-icon">🔀</div>
              <h3>路由处理</h3>
              <p>服务端与客户端路由协调，支持动态路由参数和404处理</p>
            </div>
            
            <div className="problem-card">
              <div className="problem-icon">📡</div>
              <h3>数据获取</h3>
              <p>服务端数据预取，客户端状态同步，避免重复请求</p>
            </div>
            
            <div className="problem-card">
              <div className="problem-icon">💧</div>
              <h3>客户端激活</h3>
              <p>平滑的Hydration过程，事件绑定和交互功能恢复</p>
            </div>
            
            <div className="problem-card">
              <div className="problem-icon">🌐</div>
              <h3>环境差异</h3>
              <p>处理服务端和客户端环境差异，避免代码执行错误</p>
            </div>
            
            <div className="problem-card">
              <div className="problem-icon">⚡</div>
              <h3>性能优化</h3>
              <p>缓存策略、代码分割、资源预加载等性能优化技术</p>
            </div>
            
            <div className="problem-card">
              <div className="problem-icon">🛡️</div>
              <h3>错误处理</h3>
              <p>错误边界、优雅降级、用户友好的错误提示</p>
            </div>
          </div>
        </section>
        
        <section className="demo-features">
          <h2>演示功能</h2>
          <div className="demo-grid">
            <div className="demo-item">
              <h4>📊 数据展示</h4>
              <p>首页展示统计数据和特色文章</p>
            </div>
            
            <div className="demo-item">
              <h4>👥 用户管理</h4>
              <p>用户列表、详情查看、交互操作</p>
            </div>
            
            <div className="demo-item">
              <h4>📝 文章系统</h4>
              <p>文章列表、详情页面、相关推荐</p>
            </div>
            
            <div className="demo-item">
              <h4>🔗 路由导航</h4>
              <p>动态路由、面包屑导航、404处理</p>
            </div>
            
            <div className="demo-item">
              <h4>💬 交互功能</h4>
              <p>点击事件、表单操作、状态更新</p>
            </div>
            
            <div className="demo-item">
              <h4>📱 响应式设计</h4>
              <p>移动端适配、触摸友好的界面</p>
            </div>
          </div>
        </section>
        
        {/* 交互演示 */}
        <section className="interaction-demo">
          <h2>交互功能测试</h2>
          <p>以下功能展示客户端激活后的交互能力：</p>
          
          <div className="demo-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!isHydrated) {
                  alert('页面还未完全激活，请稍候');
                  return;
                }
                
                const now = new Date();
                alert(`当前时间: ${now.toLocaleString()}\n客户端状态: 已激活 ✅`);
              }}
            >
              获取当前时间
            </button>
            
            <button
              className="btn btn-secondary"
              onClick={() => {
                if (!isHydrated) {
                  alert('页面还未完全激活，请稍候');
                  return;
                }
                
                const userAgent = navigator.userAgent;
                const platform = navigator.platform;
                alert(`浏览器信息:\n${userAgent}\n\n平台: ${platform}`);
              }}
            >
              检测浏览器
            </button>
            
            <button
              className="btn btn-outline"
              onClick={() => {
                if (!isHydrated) {
                  alert('页面还未完全激活，请稍候');
                  return;
                }
                
                const metrics = window.__SSR_METRICS__ || {};
                const info = [
                  `激活时间: ${metrics.hydrationTime ? metrics.hydrationTime.toFixed(2) + 'ms' : '未知'}`,
                  `总时间: ${metrics.totalTime ? metrics.totalTime.toFixed(2) + 'ms' : '未知'}`,
                  `激活状态: ${window.__CLIENT_HYDRATED__ ? '已激活' : '未激活'}`,
                  `环境: ${typeof window !== 'undefined' ? '客户端' : '服务端'}`
                ];
                
                alert('性能指标:\n' + info.join('\n'));
              }}
            >
              查看性能指标
            </button>
          </div>
          
          <div className="status-display">
            <div className="status-item">
              <span className="label">激活状态:</span>
              <span className={`status ${isHydrated ? 'active' : 'pending'}`}>
                {isHydrated ? '✅ 已激活' : '⏳ 激活中'}
              </span>
            </div>
            
            <div className="status-item">
              <span className="label">JavaScript:</span>
              <span className="status active">✅ 可用</span>
            </div>
            
            <div className="status-item">
              <span className="label">环境:</span>
              <span className="status active">
                {typeof window !== 'undefined' ? '🌐 客户端' : '🖥️ 服务端'}
              </span>
            </div>
          </div>
        </section>
      </div>
      
      {/* <style jsx>{`
        .about-page {
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .about-content {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        
        .about-header {
          text-align: center;
          padding: 40px 0;
        }
        
        .about-section {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .section-content h2 {
          color: #495057;
          margin-bottom: 15px;
        }
        
        .section-content p {
          color: #6c757d;
          line-height: 1.6;
          margin-bottom: 25px;
        }
        
        .features-list h3 {
          color: #495057;
          margin-bottom: 15px;
        }
        
        .features-list ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .features-list li {
          color: #6c757d;
          margin-bottom: 8px;
        }
        
        .tech-stack,
        .solved-problems,
        .demo-features,
        .interaction-demo {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .tech-stack h2,
        .solved-problems h2,
        .demo-features h2,
        .interaction-demo h2 {
          color: #495057;
          margin-bottom: 25px;
          text-align: center;
        }
        
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 25px;
        }
        
        .tech-category h3 {
          color: #007bff;
          font-size: 16px;
          margin-bottom: 15px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 8px;
        }
        
        .tech-category ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .tech-category li {
          color: #6c757d;
          padding: 5px 0;
          border-left: 3px solid #e9ecef;
          padding-left: 12px;
          margin-bottom: 5px;
          transition: border-color 0.2s;
        }
        
        .tech-category li:hover {
          border-left-color: #007bff;
        }
        
        .problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
        }
        
        .problem-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .problem-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .problem-icon {
          font-size: 36px;
          margin-bottom: 15px;
        }
        
        .problem-card h3 {
          color: #495057;
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        
        .problem-card p {
          color: #6c757d;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .demo-item {
          border-left: 4px solid #007bff;
          padding: 15px 20px;
          background: #f8f9fa;
        }
        
        .demo-item h4 {
          color: #495057;
          margin: 0 0 8px 0;
          font-size: 16px;
        }
        
        .demo-item p {
          color: #6c757d;
          margin: 0;
          font-size: 14px;
        }
        
        .interaction-demo p {
          text-align: center;
          color: #6c757d;
          margin-bottom: 30px;
        }
        
        .demo-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 30px;
        }
        
        .status-display {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .status-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .status-item .label {
          color: #6c757d;
          font-weight: 500;
        }
        
        .status {
          font-family: monospace;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .status.active {
          background: #d4edda;
          color: #155724;
        }
        
        .status.pending {
          background: #fff3cd;
          color: #856404;
        }
        
        @media (max-width: 768px) {
          .about-content {
            gap: 30px;
          }
          
          .tech-stack,
          .solved-problems,
          .demo-features,
          .interaction-demo {
            padding: 25px 20px;
          }
          
          .tech-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .problems-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .demo-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .status-item {
            flex-direction: column;
            gap: 5px;
            text-align: center;
          }
        }
      `}</style> */}
    </div>
  );
}

export default AboutPage;