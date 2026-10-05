import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import CitizenReport from './pages/CitizenReport';
import WorkerDashboard from './pages/WorkerDashboard';
import CitizenMyReports from './pages/CitizenMyReports';
import PublicMap from './pages/PublicMap';

// Root redirector based on authenticated user role
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'worker' ? (
    <Navigate to="/worker-dashboard" replace />
  ) : (
    <Navigate to="/report" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Home redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/map" element={<PublicMap />} />

              {/* Citizen & Worker Routes */}
              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker']}>
                    <CitizenReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'worker']}>
                    <CitizenMyReports />
                  </ProtectedRoute>
                }
              />

              {/* Worker Only Route */}
              <Route
                path="/worker-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['worker']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
