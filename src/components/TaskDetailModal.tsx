// client/src/components/TaskDetailModal.tsx
import React, { useState, useEffect } from 'react';
import type { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

interface User {
  _id: string; // Updated to match the API response
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string[]; // Updated to match API response
  assignedBy: string; // Updated to match API response
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskDetailModalProps {
  task: Task;
  currentUser: User;
  onClose: () => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskData: Partial<Task>) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  currentUser,
  onClose,
  onDelete,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>(task);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(task.assignedTo || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get users from Redux store
  const { allUsers = [] } = useSelector((state: RootState) => state.tasks);

  // Update local state when task prop changes
  useEffect(() => {
    setEditedTask(task);
    setSelectedUsers(task.assignedTo || []);
  }, [task]);

  const handleSave = () => {
    setLoading(true);
    setError('');
    
    try {
      // Prepare updated task data
      const updatedTask = {
        ...editedTask,
        assignedTo: selectedUsers
      };
      
      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof Task, value: any) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {isEditing ? (
              <input
                type="text"
                value={editedTask.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="text-lg font-medium text-gray-900 border border-gray-300 rounded px-2 py-1 w-full"
                autoFocus
              />
            ) : (
              <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full p-1"
              aria-label="Close modal"
              disabled={loading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 text-red-700 bg-red-50 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              {isEditing ? (
                <textarea
                  value={editedTask.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  rows={4}
                />
              ) : (
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{task.description}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Assignee</h4>
                {isEditing ? (
                  <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                    {allUsers.map(user => (
                      <div 
                        key={user._id} 
                        className={`flex items-center p-2 rounded cursor-pointer mb-2 ${
                          selectedUsers.includes(user._id) 
                            ? 'bg-indigo-50 border border-indigo-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleUserSelect(user._id)}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-indigo-800 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        <div className="ml-auto">
                          {selectedUsers.includes(user._id) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {task.assignedTo?.length > 0 ? (
                      task.assignedTo.map(userId => {
                        const user = allUsers.find(u => u._id === userId);
                        return user ? (
                          <div key={user._id} className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 text-sm font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="ml-2 text-sm text-gray-900">{user.name}</span>
                          </div>
                        ) : null;
                      })
                    ) : (
                      <p className="text-gray-500 text-sm">No assignee</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
                {isEditing ? (
                  <select
                    value={editedTask.status || ''}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                  </span>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Due Date</h4>
                {isEditing ? (
                  <input
                    type="date"
                    value={editedTask.dueDate || ''}
                    onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-600">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Priority</h4>
                {isEditing ? (
                  <select
                    value={editedTask.priority || ''}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between">
            <div>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => onDelete(task.id)}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Delete Task
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Close
              </button>
              
              {currentUser?.role === 'admin' && (
                isEditing ? (
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={loading}
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    Edit Task
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;