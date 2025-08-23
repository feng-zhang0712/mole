/**
 * 文章详情页面组件 - 演示动态路由处理
 */

import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext.js';
import LoadingSpinner from '../components/LoadingSpinner.js';

function PostDetailPage() {
  const { id } = useParams();
  const { post, relatedPosts, loading, error, isHydrated } = useData();
  
  // 如果没有文章数据且不在加载中，显示404
  if (!loading && !error && !post) {
    return (
      <div className="post-not-found">
        <h1>📄 文章不存在</h1>
        <p>抱歉，您访问的文章不存在或已被删除。</p>
        <div className="actions">
          <Link to="/posts" className="btn btn-primary">
            返回文章列表
          </Link>
          <Link to="/" className="btn btn-secondary">
            回到首页
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="post-detail-page fade-in">
      {loading ? (
        <LoadingSpinner message="加载文章详情..." />
      ) : error ? (
        <div className="error-message">
          <h3>⚠️ 加载失败</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>
              重新加载
            </button>
            <Link to="/posts" className="btn btn-secondary">
              返回列表
            </Link>
          </div>
        </div>
      ) : post ? (
        <article className="post-article">
          {/* 面包屑导航 */}
          <nav className="breadcrumb">
            <Link to="/">首页</Link>
            <span className="separator">›</span>
            <Link to="/posts">文章</Link>
            <span className="separator">›</span>
            <span className="current">{post.title}</span>
          </nav>
          
          {/* 文章头部 */}
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <div className="meta-item">
                <span className="label">作者:</span>
                <span className="value">{post.author}</span>
              </div>
              <div className="meta-item">
                <span className="label">发布时间:</span>
                <span className="value">{post.publishDate}</span>
              </div>
              <div className="meta-item">
                <span className="label">文章ID:</span>
                <span className="value">#{post.id}</span>
              </div>
            </div>
            
            {/* 标签 */}
            {post.tags && (
              <div className="post-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          
          {/* 文章内容 */}
          <div className="post-content">
            <div className="content-body">
              {post.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              
              {/* 模拟更多内容 */}
              <h2>技术要点</h2>
              <ul>
                <li>服务端渲染提供更好的SEO支持</li>
                <li>首屏加载速度显著提升</li>
                <li>客户端激活保证交互功能正常</li>
                <li>状态同步避免数据不一致</li>
              </ul>
              
              <h2>实现细节</h2>
              <p>
                在实现SSR的过程中，需要特别注意环境差异处理。服务端没有DOM环境，
                因此需要避免在服务端执行浏览器相关的代码。同时，客户端激活时需要
                确保服务端和客户端渲染的内容一致，否则会出现内容闪烁。
              </p>
              
              <h2>性能优化</h2>
              <p>
                通过合理的缓存策略和代码分割，可以进一步提升SSR应用的性能。
                服务端可以缓存渲染结果，减少重复计算。客户端可以利用代码分割
                实现按需加载，降低初始包大小。
              </p>
            </div>
            
            {/* 交互功能演示 */}
            <div className="interaction-demo">
              <h3>交互功能演示</h3>
              <p>以下功能需要客户端激活后才能正常工作：</p>
              <div className="demo-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    if (!isHydrated) {
                      alert('页面还未完全加载，请稍候再试');
                      return;
                    }
                    alert('👍 点赞成功！这是客户端交互功能');
                  }}
                >
                  👍 点赞 ({Math.floor(Math.random() * 100) + 10})
                </button>
                
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    if (!isHydrated) {
                      alert('页面还未完全加载，请稍候再试');
                      return;
                    }
                    const comment = prompt('请输入您的评论:');
                    if (comment) {
                      alert(`评论已提交: ${comment}`);
                    }
                  }}
                >
                  💬 评论
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    if (!isHydrated) {
                      alert('页面还未完全加载，请稍候再试');
                      return;
                    }
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        text: post.content.substring(0, 100),
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('链接已复制到剪贴板');
                    }
                  }}
                >
                  🔗 分享
                </button>
              </div>
              
              <div className="hydration-status">
                交互状态: {isHydrated ? '✅ 已激活' : '⏳ 激活中...'}
              </div>
            </div>
          </div>
          
          {/* 相关文章 */}
          {relatedPosts && relatedPosts.length > 0 && (
            <aside className="related-posts">
              <h2>相关文章</h2>
              <div className="related-grid">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} className="related-card">
                    <h3>
                      <Link to={`/posts/${relatedPost.id}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p>{relatedPost.content.substring(0, 100)}...</p>
                    <div className="related-meta">
                      <span>by {relatedPost.author}</span>
                      <span>{relatedPost.publishDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}
          
          {/* 导航 */}
          <nav className="post-navigation">
            <Link to="/posts" className="btn btn-primary">
              ← 返回文章列表
            </Link>
            <Link to="/" className="btn btn-secondary">
              回到首页
            </Link>
          </nav>
        </article>
      ) : null}
      
      {/* <style jsx>{`
        .post-detail-page {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .post-not-found {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .post-not-found h1 {
          color: #dc3545;
          margin-bottom: 15px;
        }
        
        .post-not-found .actions {
          margin-top: 30px;
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 30px;
          font-size: 14px;
          color: #6c757d;
        }
        
        .breadcrumb a {
          color: #007bff;
          text-decoration: none;
        }
        
        .breadcrumb a:hover {
          text-decoration: underline;
        }
        
        .separator {
          color: #dee2e6;
        }
        
        .current {
          color: #495057;
          font-weight: 500;
        }
        
        .post-article {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .post-header {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .post-title {
          font-size: 32px;
          font-weight: 700;
          color: #212529;
          margin: 0 0 20px 0;
          line-height: 1.2;
        }
        
        .post-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 14px;
        }
        
        .meta-item .label {
          color: #6c757d;
          font-weight: 500;
        }
        
        .meta-item .value {
          color: #495057;
        }
        
        .post-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .tag {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .post-content {
          line-height: 1.8;
          font-size: 16px;
        }
        
        .content-body {
          margin-bottom: 40px;
        }
        
        .content-body h2 {
          color: #495057;
          font-size: 24px;
          margin: 30px 0 15px 0;
          font-weight: 600;
        }
        
        .content-body p {
          color: #495057;
          margin: 0 0 20px 0;
        }
        
        .content-body ul {
          margin: 0 0 20px 20px;
          color: #495057;
        }
        
        .content-body li {
          margin-bottom: 8px;
        }
        
        .interaction-demo {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 40px;
        }
        
        .interaction-demo h3 {
          margin: 0 0 15px 0;
          color: #495057;
        }
        
        .demo-actions {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        
        .hydration-status {
          font-size: 14px;
          color: #6c757d;
          font-family: monospace;
          margin-top: 15px;
          padding: 8px 12px;
          background: white;
          border-radius: 4px;
        }
        
        .related-posts {
          margin-bottom: 40px;
        }
        
        .related-posts h2 {
          color: #495057;
          font-size: 20px;
          margin-bottom: 20px;
        }
        
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .related-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        
        .related-card h3 {
          margin: 0 0 10px 0;
          font-size: 16px;
        }
        
        .related-card h3 a {
          color: #495057;
          text-decoration: none;
        }
        
        .related-card h3 a:hover {
          color: #007bff;
        }
        
        .related-card p {
          color: #6c757d;
          font-size: 14px;
          margin: 0 0 10px 0;
        }
        
        .related-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }
        
        .post-navigation {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .error-message {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .error-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        @media (max-width: 768px) {
          .post-article {
            padding: 25px 20px;
          }
          
          .post-title {
            font-size: 24px;
          }
          
          .post-meta {
            flex-direction: column;
            gap: 10px;
          }
          
          .demo-actions {
            flex-direction: column;
          }
          
          .related-grid {
            grid-template-columns: 1fr;
          }
          
          .post-navigation {
            flex-direction: column;
          }
        }
      `}</style> */}
    </div>
  );
}

export default PostDetailPage;