import { useState } from 'react';
import type { TaskWithDependencies } from '../types';
import { formatDate, getStatusColor } from '../utils/taskUtils';

interface HierarchyViewProps {
  rootTasks: TaskWithDependencies[];
}

interface TaskNodeProps {
  task: TaskWithDependencies;
  level: number;
}

function TaskNode({ task, level }: TaskNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = task.childTasks && task.childTasks.length > 0;

  return (
    <div className="mb-2">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:border-blue-400 ${
          level === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
        }`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
          >
            {isExpanded ? (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        )}

        {!hasChildren && <div className="w-6" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-900 truncate">{task.name}</h3>
            <span
              className={`flex-shrink-0 px-2 py-1 rounded-full text-xs ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>
          </div>

          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            {task.startDate && (
              <span>Start: {formatDate(task.startDate)}</span>
            )}
            {task.dueDate && (
              <span>Due: {formatDate(task.dueDate)}</span>
            )}
            {task.dependsOn.length > 0 && (
              <span className="text-yellow-600">
                {task.dependsOn.length} prerequisite{task.dependsOn.length !== 1 ? 's' : ''}
              </span>
            )}
            {hasChildren && (
              <span className="text-blue-600">
                {task.childTasks!.length} subtask{task.childTasks!.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-sm text-gray-500">
          ID: {task.id}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2">
          {task.childTasks!.map((child) => (
            <TaskNode key={child.id} task={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HierarchyView({ rootTasks }: HierarchyViewProps) {
  const [expandAll, setExpandAll] = useState(true);

  // Count total tasks
  const countTasks = (tasks: TaskWithDependencies[]): number => {
    return tasks.reduce((count, task) => {
      return count + 1 + (task.childTasks ? countTasks(task.childTasks) : 0);
    }, 0);
  };

  const totalTasks = countTasks(rootTasks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Task Hierarchy
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {rootTasks.length} root task{rootTasks.length !== 1 ? 's' : ''} ({totalTasks}{' '}
              total including subtasks)
            </p>
          </div>
          <button
            onClick={() => setExpandAll(!expandAll)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-gray-600">Root Task</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
            <span className="text-gray-600">Subtask</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-gray-600">Click to collapse</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-600">Click to expand</span>
          </div>
        </div>
      </div>

      {/* Task Tree */}
      <div className="bg-white rounded-lg shadow p-6">
        {rootTasks.length > 0 ? (
          <div className="space-y-2">
            {rootTasks.map((task) => (
              <TaskNode key={task.id} task={task} level={0} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No root tasks found. All tasks may be subtasks of other tasks.
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This view shows the hierarchical parent-child relationships
          between tasks. Root tasks (shown with blue background) have no parent task.
          Click the arrow icons to expand or collapse subtasks.
        </p>
      </div>
    </div>
  );
}
