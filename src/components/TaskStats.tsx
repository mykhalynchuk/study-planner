import React from 'react';
import { useTaskContext } from '../hooks/useTaskContext';

export const TaskStats: React.FC = () => {
    const { tasks } = useTaskContext();

    const total = tasks.filter(t => !t.pendingDelete).length;
    const completed = tasks.filter(t => t.completed && !t.pendingDelete).length;
    const uncompleted = total - completed;

    return (
        <div className="stats">
            <div className="stats__item">Всього: <strong>{total}</strong></div>
            <div className="stats__item stats__item--completed">Виконано: <strong>{completed}</strong></div>
            <div className="stats__item stats__item--uncompleted">Залишилось: <strong>{uncompleted}</strong></div>
        </div>
    );
};