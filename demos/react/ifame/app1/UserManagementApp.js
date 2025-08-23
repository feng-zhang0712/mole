import React, { useState, useEffect, useCallback } from 'react';
import './UserManagementApp.css';

const UserManagementApp = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [communicationStatus, setCommunicationStatus] = useState('正在连接主应用...');
  const [globalStateInfo, setGlobalStateInfo] = useState('正在获取全局状态...');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    adminUsers: 0
  });

  // 模拟用户数据
  const mockUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: '管理员',
      status: 'active',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      username: 'user1',
      email: 'user1@example.com',
      role: '普通用户',
      status: 'active',
      createdAt: '2024-01-02'
    },
    {
      id: 3,
      username: 'user2',
      email: 'user2@example.com',
      role: '普通用户',
      status: 'inactive',
      createdAt: '2024-01-03'
    },
    {
      id: 4,
      username: 'moderator',
      email: 'moderator@example.com',
      role: '版主',
      status: 'active',
      createdAt: '2024-01-04'
    },
    {
      id: 5,
      username: 'guest',
      email: 'guest@example.com',
      role: '访客',
      status: 'pending',
      createdAt: '2024-01-05'
    }
  ];

  // 初始化应用
  useEffect(() => {
    initializeApp();
  }, []);

  // 初始化应用
  const initializeApp = useCallback(async () => {
    try {
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 加载用户数据
      setUsers(mockUsers);
      updateStats(mockUsers);
      
      // 设置通信状态
      setupCommunication();
      
      // 获取全局状态
      getGlobalState();
      
      setLoading(false);
      
      console.log('用户管理应用初始化完成');
    } catch (error) {
      console.error('用户管理应用初始化失败:', error);
      setCommunicationStatus('连接失败: ' + error.message);
    }
  }, []);

  // 设置通信
  const setupCommunication = useCallback(() => {
    // 监听来自主应用的消息
    window.addEventListener('message', handleMessage);
    
    // 发送应用就绪消息
    sendMessageToParent('appReady', {
      appId: 'app1',
      timestamp: Date.now(),
      status: 'ready'
    });
    
    setCommunicationStatus('✅ 已连接到主应用');
    
    // 定期发送心跳
    setInterval(() => {
      sendMessageToParent('heartbeat', {
        appId: 'app1',
        timestamp: Date.now()
      });
    }, 30000);
  }, []);

  // 处理来自主应用的消息
  const handleMessage = useCallback((event) => {
    const { data: message } = event;
    
    console.log('收到主应用消息:', message);
    
    switch (message.type) {
      case 'stateChange':
        handleGlobalStateChange(message);
        break;
      case 'themeChange':
        handleThemeChange(message);
        break;
      case 'userAction':
        handleUserAction(message);
        break;
      default:
        console.log('未知消息类型:', message.type);
    }
  }, []);

  // 发送消息到主应用
  const sendMessageToParent = useCallback((type, data) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type,
          data,
          source: 'app1',
          timestamp: Date.now()
        }, '*');
      }
    } catch (error) {
      console.warn('发送消息到主应用失败:', error);
    }
  }, []);

  // 处理全局状态变化
  const handleGlobalStateChange = useCallback((message) => {
    const { key, value } = message;
    
    if (key === 'userInfo') {
      setGlobalStateInfo(`当前用户: ${value?.name || '未知'} (${value?.role || '未知角色'})`);
    } else if (key === 'theme') {
      setGlobalStateInfo(`当前主题: ${value || '默认'}`);
    }
  }, []);

  // 处理主题变化
  const handleThemeChange = useCallback((message) => {
    const { theme } = message;
    document.body.className = theme || '';
    setGlobalStateInfo(`主题已切换为: ${theme || '默认'}`);
  }, []);

  // 处理用户操作
  const handleUserAction = useCallback((message) => {
    const { action, userId } = message;
    
    switch (action) {
      case 'refresh':
        refreshUsers();
        break;
      case 'selectUser':
        selectUser(userId);
        break;
      default:
        console.log('未知用户操作:', action);
    }
  }, []);

  // 获取全局状态
  const getGlobalState = useCallback(() => {
    try {
      if (window.parent && window.parent.mainApp) {
        const userInfo = window.parent.mainApp.getGlobalState('userInfo');
        const theme = window.parent.mainApp.getGlobalState('theme');
        
        if (userInfo) {
          setGlobalStateInfo(`当前用户: ${userInfo.name} (${userInfo.role})`);
        }
        
        if (theme) {
          document.body.className = theme;
        }
      }
    } catch (error) {
      console.warn('获取全局状态失败:', error);
      setGlobalStateInfo('无法获取全局状态');
    }
  }, []);

  // 更新统计信息
  const updateStats = useCallback((userList) => {
    const totalUsers = userList.length;
    const activeUsers = userList.filter(user => user.status === 'active').length;
    const newUsers = userList.filter(user => {
      const createdDate = new Date(user.createdAt);
      const now = new Date();
      const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;
    const adminUsers = userList.filter(user => user.role === '管理员').length;

    setStats({
      totalUsers,
      activeUsers,
      newUsers,
      adminUsers
    });
  }, []);

  // 刷新用户数据
  const refreshUsers = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setUsers([...mockUsers]);
      updateStats(mockUsers);
      setLoading(false);
      
      // 通知主应用数据已刷新
      sendMessageToParent('dataRefreshed', {
        appId: 'app1',
        timestamp: Date.now(),
        count: mockUsers.length
      });
    }, 1000);
  }, []);

  // 选择用户
  const selectUser = useCallback((userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  }, [selectedUsers.length, users]);

  // 添加用户
  const addUser = useCallback(() => {
    const newUser = {
      id: users.length + 1,
      username: `user${users.length + 1}`,
      email: `user${users.length + 1}@example.com`,
      role: '普通用户',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    updateStats(updatedUsers);
    
    // 通知主应用用户已添加
      sendMessageToParent('userAdded', {
        appId: 'app1',
        timestamp: Date.now(),
        user: newUser
      });
  }, [users, updateStats]);

  // 删除选中用户
  const deleteSelectedUsers = useCallback(() => {
    if (selectedUsers.length === 0) return;
    
    const updatedUsers = users.filter(user => !selectedUsers.includes(user.id));
    setUsers(updatedUsers);
    setSelectedUsers([]);
    updateStats(updatedUsers);
    
    // 通知主应用用户已删除
    sendMessageToParent('usersDeleted', {
      appId: 'app1',
      timestamp: Date.now(),
      deletedCount: selectedUsers.length
    });
  }, [selectedUsers, users, updateStats]);

  // 导出数据
  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users-data.json';
    link.click();
    URL.revokeObjectURL(url);
    
    // 通知主应用数据已导出
    sendMessageToParent('dataExported', {
      appId: 'app1',
      timestamp: Date.now(),
      format: 'json'
    });
  }, [users]);

  // 获取状态样式类
  const getStatusClass = useCallback((status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  }, []);

  // 渲染用户行
  const renderUserRow = useCallback((user) => (
    <tr key={user.id}>
      <td>
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.id)}
          onChange={() => selectUser(user.id)}
        />
      </td>
      <td>{user.id}</td>
      <td>{user.username}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
      <td>
        <span className={`status-badge ${getStatusClass(user.status)}`}>
          {user.status === 'active' ? '活跃' : 
           user.status === 'inactive' ? '非活跃' : '待审核'}
        </span>
      </td>
      <td>{user.createdAt}</td>
      <td>
        <button className="btn btn-primary" style={{ marginRight: '0.5rem' }}>
          编辑
        </button>
        <button className="btn btn-danger">
          删除
        </button>
      </td>
    </tr>
  ), [selectedUsers, selectUser, getStatusClass]);

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>正在加载用户管理应用...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">👥 用户管理系统</h1>
        <p className="app-description">用户信息管理、权限控制、角色分配</p>
      </div>
      
      <div className="communication-panel">
        <div className="communication-title">🔗 微前端通信状态</div>
        <div className="communication-content">
          {communicationStatus}
        </div>
      </div>
      
      <div className="global-state-panel">
        <div className="global-state-title">🌐 全局状态信息</div>
        <div className="global-state-content">
          {globalStateInfo}
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">总用户数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.activeUsers}</div>
          <div className="stat-label">活跃用户</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.newUsers}</div>
          <div className="stat-label">新增用户</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.adminUsers}</div>
          <div className="stat-label">管理员</div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="content-header">
          <h2 className="content-title">用户列表</h2>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={addUser}>
              添加用户
            </button>
            <button className="btn btn-success" onClick={exportData}>
              导出数据
            </button>
            <button className="btn btn-warning" onClick={refreshUsers}>
              刷新
            </button>
            <button 
              className="btn btn-danger" 
              onClick={deleteSelectedUsers}
              disabled={selectedUsers.length === 0}
            >
              删除选中 ({selectedUsers.length})
            </button>
          </div>
        </div>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(renderUserRow)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementApp;
