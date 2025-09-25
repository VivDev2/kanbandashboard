// client/src/components/KanbanBoard.tsx (Fixed drag-and-drop)
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

interface MockTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string;
  assigneeName: string;
  projectId: string;
  dueDate: string;
}

interface KanbanBoardProps {
  userId?: string;
  projectId?: string;
}

// Use useState to make tasks mutable
const KanbanBoard: React.FC<KanbanBoardProps> = ({ userId, projectId }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Mock tasks data - moved to state so we can update it
  const [tasks, setTasks] = useState<MockTask[]>([
    {
      id: '1',
      title: 'Design homepage mockup',
      description: 'Create wireframes and mockups for the new homepage design',
      status: 'todo',
      priority: 'high',
      assigneeId: 'user2',
      assigneeName: 'Jane Smith',
      projectId: 'proj1',
      dueDate: '2024-01-15',
    },
    {
      id: '2',
      title: 'API endpoint development',
      description: 'Implement user authentication endpoints',
      status: 'in-progress',
      priority: 'medium',
      assigneeId: 'user3',
      assigneeName: 'Mike Johnson',
      projectId: 'proj2',
      dueDate: '2024-01-20',
    },
    {
      id: '3',
      title: 'Database schema design',
      description: 'Design database schema for new features',
      status: 'review',
      priority: 'high',
      assigneeId: 'user4',
      assigneeName: 'Sarah Wilson',
      projectId: 'proj3',
      dueDate: '2024-01-10',
    },
    {
      id: '4',
      title: 'Mobile app testing',
      description: 'Conduct thorough testing of mobile application',
      status: 'completed',
      priority: 'medium',
      assigneeId: 'user2',
      assigneeName: 'Jane Smith',
      projectId: 'proj2',
      dueDate: '2024-01-05',
    },
    {
      id: '5',
      title: 'User profile component',
      description: 'Build reusable user profile React component',
      status: 'todo',
      priority: 'low',
      assigneeId: 'user3',
      assigneeName: 'Mike Johnson',
      projectId: 'proj1',
      dueDate: '2024-01-25',
    },
    {
      id: '6',
      title: 'Payment gateway integration',
      description: 'Integrate Stripe payment processing',
      status: 'in-progress',
      priority: 'urgent',
      assigneeId: 'user4',
      assigneeName: 'Sarah Wilson',
      projectId: 'proj4',
      dueDate: '2024-01-18',
    },
  ]);
  
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<MockTask | null>(null);

  // Filter tasks based on props
  const filteredTasks = tasks.filter(task => {
    // If projectId is specified, filter by project
    if (projectId && task.projectId !== projectId) return false;
    
    // If userId is specified, filter by user
    if (userId && task.assigneeId !== userId) return false;
    
    return true;
  });

  // Group tasks by status
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-200' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-200' },
    { id: 'review', title: 'Review', color: 'bg-yellow-200' },
    { id: 'completed', title: 'Completed', color: 'bg-green-200' },
  ];

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Drag and drop handlers (for admin functionality)
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (user?.role !== 'admin') return;
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (user?.role !== 'admin') return;
    
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      // Update the task status
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
            : task
        )
      );
      console.log(`Admin moved task ${taskId} to ${newStatus}`);
    }
    setDraggedTaskId(null);
  };

  // User can toggle task completion (for non-admin users)
  const handleTaskToggle = (taskId: string, currentStatus: string) => {
    if (user?.role === 'admin') return; // Admins use drag-drop
    
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    
    // Update the task status
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
          : task
      )
    );
    
    console.log(`User toggled task ${taskId} from ${currentStatus} to ${newStatus}`);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle task click
  const handleTaskClick = (task: MockTask) => {
    if (user?.role === 'admin') {
      setSelectedTask(task);
      setShowTaskModal(true);
    }
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-gray-50 rounded-lg"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={`px-4 py-3 rounded-t-lg ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <span className="bg-white bg-opacity-50 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>
            </div>
            
            <div className="p-3 min-h-96">
              <div className="space-y-3">
                {getTasksByStatus(column.id).map(task => (
                  <div
                    key={task.id}
                    draggable={user?.role === 'admin'}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => handleTaskClick(task)}
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-move hover:shadow-md transition-shadow ${
                      draggedTaskId === task.id ? 'opacity-50' : ''
                    } ${user?.role === 'admin' ? 'cursor-move' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 text-xs font-medium">
                            {task.assigneeName?.split(' ').map(n => n[0]).join('') || 'U'}
                          </span>
                        </div>
                        <span className="ml-2 text-xs text-gray-500 truncate max-w-[80px]">
                          {task.assigneeName}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                    
                    {user?.role !== 'admin' && (
                      <div className="mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskToggle(task.id, task.status);
                          }}
                          className={`w-full text-xs px-2 py-1 rounded ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          {task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Task Detail Modal (Admin only) */}
      {showTaskModal && selectedTask && user?.role === 'admin' && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

// Task Detail Modal Component
const TaskDetailModal: React.FC<{ 
  task: MockTask; 
  onClose: () => void 
}> = ({ task, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
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
        
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600 text-sm">{task.description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Assignee</h4>
                <div className="flex items-center mt-1">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 text-sm font-medium">
                      {task.assigneeName?.split(' ').map(n => n[0]).join('') || 'U'}
                    </span>
                  </div>
                  <span className="ml-2 text-sm text-gray-900">{task.assigneeName}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Due Date</h4>
                <p className="text-sm text-gray-600">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Priority</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
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
              Close
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;