import React from 'react';
import { TaskItem } from './TaskItem';
import { useTaskContext } from '../hooks/useTaskContext';

export const TaskList: React.FC = () => {
    const {
        tasks, filter, status, error, fetchTasks,
        currentPage, setCurrentPage, totalTasks
    } = useTaskContext();

    if (status === 'loading') {
        return <div className="task-list__loading">Завантаження завдань із сервера...</div>;
    }

    if (status === 'error') {
        return (
            <div className="task-list__error">
                <p>{error}</p>
                <button onClick={fetchTasks} className="task-form__button">Спробувати ще раз</button>
            </div>
        );
    }

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'uncompleted') return !task.completed;
        return true;
    });

    if (status === 'success' && tasks.length === 0) {
        return <div className="task-list__empty">Завдань не знайдено на сервері.</div>;
    }

    const totalPages = Math.ceil(totalTasks / 10);

    return (
        <div className="task-list-container">
            <ul className="task-list">
                {filteredTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                ))}
            </ul>

            <div className="pagination" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="filters__btn"
                >
                    Попередня
                </button>
                <span style={{ padding: '0.5rem' }}>Сторінка {currentPage} з {totalPages || 1}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="filters__btn"
                >
                    Наступна
                </button>
            </div>
        </div>
    );
};