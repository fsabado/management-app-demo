import type {
  Project,
  ProjectCreate,
  ProjectUpdate,
  Task,
  TaskCreate,
  TaskUpdate,
} from '../types';

// In development, use Vite proxy (/api) to avoid CORS issues
// In production, use the full API URL from environment variable
const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || 'https://897d77d8e056.ngrok-free.app');

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Required for ngrok to work in browser
        ...options?.headers,
      },
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `API Error: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

export const projectsApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    return fetchApi<Project[]>('/projects');
  },

  // Get a single project by ID
  getProject: async (id: number): Promise<Project> => {
    return fetchApi<Project>(`/projects/${id}`);
  },

  // Create a new project
  createProject: async (data: ProjectCreate): Promise<Project> => {
    return fetchApi<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a project
  updateProject: async (id: number, data: ProjectUpdate): Promise<Project> => {
    return fetchApi<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a project (only if it has no tasks)
  deleteProject: async (id: number): Promise<void> => {
    return fetchApi<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  // Get all tasks for a project
  getProjectTasks: async (projectId: number): Promise<Task[]> => {
    return fetchApi<Task[]>(`/projects/${projectId}/tasks`);
  },
};

export const tasksApi = {
  // Get a single task by ID
  getTask: async (projectId: number, taskId: number): Promise<Task> => {
    return fetchApi<Task>(`/projects/${projectId}/tasks/${taskId}`);
  },

  // Create a new task
  createTask: async (projectId: number, data: TaskCreate): Promise<Task> => {
    return fetchApi<Task>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a task
  updateTask: async (
    projectId: number,
    taskId: number,
    data: TaskUpdate
  ): Promise<Task> => {
    return fetchApi<Task>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a task (only if no other tasks depend on it)
  deleteTask: async (projectId: number, taskId: number): Promise<void> => {
    return fetchApi<void>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },
};
