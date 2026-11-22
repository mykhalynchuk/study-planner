import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import axios from 'axios';
import { taskRepository } from '../repositories/taskRepository';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import { TaskFormDialog } from '../components/TaskFormDialog';
import type { Task } from '../types/task';
import type { TaskFormData } from '../schemas/taskSchema';
import './TaskDetailsPage.scss';

export const TaskDetailsPage: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { tasks, updateTask, deleteTask, toggleTask, showToast } = useTaskContext();

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadCount, setReloadCount] = useState(0);

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const tasksRef = useRef(tasks);
    tasksRef.current = tasks;

    useEffect(() => {
        const numericId = Number(taskId);
        if (!taskId || Number.isNaN(numericId) || numericId <= 0) {
            setError('Некоректний ідентифікатор завдання.');
            setLoading(false);
            return;
        }

        const abortController = new AbortController();

        const loadTaskDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiTask = await taskRepository.getById(
                    numericId,
                    abortController.signal
                );
                const localMatch = tasksRef.current.find((t) => t.id === numericId);

                setTask(localMatch ? { ...apiTask, ...localMatch } : apiTask);
            } catch (err) {
                if (axios.isCancel(err)) return;

                const localMatch = tasksRef.current.find((t) => t.id === numericId);
                if (localMatch) {
                    setTask(localMatch);
                } else {
                    setError('Не вдалося завантажити деталі завдання.');
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        loadTaskDetails();

        return () => abortController.abort();
    }, [taskId, reloadCount]);

    const redirectToLogin = () => {
        const currentUrl = encodeURIComponent(location.pathname + location.search);
        navigate(`/login?redirectTo=${currentUrl}`);
    };

    const handleEditClick = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = async (data: TaskFormData) => {
        if (!task) return;
        const updatedTask = await updateTask(task.id, data);
        setTask(updatedTask);
    };

    const handleToggleStatus = async () => {
        if (!task) return;
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        const nextCompleted = !task.completed;
        setTask({ ...task, completed: nextCompleted });
        try {
            await toggleTask(task.id);
        } catch {
            setTask({ ...task, completed: !nextCompleted });
        }
    };

    const handleDeleteRequest = () => {
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }
        setIsConfirmingDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!task) return;
        if (!isAuthenticated) {
            redirectToLogin();
            return;
        }

        setIsDeleting(true);
        try {
            await deleteTask(task.id);
            navigate('/tasks');
        } catch {
            showToast('Не вдалося видалити завдання', 'error');
            setIsDeleting(false);
        }
    };

    const formatDate = (isoDate: string) => {
        const parsed = new Date(isoDate);
        if (Number.isNaN(parsed.getTime())) return isoDate;
        return parsed.toLocaleString('uk-UA', {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    return (
        <section className="task-details">
            <div className="task-details__top-bar">
                <Link to="/tasks" className="task-details__back-link">
                    ← Назад до списку завдань
                </Link>
            </div>

            {loading && (
                <div className="task-details__state">Завантаження деталей завдання...</div>
            )}

            {!loading && error && (
                <div className="task-details__state task-details__state--error">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="task-details__btn task-details__btn--primary"
                        onClick={() => setReloadCount((prev) => prev + 1)}
                    >
                        Спробувати ще раз
                    </button>
                </div>
            )}

            {!loading && !error && task && (
                <article className="task-details__card">
                    <div className="task-details__header">
                        <span className="task-details__id">Завдання #{task.id}</span>
                        <span
                            className={`task-details__status ${
                                task.completed
                                    ? 'task-details__status--done'
                                    : 'task-details__status--active'
                            }`}
                        >
                            {task.completed ? 'Виконано' : 'В процесі'}
                        </span>
                    </div>

                    <h1 className="task-details__title">{task.title}</h1>

                    <p className="task-details__description">
                        {task.description || 'Опис відсутній.'}
                    </p>

                    <dl className="task-details__meta">
                        <div className="task-details__meta-item">
                            <dt className="task-details__meta-label">Категорія</dt>
                            <dd className="task-details__meta-value">{task.category}</dd>
                        </div>

                        <div className="task-details__meta-item">
                            <dt className="task-details__meta-label">Пріоритет</dt>
                            <dd className="task-details__meta-value">
                                <span
                                    className={`task-details__priority task-details__priority--${task.priority}`}
                                >
                                    {task.priority}
                                </span>
                            </dd>
                        </div>

                        <div className="task-details__meta-item">
                            <dt className="task-details__meta-label">Створив</dt>
                            <dd className="task-details__meta-value">{task.createdBy}</dd>
                        </div>

                        <div className="task-details__meta-item">
                            <dt className="task-details__meta-label">Дата створення</dt>
                            <dd className="task-details__meta-value">
                                {formatDate(task.createdAt)}
                            </dd>
                        </div>
                    </dl>

                    {!isAuthenticated && (
                        <div className="task-details__auth-notice">
                            Редагування та видалення доступні лише авторизованим
                            користувачам.
                        </div>
                    )}

                    {isConfirmingDelete ? (
                        <div className="task-details__confirm" role="alert">
                            <p className="task-details__confirm-text">
                                Ви впевнені, що хочете видалити це завдання?
                            </p>
                            <div className="task-details__confirm-actions">
                                <button
                                    type="button"
                                    className="task-details__btn task-details__btn--danger"
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Видалення...' : 'Підтвердити видалення'}
                                </button>
                                <button
                                    type="button"
                                    className="task-details__btn task-details__btn--secondary"
                                    onClick={() => setIsConfirmingDelete(false)}
                                    disabled={isDeleting}
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="task-details__actions">
                            <button
                                type="button"
                                className="task-details__btn task-details__btn--primary"
                                onClick={handleEditClick}
                            >
                                Редагувати
                            </button>
                            <button
                                type="button"
                                className="task-details__btn task-details__btn--secondary"
                                onClick={handleToggleStatus}
                            >
                                {task.completed
                                    ? 'Позначити невиконаним'
                                    : 'Позначити виконаним'}
                            </button>
                            <button
                                type="button"
                                className="task-details__btn task-details__btn--danger"
                                onClick={handleDeleteRequest}
                            >
                                Видалити
                            </button>
                        </div>
                    )}

                    <TaskFormDialog
                        open={isEditDialogOpen}
                        mode="edit"
                        task={task}
                        onClose={() => setIsEditDialogOpen(false)}
                        onSubmit={handleEditSubmit}
                    />
                </article>
            )}
        </section>
    );
};