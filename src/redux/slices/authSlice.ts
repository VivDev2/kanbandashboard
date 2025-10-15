// client/src/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, isRejectedWithValue } from '@reduxjs/toolkit';
import type { AuthState, User } from "../../types";

// Add Leave interface
interface Leave {
  _id: string;
  user: User;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: User;
  createdAt: string;
  updatedAt: string;
}

// Add LeaveStats interface
interface LeaveStats {
  monthly: Record<string, number>;
  yearly: Record<string, number>;
  total: number;
}

// Update ExtendedAuthState to include leaves
interface ExtendedAuthState extends AuthState {
  leaves: Leave[];
  myLeaves: Leave[];
  leaveStats: Record<string, LeaveStats>;
  leavesLoading: boolean;
  leavesError: string | null;
}

// Load initial state from localStorage
const loadInitialState = (): ExtendedAuthState => {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken || null,
      users: [],
      teams: [],
      leaves: [],
      myLeaves: [],
      leaveStats: {},
      loading: false,
      usersLoading: false,
      teamsLoading: false,
      leavesLoading: false,
      error: null,
      usersError: null,
      teamsError: null,
      leavesError: null,
    };
  } catch (err) {
    return {
      user: null,
      token: null,
      users: [],
      teams: [],
      leaves: [],
      myLeaves: [],
      leaveStats: {},
      loading: false,
      usersLoading: false,
      teamsLoading: false,
      leavesLoading: false,
      error: null,
      usersError: null,
      teamsError: null,
      leavesError: null,
    };
  }
};

const initialState: ExtendedAuthState = loadInitialState();

