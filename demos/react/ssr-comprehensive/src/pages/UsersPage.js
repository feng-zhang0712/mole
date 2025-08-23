/**
 * 用户页面组件 - 展示用户管理功能
 */

import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext.js';
import LoadingSpinner from '../components/LoadingSpinner.js';

function UsersPage() {
  const { users, loading, error, fetchData, isHydrated } = useData();
  const [selectedUser, setSelectedUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // 客户端刷新数据功能
  const handleRefresh = async () => {
    if (typeof window === 'undefined') return; // 服务端不执行
    
    try {
      setRefreshing(true);
      await fetchData('/api/users');
    } catch (err) {
      console.error('刷新用户数据失败:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  // 处理用户选择 - 演示客户端事件处理
  const handleUserClick = (user) => {
    if (!isHydrated) {
      alert('页面还未完全加载，请稍候再试');
      return;
    }
    
    setSelectedUser(selectedUser?.id === user.id ? null : user);
    console.log('用户选择:', user);
  };
  
  // 模拟编辑用户
  const handleEditUser = (user) => {
    if (!isHydrated) return;
    
    const newName = prompt('修改用户名:', user.name);
    if (newName && newName !== user.name) {
      alert(`用户名已更新为: ${newName}`);
      // 在真实应用中，这里会调用API更新数据
    }
  };
  
  return (
    <div className="users-page fade-in">
      <div className="page-header">
        <h1 className="page-title">用户管理</h1>
        <p className="page-description">
          管理和查看所有注册用户的信息。这个页面演示了客户端事件处理和数据交互功能。
        </p>
        
        <div className="page-actions">
          <button 
            className={`btn btn-primary ${refreshing ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            {refreshing ? '刷新中...' : '刷新数据'}
          </button>
          
          <div className="status-info">
            状态: {isHydrated ? '✅ 交互可用' : '⏳ 激活中'}
          </div>
        </div>
      </div>
      
      {/* 用户统计 */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">总用户数</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="stat-label">管理员</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">
            {users.filter(u => u.role === 'user').length}
          </div>
          <div className="stat-label">普通用户</div>
        </div>
      </div>
      
      {/* 用户列表 */}
      <div className="users-content">
        {loading && !refreshing ? (
          <LoadingSpinner message="加载用户数据..." />
        ) : error ? (
          <div className="error-message">
            <h3>⚠️ 加载失败</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleRefresh}>
              重试
            </button>
          </div>
        ) : (
          <div className="users-grid">
            <div className="users-list">
              <h2>用户列表</h2>
              {users.length > 0 ? (
                <div className="user-cards">
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      className={`user-card ${selectedUser?.id === user.id ? 'selected' : ''}`}
                      onClick={() => handleUserClick(user)}
                    >
                      <div className="user-avatar">
                        {user.name.charAt(0)}
                      </div>
                      
                      <div className="user-info">
                        <h3 className="user-name">{user.name}</h3>
                        <span className={`user-role role-${user.role}`}>
                          {user.role === 'admin' ? '管理员' : '普通用户'}
                        </span>
                        <p className="user-email">{user.email}</p>
                      </div>
                      
                      <div className="user-actions">
                        <button 
                          className="btn btn-outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                        >
                          编辑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <p>暂无用户数据</p>
                  <button className="btn btn-primary" onClick={handleRefresh}>
                    重新加载
                  </button>
                </div>
              )}
            </div>
            
            {/* 用户详情面板 */}
            <div className="user-detail">
              <h2>用户详情</h2>
              {selectedUser ? (
                <div className="detail-content">
                  <div className="detail-header">
                    <div className="detail-avatar">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div className="detail-info">
                      <h3>{selectedUser.name}</h3>
                      <span className={`user-role role-${selectedUser.role}`}>
                        {selectedUser.role === 'admin' ? '管理员' : '普通用户'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="detail-fields">
                    <div className="field-group">
                      <label>ID</label>
                      <span>{selectedUser.id}</span>
                    </div>
                    
                    <div className="field-group">
                      <label>姓名</label>
                      <span>{selectedUser.name}</span>
                    </div>
                    
                    <div className="field-group">
                      <label>邮箱</label>
                      <span>{selectedUser.email}</span>
                    </div>
                    
                    <div className="field-group">
                      <label>角色</label>
                      <span>{selectedUser.role === 'admin' ? '管理员' : '普通用户'}</span>
                    </div>
                  </div>
                  
                  <div className="detail-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleEditUser(selectedUser)}
                    >
                      编辑用户
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setSelectedUser(null)}
                    >
                      关闭详情
                    </button>
                  </div>
                </div>
              ) : (
                <div className="detail-placeholder">
                  <p>请选择一个用户查看详细信息</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* <style jsx>{`
        .users-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        
        .status-info {
          font-size: 14px;
          color: #6c757d;
          font-family: monospace;
        }
        
        .users-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .users-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }
        
        .users-list h2,
        .user-detail h2 {
          font-size: 20px;
          margin-bottom: 20px;
          color: #495057;
        }
        
        .user-cards {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .user-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .user-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }
        
        .user-card.selected {
          border: 2px solid #007bff;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
        }
        
        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
        }
        
        .user-info {
          flex: 1;
        }
        
        .user-name {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #212529;
        }
        
        .user-role {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .role-admin {
          background: #dc3545;
          color: white;
        }
        
        .role-user {
          background: #28a745;
          color: white;
        }
        
        .user-email {
          margin: 8px 0 0 0;
          color: #6c757d;
          font-size: 14px;
        }
        
        .user-actions {
          display: flex;
          gap: 10px;
        }
        
        .user-detail {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          height: fit-content;
          position: sticky;
          top: 20px;
        }
        
        .detail-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .detail-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }
        
        .detail-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
        }
        
        .detail-info h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          color: #212529;
        }
        
        .detail-fields {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .field-group label {
          font-size: 12px;
          color: #6c757d;
          text-transform: uppercase;
          font-weight: 600;
        }
        
        .field-group span {
          font-size: 14px;
          color: #495057;
        }
        
        .detail-actions {
          display: flex;
          gap: 10px;
          flex-direction: column;
        }
        
        .detail-placeholder {
          text-align: center;
          color: #6c757d;
          padding: 40px 20px;
        }
        
        .error-message {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .error-message h3 {
          color: #dc3545;
          margin-bottom: 15px;
        }
        
        .no-data {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .users-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .user-card {
            padding: 15px;
          }
          
          .user-detail {
            position: static;
          }
          
          .page-actions {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }
        }
      `}</style> */}
    </div>
  );
}

export default UsersPage;