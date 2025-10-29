import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/slices/dashboardSlice';
import { fetchTasks, selectUserTasks } from '../redux/slices/taskSlice';
import socketService from '../services/socketService';
import KanbanBoard from './KanbanBoard';
import TaskService from '../services/taskService';

const UserDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {stats, loading } = useSelector((state: RootState) => state.dashboard);

  // Normalize userId safely
  const userId = user?._id;

  // Use the memoized selector
  const userTasks = useSelector((state: RootState) => selectUserTasks(state, userId));

  const [kanbanLayout, setKanbanLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [figmaLinks, setFigmaLinks] = useState<string[]>([]);
  const [newFigmaLink, setNewFigmaLink] = useState('');
  const [githubLinks, setGithubLinks] = useState<string[]>([]);
  const [newGithubLink, setNewGithubLink] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<{ type: 'figma' | 'github'; index: number } | null>(null);
  const [quickNotes, setQuickNotes] = useState('');

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchDashboardData());
    dispatch(fetchTasks() as any);
    
    // Load persisted data
    const storedFigmaLinks = localStorage.getItem('figmaLinks');
    const storedGithubLinks = localStorage.getItem('githubLinks');
    const storedQuickNotes = localStorage.getItem('quickNotes');
    
    if (storedFigmaLinks) setFigmaLinks(JSON.parse(storedFigmaLinks));
    if (storedGithubLinks) setGithubLinks(JSON.parse(storedGithubLinks));
    if (storedQuickNotes) setQuickNotes(storedQuickNotes);
  }, [dispatch]);

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('figmaLinks', JSON.stringify(figmaLinks));
  }, [figmaLinks]);

  useEffect(() => {
    localStorage.setItem('githubLinks', JSON.stringify(githubLinks));
  }, [githubLinks]);

  useEffect(() => {
    localStorage.setItem('quickNotes', quickNotes);
  }, [quickNotes]);

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

  const handleAddFigmaLink = () => {
    if (newFigmaLink.trim()) {
      setFigmaLinks([...figmaLinks, newFigmaLink.trim()]);
      setNewFigmaLink('');
    }
  };

  const handleAddGithubLink = () => {
    if (newGithubLink.trim()) {
      setGithubLinks([...githubLinks, newGithubLink.trim()]);
      setNewGithubLink('');
    }
  };

  const handleCopyLink = (link: string, type: 'figma' | 'github', index: number) => {
    navigator.clipboard.writeText(link);
    setCopiedIndex({ type, index });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDeleteLink = (type: 'figma' | 'github', index: number) => {
    if (type === 'figma') {
      setFigmaLinks(figmaLinks.filter((_, i) => i !== index));
    } else {
      setGithubLinks(githubLinks.filter((_, i) => i !== index));
    }
  };

  // Get current hour for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading your workspace...</p>
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

  const completionRate = userTasks.length > 0 
    ? Math.round((userStats.completedTasks / userTasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Personalized Greeting Header */}
        <div className="mb-10">
          <div className="mb-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-lg text-gray-500">
              Here's what's happening with your tasks today
            </p>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tasks Card */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Tasks</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{userTasks.length}</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">↑ 12%</span>
              <span className="text-gray-500 ml-2">vs last week</span>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-amber-200 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">In Progress</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{userStats.inProgressTasks}</p>
            </div>
            <div className="flex items-center text-sm">
              {userStats.overdueTasks > 0 ? (
                <>
                  <span className="text-red-600 font-medium">{userStats.overdueTasks} overdue</span>
                  <span className="text-gray-500 ml-2">needs attention</span>
                </>
              ) : (
                <>
                  <span className="text-green-600 font-medium">✓ On track</span>
                  <span className="text-gray-500 ml-2">great progress</span>
                </>
              )}
            </div>
          </div>

          {/* Completed Card */}
          <div className="group relative bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-green-200 transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{userStats.completedTasks}</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">{completionRate}% done</span>
              <span className="text-gray-500 ml-2">completion rate</span>
            </div>
          </div>

          {/* Productivity Score Card */}
          <div className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-all duration-300">
            <div className="absolute top-6 right-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-white/80 uppercase tracking-wide">Productivity</p>
              <p className="text-4xl font-bold mt-2">{completionRate}</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="font-medium">Keep it up!</span>
              <span className="ml-2 opacity-80">🔥</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Figma Files Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-200 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Figma Files</h2>
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                {figmaLinks.length}
              </span>
            </div>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {figmaLinks.map((link, index) => (
                <div key={index} className="group flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate font-medium">{link}</p>
                  </div>
                  <button
                    onClick={() => handleCopyLink(link, 'figma', index)}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Copy link"
                  >
                    {copiedIndex?.type === 'figma' && copiedIndex?.index === index ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteLink('figma', index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {figmaLinks.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No Figma files yet</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFigmaLink}
                onChange={(e) => setNewFigmaLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFigmaLink()}
                placeholder="Paste Figma link..."
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <button
                onClick={handleAddFigmaLink}
                disabled={!newFigmaLink.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* GitHub Repos Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">GitHub Repos</h2>
              </div>
              <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                {githubLinks.length}
              </span>
            </div>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {githubLinks.map((link, index) => (
                <div key={index} className="group flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate font-medium">{link}</p>
                  </div>
                  <button
                    onClick={() => handleCopyLink(link, 'github', index)}
                    className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Copy link"
                  >
                    {copiedIndex?.type === 'github' && copiedIndex?.index === index ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteLink('github', index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              {githubLinks.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No repositories yet</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGithubLink}
                onChange={(e) => setNewGithubLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddGithubLink()}
                placeholder="Paste GitHub link..."
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
              />
              <button
                onClick={handleAddGithubLink}
                disabled={!newGithubLink.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Quick Notes Card */}
          <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Quick Notes</h2>
              </div>
            </div>
            <textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Jot down quick thoughts, ideas, or reminders..."
              rows={8}
              className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            />
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>Auto-saved</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Synced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b-2 border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
              <p className="text-sm text-gray-500 mt-1">Drag and drop to update task status</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Layout:</span>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setKanbanLayout('horizontal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    kanbanLayout === 'horizontal'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setKanbanLayout('vertical')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    kanbanLayout === 'vertical'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4v16M15 4v16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className={`p-6 ${kanbanLayout === 'vertical' ? 'max-h-[800px] overflow-y-auto' : ''}`}>
            <KanbanBoard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;