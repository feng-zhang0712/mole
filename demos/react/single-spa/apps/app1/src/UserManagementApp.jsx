import React, { useState, useEffect } from 'react';
import './UserManagementApp.css';

const UserManagementApp = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // 模拟用户数据
  const mockUsers = [
    { id: 1, name: '张三', email: 'zhangsan@example.com', role: 'admin', status: 'active', department: '技术部', joinDate: '2023-01-15' },
    { id: 2, name: '李四', email: 'lisi@example.com', role: 'user', status: 'active', department: '产品部', joinDate: '2023-02-20' },
    { id: 3, name: '王五', email: 'wangwu@example.com', role: 'manager', status: 'inactive', department: '市场部', joinDate: '2023-03-10' },
    { id: 4, name: '赵六', email: 'zhaoliu@example.com', role: 'user', status: 'active', department: '设计部', joinDate: '2023-04-05' },
    { id: 5, name: '钱七', email: 'qianqi@example.com', role: 'admin', status: 'active', department: '技术部', joinDate: '2023-05-12' }
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddUser = (userData) => {
    const newUser = {
      ...userData,
      id: users.length + 1,
      joinDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setShowAddForm(false);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditingUser(null);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleStatusToggle = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="user-management-app">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="user-management-app">
      <div className="app-header">
        <h2>👥 用户管理系统</h2>
        <p>管理用户信息、权限和状态</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="搜索用户姓名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">所有角色</option>
            <option value="admin">管理员</option>
            <option value="manager">经理</option>
            <option value="user">普通用户</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="add-user-btn"
        >
          ➕ 添加用户
        </button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>总用户数</h3>
          <p>{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>活跃用户</h3>
          <p>{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>管理员</h3>
          <p>{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>部门</th>
              <th>状态</th>
              <th>入职日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role}`}>
                    {user.role === 'admin' ? '管理员' : 
                     user.role === 'manager' ? '经理' : '用户'}
                  </span>
                </td>
                <td>{user.department}</td>
                <td>
                  <span className={`status-badge status-${user.status}`}>
                    {user.status === 'active' ? '活跃' : '非活跃'}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>
                  <div className="actions">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="edit-btn"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleStatusToggle(user.id)}
                      className={`status-btn ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                    >
                      {user.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="delete-btn"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <UserForm
          onSubmit={handleAddUser}
          onCancel={() => setShowAddForm(false)}
          mode="add"
        />
      )}

      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
          mode="edit"
        />
      )}
    </div>
  );
};

// 用户表单组件
const UserForm = ({ user, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    department: user?.department || '',
    status: user?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'edit') {
      onSubmit({ ...user, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{mode === 'edit' ? '编辑用户' : '添加用户'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>姓名:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>邮箱:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>角色:</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">普通用户</option>
              <option value="manager">经理</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div className="form-group">
            <label>部门:</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>状态:</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="active">活跃</option>
              <option value="inactive">非活跃</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {mode === 'edit' ? '更新' : '添加'}
            </button>
            <button type="button" onClick={onCancel} className="cancel-btn">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementApp;
