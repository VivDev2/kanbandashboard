// Updated taskSlice with project creation functionality
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import type { Task } from '../../types';
import type { RootState } from '../../redux/store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const normalizeTask = (task: any): Task => ({
  ...task,
  id: task._id || task.id,
  // Ensure consistent date format
  dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
});

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch tasks');
      }

      const data = await response.json();
      return data.tasks;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Interface for creating a task (matches backend expectations)
interface CreateTaskData {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string[]; // User IDs, not User objects
  dueDate?: string;
  projectId?: string;
}

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskData, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create task');
      }

      const data = await response.json();
      return data.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...updateData }: { id: string } & Partial<Task>, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      // Validate ID before making request
      if (!id || id === 'undefined' || id === 'null') {
        return rejectWithValue('Task ID is required and must be valid');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update task');
      }

      const data = await response.json();
      return data.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// New thunk for updating task status
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, newStatus }: { taskId: string; newStatus: string }, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update task status');
      }

      const data = await response.json();
      return data.task;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      // Validate ID before making request
      if (!taskId || taskId === 'undefined' || taskId === 'null') {
        return rejectWithValue('Task ID is required and must be valid');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete task');
      }

      return taskId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  'tasks/fetchAllUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/tasks/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      return data.users;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// New thunk for fetching projects
export const fetchProjects = createAsyncThunk(
  'tasks/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch projects');
      }

      const data = await response.json();
      return data.projects;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// New thunk for creating a project
export const createProject = createAsyncThunk(
  'tasks/createProject',
  async (projectData: { name: string }, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create project');
      }

      const data = await response.json();
      return data.project;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error. Please try again.');
    }
  }
);

// Memoized selectors
export const selectAllTasks = (state: RootState) => state.tasks.tasks;
export const selectAllUsers = (state: RootState) => state.tasks.allUsers;
export const selectAllProjects = (state: RootState) => state.tasks.allProjects;

export const selectUserTasks = createSelector(
  [selectAllTasks, (_, userId: string | undefined) => userId],
  (tasks, userId) => {
    if (!userId) return [];
    return tasks.filter(task => 
      Array.isArray(task.assignedTo) && 
      task.assignedTo.some((assignee: any) => 
        assignee.id === userId || assignee._id === userId || assignee === userId
      )
    );
  }
);

export const selectTasksByStatus = createSelector(
  [selectAllTasks, (_, status: string) => status],
  (tasks, status) => tasks.filter(task => task.status === status)
);

export const selectTasksByPriority = createSelector(
  [selectAllTasks, (_, priority: string) => priority],
  (tasks, priority) => tasks.filter(task => task.priority === priority)
);

export const selectOverdueTasks = createSelector(
  [selectAllTasks],
  (tasks) => tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  )
);

interface TaskState {
  tasks: Task[];
  allUsers: any[];
  allProjects: any[]; // Updated type
  loading: boolean;
  error: string | null;
  projectInputOpen: boolean; // New state for project input
}

const initialState: TaskState = {
  tasks: [],
  allUsers: [],
  allProjects: [],
  loading: false,
  error: null,
  projectInputOpen: false, // New state
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.push(normalizeTask(action.payload));
    },
    // Renamed the reducer to avoid conflict
    updateTaskStatusReducer: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(task => task._id === taskId);
      if (task) {
        task.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTasks: (state) => {
      state.tasks = [];
      state.allProjects = [];
    },
    toggleProjectInput: (state) => {
      state.projectInputOpen = !state.projectInputOpen;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.map(normalizeTask);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(normalizeTask(action.payload));
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const normalizedTask = normalizeTask(action.payload);
        const index = state.tasks.findIndex(task => task._id === normalizedTask._id);
        if (index !== -1) {
          state.tasks[index] = normalizedTask;
        }
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const normalizedTask = normalizeTask(action.payload);
        const index = state.tasks.findIndex(task => task._id === normalizedTask._id);
        if (index !== -1) {
          state.tasks[index] = normalizedTask;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.allProjects = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.allProjects.push(action.payload);
        state.projectInputOpen = false; // Close input after creation
      });
  },
});

export const { 
  addTask, 
  updateTaskStatusReducer, 
  clearError, 
  resetTasks, 
  toggleProjectInput 
} = taskSlice.actions;
export default taskSlice.reducer;