// Use environment variable for API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth headers
const getAuthHeaders = (state: ExtendedAuthState) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${state.token}`
});

// Helper function to save auth state to localStorage
const saveAuthState = (user: User | null, token: string | null) => {
  if (user && token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

// Existing thunks remain the same
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Login failed');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// New async thunks for team management (existing)
export const fetchAllUsers = createAsyncThunk(
  'auth/fetchAllUsers',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      return data.data || data.users;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const fetchAllTeams = createAsyncThunk(
  'auth/fetchAllTeams',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'GET',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch teams');
      }

      const data = await response.json();
      return data.data || data.teams;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'auth/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'admin' | 'user' }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(state.auth),
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update user role');
      }

      const data = await response.json();
      return data.data || data.user;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'auth/updateUserStatus',
  async ({ userId, isActive }: { userId: string; isActive: boolean }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(state.auth),
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update user status');
      }

      const data = await response.json();
      return data.data || data.user;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const createTeam = createAsyncThunk(
  'auth/createTeam',
  async ({ name, description, project, members }: { name: string; description: string; project: string; members: string[] }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: getAuthHeaders(state.auth),
        body: JSON.stringify({ name, description, project, members }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create team');
      }

      const data = await response.json();
      return data.data || data.team;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'auth/deleteTeam',
  async (teamId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete team');
      }

      return teamId;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const addMemberToTeam = createAsyncThunk(
  'auth/addMemberToTeam',
  async ({ teamId, userId }: { teamId: string; userId: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: getAuthHeaders(state.auth),
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to add member to team');
      }

      const data = await response.json();
      return data.data || data.team;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const removeMemberFromTeam = createAsyncThunk(
  'auth/removeMemberFromTeam',
  async ({ teamId, userId }: { teamId: string; userId: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to remove member from team');
      }

      const data = await response.json();
      return data.data || data.team;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// New async thunks for leave management
export const requestLeave = createAsyncThunk(
  'auth/requestLeave',
  async ({ startDate, endDate, reason }: { startDate: string; endDate: string; reason: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/leaves`, {
        method: 'POST',
        headers: getAuthHeaders(state.auth),
        body: JSON.stringify({ startDate, endDate, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to request leave');
      }

      const data = await response.json();
      return data.data || data.leave;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const fetchMyLeaves = createAsyncThunk(
  'auth/fetchMyLeaves',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/leaves/my-requests`, {
        method: 'GET',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch leave requests');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const fetchAllLeaves = createAsyncThunk(
  'auth/fetchAllLeaves',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/leaves`, {
        method: 'GET',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch leave requests');
      }

      const data = await response.json();
      return data.data;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  'auth/updateLeaveStatus',
  async ({ leaveId, status }: { leaveId: string; status: 'approved' | 'rejected' }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const response = await fetch(`${API_BASE_URL}/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: getAuthHeaders(state.auth),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update leave status');
      }

      const data = await response.json();
      return data.data || data.leave;
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

export const fetchLeaveStats = createAsyncThunk(
  'auth/fetchLeaveStats',
  async (userId?: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { auth: ExtendedAuthState };
      const url = userId 
        ? `${API_BASE_URL}/api/leaves/stats/${userId}`
        : `${API_BASE_URL}/api/leaves/stats`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(state.auth),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch leave stats');
      }

      const data = await response.json();
      return { userId, stats: data.data };
    } catch (error: any) {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.users = [];
      state.teams = [];
      state.leaves = [];
      state.myLeaves = [];
      state.leaveStats = {};
      state.error = null;
      state.usersError = null;
      state.teamsError = null;
      state.leavesError = null;
      // Clear localStorage on logout
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      // Save to localStorage
      saveAuthState(action.payload, state.token);
    },
    clearError: (state) => {
      state.error = null;
      state.usersError = null;
      state.teamsError = null;
      state.leavesError = null;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // Save to localStorage
      saveAuthState(state.user, action.payload);
    },
    addUserToTeam: (state, action) => {
      const { userId, teamId, teamName } = action.payload;
      const user = state.users.find(u => u._id === userId);
      if (user) {
        user.team = { _id: teamId, name: teamName };
      }
    },
    removeUserFromTeam: (state, action) => {
      const userId = action.payload;
      const user = state.users.find(u => u._id === userId);
      if (user) {
        user.team = undefined;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Save to localStorage
        saveAuthState(action.payload.user, action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Save to localStorage
        saveAuthState(action.payload.user, action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch all users cases
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload as string;
      })
      
      // Fetch all teams cases
      .addCase(fetchAllTeams.pending, (state) => {
        state.teamsLoading = true;
        state.teamsError = null;
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.teamsLoading = false;
        state.teams = action.payload;
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.teamsLoading = false;
        state.teamsError = action.payload as string;
      })
      
      // Update user role cases
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      
      // Update user status cases
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload;
        const index = state.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
      })
      
      // Create team cases
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
      })
      
      // Delete team cases
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t._id !== action.payload);
      })
      
      // Add member to team cases
      .addCase(addMemberToTeam.fulfilled, (state, action) => {
        const updatedTeam = action.payload;
        const index = state.teams.findIndex(t => t._id === updatedTeam._id);
        if (index !== -1) {
          state.teams[index] = updatedTeam;
        }
      })
      
      // Remove member from team cases
      .addCase(removeMemberFromTeam.fulfilled, (state, action) => {
        const updatedTeam = action.payload;
        const index = state.teams.findIndex(t => t._id === updatedTeam._id);
        if (index !== -1) {
          state.teams[index] = updatedTeam;
        }
      })
      
      // Request leave cases
      .addCase(requestLeave.pending, (state) => {
        state.leavesLoading = true;
        state.leavesError = null;
      })
      .addCase(requestLeave.fulfilled, (state, action) => {
        state.leavesLoading = false;
        state.leaves.push(action.payload);
        state.myLeaves.push(action.payload);
      })
      .addCase(requestLeave.rejected, (state, action) => {
        state.leavesLoading = false;
        state.leavesError = action.payload as string;
      })
      
      // Fetch my leaves cases
      .addCase(fetchMyLeaves.pending, (state) => {
        state.leavesLoading = true;
        state.leavesError = null;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.leavesLoading = false;
        state.myLeaves = action.payload;
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.leavesLoading = false;
        state.leavesError = action.payload as string;
      })
      
      // Fetch all leaves cases
      .addCase(fetchAllLeaves.pending, (state) => {
        state.leavesLoading = true;
        state.leavesError = null;
      })
      .addCase(fetchAllLeaves.fulfilled, (state, action) => {
        state.leavesLoading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchAllLeaves.rejected, (state, action) => {
        state.leavesLoading = false;
        state.leavesError = action.payload as string;
      })
      
      // Update leave status cases
      .addCase(updateLeaveStatus.fulfilled, (state, action) => {
        const updatedLeave = action.payload;
        const index = state.leaves.findIndex(l => l._id === updatedLeave._id);
        if (index !== -1) {
          state.leaves[index] = updatedLeave;
        }
        
        // Also update in myLeaves if it exists there
        const myIndex = state.myLeaves.findIndex(l => l._id === updatedLeave._id);
        if (myIndex !== -1) {
          state.myLeaves[myIndex] = updatedLeave;
        }
      })
      
      // Fetch leave stats cases
      .addCase(fetchLeaveStats.fulfilled, (state, action) => {
        const { userId, stats } = action.payload;
        if (userId) {
          state.leaveStats[userId] = stats;
        } else {
          // This is for overall stats
          // We'll handle this differently if needed
        }
      });
  },
});

export const { logout, setUser, clearError, setToken, addUserToTeam, removeUserFromTeam } = authSlice.actions;
export default authSlice.reducer;