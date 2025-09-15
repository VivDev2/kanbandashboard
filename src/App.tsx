// client/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './redux/store';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const { user, token } = useSelector((state: RootState) => state.auth);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          token ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} replace />
          ) : (
            <Login />
          )
        } />
        
        <Route path="/register" element={
          token ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} replace />
          ) : (
            <Register />
          )
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/user" element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          token ? (
            <Navigate to={user?.role === 'admin' ? '/admin' : '/user'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;