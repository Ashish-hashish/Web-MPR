import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <p className="text-slate-500 font-medium text-sm">Verifying civic credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If citizen tries to access worker dashboard, send to report
    if (user.role === 'citizen') {
      return <Navigate to="/report" replace />;
    }
    // If worker tries to access citizen only page, send to dashboard
    return <Navigate to="/worker-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
