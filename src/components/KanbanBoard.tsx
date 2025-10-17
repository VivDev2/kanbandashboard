// client/src/components/KanbanBoard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { updateTask, deleteTask, updateTaskStatus } from '../redux/slices/taskSlice';
import TaskService from '../services/taskService';
import TaskDetailModal from './TaskDetailModal';
import CreateTaskModal from './CreateTaskModal';
import type { Task } from '../types';

interface KanbanBoardProps {
  userId?: string;
  projectId?: string;
  selectedProject?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: currentUser, users: availableUsers } = useSelector((state: RootState) => state.auth);
  const { tasks: reduxTasks } = useSelector((state: RootState) => state.tasks);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // useRef to hold the dragged task to avoid re-renders while dragging
  const draggedTaskRef = useRef<Task | null>(null);

  // Columns definition
  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-200', headerColor: 'bg-gray-100' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-200', headerColor: 'bg-blue-100' },
    { id: 'review', title: 'Review', color: 'bg-yellow-200', headerColor: 'bg-yellow-100' },
    { id: 'done', title: 'Done', color: 'bg-green-200', headerColor: 'bg-green-100' },
  ] as const;

  // Filter tasks based on props (and update when redux tasks change)
  useEffect(() => {
    let filtered = reduxTasks ?? [];

    if (userId) {
      filtered = filtered.filter(task =>
        Array.isArray(task.assignedTo) &&
        task.assignedTo.some((assignedUser: any) => {
          // assignedUser might be a string (id) or object
          const id = typeof assignedUser === 'string' ? assignedUser : assignedUser?._id;
          return id === userId;
        })
      );
    }

    setTasks(filtered);
  }, [reduxTasks, userId]);

  // Setup TaskService listeners (keeps tasks in sync if using websockets)
  useEffect(() => {
    const handleTaskUpdated = (updatedTask: Task) => {
      setTasks(prev => prev.map(t => (t._id === updatedTask._id ? updatedTask : t)));
    };

    const handleTaskDeleted = (taskId: string) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    };

    TaskService.setupTaskListeners(() => {}, handleTaskUpdated, handleTaskDeleted);
    return () => TaskService.disconnect();
  }, []);

  const getTasksByStatus = (status: string) => tasks.filter(task => task.status === status);

  // ---------- Drag & Drop handlers (optimized) ----------
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    // Only admin can start drag
    if (!currentUser || String(currentUser.role).toLowerCase() !== 'admin') {
      e.preventDefault();
      return;
    }

    e.stopPropagation();
    draggedTaskRef.current = task;

    // set drag data (some browsers require setData to allow drop)
    try {
      e.dataTransfer.setData('text/plain', task._id);
    } catch {
      /* ignore if browser disallows */
    }
    e.dataTransfer.effectAllowed = 'move';

    // visual hint on the dragged element
    const el = e.currentTarget as HTMLElement;
    el.classList.add('opacity-70', 'scale-95');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('opacity-70', 'scale-95');
    draggedTaskRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    // allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const el = e.currentTarget as HTMLElement;
    el.classList.add('ring-2', 'ring-indigo-500', 'ring-opacity-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.classList.remove('ring-2', 'ring-indigo-500', 'ring-opacity-50');

    const dragged = draggedTaskRef.current;
    if (!dragged || !currentUser || String(currentUser.role).toLowerCase() !== 'admin') return;

    if (dragged.status === newStatus) {
      draggedTaskRef.current = null;
      return;
    }

    // Dispatch the update
    dispatch(updateTaskStatus({ taskId: dragged._id, newStatus }));
    // Update local state for instant UI feedback
    setTasks(prev => prev.map(t => (t._id === dragged._id ? { ...t, status: newStatus } : t)));

    draggedTaskRef.current = null;
  };
  // ------------------------------------------------------

  // Click to open modal (non-conflicting because drag happens from handle)
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Toggle complete for non-admins
  const handleTaskToggle = (task: Task) => {
    if (currentUser?.role === 'admin') return;
    const newStatus: Task['status'] = task.status === 'done' ? 'todo' : 'done';

    dispatch(updateTaskStatus({ taskId: task._id, newStatus }));
    setTasks(prev => prev.map(t => (t._id === task._id ? { ...t, status: newStatus } : t)));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    dispatch(deleteTask(taskId));
    if (selectedTask?._id === taskId) {
      setShowTaskModal(false);
      setSelectedTask(null);
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Card component (drag handle only for admins)
  const Card: React.FC<{ task: Task }> = ({ task }) => {
    // Normalize assignedTo for UI (may be id strings or user objects)
    const assignedUsers = Array.isArray(task.assignedTo)
      ? task.assignedTo.map((u: any) => (typeof u === 'string' ? availableUsers.find(user => user._id === u) : u)).filter(Boolean)
      : [];

    const isAdmin = String(currentUser?.role).toLowerCase() === 'admin';

    return (
      <div
        key={task._id}
        onClick={() => handleTaskClick(task)}
        className={`bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 ${
          isAdmin ? 'cursor-pointer' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h4 className="font-semibold text-gray-900 text-base">{task.title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>

          {/* Drag handle for admins only */}
          {isAdmin && (
            <div
              draggable
              onDragStart={e => handleDragStart(e, task)}
              onDragEnd={handleDragEnd}
              onMouseDown={e => e.stopPropagation()} // prevent opening modal when user clicks handle
              title="Drag task"
              className="ml-2 p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 15h8" />
              </svg>
            </div>
          )}
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{task.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex -space-x-2">
            {assignedUsers.slice(0, 3).map((user: any) => (
              <div
                key={user?._id ?? Math.random()}
                className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center border border-white"
                title={user?.name}
              >
                <span className="text-indigo-600 text-xs font-medium">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : '?'}
                </span>
              </div>
            ))}

            {assignedUsers.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center border border-white text-xs">
                +{assignedUsers.length - 3}
              </div>
            )}
          </div>

          <div className="text-right">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</div>
        </div>

        {currentUser?.role !== 'admin' && (
          <div className="mt-3">
            <button
              onClick={e => {
                e.stopPropagation();
                handleTaskToggle(task);
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
            className="bg-gray-50 rounded-lg transition-all duration-200"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, column.id as Task['status'])}
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
                  <Card
                    key={task._id}
                    task={{
                      ...task,
                      // Normalize assignedTo for rendering: map ids to user objects if possible
                      assignedTo: Array.isArray(task.assignedTo)
                        ? task.assignedTo.map((u: any) => (typeof u === 'string' ? availableUsers.find(user => user._id === u) : u))
                        : [],
                      assignedBy: task.assignedBy,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailModal
          task={{
            ...selectedTask,
            id: selectedTask._id,
            assignedTo: Array.isArray(selectedTask.assignedTo)
              ? selectedTask.assignedTo.map((u: any) => (typeof u === 'string' ? u : u._id))
              : [],
            assignedBy: typeof selectedTask.assignedBy === 'string' ? selectedTask.assignedBy : selectedTask.assignedBy?._id,
          }}
          currentUser={currentUser!}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onDelete={handleDeleteTask}
          onUpdate={updatedTask => {
            if (!selectedTask) return;
            dispatch(
              updateTask({
                _id: selectedTask._id,
                id: selectedTask._id,
                ...updatedTask,
                assignedTo: (updatedTask.assignedTo ?? []).map((id: string) => availableUsers.find(u => u._id === id)!),
                assignedBy: selectedTask.assignedBy,
              })
            );
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
