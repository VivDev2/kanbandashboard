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
  },
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
    builder.addCase(fetchDashboardData.fulfilled, (state, action) => {
      // Update dashboard with fetched data
    });
  },
});

export const { addNotification, removeNotification, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;