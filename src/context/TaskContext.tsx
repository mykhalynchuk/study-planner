import React, {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import axios from 'axios';
import type { Task } from '../types/task';
import type { TaskFormData } from '../schemas/taskSchema';
import { taskRepository } from '../repositories/taskRepository';
import { useAuth } from '../hooks/useAuth';
import { tokenStorage } from '../utils/tokenStorage';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ToastState {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
}

interface TaskContextProps {
    tasks: Task[];
    status: RequestStatus;
    error: string | null;
    toast: ToastState;
    totalTasks: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    showToast: (message: string, type?: ToastState['type']) => void;
    fetchTasks: () => void;
    addTask: (data: TaskFormData) => Promise<Task>;
    updateTask: (id: number, data: TaskFormData) => Promise<Task>;
    toggleTask: (id: number) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
}

export const TaskContext = createContext<TaskContextProps | null>(null);

export const TASKS_PER_PAGE = 10;

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [status, setStatus] = useState<RequestStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [totalTasks, setTotalTasks] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'info',
        visible: false,
    });

    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback(
        (message: string, type: ToastState['type'] = 'info') => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
            setToast({ message, type, visible: true });
            toastTimeoutRef.current = setTimeout(() => {
                setToast((prev) => ({ ...prev, visible: false }));
            }, 3500);
        },
        []
    );

    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        const loadTasks = async () => {
            setStatus('loading');
            setError(null);
            try {
                const skip = (currentPage - 1) * TASKS_PER_PAGE;
                const data = await taskRepository.getAll(
                    TASKS_PER_PAGE,
                    skip,
                    abortController.signal
                );
                setTasks(data.tasks);
                setTotalTasks(data.total);
                setStatus('success');
            } catch (err) {
                if (axios.isCancel(err)) return;

                setStatus('error');
                setError("Не вдалося завантажити завдання. Перевірте з'єднання.");
                showToast('Помилка завантаження API', 'error');
            }
        };

        loadTasks();

        return () => abortController.abort();
    }, [currentPage, reloadTrigger, showToast]);

    const fetchTasks = useCallback(() => {
        setReloadTrigger((prev) => prev + 1);
    }, []);

    const ensureAuthorized = useCallback(() => {
        if (!isAuthenticated || !tokenStorage.getToken()) {
            showToast('Потрібна авторизація для цієї дії', 'warning');
            throw new Error('Необхідно увійти в систему для виконання цієї дії.');
        }
    }, [isAuthenticated, showToast]);

    const addTask = useCallback(
        async (data: TaskFormData): Promise<Task> => {
            ensureAuthorized();
            const createdTask = await taskRepository.create({
                ...data,
                createdBy: user?.username ?? 'Authorized user',
            });
            setTasks((prev) => [createdTask, ...prev]);
            setTotalTasks((prev) => prev + 1);
            showToast('Завдання успішно створено!', 'success');
            return createdTask;
        },
        [ensureAuthorized, user, showToast]
    );

    const updateTask = useCallback(
        async (id: number, data: TaskFormData): Promise<Task> => {
            ensureAuthorized();
            const existing = tasks.find((t) => t.id === id);
            const updatedFromApi = await taskRepository.update(id, {
                ...data,
                completed: existing?.completed ?? false,
            });

            const mergedTask: Task = {
                ...updatedFromApi,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority,
                createdBy: existing?.createdBy ?? updatedFromApi.createdBy,
                createdAt: existing?.createdAt ?? updatedFromApi.createdAt,
            };

            setTasks((prev) => prev.map((t) => (t.id === id ? mergedTask : t)));
            showToast('Зміни збережено!', 'success');
            return mergedTask;
        },
        [ensureAuthorized, tasks, showToast]
    );

    const toggleTask = useCallback(
        async (id: number) => {
            ensureAuthorized();
            const taskToToggle = tasks.find((t) => t.id === id);
            if (!taskToToggle) return;

            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
            );

            try {
                await taskRepository.update(id, { completed: !taskToToggle.completed });
            } catch {
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === id ? { ...t, completed: taskToToggle.completed } : t
                    )
                );
                showToast('Не вдалося оновити статус завдання', 'error');
            }
        },
        [ensureAuthorized, tasks, showToast]
    );

    const deleteTask = useCallback(
        async (id: number) => {
            ensureAuthorized();
            await taskRepository.delete(id);
            setTasks((prev) => prev.filter((t) => t.id !== id));
            setTotalTasks((prev) => Math.max(0, prev - 1));
            showToast('Завдання видалено', 'info');
        },
        [ensureAuthorized, showToast]
    );

    const contextValue = useMemo<TaskContextProps>(
        () => ({
            tasks,
            status,
            error,
            toast,
            totalTasks,
            currentPage,
            setCurrentPage,
            showToast,
            fetchTasks,
            addTask,
            updateTask,
            toggleTask,
            deleteTask,
        }),
        [
            tasks,
            status,
            error,
            toast,
            totalTasks,
            currentPage,
            showToast,
            fetchTasks,
            addTask,
            updateTask,
            toggleTask,
            deleteTask,
        ]
    );

    return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};