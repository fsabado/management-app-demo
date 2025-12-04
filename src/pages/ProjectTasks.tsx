import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Task, TaskWithDependencies } from '../types';
import { projectsApi } from '../services/api';
import {
  enrichTasksWithDependencies,
  getUpcomingTasks,
  buildTaskHierarchy,
} from '../utils/taskUtils';
import TaskList from '../components/TaskList';
import TaskDependencyView from '../components/TaskDependencyView';
import TimelineView from '../components/TimelineView';
import HierarchyView from '../components/HierarchyView';
import GanttChart from '../components/GanttChart';

type ViewMode = 'list' | 'dependencies' | 'timeline' | 'hierarchy' | 'gantt';

export default function ProjectTasks() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [enrichedTasks, setEnrichedTasks] = useState<TaskWithDependencies[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await projectsApi.getProjectTasks(parseInt(id));
        setTasks(data);
        const enriched = enrichTasksWithDependencies(data);
        setEnrichedTasks(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  const upcomingTasks = getUpcomingTasks(tasks);
  const rootTasks = buildTaskHierarchy(enrichedTasks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects
          </Link>
          <h1 className="text-4xl font-bold mb-2">Project Tasks</h1>
          <div className="flex items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>{tasks.length} Total Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>{upcomingTasks.length} Upcoming (2 weeks)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* View Mode Selector */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Next 2 Weeks
            </button>
            <button
              onClick={() => setViewMode('dependencies')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'dependencies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dependencies
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'hierarchy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'gantt'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gantt Chart
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'list' && (
          <TaskList
            tasks={enrichedTasks}
            onTaskSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
          />
        )}

        {viewMode === 'timeline' && <TimelineView tasks={upcomingTasks} />}

        {viewMode === 'dependencies' && (
          <TaskDependencyView
            tasks={enrichedTasks}
            selectedTaskId={selectedTaskId}
            onTaskSelect={setSelectedTaskId}
          />
        )}

        {viewMode === 'hierarchy' && <HierarchyView rootTasks={rootTasks} />}

        {viewMode === 'gantt' && <GanttChart tasks={tasks} />}

        {tasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No tasks found for this project</p>
          </div>
        )}
      </div>
    </div>
  );
}
