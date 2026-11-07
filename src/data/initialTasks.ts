import type { Task } from '../types/task';

export const initialTasks: Task[] = [
    {
        id: 1,
        title: 'Вивчити React Hooks',
        description: 'Розібратися з useState, useEffect та Context API',
        completed: false,
        priority: 'high',
        category: 'Навчання'
    },
    {
        id: 2,
        title: 'Зробити Лабораторну №9',
        description: 'Додати Reducer та Undoable Delete',
        completed: true,
        priority: 'medium',
        category: 'Університет'
    }
];