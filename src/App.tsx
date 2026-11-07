import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { Toast } from './components/Toast';
import { TaskProvider } from './context/TaskContext';
import './styles/main.scss';

function StudyPlannerApp() {
  return (
      <div className="app-container">
        <Header />
        <main className="main-content">
          <TaskForm />
          <div className="tasks-board">
            <TaskStats />
            <TaskFilters />
            <TaskList />
          </div>
        </main>
        <Toast />
      </div>
  );
}

function App() {
  return (
      <TaskProvider>
        <StudyPlannerApp />
      </TaskProvider>
  );
}

export default App;