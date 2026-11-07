import React from 'react';
import { TaskItem } from './TaskItem';
import { useTaskContext } from '../hooks/useTaskContext';

export const TaskList: React.FC = () => {
    const { tasks, filter } = useTaskContext();

    const activeTasks = tasks.filter(task => !task.pendingDelete);

    const filteredTasks = activeTasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'uncompleted') return !task.completed;
        return true;
    });

    if (tasks.length === 0) {
        return <div className="task-list__empty">Завдань поки немає. Додайте перше завдання.</div>;
    }

    if (filteredTasks.length === 0) {
        return <div className="task-list__empty">За цим фільтром завдань немає.</div>;
    }

    return (
        <ul className="task-list">
            {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
            ))}
        </ul>
    );
};