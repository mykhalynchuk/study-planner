import { useState } from 'react';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import {type FilterType, TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import type {Task} from './types/task';
import { initialTasks } from './data/initialTasks';
import './styles/main.scss';

function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>('all');

  // Додавання завдання (immutable)
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: Date.now(), // Проста генерація унікального ID
      completed: false,
    };
    setTasks([...tasks, newTask]);
  };

  // Зміна статусу завдання (immutable)
  const handleToggleStatus = (id: number) => {
    setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Видалення завдання (immutable)
  const handleDelete = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Фільтрація (не змінюємо оригінальний масив)
  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'uncompleted') return !task.completed;
    return true; // для 'all'
  });

  return (
      <div className="app-container">
        <Header />

        <main className="main-content">
          <TaskForm onAddTask={handleAddTask} />

          <div className="tasks-board">
            <TaskStats tasks={tasks} />
            <TaskFilters currentFilter={filter} onFilterChange={setFilter} />

            <TaskList
                tasks={filteredTasks}
                totalTasksCount={tasks.length}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
            />
          </div>
        </main>
      </div>
  );
}

export default App;