import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsList from './pages/ProjectsList';
import ProjectTasks from './pages/ProjectTasks';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProjectsList />} />
        <Route path="/projects/:id" element={<ProjectTasks />} />
      </Routes>
    </Router>
  );
}

export default App;
