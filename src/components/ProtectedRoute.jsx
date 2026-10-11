import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user || !user.isLoggedIn) {
    // Redirect to login page and remember where the user was heading
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
