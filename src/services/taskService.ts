// client/src/services/taskService.ts
import axios from 'axios';
import socketService from './socketService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class TaskService {
  private static instance: TaskService;

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async getTasks() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  }

  async getAllUsers() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/api/tasks/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  }

  async updateTask(taskData: any) {
    const token = localStorage.getItem('token');
    const taskId = taskData._id || taskData.id;
    
    // ✅ Enhanced validation
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Invalid task ID:', taskId);
      throw new Error("Task ID is missing or invalid");
    }

    const response = await axios.put(
      `${API_BASE_URL}/api/tasks/${taskId}`,
      taskData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async deleteTask(taskId: string) {
    const token = localStorage.getItem('token');
    
    // ✅ Add validation for deleteTask as well
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Invalid task ID for deletion:', taskId);
      throw new Error("Task ID is missing or invalid");
    }

    const response = await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  }

  async createTask(taskData: any) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/api/tasks`,
      taskData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  async updateTaskStatus(taskId: string, newStatus: string) {
    const token = localStorage.getItem('token');
    
    // ✅ Add validation for updateTaskStatus as well
    if (!taskId || taskId === 'undefined' || taskId === 'null') {
      console.error('Invalid task ID for status update:', taskId);
      throw new Error("Task ID is missing or invalid");
    }

    const response = await axios.patch(
      `${API_BASE_URL}/api/tasks/${taskId}/status`,
      { status: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }

  setupTaskListeners(
    onTaskAssigned: (task: any) => void,
    onTaskUpdated: (task: any) => void,
    onTaskDeleted: (taskId: string) => void
  ) {
    socketService.on('taskAssigned', onTaskAssigned);
    socketService.on('taskUpdated', onTaskUpdated);
    socketService.on('taskDeleted', (data: { taskId: string }) => {
      onTaskDeleted(data.taskId);
    });
  }

  disconnect() {
    socketService.off('taskAssigned');
    socketService.off('taskUpdated');
    socketService.off('taskDeleted');
  }
}

export default TaskService.getInstance();