import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import type { Task } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';

export const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const { toggleTask } = useTaskContext();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleToggle = () => {
        if (!isAuthenticated) {
            const currentUrl = encodeURIComponent(location.pathname + location.search);
            navigate(`/login?redirectTo=${currentUrl}`);
            return;
        }
        void toggleTask(task.id);
    };

    return (
        <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
            <div className="task-item__content">
                <Link to={`/tasks/${task.id}`} className="task-item__title-link">
                    <h3 className="task-item__title">{task.title}</h3>
                </Link>
                <div className="task-item__meta">
                    <span className="task-item__tag">{task.category}</span>
                    <span
                        className={`task-item__priority task-item__priority--${task.priority}`}
                    >
                        {task.priority}
                    </span>
                </div>
            </div>

            <div className="task-item__actions">
                <Link
                    to={`/tasks/${task.id}`}
                    className="task-item__btn task-item__btn--undo"
                >
                    Деталі
                </Link>
                <button
                    type="button"
                    className={`task-item__btn ${
                        task.completed ? 'task-item__btn--undo' : 'task-item__btn--done'
                    }`}
                    onClick={handleToggle}
                >
                    {task.completed ? 'Скасувати' : 'Виконати'}
                </button>
            </div>
        </li>
    );
};