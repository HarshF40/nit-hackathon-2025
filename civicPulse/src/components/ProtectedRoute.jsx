import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredType }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const authType = localStorage.getItem('authType');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && authType !== requiredType) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
