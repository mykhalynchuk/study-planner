import React, { createContext, useEffect, useState, useRef, useMemo, type ReactNode } from 'react';
import type { Task, FilterType } from '../types/task';
import { taskRepository } from '../repositories/taskRepository';
import { useLocalStorage } from '../hooks/useLocalStorage';

type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface ToastState {
    message: string; type: 'success' | 'error' | 'warning' | 'info'; visible: boolean;
}

interface TaskContextProps {
    tasks: Task[];
    status: RequestStatus;
    error: string | null;
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    editingTask: Task | null;
    setEditingTask: (task: Task | null) => void;
    toast: ToastState;
    totalTasks: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;

    fetchTasks: () => void;
    addTask: (task: Omit<Task, 'id' | 'completed' | 'pendingDelete'>) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    toggleTask: (id: number) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
}

export const TaskContext = createContext<TaskContextProps | null>(null);

const LIMIT = 10;

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [status, setStatus] = useState<RequestStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [totalTasks, setTotalTasks] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const [filter, setFilter] = useLocalStorage<FilterType>('task_filter', 'all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });

    // @ts-ignore
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (message: string, type: ToastState['type'] = 'info') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ message, type, visible: true });
        toastTimeoutRef.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
    };

    useEffect(() => {
        const abortController = new AbortController();

        const loadTasks = async () => {
            setStatus('loading');
            setError(null);
            try {
                const skip = (currentPage - 1) * LIMIT;
                const data = await taskRepository.getAll(LIMIT, skip, abortController.signal);
                setTasks(data.tasks);
                setTotalTasks(data.total);
                setStatus('success');
            } catch (err: any) {
                if (err.name === 'CanceledError' || err.message === 'canceled') return;

                setStatus('error');
                setError('Не вдалося завантажити завдання. Перевірте з\'єднання.');
                showToast('Помилка завантаження API', 'error');
            }
        };

        loadTasks();

        return () => abortController.abort();
    }, [currentPage]);

    const fetchTasks = () => setCurrentPage(prev => prev);

    const addTask = async (task: Omit<Task, 'id' | 'completed' | 'pendingDelete'>) => {
        try {
            // @ts-ignore
            const newTask = await taskRepository.create(task);
            setTasks(prev => [newTask, ...prev]);
            showToast('Завдання створено на сервері!', 'success');
        } catch (err) {
            showToast('Помилка створення завдання', 'error');
        }
    };

    const updateTask = async (task: Task) => {
        try {
            const updated = await taskRepository.update(task.id, task);
            setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
            setEditingTask(null);
            showToast('Зміни збережено!', 'success');
        } catch (err) {
            showToast('Помилка оновлення', 'error');
        }
    };

    const toggleTask = async (id: number) => {
        const taskToToggle = tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

        try {
            await taskRepository.update(id, { completed: !taskToToggle.completed });
        } catch (err) {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: taskToToggle.completed } : t));
            showToast('Не вдалося змінити статус', 'error');
        }
    };

    const deleteTask = async (id: number) => {
        try {
            await taskRepository.delete(id);
            setTasks(prev => prev.filter(t => t.id !== id));
            showToast('Завдання видалено', 'info');
        } catch (err) {
            showToast('Помилка видалення', 'error');
        }
    };

    const contextValue = useMemo(() => ({
        tasks, status, error, filter, setFilter, editingTask, setEditingTask, toast,
        totalTasks, currentPage, setCurrentPage, fetchTasks,
        addTask, updateTask, toggleTask, deleteTask
    }), [tasks, status, error, filter, editingTask, toast, totalTasks, currentPage]);

    return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>;
};