import { useMemo } from 'react';
import type { Task } from '../types';
import { Badge } from './ui/badge';

interface GanttChartProps {
  tasks: Task[];
}

export default function GanttChart({ tasks }: GanttChartProps) {
  // Calculate date range for the chart
  const { startDate, endDate, totalDays, tasksWithPositions } = useMemo(() => {
    // Filter tasks that have both start and due dates
    const validTasks = tasks.filter(t => t.startDate && t.dueDate);

    if (validTasks.length === 0) {
      return { startDate: null, endDate: null, totalDays: 0, tasksWithPositions: [] };
    }

    // Find earliest start and latest end
    const dates = validTasks.map(t => ({
      start: new Date(t.startDate!),
      end: new Date(t.dueDate!),
    }));

    const minDate = new Date(Math.min(...dates.map(d => d.start.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.end.getTime())));

    // Add padding to the date range
    const paddingDays = 2;
    minDate.setDate(minDate.getDate() - paddingDays);
    maxDate.setDate(maxDate.getDate() + paddingDays);

    const totalMs = maxDate.getTime() - minDate.getTime();
    const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));

    // Calculate position and width for each task
    const tasksWithPositions = validTasks.map(task => {
      const taskStart = new Date(task.startDate!);
      const taskEnd = new Date(task.dueDate!);

      const startOffset = taskStart.getTime() - minDate.getTime();
      const taskDuration = taskEnd.getTime() - taskStart.getTime();

      const leftPercent = (startOffset / totalMs) * 100;
      const widthPercent = (taskDuration / totalMs) * 100;

      return {
        task,
        leftPercent,
        widthPercent,
      };
    });

    return {
      startDate: minDate,
      endDate: maxDate,
      totalDays,
      tasksWithPositions,
    };
  }, [tasks]);

  // Generate date markers for the timeline
  const dateMarkers = useMemo(() => {
    if (!startDate || !endDate || totalDays === 0) return [];

    const markers: { date: Date; label: string; position: number }[] = [];
    const markerInterval = Math.max(1, Math.floor(totalDays / 10)); // Show ~10 markers

    let currentDate = new Date(startDate);
    const totalMs = endDate.getTime() - startDate.getTime();

    while (currentDate <= endDate) {
      const offset = currentDate.getTime() - startDate.getTime();
      const position = (offset / totalMs) * 100;

      markers.push({
        date: new Date(currentDate),
        label: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        position,
      });

      currentDate.setDate(currentDate.getDate() + markerInterval);
    }

    return markers;
  }, [startDate, endDate, totalDays]);

  if (tasksWithPositions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">
          No tasks with start and due dates available for Gantt chart
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-xl p-8 border-2 border-blue-100">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gantt Chart</h2>
            <p className="text-sm text-gray-600 mt-1">
              Timeline: <span className="font-semibold text-blue-600">{startDate?.toLocaleDateString()}</span> →{' '}
              <span className="font-semibold text-purple-600">{endDate?.toLocaleDateString()}</span> ({totalDays} days)
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap gap-3 p-4 bg-white/80 backdrop-blur rounded-xl shadow-sm">
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 bg-green-50 border-green-200">
          <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-green-700">Completed</span>
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-blue-200">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-blue-700">In Progress</span>
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-gray-200">
          <div className="w-4 h-4 bg-gradient-to-br from-gray-300 to-gray-500 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-gray-700">Planned</span>
        </Badge>
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 bg-red-50 border-red-200">
          <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-red-700">Cancelled</span>
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: '800px' }}>
          {/* Timeline header */}
          <div className="relative h-12 border-b-2 border-gray-300 mb-4">
            {dateMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="absolute top-0 flex flex-col items-center"
                style={{ left: `${marker.position}%` }}
              >
                <div className="h-3 w-px bg-gray-300"></div>
                <span className="text-xs text-gray-600 mt-1">{marker.label}</span>
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {tasksWithPositions.map(({ task, leftPercent, widthPercent }) => (
              <div key={task.id} className="relative h-12 group">
                {/* Task name on the left */}
                <div className="absolute left-0 top-0 bottom-0 w-48 pr-4 flex items-center">
                  <span className="text-sm text-gray-900 truncate" title={task.name}>
                    {task.name}
                  </span>
                </div>

                {/* Timeline area */}
                <div className="ml-48 relative h-full">
                  {/* Grid lines */}
                  {dateMarkers.map((marker, idx) => (
                    <div
                      key={idx}
                      className="absolute top-0 bottom-0 w-px bg-gray-100"
                      style={{ left: `${marker.position}%` }}
                    ></div>
                  ))}

                  {/* Task bar */}
                  <div
                    className="group/bar absolute top-1/2 -translate-y-1/2 h-10 rounded-lg shadow-lg cursor-pointer transition-all hover:shadow-2xl hover:scale-105 hover:z-10 overflow-hidden"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${Math.max(widthPercent, 1)}%`,
                      background: getTaskColor(task.status),
                    }}
                    title={`${task.name}\n${task.startDate} → ${task.dueDate}\nStatus: ${task.status}`}
                  >
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>

                    {/* Dependency indicators */}
                    {task.dependsOn.length > 0 && (
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white z-10 animate-pulse">
                        {task.dependsOn.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task count summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {tasksWithPositions.length} of {tasks.length} tasks (tasks with dates only)
        </p>
      </div>
    </div>
  );
}

function getTaskColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // green gradient
    case 'in progress':
      return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'; // blue gradient
    case 'planned':
      return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'; // gray gradient
    case 'cancelled':
      return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'; // red gradient
    default:
      return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'; // default gray
  }
}
