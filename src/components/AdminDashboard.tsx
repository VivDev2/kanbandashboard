// client/src/components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import KanbanBoard from './KanbanBoard';
import CreateTaskModal from './CreateTaskModal';
import { fetchTasks, fetchAllUsers } from '../redux/slices/taskSlice';
import type { RootState, AppDispatch } from '../redux/store';
import TaskService from '../services/taskService';

const AdminDashboard: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { tasks, allUsers, loading } = useSelector((state: RootState) => state.tasks);

  // Mock projects for admin
  const mockProjects = [
    { id: 'all', name: 'All Projects' },
    { id: 'proj1', name: 'Website Redesign' },
    { id: 'proj2', name: 'Mobile App' },
    { id: 'proj3', name: 'API Integration' },
    { id: 'proj4', name: 'Database Migration' },
  ];

  // Calculate stats
  const stats = {
    totalUsers: allUsers.length,
    pendingRequests: 3, // You can calculate this from your data
    completedTasks: tasks.filter((t: any) => t.status === 'done').length,
    totalTasks: tasks.length
  };

  useEffect(() => {
    dispatch(fetchTasks() as any);
    dispatch(fetchAllUsers() as any);
  }, [dispatch]);

  useEffect(() => {
    const handleTaskAssigned = () => {
      dispatch(fetchTasks() as any); // Refresh tasks when assigned
    };

    const handleTaskUpdated = () => {
      dispatch(fetchTasks() as any); // Refresh tasks when updated
    };

    const handleTaskDeleted = () => {
      dispatch(fetchTasks() as any); // Refresh tasks when deleted
    };

    TaskService.setupTaskListeners(
      handleTaskAssigned,
      handleTaskUpdated,
      handleTaskDeleted
    );

    return () => {
      TaskService.disconnect();
    };
  }, [dispatch]);

  const handleTaskCreated = () => {
    // Refresh tasks after creating a new one
    dispatch(fetchTasks() as any);
  };

  // Removed unused variables: filteredTasks and handleDragEnd

  if (loading) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-indigo-800 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 011-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Pending Requests</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.pendingRequests}</p>
              </div>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Completed Tasks</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.completedTasks}</p>
              </div>
            </div>
          </div>

          {/* Total Tasks Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Tasks</h3>
                <p className="text-2xl font-semibold text-gray-700">{stats.totalTasks}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Project Filter and Create Task */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Task Management</h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {mockProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => setShowCreateTaskModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Task
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedProject === 'all' ? 'All Tasks' : mockProjects.find(p => p.id === selectedProject)?.name + ' Tasks'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag cards between columns to update status • Click cards to edit details
            </p>
          </div>
          <div className="p-6 min-h-[500px]">
            <KanbanBoard />
          </div>
        </div>

        {/* Create Task Modal */}
        <CreateTaskModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;