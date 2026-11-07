import React, { createContext, useReducer, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Task, FilterType } from '../types/task';
import { taskReducer } from '../reducers/taskReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialTasks } from '../data/initialTasks';

interface ToastState {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
    undoId?: number;
}

interface TaskContextProps {
    tasks: Task[]; filter: FilterType; setFilter: (filter: FilterType) => void;
    editingTask: Task | null; setEditingTask: (task: Task | null) => void;
    toast: ToastState; addTask: (task: Omit<Task, 'id' | 'completed' | 'pendingDelete'>) => void;
    updateTask: (task: Task) => void; toggleTask: (id: number) => void;
    requestDelete: (id: number) => void; undoDelete: (id: number) => void;
    clearCompleted: () => void; resetTasks: () => void;
}

export const TaskContext = createContext<TaskContextProps | null>(null);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tasks, dispatch] = useReducer(taskReducer, []);
    const [filter, setFilter] = useLocalStorage<FilterType>('task_filter', 'all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });

    // @ts-ignore
    const deleteTimeouts = useRef<Record<number, NodeJS.Timeout>>({});

    useEffect(() => {
        try {
            const saved = localStorage.getItem('study_tasks');
            dispatch({ type: 'set_tasks', payload: saved ? JSON.parse(saved) : initialTasks });
        } catch (e) { dispatch({ type: 'set_tasks', payload: initialTasks }); }
    }, []);

    useEffect(() => {
        if (tasks.length > 0 || localStorage.getItem('study_tasks')) {
            localStorage.setItem('study_tasks', JSON.stringify(tasks));
        }
        const activeCount = tasks.filter(t => !t.completed && !t.pendingDelete).length;
        document.title = `Study Planner — ${activeCount} active tasks`;
    }, [tasks]);

    const showToast = (message: string, type: ToastState['type'] = 'info', undoId?: number) => {
        setToast({ message, type, visible: true, undoId });
        if (undoId === undefined) {
            setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
        }
    };

    const addTask = (task: Omit<Task, 'id' | 'completed' | 'pendingDelete'>) => {
        dispatch({ type: 'add', payload: task }); showToast('Завдання успішно додано!', 'success');
    };

    const updateTask = (task: Task) => {
        dispatch({ type: 'update', payload: task }); setEditingTask(null); showToast('Завдання оновлено!', 'success');
    };

    const toggleTask = (id: number) => dispatch({ type: 'toggle', payload: id });
    const clearCompleted = () => dispatch({ type: 'clearCompleted' });
    const resetTasks = () => dispatch({ type: 'reset' });

    // Оновлений Request Delete
    const requestDelete = (id: number) => {
        dispatch({ type: 'requestDelete', payload: id });
        showToast('Завдання буде видалено через 5 сек.', 'warning', id);

        deleteTimeouts.current[id] = setTimeout(() => {
            dispatch({ type: 'confirmDelete', payload: id });
            delete deleteTimeouts.current[id];
            // Ховаємо тост, якщо він належав цьому вилученому завданню
            setToast(prev => prev.undoId === id ? { ...prev, visible: false, undoId: undefined } : prev);
        }, 5000);
    };

    const undoDelete = (id: number) => {
        if (deleteTimeouts.current[id]) {
            clearTimeout(deleteTimeouts.current[id]);
            delete deleteTimeouts.current[id];
        }
        dispatch({ type: 'undoDelete', payload: id });
        showToast('Видалення скасовано.', 'info');
    };

    return (
        <TaskContext.Provider value={{ tasks, filter, setFilter, editingTask, setEditingTask, toast, addTask, updateTask, toggleTask, requestDelete, undoDelete, clearCompleted, resetTasks }}>
            {children}
        </TaskContext.Provider>
    );
};