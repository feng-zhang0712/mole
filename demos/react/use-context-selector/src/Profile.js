import React, { use } from 'react';
import { useAuthSelector } from '../context/AuthContext';

function Profile() {
  const user = useAuthSelector(context => context.user);
  
  console.warn('User Rerender...');
  
  return (
    <div>
      User: {user}
    </div>
  )
}

export default Profile;
