// client/src/types/index.ts
export interface Task {
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
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
    totalTasks: number;
  };
  tasks: Task[];
  allUsers: User[];
  loading: boolean;
  error: string | null;
}