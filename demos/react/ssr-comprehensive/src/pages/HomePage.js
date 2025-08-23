/**
 * 首页组件 - 展示首页内容和统计信息
 */

import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.js';
import LoadingSpinner from '../components/LoadingSpinner.js';

function HomePage() {
  const { 
    featuredPosts, 
    totalUsers, 
    totalPosts, 
    loading, 
    isHydrated,
    meta 
  } = useData();
  
  // 设置页面title（仅客户端）
  if (typeof document !== 'undefined' && meta?.title) {
    document.title = meta.title;
  }
  
  return (
    <div className="home-page fade-in">
      {/* 页面头部 */}
      <div className="hero-section">
        <h1 className="page-title">欢迎来到 SSR React Demo</h1>
        <p className="page-description">
          这是一个完整的服务端渲染(SSR)演示项目，展示了如何解决 React SSR 开发中的核心问题。
          包括路由处理、数据获取、状态同步、客户端激活、事件处理等关键技术。
        </p>
        
        {/* 激活状态指示器 */}
        <div className="hydration-status">
          <span className={`status-badge ${isHydrated ? 'hydrated' : 'hydrating'}`}>
            {isHydrated ? '✅ 客户端已激活' : '⏳ 正在激活...'}
          </span>
        </div>
      </div>
      
      {/* 统计数据 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalUsers}</div>
          <div className="stat-label">注册用户</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{totalPosts}</div>
          <div className="stat-label">发布文章</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{isHydrated ? '✅' : '⏳'}</div>
          <div className="stat-label">激活状态</div>
        </div>
      </div>
      
      {/* 特色文章 */}
      <section className="featured-section">
        <h2>精选文章</h2>
        
        {loading ? (
          <LoadingSpinner message="加载精选文章..." />
        ) : (
          <div className="featured-posts">
            {featuredPosts && featuredPosts.length > 0 ? (
              featuredPosts.map(post => (
                <article key={post.id} className="card">
                  <div className="card-body">
                    <h3 className="card-title">
                      <Link to={`/posts/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="card-text">
                      {post.content.substring(0, 150)}...
                    </p>
                    <div className="post-meta">
                      <span className="author">作者: {post.author}</span>
                      <span className="date">{post.publishDate}</span>
                    </div>
                    <Link 
                      to={`/posts/${post.id}`} 
                      className="btn btn-primary"
                    >
                      阅读更多
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-data">
                <p>暂无精选文章</p>
              </div>
            )}
          </div>
        )}
      </section>
      
      {/* 功能特性介绍 */}
      <section className="features-section">
        <h2>技术特性</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>服务端渲染</h3>
            <p>首屏快速加载，SEO友好，支持社交媒体分享预览</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>客户端激活</h3>
            <p>无缝的服务端到客户端过渡，事件处理和交互功能</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📡</div>
            <h3>数据同步</h3>
            <p>服务端预取数据，客户端状态同步，避免重复请求</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>性能优化</h3>
            <p>代码分割、缓存策略、资源预加载等性能优化技术</p>
          </div>
        </div>
      </section>
      
      {/* 快速导航 */}
      <section className="quick-nav">
        <h2>快速导航</h2>
        <div className="nav-cards">
          <Link to="/users" className="nav-card">
            <div className="nav-icon">👥</div>
            <h3>用户管理</h3>
            <p>查看和管理用户信息</p>
          </Link>
          
          <Link to="/posts" className="nav-card">
            <div className="nav-icon">📝</div>
            <h3>文章列表</h3>
            <p>浏览所有技术文章</p>
          </Link>
          
          <Link to="/about" className="nav-card">
            <div className="nav-icon">ℹ️</div>
            <h3>关于项目</h3>
            <p>了解项目技术细节</p>
          </Link>
        </div>
      </section>
      
      {/* <style jsx>{`
        .home-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .hero-section {
          text-align: center;
          padding: 40px 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          margin-bottom: 40px;
        }
        
        .hero-section .page-title {
          color: white;
          margin-bottom: 20px;
        }
        
        .hero-section .page-description {
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          max-width: 800px;
          margin: 0 auto 30px;
        }
        
        .hydration-status {
          margin-top: 20px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .status-badge.hydrated {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.3);
        }
        
        .status-badge.hydrating {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }
        
        .featured-section {
          margin-bottom: 50px;
        }
        
        .featured-section h2 {
          font-size: 24px;
          margin-bottom: 30px;
          color: #495057;
        }
        
        .featured-posts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        
        .post-meta {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          font-size: 14px;
          color: #6c757d;
        }
        
        .features-section,
        .quick-nav {
          margin-bottom: 50px;
        }
        
        .features-section h2,
        .quick-nav h2 {
          font-size: 24px;
          margin-bottom: 30px;
          color: #495057;
          text-align: center;
        }
        
        .features-grid,
        .nav-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }
        
        .feature-card,
        .nav-card {
          background: white;
          border-radius: 8px;
          padding: 30px 20px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .feature-card:hover,
        .nav-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        
        .nav-card {
          text-decoration: none;
          color: inherit;
        }
        
        .feature-icon,
        .nav-icon {
          font-size: 48px;
          margin-bottom: 15px;
          display: block;
        }
        
        .feature-card h3,
        .nav-card h3 {
          font-size: 18px;
          margin: 0 0 10px 0;
          color: #495057;
        }
        
        .feature-card p,
        .nav-card p {
          color: #6c757d;
          line-height: 1.6;
          margin: 0;
        }
        
        .no-data {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }
        
        @media (max-width: 768px) {
          .hero-section {
            padding: 30px 20px;
          }
          
          .featured-posts {
            grid-template-columns: 1fr;
          }
          
          .features-grid,
          .nav-cards {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      `}</style> */}
    </div>
  );
}

export default HomePage;