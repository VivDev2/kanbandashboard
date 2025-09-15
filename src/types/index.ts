// client/src/types/index.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface DashboardState {
  notifications: any[];
  requests: any[];
  stats: {
    totalUsers: number;
    pendingRequests: number;
    completedTasks: number;
  };
}