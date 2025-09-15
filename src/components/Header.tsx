// client/src/components/Header.tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import socketService from '../services/socketService';

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    socketService.disconnect();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Welcome, {user?.name}</span>
          <span className={`text-sm font-medium px-2.5 py-0.5 rounded ${
            user?.role === 'admin' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {user?.role === 'admin' ? 'Admin' : 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;