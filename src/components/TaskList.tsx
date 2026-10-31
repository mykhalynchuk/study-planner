import React from 'react';
import type {Task} from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
    tasks: Task[];
    totalTasksCount: number;
    onToggleStatus: (id: number) => void;
    onDelete: (id: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, totalTasksCount, onToggleStatus, onDelete }) => {
    if (totalTasksCount === 0) {
        return (
            <div className="task-list__empty">
                Завдань поки немає. Додайте перше навчальне завдання.
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="task-list__empty">
                За цим фільтром завдань немає.
            </div>
        );
    }

    return (
        <ul className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
};