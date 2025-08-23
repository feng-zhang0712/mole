import React from 'react';
import { useAuthSelector } from '../context/AuthContext';

function Status() {
  const isAuthenticated = useAuthSelector(context => context.isAuthenticated);

  console.warn('Status Rerender...');
  
  return (
    <div>
      Status: {isAuthenticated ? 'Online' : 'Offline'}
    </div>
  );  
}

export default Status;
