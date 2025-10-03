import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../redux/slices/taskSlice';
import type { RootState } from '../redux/store';
import type { AppDispatch } from '../redux/store';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string[];
  dueDate: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  projectId?: string;
  color: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onTaskCreated 
}) => {
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: [],
    dueDate: '',
    status: 'todo',
    projectId: '',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { allUsers = [] } = useSelector((state: RootState) => state.tasks); // Add default value
  // Removed unused user variable

  // Mock projects
  const mockProjects = [
    { id: 'proj1', name: 'Website Redesign' },
    { id: 'proj2', name: 'Mobile App' },
    { id: 'proj3', name: 'API Integration' },
    { id: 'proj4', name: 'Database Migration' },
  ];

  // Color options for Kanban cards
  const colorOptions = [
    { value: '#3b82f6', name: 'Blue', bg: 'bg-blue-500' },
    { value: '#ef4444', name: 'Red', bg: 'bg-red-500' },
    { value: '#10b981', name: 'Green', bg: 'bg-green-500' },
    { value: '#f59e0b', name: 'Yellow', bg: 'bg-yellow-500' },
    { value: '#8b5cf6', name: 'Purple', bg: 'bg-purple-500' },
    { value: '#ec4899', name: 'Pink', bg: 'bg-pink-500' },
    { value: '#06b6d4', name: 'Cyan', bg: 'bg-cyan-500' },
    { value: '#f97316', name: 'Orange', bg: 'bg-orange-500' },
  ];

  // Kanban columns
  const kanbanColumns = [
    { id: 'todo' as const, title: 'To Do', color: 'bg-gray-200' },
    { id: 'in-progress' as const, title: 'In Progress', color: 'bg-blue-200' },
    { id: 'review' as const, title: 'Review', color: 'bg-yellow-200' },
    { id: 'done' as const, title: 'Done', color: 'bg-green-200' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTaskFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: [],
        dueDate: '',
        status: 'todo',
        projectId: mockProjects[0]?.id || '',
        color: '#3b82f6'
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare task data for API
      const taskData = {
        title: taskFormData.title,
        description: taskFormData.description,
        priority: taskFormData.priority,
        assignedTo: taskFormData.assignedTo,
        dueDate: taskFormData.dueDate,
        status: taskFormData.status,
      };

      const result = await dispatch(createTask(taskData));
      
      if (createTask.fulfilled.match(result)) {
        onTaskCreated?.();
        onClose();
      } else {
        throw new Error(result.payload as string || 'Failed to create task');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      option => option.value
    );
    setTaskFormData(prev => ({ ...prev, assignedTo: selectedOptions }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorSelect = (color: string) => {
    setTaskFormData(prev => ({ ...prev, color }));
  };

  const handleStatusSelect = (status: TaskFormData['status']) => {
    setTaskFormData(prev => ({ ...prev, status }));
  };

  const handlePrioritySelect = (priority: TaskFormData['priority']) => {
    setTaskFormData(prev => ({ ...prev, priority }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Create New Task</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
              disabled={loading}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={taskFormData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  name="projectId"
                  value={taskFormData.projectId}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {mockProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={taskFormData.description}
                onChange={handleChange}
                rows={2}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Task description"
              />
            </div>

            {/* Kanban Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {kanbanColumns.map(column => (
                  <button
                    key={column.id} // ✅ Key added
                    type="button"
                    onClick={() => handleStatusSelect(column.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      taskFormData.status === column.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-full h-2 ${column.color} rounded mb-2`}></div>
                    <span className="text-sm">{column.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority & Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Priority
                </label>
                <div className="space-y-2">
                  {(['low', 'medium', 'high'] as const).map(priority => (
                    <button
                      key={priority} // ✅ Key added
                      type="button"
                      onClick={() => handlePrioritySelect(priority)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        taskFormData.priority === priority
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          priority === 'high' ? 'bg-red-500' :
                          priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <span className="capitalize">{priority}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Card Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value} // ✅ Key added
                      type="button"
                      onClick={() => handleColorSelect(color.value)}
                      className={`w-full aspect-square rounded-lg border-2 ${
                        taskFormData.color === color.value 
                          ? 'border-gray-800 ring-2 ring-offset-1 ring-indigo-500' 
                          : 'border-gray-300'
                      } ${color.bg} hover:opacity-80 transition-all`}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {colorOptions.find(c => c.value === taskFormData.color)?.name}
                </p>
              </div>
            </div>

            {/* Due Date & Assignees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={taskFormData.dueDate}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To *
                </label>
                <select
                  name="assignedTo"
                  value={taskFormData.assignedTo}
                  onChange={handleUserSelect}
                  multiple
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  size={3}
                >
                  {allUsers.map(user => (
                    <option key={user._id} value={user._id}> {/* ✅ Key added */}
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {taskFormData.assignedTo.length > 0 
                    ? `${taskFormData.assignedTo.length} user(s) selected`
                    : 'Hold Ctrl/Cmd to select multiple users'
                  }
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 text-red-700 bg-red-50 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;