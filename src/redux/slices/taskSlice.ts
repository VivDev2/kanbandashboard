// client/src/redux/slices/taskSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Task } from '../../types';
import type { RootState } from '../../redux/store';
import { createSelector } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
     console.log('updateTask called with ID:', id); // 🔍 Debug log
    
     try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      // Validate ID before making request
      if (!id || id === 'undefined' || id === 'null') {
         console.error('Invalid task ID:', { id, type: typeof id });
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

// Memoized selectors
export const selectAllTasks = (state: RootState) => state.tasks.tasks;
export const selectAllUsers = (state: RootState) => state.tasks.allUsers;

export const selectUserTasks = createSelector(
  [selectAllTasks, (_, userId: string | undefined) => userId],
  (tasks, userId) => {
    if (!userId) return [];
    return tasks.filter(task => 
      task.assignedTo.some((assignee: any) => assignee.id === userId)
    );
  }
);

export const selectTasksByStatus = createSelector(
  [selectAllTasks, (_, status: string) => status],
  (tasks, status) => tasks.filter(task => task.status === status)
);

interface TaskState {
  tasks: Task[];
  allUsers: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  allUsers: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    // Renamed the reducer to avoid conflict
    updateTaskStatusReducer: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(task => task.id === taskId);
      if (task) {
        task.status = status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        // Update the task in the state with the response from the server
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
      });
  },
});

export const { addTask, updateTaskStatusReducer, clearError } = taskSlice.actions;
export default taskSlice.reducer;