# Project Management Application

A React-based project management application built for viewing and analyzing mineral extraction project tasks with dependency tracking, timeline visualization, and hierarchical task organization.

## Stack

- **React** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## Features

### Core Views

1. **Projects List**
   - View all projects with key metrics
   - Navigate to individual project task views
   - Display project duration, task count, and date ranges

2. **Task List View**
   - Comprehensive task table with filtering and sorting
   - Search by task name
   - Filter by status (planned, in progress, completed, cancelled)
   - Sort by name, start date, due date, or status
   - Visual indicators for task dependencies

### Advanced Features

3. **Task Dependency Visualization**
   - View upstream tasks (prerequisites) for any task
   - View downstream tasks (dependent tasks) that will be impacted by delays
   - Analyze critical path showing all tasks leading to a target task
   - Impact analysis showing all tasks affected by a delay

4. **Timeline View (Next 2 Weeks)**
   - Calendar view of upcoming tasks
   - Tasks grouped by date
   - Summary statistics by status
   - Answers: "What's supposed to happen in the next two weeks?"

5. **Hierarchical Task View**
   - Tree structure showing parent-child task relationships
   - Expandable/collapsible task nodes
   - Visual distinction between root tasks and subtasks
   - Shows full task hierarchy at a glance

6. **Gantt Chart**
   - Visual timeline representation of project schedule
   - Horizontal bars showing task duration and positioning
   - Color-coded by task status (completed, in progress, planned, cancelled)
   - Dependency indicators showing prerequisite count
   - Interactive timeline with date markers
   - Helps visualize project timeline and identify scheduling conflicts

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the API base URL:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` with your ngrok tunnel URL:
     ```
     VITE_API_BASE_URL=https://your-tunnel-id.ngrok-free.app
     ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## API Integration

The application connects to a Task Management API with the following endpoints:

### Projects
- `GET /projects` - List all projects
- `GET /projects/:id` - Get project details
- `POST /projects` - Create a new project
- `PUT /projects/:id` - Update a project
- `DELETE /projects/:id` - Delete a project (only if it has no tasks)

### Tasks
- `GET /projects/:id/tasks` - Get all tasks for a project
- `GET /projects/:id/tasks/:taskId` - Get task details
- `POST /projects/:id/tasks` - Create a new task
- `PUT /projects/:id/tasks/:taskId` - Update a task
- `DELETE /projects/:id/tasks/:taskId` - Delete a task (only if no other tasks depend on it)

### API Configuration

The API base URL is configured via environment variable `VITE_API_BASE_URL`. This should point to your ngrok tunnel URL provided during the interview.

**Note:** Project metrics (task count, duration, earliest start date, latest end date) are computed client-side from the tasks data.

## Usage

### Viewing Projects

1. The home page displays all available projects as cards
2. Each card shows project name, task count, duration, and date range
3. Click on any project card to view its tasks

### Analyzing Tasks

Once in a project's task view, you can switch between different views using the tab buttons:

- **All Tasks**: Table view with search, filter, and sort capabilities
- **Next 2 Weeks**: Timeline showing upcoming tasks grouped by date
- **Dependencies**: Detailed dependency analysis for selected tasks
- **Hierarchy**: Tree view showing parent-child task relationships
- **Gantt Chart**: Visual timeline showing task schedules and durations

### Dependency Analysis

In the Dependencies view:
1. Select a task from the left sidebar
2. View prerequisite tasks (what this task depends on)
3. View dependent tasks (what depends on this task)
4. See the critical path (all tasks leading to this task)
5. Analyze impact (all tasks affected if this task is delayed)

This directly answers the user questions:
- "What is task X connected to?"
- "If task X is delayed, what other tasks will be delayed?"
- "What are all the tasks which lead up to task Y?"

## Project Structure

```
src/
├── components/          # React components
│   ├── TaskList.tsx           # Task table with filtering/sorting
│   ├── TaskDependencyView.tsx # Dependency analysis view
│   ├── TimelineView.tsx       # 2-week timeline view
│   └── HierarchyView.tsx      # Hierarchical task tree
├── pages/              # Page components
│   ├── ProjectsList.tsx       # Projects list page
│   └── ProjectTasks.tsx       # Project tasks page
├── services/           # API services
│   └── api.ts                 # API client
├── types/              # TypeScript type definitions
│   └── index.ts              # Project and Task interfaces
├── utils/              # Utility functions
│   └── taskUtils.ts          # Task processing utilities
├── App.tsx             # Main app with routing
└── main.tsx            # Application entry point
```

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies & Design Decisions

### State Management
- Uses React hooks (`useState`, `useEffect`) for local state management
- No global state management needed for this application size

### Dependency Graph Algorithm
- Uses adjacency list representation for efficient graph traversal
- Implements DFS for finding prerequisite paths and dependent tasks
- Tasks are enriched with dependency information on load for O(1) lookup

### Performance Optimizations
- Dependency enrichment happens once when tasks are loaded
- Memoized calculations for expensive operations
- Efficient date filtering and grouping

### User Experience
- Responsive design works on mobile and desktop
- Clear visual indicators for task status and relationships
- Color-coded sections for different dependency types
- Interactive elements with hover states and transitions

## Future Enhancements

Potential improvements for production use:
- Weather API integration for timeline view
- Gantt chart visualization
- Task editing and creation
- Real-time updates via WebSockets
- Export functionality (PDF, CSV)
- User authentication and permissions
- Undo/redo functionality
- Bulk task operations
