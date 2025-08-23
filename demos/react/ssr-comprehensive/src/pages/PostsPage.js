/**
 * 文章列表页面组件
 */

import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.js';
import LoadingSpinner from '../components/LoadingSpinner.js';

function PostsPage() {
  const { posts, loading, error, isHydrated } = useData();
  
  return (
    <div className="posts-page fade-in">
      <div className="page-header">
        <h1 className="page-title">技术文章</h1>
        <p className="page-description">
          浏览我们的技术文章集合，涵盖React、Webpack、前端工程化等主题。
        </p>
      </div>
      
      <div className="posts-content">
        {loading ? (
          <LoadingSpinner message="加载文章列表..." />
        ) : error ? (
          <div className="error-message">
            <h3>⚠️ 加载失败</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              重新加载
            </button>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <h2 className="post-title">
                    <Link to={`/posts/${post.id}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <div className="post-meta">
                    <span className="author">by {post.author}</span>
                    <span className="date">{post.publishDate}</span>
                  </div>
                </div>
                
                <div className="post-content">
                  <p className="post-excerpt">
                    {post.content.substring(0, 200)}...
                  </p>
                  
                  {post.tags && (
                    <div className="post-tags">
                      {post.tags.map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="post-actions">
                  <Link 
                    to={`/posts/${post.id}`} 
                    className="btn btn-primary"
                  >
                    阅读全文
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <h3>暂无文章</h3>
            <p>还没有发布任何文章。</p>
          </div>
        )}
      </div>
      
      {/* <style jsx>{`
        .posts-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }
        
        .post-card {
          background: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        
        .post-header {
          margin-bottom: 15px;
        }
        
        .post-title {
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.3;
        }
        
        .post-title a {
          color: #212529;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .post-title a:hover {
          color: #007bff;
        }
        
        .post-meta {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: #6c757d;
        }
        
        .post-content {
          flex: 1;
          margin-bottom: 20px;
        }
        
        .post-excerpt {
          color: #495057;
          line-height: 1.6;
          margin: 0 0 15px 0;
        }
        
        .post-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .tag {
          background: #f8f9fa;
          color: #495057;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .post-actions {
          margin-top: auto;
        }
        
        .error-message,
        .no-data {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .error-message h3,
        .no-data h3 {
          color: #dc3545;
          margin-bottom: 15px;
        }
        
        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .post-card {
            padding: 20px;
          }
        }
      `}</style> */}
    </div>
  );
}

export default PostsPage;