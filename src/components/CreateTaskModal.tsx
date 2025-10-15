// Updated CreateTaskModal to handle empty projectId properly
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createTask, 
  fetchProjects, 
  createProject,
  toggleProjectInput as toggleProjectInputAction
} from '../redux/slices/taskSlice';
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { 
    allUsers = [], 
    allProjects = [],
    projectInputOpen 
  } = useSelector((state: RootState) => state.tasks);

  // Kanban columns
  const kanbanColumns = [
    { id: 'todo' as const, title: 'To Do', color: 'bg-gray-200' },
    { id: 'in-progress' as const, title: 'In Progress', color: 'bg-blue-200' },
    { id: 'review' as const, title: 'Review', color: 'bg-yellow-200' },
    { id: 'done' as const, title: 'Done', color: 'bg-green-200' },
  ];

  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch projects when modal opens
      dispatch(fetchProjects());
      setTaskFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: [],
        dueDate: '',
        status: 'todo',
        projectId: allProjects[0]?.id || '', // Only set if projects exist
      });
      setSelectedUsers([]);
      setError('');
    }
  }, [isOpen]); // Only depend on isOpen, not allProjects

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare task data for API - only include projectId if it has a value
      const taskData: any = {
        title: taskFormData.title,
        description: taskFormData.description,
        priority: taskFormData.priority,
        assignedTo: selectedUsers,
        dueDate: taskFormData.dueDate,
        status: taskFormData.status,
      };

      // Only add projectId if it's not empty
      if (taskFormData.projectId) {
        taskData.projectId = taskFormData.projectId;
      }

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

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusSelect = (status: TaskFormData['status']) => {
    setTaskFormData(prev => ({ ...prev, status }));
  };

  const handlePrioritySelect = (priority: TaskFormData['priority']) => {
    setTaskFormData(prev => ({ ...prev, priority }));
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    try {
      const result = await dispatch(createProject({ name: newProjectName }));
      if (createProject.fulfilled.match(result)) {
        setNewProjectName('');
        // The project will be added to the list automatically by the reducer
      } else {
        throw new Error(result.payload as string || 'Failed to create project');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    }
  };

  const toggleProjectInput = () => {
    dispatch(toggleProjectInputAction());
    setError('');
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
              aria-label="Close modal"
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
                <div className="flex gap-2">
                  <select
                    name="projectId"
                    value={taskFormData.projectId}
                    onChange={handleChange}
                    disabled={loading}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {allProjects.length > 0 ? (
                      <>
                        <option value="">Select a project</option>
                        {allProjects.map(project => (
                          <option key={project._id} value={project._id}>
                            {project.name}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option disabled>No projects available</option>
                    )}
                  </select>
                  
                  <button
                    type="button"
                    onClick={toggleProjectInput}
                    className="px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-300 rounded-md hover:bg-indigo-200 transition-colors"
                  >
                    {projectInputOpen ? 'Cancel' : '+'}
                  </button>
                </div>
                
                {projectInputOpen && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="New project name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateProject}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
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
                    key={column.id}
                    type="button"
                    onClick={() => handleStatusSelect(column.id)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      taskFormData.status === column.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    aria-pressed={taskFormData.status === column.id}
                  >
                    <div className={`w-full h-2 ${column.color} rounded mb-2`}></div>
                    <span className="text-sm">{column.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Priority
              </label>
              <div className="space-y-2">
                {(['low', 'medium', 'high'] as const).map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handlePrioritySelect(priority)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      taskFormData.priority === priority
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    aria-pressed={taskFormData.priority === priority}
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

            {/* Assign Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Assign To
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto">
                {allUsers.length > 0 ? (
                  allUsers.map((user: any) => (
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
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No users available</p>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {selectedUsers.length > 0 
                  ? `${selectedUsers.length} user(s) selected`
                  : 'Click on users to assign'}
              </div>
            </div>

            {/* Due Date */}
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