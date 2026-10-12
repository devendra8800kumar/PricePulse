import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children }) {
  const { user, isAuthLoading } = useApp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verifying session with PricePulse...</p>
      </div>
    );
  }

  if (!user || !user.isLoggedIn) {
    // Redirect to login page and remember where the user was heading
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
