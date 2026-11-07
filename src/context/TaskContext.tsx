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
    timeLeft?: number;
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
    // @ts-ignore
    const countdownIntervals = useRef<Record<number, NodeJS.Timeout>>({});
    // @ts-ignore
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('study_tasks');
            dispatch({ type: 'set_tasks', payload: saved ? JSON.parse(saved) : initialTasks });
        } catch (e) { dispatch({ type: 'set_tasks', payload: initialTasks }); }
    }, []);

    useEffect(() => {
        localStorage.setItem('study_tasks', JSON.stringify(tasks));
        const activeCount = tasks.filter(t => !t.completed && !t.pendingDelete).length;
        document.title = `Study Planner — ${activeCount} active tasks`;
    }, [tasks]);

    const showToast = (message: string, type: ToastState['type'] = 'info', undoId?: number, initialTimeLeft?: number) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

        setToast({ message, type, visible: true, undoId, timeLeft: initialTimeLeft });

        if (undoId === undefined) {
            toastTimeoutRef.current = setTimeout(() => {
                setToast(prev => ({ ...prev, visible: false }));
            }, 4000);
        }
    };

    const addTask = (task: Omit<Task, 'id' | 'completed' | 'pendingDelete'>) => {
        dispatch({ type: 'add', payload: task }); showToast('Завдання додано!', 'success');
    };

    const updateTask = (task: Task) => {
        dispatch({ type: 'update', payload: task }); setEditingTask(null); showToast('Завдання оновлено!', 'success');
    };

    const toggleTask = (id: number) => dispatch({ type: 'toggle', payload: id });
    const clearCompleted = () => dispatch({ type: 'clearCompleted' });

    const resetTasks = () => {
        dispatch({ type: 'reset' });
        showToast('Дані скинуто до початкових', 'success');
    };

    const requestDelete = (id: number) => {
        dispatch({ type: 'requestDelete', payload: id });
        showToast('Завдання буде видалено...', 'warning', id, 5); // Передаємо 5 секунд

        let timeRemaining = 5;
        countdownIntervals.current[id] = setInterval(() => {
            timeRemaining -= 1;
            setToast(prev => prev.undoId === id ? { ...prev, timeLeft: timeRemaining } : prev);
            if (timeRemaining <= 0) clearInterval(countdownIntervals.current[id]);
        }, 1000);

        deleteTimeouts.current[id] = setTimeout(() => {
            dispatch({ type: 'confirmDelete', payload: id });
            delete deleteTimeouts.current[id];
            setToast(prev => prev.undoId === id ? { ...prev, visible: false, undoId: undefined } : prev);
        }, 5000);
    };

    const undoDelete = (id: number) => {
        if (deleteTimeouts.current[id]) {
            clearTimeout(deleteTimeouts.current[id]);
            delete deleteTimeouts.current[id];
        }
        if (countdownIntervals.current[id]) {
            clearInterval(countdownIntervals.current[id]);
            delete countdownIntervals.current[id];
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