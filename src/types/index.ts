// client/src/types/index.ts

export interface User {
  _id: string;           // Make this required
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive?: boolean;
  createdAt?: string;
  team?: {
    _id: string;
    name: string;
  };
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  project?: string;
  members: User[];
  createdAt: string;
}

export interface Leave {
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

export interface LeaveStats {
  monthly: Record<string, number>;
  yearly: Record<string, number>;
  total: number;
}

export interface Task {
  _id: string;                   // Required
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: User[];            // Keep as User[] everywhere
  assignedBy: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  users: User[];
  teams: Team[];
  leaves: Leave[];
  myLeaves: Leave[];
  leaveStats: Record<string, LeaveStats>;
  loading: boolean;
  usersLoading: boolean;
  teamsLoading: boolean;
  leavesLoading: boolean;
  error: string | null;
  usersError: string | null;
  teamsError: string | null;
  leavesError: string | null;
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
