// client/src/App.tsx
import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './redux/store';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import UserManagement from './components/UserManagement'; // Add this import
import Login from './components/Login';
import Register from './components/Register';
import socketService from './services/socketService';
import DashboardLayout from './components/DashboardLayout';
import LeaveManagement from './components/LeaveManagement';
import ProjectTimeline from './components/ProjectTimeline';

function App() {
  const { user, token, loading } = useSelector((state: RootState) => state.auth);
  const tokenRef = useRef<string | null>(null);

  // Handle socket connection/disconnection based on auth state
  useEffect(() => {
    // Only reconnect if token actually changed
    if (token && token !== tokenRef.current) {
      tokenRef.current = token;
      socketService.connect(token);
    } else if (!token && tokenRef.current) {
      tokenRef.current = null;
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderRedirect = () => {
    if (!token || !user) {
      return <Navigate to="/login" replace />;
    }
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            token && user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
            ) : (
              <Login />
            )
          } 
        />
        
        <Route 
          path="/register" 
          element={
            token && user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />
            ) : (
              <Register />
            )
          } 
        />
        
        {/* Admin Dashboard Route - Default */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* User Management Route - Nested under /admin */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/admin/leaves" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <LeaveManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />



        <Route 
          path="/admin/timeline" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout>
                <ProjectTimeline   />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />



        
        <Route 
          path="/user" 
          element={
            <ProtectedRoute requiredRole="user">
              <DashboardLayout>
                <UserDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/user/leaves" 
          element={
            <ProtectedRoute requiredRole="user">
              <DashboardLayout>
                <LeaveManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />







        
        <Route path="/" element={renderRedirect()} />
        
        <Route 
          path="*" 
          element={
            <div className="min-h-screen flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;