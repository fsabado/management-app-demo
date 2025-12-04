export type TaskStatus = 'planned' | 'in progress' | 'completed' | 'cancelled';

// Base Project from API
export interface Project {
  id: number;
  name: string;
  tasks?: Task[];
}

// Extended Project with computed fields
export interface ProjectWithMetrics extends Project {
  taskCount: number;
  earliestStartDate: string | null;
  latestEndDate: string | null;
  durationDays: number | null;
}

// Project creation payload
export interface ProjectCreate {
  name: string;
}

// Project update payload
export interface ProjectUpdate {
  name?: string;
}

// Base Task from API
export interface Task {
  id: number;
  projectId: number;
  name: string;
  status: TaskStatus;
  parentTaskId: number | null;
  dependsOn: number[];
  startDate: string | null;
  dueDate: string | null;
}

// Task creation payload
export interface TaskCreate {
  name: string;
  status: TaskStatus;
  parentTaskId?: number | null;
  dependsOn?: number[];
  startDate?: string | null;
  dueDate?: string | null;
}

// Task update payload
export interface TaskUpdate {
  name?: string;
  status?: TaskStatus;
  parentTaskId?: number | null;
  dependsOn?: number[];
  startDate?: string | null;
  dueDate?: string | null;
}

// Task with enriched dependency information
export interface TaskWithDependencies extends Task {
  dependentTasks?: Task[]; // Tasks that depend on this task (downstream)
  prerequisiteTasks?: Task[]; // Tasks this task depends on (upstream)
  childTasks?: Task[]; // Subtasks (hierarchical)
}
