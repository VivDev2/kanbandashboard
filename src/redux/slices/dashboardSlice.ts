// client/src/redux/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardState } from '../../types';

const initialState: DashboardState = {
  notifications: [],
  requests: [],
  stats: {
    totalUsers: 0,
    pendingRequests: 0,
    completedTasks: 0,
    totalTasks: 0,
  },
  tasks: [],
  allUsers: [],
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async (_, { getState }) => {
    const { auth } = getState() as any;
    const response = await fetch('/api/dashboard', {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return response.json();
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (_, index) => index !== action.payload
      );
    },
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state) => {
        state.loading = false;
        // Update dashboard with fetched data
        // state.notifications = action.payload.notifications;
        // state.requests = action.payload.requests;
        // state.stats = action.payload.stats;
        // state.tasks = action.payload.tasks;
        // state.allUsers = action.payload.allUsers;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export const { addNotification, removeNotification, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;