// client/src/components/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { updateTask, deleteTask, addTask, updateTaskStatus } from '../redux/slices/taskSlice';
import TaskService from '../services/taskService';
import TaskDetailModal from './TaskDetailModal';

interface User {
  id: string;
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
  assignedTo: User[];
  assignedBy: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface KanbanBoardProps {
  userId?: string;
  projectId?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  userId, 
  projectId 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const reduxTasks = useSelector((state: RootState) => state.tasks.tasks);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Mock users for assignment (in real app, this would come from API)
  const availableUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'user' },
  ];

  useEffect(() => {
    // Filter tasks based on props
    let filtered = reduxTasks;
    
    if (projectId) {
      // Add project filtering logic if needed
      filtered = filtered.filter(() => {
        // For now, we don't have project info in tasks
        return true;
      });
    }
    
    if (userId) {
      filtered = filtered.filter(task => 
        task.assignedTo.some(assignedUser => assignedUser.id === userId)
      );
    }
    
    setTasks(filtered);
  }, [reduxTasks, userId, projectId]);

  useEffect(() => {
    const handleTaskUpdated = (task: Task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    };

    const handleTaskDeleted = (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    TaskService.setupTaskListeners(
      () => {}, // taskAssigned - handled by taskSlice
      handleTaskUpdated,
      handleTaskDeleted
    );

    return () => {
      TaskService.disconnect();
    };
  }, []);

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-200', headerColor: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-200', headerColor: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-200', headerColor: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-200', headerColor: 'bg-green-100' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  // Drag and drop handlers using native drag events
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (currentUser?.role !== 'admin') return;
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin' || !draggedTask) return;
    
    // ✅ Validate task ID before dispatching
    if (!draggedTask.id || draggedTask.id === 'undefined' || draggedTask.id === 'null') {
      console.error('Cannot update task status - invalid ID:', draggedTask.id);
      alert('Error: Cannot update task. Invalid task ID.');
      setDraggedTask(null);
      return;
    }
    
    // Update the task status via Redux using the dedicated status update thunk
    dispatch(updateTaskStatus({ 
      taskId: draggedTask.id, 
      newStatus: newStatus 
    }) as any);
    
    // Update local state immediately for better UX
    setTasks(prev => prev.map(task => 
      task.id === draggedTask.id ? { ...task, status: newStatus } : task
    ));
    
    setDraggedTask(null);
  };

  // User can toggle task completion (for non-admin users)
  const handleTaskToggle = (taskId: string, currentStatus: string) => {
    if (currentUser?.role === 'admin') return; // Admins use drag-drop
    
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    
    // ✅ Validate task ID before dispatching
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Cannot toggle task status - invalid ID:', taskId);
      alert('Error: Cannot update task. Invalid task ID.');
      return;
    }
    
    // Update the task status via Redux using the dedicated status update thunk
    dispatch(updateTaskStatus({ taskId, newStatus }) as any);
    
    // Update local state immediately for better UX
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Cannot delete task - invalid ID:', taskId);
      alert('Error: Cannot delete task. Invalid task ID.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    dispatch(deleteTask(taskId) as any);
    if (selectedTask?.id === taskId) {
      setShowTaskModal(false);
      setSelectedTask(null);
    }
  };

  // Add new task
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'assignedBy'>) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(), // In real app, this would be generated by backend
      assignedBy: currentUser!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    dispatch(addTask(newTask) as any);
    setShowAddTaskModal(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle task click
  const handleTaskClick = (task: Task) => {
    // ✅ Add validation
    if (!task.id || task.id === 'undefined' || task.id === 'null') {
      console.error('Cannot open task modal - invalid task ID:', task.id);
      alert('Error: Cannot open task. Invalid task ID.');
      return;
    }
    
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Enhanced card styling with better visibility
  const Card = ({ task }: { task: Task }) => {
    return (
      <div
        key={task.id}
        draggable={currentUser?.role === 'admin'}
        onDragStart={(e) => handleDragStart(e, task)}
        onClick={() => handleTaskClick(task)}
        className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-move hover:shadow-lg transition-all duration-200 ${
          draggedTask?.id === task.id ? 'opacity-70 transform scale-95' : ''
        } ${currentUser?.role === 'admin' ? 'cursor-move' : 'cursor-pointer'}`}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-gray-900 text-base">{task.title}</h4>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{task.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 text-xs font-medium">
                {task.assignedTo[0]?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <span className="ml-2 truncate max-w-[80px]">
              {task.assignedTo[0]?.name}
            </span>
          </div>
          
          <div className="text-right">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
          </div>
        </div>
        
        {currentUser?.role !== 'admin' && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTaskToggle(task.id, task.status);
              }}
              className={`w-full text-xs px-2 py-1 rounded ${
                task.status === 'done'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {task.status === 'done' ? 'Completed' : 'Mark Complete'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      {/* Header with Add Task Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-gray-50 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`px-4 py-3 rounded-t-lg ${column.headerColor} border-b border-gray-300`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded-full border border-gray-300">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>
            
            <div className="p-3 min-h-96">
              <div className="space-y-3">
                {getTasksByStatus(column.id).map(task => (
                  <Card key={task.id} task={task} />
                ))}
                
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mt-2 text-sm">No tasks in this column</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailModal 
          task={selectedTask}
          currentUser={currentUser}
          availableUsers={availableUsers}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onDelete={handleDeleteTask}
          onUpdate={(updatedTask) => {
            // ✅ Add validation before dispatching
            if (!selectedTask?.id || selectedTask.id === 'undefined' || selectedTask.id === 'null') {
              console.error('Cannot update task - invalid ID:', selectedTask?.id);
              alert('Error: Cannot update task. Invalid task ID.');
              return;
            }
            
            dispatch(updateTask({
              id: selectedTask.id,
              ...updatedTask
            }) as any);
          }}
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <AddTaskModal
          availableUsers={availableUsers}
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={handleAddTask}
        />
      )}
    </div>
  );
};

// Add Task Modal Component
interface AddTaskModalProps {
  availableUsers: User[];
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'assignedBy'>) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  availableUsers,
  onClose,
  onSubmit
}) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignedTo: [] as User[],
    dueDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    onSubmit(newTask);
  };

  const handleFieldChange = (field: string, value: any) => {
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Add New Task</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => handleFieldChange('priority', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee
                  </label>
                  <select
                    value={newTask.assignedTo[0]?.id || ''}
                    onChange={(e) => {
                      const user = availableUsers.find(u => u.id === e.target.value);
                      handleFieldChange('assignedTo', user ? [user] : []);
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select assignee</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KanbanBoard;