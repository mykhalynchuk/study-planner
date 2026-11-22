import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { TASKS_PER_PAGE } from '../context/TaskContext';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import { TaskItem } from '../components/TaskItem';
import { TaskFormDialog } from '../components/TaskFormDialog';
import type { FilterType, Priority } from '../types/task';
import type { TaskFormData } from '../schemas/taskSchema';
import './TasksPage.scss';

type PriorityFilter = 'all' | Priority;

const VALID_STATUSES: FilterType[] = ['all', 'completed', 'uncompleted'];
const VALID_PRIORITIES: PriorityFilter[] = ['all', 'low', 'medium', 'high'];

export const TasksPage: React.FC = () => {
    const {
        tasks,
        status: requestStatus,
        error,
        fetchTasks,
        addTask,
        currentPage,
        setCurrentPage,
        totalTasks,
    } = useTaskContext();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);


    const statusParam = searchParams.get('status') as FilterType | null;
    const priorityParam = searchParams.get('priority') as PriorityFilter | null;

    const statusFilter: FilterType =
        statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : 'all';
    const priorityFilter: PriorityFilter =
        priorityParam && VALID_PRIORITIES.includes(priorityParam) ? priorityParam : 'all';

    const updateQueryParam = (key: 'status' | 'priority', value: string) => {
        const nextParams = new URLSearchParams(searchParams);
        if (value === 'all') {
            nextParams.delete(key);
        } else {
            nextParams.set(key, value);
        }
        setSearchParams(nextParams, { replace: true });
    };

    const handleOpenCreate = () => {
        if (!isAuthenticated) {
            const currentUrl = encodeURIComponent(location.pathname + location.search);
            navigate(`/login?redirectTo=${currentUrl}`);
            return;
        }
        setIsCreateDialogOpen(true);
    };

    const handleCreateSubmit = async (data: TaskFormData) => {
        await addTask(data);
    };

    const filteredTasks = tasks.filter((task) => {
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'completed' && task.completed) ||
            (statusFilter === 'uncompleted' && !task.completed);

        const matchesPriority =
            priorityFilter === 'all' || task.priority === priorityFilter;

        return matchesStatus && matchesPriority;
    });

    const totalPages = Math.max(1, Math.ceil(totalTasks / TASKS_PER_PAGE));

    return (
        <section className="tasks-page">
            <div className="tasks-page__header">
                <div>
                    <h1 className="tasks-page__title">Навчальні завдання</h1>
                    <p className="tasks-page__subtitle">
                        Всього на сервері: {totalTasks} • Показано на сторінці:{' '}
                        {filteredTasks.length}
                    </p>
                </div>

                <button
                    type="button"
                    className="tasks-page__add-btn"
                    onClick={handleOpenCreate}
                    aria-label="Створити нове завдання"
                    title={
                        isAuthenticated
                            ? 'Створити нове завдання'
                            : 'Увійдіть, щоб створити завдання'
                    }
                >
                    + Додати завдання
                </button>
            </div>

            <div className="tasks-page__controls">
                <div className="tasks-page__filter-group" role="group" aria-label="Фільтр за статусом">
                    <span className="tasks-page__filter-label">Статус:</span>
                    {(['all', 'uncompleted', 'completed'] as const).map((item) => (
                        <button
                            key={item}
                            type="button"
                            className={`tasks-page__filter-btn ${
                                statusFilter === item ? 'tasks-page__filter-btn--active' : ''
                            }`}
                            onClick={() => updateQueryParam('status', item)}
                        >
                            {item === 'all'
                                ? 'Усі'
                                : item === 'completed'
                                    ? 'Виконані'
                                    : 'Невиконані'}
                        </button>
                    ))}
                </div>

                <div className="tasks-page__filter-group">
                    <label className="tasks-page__filter-label" htmlFor="priority-filter">
                        Пріоритет:
                    </label>
                    <select
                        id="priority-filter"
                        className="tasks-page__select"
                        value={priorityFilter}
                        onChange={(e) => updateQueryParam('priority', e.target.value)}
                    >
                        <option value="all">Усі пріоритети</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            {requestStatus === 'loading' && (
                <div className="tasks-page__state">Завантаження завдань із сервера...</div>
            )}

            {requestStatus === 'error' && (
                <div className="tasks-page__state tasks-page__state--error">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={fetchTasks}
                        className="tasks-page__retry-btn"
                    >
                        Спробувати ще раз
                    </button>
                </div>
            )}

            {requestStatus === 'success' && filteredTasks.length === 0 && (
                <div className="tasks-page__state">
                    Завдань за обраними фільтрами не знайдено.
                </div>
            )}

            {requestStatus === 'success' && filteredTasks.length > 0 && (
                <ul className="task-list">
                    {filteredTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </ul>
            )}

            <div className="tasks-page__pagination">
                <button
                    type="button"
                    className="tasks-page__page-btn"
                    disabled={currentPage === 1 || requestStatus === 'loading'}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Попередня
                </button>
                <span className="tasks-page__page-info">
                    Сторінка {currentPage} з {totalPages}
                </span>
                <button
                    type="button"
                    className="tasks-page__page-btn"
                    disabled={currentPage >= totalPages || requestStatus === 'loading'}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Наступна
                </button>
            </div>

            <TaskFormDialog
                open={isCreateDialogOpen}
                mode="create"
                onClose={() => setIsCreateDialogOpen(false)}
                onSubmit={handleCreateSubmit}
            />
        </section>
    );
};