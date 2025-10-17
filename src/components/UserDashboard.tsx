// client/src/components/UserDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import { fetchTasks, selectUserTasks } from '../redux/slices/taskSlice';
import socketService from '../services/socketService';
import KanbanBoard from './KanbanBoard';
import TaskService from '../services/taskService';
// Remove unused import type { User } from '../types';

const UserDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, stats, loading } = useSelector((state: RootState) => state.dashboard);

  // Normalize userId safely
  const userId = user?._id 

  // Use the memoized selector
  const userTasks = useSelector((state: RootState) => selectUserTasks(state, userId));

  const [requestMessage, setRequestMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchTasks() as any);
  }, [dispatch]);

  // Listen for notifications
  useEffect(() => {
    const handleNotification = (data: any) => {
      console.log('New notification:', data);
    };
    socketService.on('notification', handleNotification);
    return () => socketService.off('notification', handleNotification);
  }, []);

  // Listen for task events
  useEffect(() => {
    const handleTaskAssigned = () => dispatch(fetchTasks() as any);
    const handleTaskUpdated = () => dispatch(fetchTasks() as any);
    const handleTaskDeleted = () => dispatch(fetchTasks() as any);

    TaskService.setupTaskListeners(handleTaskAssigned, handleTaskUpdated, handleTaskDeleted);
    return () => TaskService.disconnect();
  }, [dispatch]);

  const handleRequestApproval = () => {
    if (requestMessage.trim() && userId && user) {
      socketService.emit('user:requestApproval', {
        message: requestMessage,
        userId,
        userName: user.name,
        timestamp: new Date().toISOString(),
      });
      setRequestMessage('');
    }
  };

  const handleUpdateStatus = () => {
    if (userId) {
      socketService.emit('user:updateStatus', {
        userId,
        status: 'online',
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-indigo-800 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate user-specific stats
  const userStats = {
    totalUsers: stats?.totalUsers || 0,
    pendingRequests: stats?.pendingRequests || 0,
    completedTasks: userTasks.filter((task) => task.status === 'done').length,
    inProgressTasks: userTasks.filter((task) => task.status === 'in-progress').length,
    overdueTasks: userTasks.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'done';
    }).length,
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b w-full">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg mr-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back</p>
              <p className="font-medium text-gray-900">{user?.name}</p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {['overview', 'tasks', 'analytics', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* My Tasks */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">My Tasks</h3>
                <p className="text-2xl font-bold text-gray-900">{userTasks.length}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{userTasks.length > 0 ? '5%' : '0%'} from last week
                </p>
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                <p className="text-2xl font-bold text-gray-900">{userStats.inProgressTasks}</p>
                <p className="text-xs text-amber-600 mt-1">
                  {userStats.overdueTasks > 0 ? `${userStats.overdueTasks} overdue` : 'All on track'}
                </p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-2xl font-bold text-gray-700">{userStats.completedTasks}</p>
                <p className="text-xs text-green-600 mt-1">On track for this week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="request-message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Send a request
                </label>
                <textarea
                  id="request-message"
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="What do you need approval for?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRequestApproval}
                  disabled={!requestMessage.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Request
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {notifications.slice(0, 3).map((notification, index) => (
                <div key={index} className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-2.5 h-2.5 rounded-full mt-2.5 mr-3 ${
                      notification.type === 'info'
                        ? 'bg-indigo-500'
                        : notification.type === 'warning'
                        ? 'bg-amber-500'
                        : notification.type === 'success'
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-xl shadow-sm mb-8 border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">My Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage your current tasks and priorities
            </p>
          </div>
          <div className="p-6">
            <KanbanBoard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
