// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  // 1. Not logged in? Send to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If allowedRoles is defined, check authorization
  if (allowedRoles) {
    // Normalize to array
    const roles = Array.isArray(allowedRoles)
      ? allowedRoles.map(r => r.toLowerCase())
      : [allowedRoles.toLowerCase()];

    if (!roles.includes(user.role.toLowerCase())) {
      // User is logged in but not in allowed role(s)
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>🚫 Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      );
    }
  }

  // 3. Authenticated (and authorized, if required) ⇒ render children
  return children;
};

export default ProtectedRoute;
