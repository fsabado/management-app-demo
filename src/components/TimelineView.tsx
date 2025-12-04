import type { Task } from '../types';
import { groupTasksByDate, formatDate, getStatusColor } from '../utils/taskUtils';

interface TimelineViewProps {
  tasks: Task[];
}

export default function TimelineView({ tasks }: TimelineViewProps) {
  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Array.from(groupedTasks.keys()).sort();

  // Get today and 2 weeks from now for context
  const today = new Date();
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(today.getDate() + 14);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Next 2 Weeks Timeline
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {formatDate(today.toISOString())} → {formatDate(twoWeeksFromNow.toISOString())}
        </p>
        <div className="text-sm text-gray-600">
          Showing {tasks.length} task(s) scheduled in the next 14 days
        </div>
      </div>

      {sortedDates.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const tasksForDate = groupedTasks.get(dateKey)!;
            const date = new Date(dateKey);
            const isToday = date.toDateString() === today.toDateString();
            const isPast = date < today && !isToday;

            return (
              <div key={dateKey} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className={`px-6 py-3 ${
                    isToday
                      ? 'bg-blue-600 text-white'
                      : isPast
                      ? 'bg-gray-300 text-gray-700'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {date.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      {isToday && <div className="text-sm">Today</div>}
                    </div>
                    <div className="text-sm font-medium">
                      {tasksForDate.length} task{tasksForDate.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {tasksForDate.map((task) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{task.name}</h3>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status}
                              </span>
                              {task.startDate && (
                                <span className="text-gray-600">
                                  Start: {formatDate(task.startDate)}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-gray-600">
                                  Due: {formatDate(task.dueDate)}
                                </span>
                              )}
                            </div>
                            {task.dependsOn.length > 0 && (
                              <div className="mt-2 text-xs text-gray-500">
                                Depends on {task.dependsOn.length} other task
                                {task.dependsOn.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No tasks scheduled in the next 2 weeks</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter((t) => t.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tasks.filter((t) => t.status === 'in progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {tasks.filter((t) => t.status === 'planned').length}
            </div>
            <div className="text-sm text-gray-600">Planned</div>
          </div>
        </div>
      </div>
    </div>
  );
}
