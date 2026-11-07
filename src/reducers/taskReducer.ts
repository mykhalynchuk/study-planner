import type { Task, TaskAction } from '../types/task';
import { initialTasks } from '../data/initialTasks';

export function taskReducer(state: Task[], action: TaskAction): Task[] {
    switch (action.type) {
        case 'set_tasks':
            return action.payload;
        case 'add':
            return [...state, { ...action.payload, id: Date.now(), completed: false }];
        case 'toggle':
            return state.map(task =>
                task.id === action.payload ? { ...task, completed: !task.completed } : task
            );
        case 'update':
            return state.map(task =>
                task.id === action.payload.id ? action.payload : task
            );
        case 'requestDelete':
            return state.map(task =>
                task.id === action.payload ? { ...task, pendingDelete: true } : task
            );
        case 'confirmDelete':
            return state.filter(task => task.id !== action.payload);
        case 'undoDelete':
            return state.map(task =>
                task.id === action.payload ? { ...task, pendingDelete: false } : task
            );
        case 'clearCompleted':
            return state.filter(task => !task.completed);
        case 'reset':
            return initialTasks;
        default:
            return state;
    }
}