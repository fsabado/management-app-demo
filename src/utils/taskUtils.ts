import type { Task, TaskWithDependencies, Project, ProjectWithMetrics } from '../types';

/**
 * Compute project metrics from tasks
 */
export function computeProjectMetrics(project: Project, tasks: Task[]): ProjectWithMetrics {
  const taskCount = tasks.length;

  if (taskCount === 0) {
    return {
      ...project,
      taskCount: 0,
      earliestStartDate: null,
      latestEndDate: null,
      durationDays: null,
    };
  }

  // Find earliest start date
  const startDates = tasks
    .map(t => t.startDate)
    .filter((date): date is string => date !== null);
  const earliestStartDate = startDates.length > 0
    ? startDates.reduce((min, date) => (date < min ? date : min))
    : null;

  // Find latest end date
  const endDates = tasks
    .map(t => t.dueDate)
    .filter((date): date is string => date !== null);
  const latestEndDate = endDates.length > 0
    ? endDates.reduce((max, date) => (date > max ? date : max))
    : null;

  // Calculate duration in days
  let durationDays: number | null = null;
  if (earliestStartDate && latestEndDate) {
    const start = new Date(earliestStartDate);
    const end = new Date(latestEndDate);
    durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  return {
    ...project,
    taskCount,
    earliestStartDate,
    latestEndDate,
    durationDays,
  };
}

/**
 * Build a task dependency graph and enrich tasks with dependency information
 */
export function enrichTasksWithDependencies(tasks: Task[]): TaskWithDependencies[] {
  const taskMap = new Map<number, TaskWithDependencies>();

  // Initialize all tasks in the map
  tasks.forEach(task => {
    taskMap.set(task.id, {
      ...task,
      dependentTasks: [],
      prerequisiteTasks: [],
      childTasks: [],
    });
  });

  // Build relationships
  tasks.forEach(task => {
    const enrichedTask = taskMap.get(task.id)!;

    // Add prerequisite tasks (tasks this task depends on)
    task.dependsOn.forEach(depId => {
      const prerequisite = taskMap.get(depId);
      if (prerequisite) {
        enrichedTask.prerequisiteTasks!.push(prerequisite);
        // Add this task as dependent of the prerequisite
        prerequisite.dependentTasks!.push(enrichedTask);
      }
    });

    // Add child tasks (hierarchical relationship)
    if (task.parentTaskId) {
      const parent = taskMap.get(task.parentTaskId);
      if (parent) {
        parent.childTasks!.push(enrichedTask);
      }
    }
  });

  return Array.from(taskMap.values());
}

/**
 * Find all tasks that lead to a target task (critical path to task)
 */
export function findPrerequisitePath(
  taskId: number,
  tasks: TaskWithDependencies[]
): TaskWithDependencies[] {
  const visited = new Set<number>();
  const path: TaskWithDependencies[] = [];

  function traverse(currentId: number) {
    if (visited.has(currentId)) return;
    visited.add(currentId);

    const task = tasks.find(t => t.id === currentId);
    if (!task) return;

    path.push(task);

    // Traverse prerequisites
    task.prerequisiteTasks?.forEach(prereq => traverse(prereq.id));

    // Traverse parent task
    if (task.parentTaskId) {
      traverse(task.parentTaskId);
    }
  }

  traverse(taskId);
  return path;
}

/**
 * Find all tasks that depend on a target task (downstream impact)
 */
export function findDependentTasks(
  taskId: number,
  tasks: TaskWithDependencies[]
): TaskWithDependencies[] {
  const visited = new Set<number>();
  const dependents: TaskWithDependencies[] = [];

  function traverse(currentId: number) {
    const task = tasks.find(t => t.id === currentId);
    if (!task || visited.has(currentId)) return;
    visited.add(currentId);

    // Add dependent tasks
    task.dependentTasks?.forEach(dependent => {
      dependents.push(dependent);
      traverse(dependent.id);
    });

    // Add child tasks
    task.childTasks?.forEach(child => {
      dependents.push(child);
      traverse(child.id);
    });
  }

  traverse(taskId);
  return dependents;
}

/**
 * Filter tasks by date range
 */
export function filterTasksByDateRange(
  tasks: Task[],
  startDate: Date,
  endDate: Date
): Task[] {
  return tasks.filter(task => {
    if (!task.startDate && !task.dueDate) return false;

    const taskStart = task.startDate ? new Date(task.startDate) : null;
    const taskEnd = task.dueDate ? new Date(task.dueDate) : null;

    // Include task if it overlaps with the date range
    if (taskStart && taskStart >= startDate && taskStart <= endDate) return true;
    if (taskEnd && taskEnd >= startDate && taskEnd <= endDate) return true;
    if (taskStart && taskEnd && taskStart <= startDate && taskEnd >= endDate) return true;

    return false;
  });
}

/**
 * Get tasks for the next N days
 */
export function getUpcomingTasks(tasks: Task[], days: number = 14): Task[] {
  const now = new Date();
  const endDate = new Date();
  endDate.setDate(now.getDate() + days);

  return filterTasksByDateRange(tasks, now, endDate);
}

/**
 * Group tasks by date
 */
export function groupTasksByDate(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>();

  tasks.forEach(task => {
    const date = task.startDate || task.dueDate;
    if (!date) return;

    const dateKey = new Date(date).toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(task);
  });

  return grouped;
}

/**
 * Build hierarchical task tree
 */
export function buildTaskHierarchy(tasks: TaskWithDependencies[]): TaskWithDependencies[] {
  return tasks.filter(task => !task.parentTaskId);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'No date';

  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'planned':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
