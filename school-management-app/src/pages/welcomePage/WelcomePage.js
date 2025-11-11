import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const WelcomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome {user?.role || 'User'} 👋</h2>
      <p>Thanks for logging in to the school management system.</p>
    </div>
  );
};

export default WelcomePage;
