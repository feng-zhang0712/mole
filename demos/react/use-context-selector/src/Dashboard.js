import React from 'react';
import { useAuthSelector } from '../context/AuthContext';

function Dashboard() {
  const { isAuthenticated, loading, login, logout, changeUser } = useAuthSelector(context => ({
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    login: context.login,
    logout: context.logout,
    changeUser: context.changeUser
  }));

  // const { isAuthenticated, login, logout, changeUser } = useAuthSelector(context => context);

  console.warn('Dashboard Rerender...');

  if (loading) {
    return (
      <div>Loading...</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={changeUser}>Change User</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Dashboard;
