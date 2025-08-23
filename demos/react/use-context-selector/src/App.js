import React from 'react';
import AuthProvider from '../context/AuthContext';
import Status from './Status';
import Profile from './Profile';
import Dashboard from './Dashboard';

function App() {
  return (
    <AuthProvider>
      <Status />
      <Profile />
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
