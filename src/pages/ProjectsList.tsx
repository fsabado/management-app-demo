import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectWithMetrics } from '../types';
import { projectsApi } from '../services/api';
import { formatDate, computeProjectMetrics } from '../utils/taskUtils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function ProjectsList() {
  const [projects, setProjects] = useState<ProjectWithMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const projectsData = await projectsApi.getProjects();

        // Fetch tasks for each project and compute metrics
        const projectsWithMetrics = await Promise.all(
          projectsData.map(async (project) => {
            try {
              const tasks = await projectsApi.getProjectTasks(project.id);
              return computeProjectMetrics(project, tasks);
            } catch (err) {
              // If fetching tasks fails, return project with zero metrics
              console.error(`Failed to load tasks for project ${project.id}:`, err);
              return computeProjectMetrics(project, []);
            }
          })
        );

        setProjects(projectsWithMetrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Projects</h2>
          <p className="text-gray-600 animate-pulse">Fetching your data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="destructive"
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-2">Project Management</h1>
          <p className="text-blue-100 text-lg">
            Manage and view all your mineral extraction projects
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-100">{projects.length} Active Projects</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group relative block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-500 border-2 border-transparent hover:border-blue-200 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {project.name}
                  </h2>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Tasks</span>
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                      {project.taskCount}
                    </Badge>
                  </div>

                  {project.durationDays !== null && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Duration</span>
                      <Badge className="bg-purple-600 text-white hover:bg-purple-700 shadow-md">
                        {project.durationDays} days
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {project.earliestStartDate && (
                      <div className="p-2 bg-green-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">Start</div>
                        <div className="text-sm font-semibold text-green-700">
                          {formatDate(project.earliestStartDate)}
                        </div>
                      </div>
                    )}

                    {project.latestEndDate && (
                      <div className="p-2 bg-orange-50 rounded-lg text-center">
                        <div className="text-xs text-gray-500 mb-1">End</div>
                        <div className="text-sm font-semibold text-orange-700">
                          {formatDate(project.latestEndDate)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl group-hover:shadow-lg transition-all duration-300">
                    <span className="text-sm font-bold">View Tasks</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Projects Yet</h3>
            <p className="text-gray-500">Create your first project to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
