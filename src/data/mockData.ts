// client/src/data/mockData.ts
export interface MockTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: {
    id: string;
    name: string;
    avatar: string;
  };
  projectId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockProject {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar: string;
}

export interface MockTeam {
  id: string;
  name: string;
  members: string[]; // user IDs
}

// Mock Users
export const mockUsers: MockUser[] = [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', avatar: 'AU' },
  { id: '2', name: 'John Doe', email: 'john@example.com', role: 'user', avatar: 'JD' },
  { id: '3', name: 'Jane Smith', email: 'jane@example.com', role: 'user', avatar: 'JS' },
  { id: '4', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', avatar: 'MJ' },
  { id: '5', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', avatar: 'SW' },
];

// Mock Projects
export const mockProjects: MockProject[] = [
  { id: 'proj1', name: 'Website Redesign', description: 'Complete redesign of company website', color: 'bg-blue-500' },
  { id: 'proj2', name: 'Mobile App', description: 'Native mobile application development', color: 'bg-green-500' },
  { id: 'proj3', name: 'API Integration', description: 'Third-party API integrations', color: 'bg-purple-500' },
  { id: 'proj4', name: 'Database Migration', description: 'Migrate to new database system', color: 'bg-red-500' },
];

// Mock Teams
export const mockTeams: MockTeam[] = [
  { id: 'team1', name: 'Frontend Team', members: ['2', '3'] },
  { id: 'team2', name: 'Backend Team', members: ['4', '5'] },
  { id: 'team3', name: 'Design Team', members: ['3'] },
];

// Mock Tasks
export const mockTasks: MockTask[] = [
  {
    id: 'task1',
    title: 'Design homepage mockup',
    description: 'Create wireframes and mockups for the new homepage design',
    status: 'todo',
    priority: 'high',
    assignee: { id: '3', name: 'Jane Smith', avatar: 'JS' },
    projectId: 'proj1',
    dueDate: '2024-01-15',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'task2',
    title: 'API endpoint development',
    description: 'Implement user authentication endpoints',
    status: 'in-progress',
    priority: 'medium',
    assignee: { id: '4', name: 'Mike Johnson', avatar: 'MJ' },
    projectId: 'proj2',
    dueDate: '2024-01-20',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-05',
  },
  {
    id: 'task3',
    title: 'Database schema design',
    description: 'Design database schema for new features',
    status: 'review',
    priority: 'high',
    assignee: { id: '5', name: 'Sarah Wilson', avatar: 'SW' },
    projectId: 'proj4',
    dueDate: '2024-01-10',
    createdAt: '2023-12-28',
    updatedAt: '2024-01-08',
  },
  {
    id: 'task4',
    title: 'Mobile app testing',
    description: 'Conduct thorough testing of mobile application',
    status: 'completed',
    priority: 'medium',
    assignee: { id: '2', name: 'John Doe', avatar: 'JD' },
    projectId: 'proj2',
    dueDate: '2024-01-05',
    createdAt: '2023-12-20',
    updatedAt: '2024-01-05',
  },
  {
    id: 'task5',
    title: 'User profile component',
    description: 'Build reusable user profile React component',
    status: 'todo',
    priority: 'low',
    assignee: { id: '3', name: 'Jane Smith', avatar: 'JS' },
    projectId: 'proj1',
    dueDate: '2024-01-25',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-03',
  },
  {
    id: 'task6',
    title: 'Payment gateway integration',
    description: 'Integrate Stripe payment processing',
    status: 'in-progress',
    priority: 'urgent',
    assignee: { id: '4', name: 'Mike Johnson', avatar: 'MJ' },
    projectId: 'proj3',
    dueDate: '2024-01-18',
    createdAt: '2024-01-04',
    updatedAt: '2024-01-06',
  },
];