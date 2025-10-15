// client/src/components/KanbanBoard.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { updateTask, deleteTask, addTask, updateTaskStatus } from '../redux/slices/taskSlice';
import TaskService from '../services/taskService';
import TaskDetailModal from './TaskDetailModal';
import CreateTaskModal from './CreateTaskModal';
import type { Task, User } from '../types'; // Import types

interface KanbanBoardProps {
  userId?: string;
  projectId?: string;
  selectedProject?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  userId, 
  projectId,
  selectedProject
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { tasks: reduxTasks, allUsers } = useSelector((state: RootState) => state.tasks);
  
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
    
    // Add project filtering if selectedProject is passed
    if (selectedProject && selectedProject !== 'all') {
      // In a real app, tasks would have a project property
      // For now, we'll just return all tasks
      // filtered = filtered.filter(task => task.projectId === selectedProject);
    }
    
    setTasks(filtered);
  }, [reduxTasks, userId, projectId, selectedProject]);

  useEffect(() => {
    const handleTaskUpdated = (updatedTask: Task) => {
      // Ensure the task matches the exact Task interface
      const normalizedTask: Task = {
        id: updatedTask.id || updatedTask._id || '',
        _id: updatedTask._id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status as 'todo' | 'in-progress' | 'review' | 'done',
        priority: updatedTask.priority as 'low' | 'medium' | 'high',
        assignedTo: updatedTask.assignedTo,
        assignedBy: updatedTask.assignedBy,
        dueDate: updatedTask.dueDate,
        createdAt: updatedTask.createdAt,
        updatedAt: updatedTask.updatedAt,
      };

      setTasks(prev => 
        prev.map(task => 
          (task.id === normalizedTask.id || task._id === normalizedTask._id) 
            ? normalizedTask 
            : task
        )
      );
    };

    const handleTaskDeleted = (taskId: string) => {
      setTasks(prev => 
        prev.filter(task => task.id !== taskId && task._id !== taskId)
      );
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

  const getTaskId = (task: Task) => task.id || task._id || '';

  // Drag and drop handlers using native drag events
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (currentUser?.role !== 'admin') return;
    e.dataTransfer.setData('text/plain', task.id || task._id || '');
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTask(task);
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Remove visual feedback
    const target = e.target as HTMLElement;
    target.classList.remove('opacity-50');
    setDraggedTask(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin' || !draggedTask) return;
    
    const taskId = draggedTask.id || draggedTask._id;
    
    // ✅ Validate task ID before dispatching
    if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
      console.error('Cannot update task status - invalid ID:', taskId);
      alert('Error: Cannot update task. Invalid task ID.');
      setDraggedTask(null);
      return;
    }
    
    // Update the task status via Redux using the dedicated status update thunk
    dispatch(updateTaskStatus({ 
      taskId: taskId, 
      newStatus: newStatus 
    }) as any);
    
    // Update local state immediately for better UX
    setTasks(prev => prev.map(task => {
      const currentTaskId = task.id || task._id;
      return currentTaskId === taskId ? { ...task, status: newStatus } : task;
    }));
    
    setDraggedTask(null);
  };

  // User can toggle task completion (for non-admin users)
  const handleTaskToggle = (taskId: string, currentStatus: string) => {
    if (currentUser?.role === 'admin') return; // Admins use drag-drop
    
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    
    // ✅ Validate task ID before dispatching
    if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
      console.error('Cannot toggle task status - invalid ID:', taskId);
      alert('Error: Cannot update task. Invalid task ID.');
      return;
    }
    
    // Update the task status via Redux using the dedicated status update thunk
    dispatch(updateTaskStatus({ taskId, newStatus }) as any);
    
    // Update local state immediately for better UX
    setTasks(prev => prev.map(task => {
      const currentTaskId = task.id || task._id;
      return currentTaskId === taskId ? { ...task, status: newStatus } as Task : task;
    }));
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
      console.error('Cannot delete task - invalid ID:', taskId);
      alert('Error: Cannot delete task. Invalid task ID.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    dispatch(deleteTask(taskId) as any);
    if (selectedTask?.id === taskId || selectedTask?._id === taskId) {
      setShowTaskModal(false);
      setSelectedTask(null);
    }
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
    const taskId = task.id || task._id;
    if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
      console.error('Cannot open task modal - invalid task ID:', taskId);
      alert('Error: Cannot open task. Invalid task ID.');
      return;
    }
    
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Enhanced card styling with better visibility
  const Card = ({ task }: { task: Task }) => {
    const taskId = task.id || task._id || '';
    
    return (
      <div
        key={taskId}
        draggable={currentUser?.role === 'admin'}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        onClick={() => handleTaskClick(task)}
        className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-move hover:shadow-lg transition-all duration-200 ${
          draggedTask?.id === task.id || draggedTask?._id === task._id ? 'opacity-70 transform scale-95' : ''
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
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user, index) => (
              <div 
                key={user.id} 
                className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center border border-white"
                title={user.name}
              >
                <span className="text-indigo-600 text-xs font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center border border-white text-xs">
                +{task.assignedTo.length - 3}
              </div>
            )}
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
                handleTaskToggle(taskId, task.status);
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
      {/* Add Task Button at the top */}
      {currentUser?.role === 'admin' && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Task
          </button>
        </div>
      )}

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
                  <Card key={task.id || task._id} task={task} />
                ))}
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
            const taskId = selectedTask.id || selectedTask._id;
            if (!taskId || taskId === 'undefined' || taskId === 'null' || taskId === '') {
              console.error('Cannot update task - invalid ID:', taskId);
              alert('Error: Cannot update task. Invalid task ID.');
              return;
            }
            
            dispatch(updateTask({
              id: taskId,
              ...updatedTask
            }) as any);
          }}
        />
      )}

      {/* Create Task Modal */}
      {showAddTaskModal && (
        <CreateTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onTaskCreated={() => setShowAddTaskModal(false)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;