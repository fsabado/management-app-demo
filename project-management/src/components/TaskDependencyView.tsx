import type { TaskWithDependencies } from '../types';
import { formatDate, getStatusColor, findDependentTasks, findPrerequisitePath } from '../utils/taskUtils';

interface TaskDependencyViewProps {
  tasks: TaskWithDependencies[];
  selectedTaskId: number | null;
  onTaskSelect: (taskId: number) => void;
}

export default function TaskDependencyView({
  tasks,
  selectedTaskId,
  onTaskSelect,
}: TaskDependencyViewProps) {
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Task Selector */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Task</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => onTaskSelect(task.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTaskId === task.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{task.name}</div>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dependency Details */}
      <div className="lg:col-span-2">
        {selectedTask ? (
          <div className="space-y-6">
            {/* Selected Task Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedTask.name}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(
                      selectedTask.status
                    )}`}
                  >
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Start:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDate(selectedTask.startDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Due:</span>
                  <span className="ml-2 text-gray-900">
                    {formatDate(selectedTask.dueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Task ID:</span>
                  <span className="ml-2 text-gray-900">#{selectedTask.id}</span>
                </div>
              </div>
            </div>

            {/* Prerequisite Tasks (What this task depends on) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prerequisites (Upstream)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tasks that must be completed before this task can start
              </p>
              {selectedTask.prerequisiteTasks && selectedTask.prerequisiteTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedTask.prerequisiteTasks.map((prereq) => (
                    <div
                      key={prereq.id}
                      onClick={() => onTaskSelect(prereq.id)}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{prereq.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(prereq.startDate)} → {formatDate(prereq.dueDate)}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            prereq.status
                          )}`}
                        >
                          {prereq.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No prerequisite tasks</p>
              )}
            </div>

            {/* Dependent Tasks (What depends on this task) */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dependent Tasks (Downstream)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tasks that will be delayed if this task is delayed
              </p>
              {selectedTask.dependentTasks && selectedTask.dependentTasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedTask.dependentTasks.map((dependent) => (
                    <div
                      key={dependent.id}
                      onClick={() => onTaskSelect(dependent.id)}
                      className="p-3 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{dependent.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(dependent.startDate)} → {formatDate(dependent.dueDate)}
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            dependent.status
                          )}`}
                        >
                          {dependent.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No dependent tasks</p>
              )}
            </div>

            {/* Critical Path */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Critical Path to This Task
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                All tasks that lead up to this task (including prerequisites and parent tasks)
              </p>
              {(() => {
                const path = findPrerequisitePath(selectedTask.id, tasks);
                return path.length > 1 ? (
                  <div className="space-y-2">
                    {path.map((task, index) => (
                      <div key={task.id} className="flex items-center">
                        <div className="flex-shrink-0 w-8 text-center text-sm text-gray-500">
                          {index + 1}
                        </div>
                        <div
                          onClick={() => onTaskSelect(task.id)}
                          className={`flex-1 p-3 rounded-lg cursor-pointer transition-colors ${
                            task.id === selectedTask.id
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{task.name}</div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">This is a root task with no prerequisites</p>
                );
              })()}
            </div>

            {/* Impact Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Impact Analysis
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If this task is delayed, the following tasks will be affected
              </p>
              {(() => {
                const impactedTasks = findDependentTasks(selectedTask.id, tasks);
                return impactedTasks.length > 0 ? (
                  <div>
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-sm font-medium text-red-900">
                        ⚠️ {impactedTasks.length} task(s) will be impacted
                      </div>
                    </div>
                    <div className="space-y-2">
                      {impactedTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => onTaskSelect(task.id)}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{task.name}</div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No other tasks will be directly impacted
                  </p>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">Select a task to view its dependencies</p>
          </div>
        )}
      </div>
    </div>
  );
}
