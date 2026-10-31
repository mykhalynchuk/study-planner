import React from 'react';
import type {Task} from '../types/task';

interface TaskStatsProps {
    tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const uncompleted = total - completed;

    return (
        <div className="stats">
            <div className="stats__item">Всього: <strong>{total}</strong></div>
            <div className="stats__item stats__item--completed">Виконано: <strong>{completed}</strong></div>
            <div className="stats__item stats__item--uncompleted">Залишилось: <strong>{uncompleted}</strong></div>
        </div>
    );
};