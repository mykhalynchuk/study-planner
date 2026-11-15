import React, { useState } from 'react';
import type { Task } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';
import { TaskDetailsModal } from './TaskDetailsModal';

export const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const { toggleTask, deleteTask, setEditingTask } = useTaskContext();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const handleDelete = () => {
        if (window.confirm('Ви впевнені, що хочете видалити це завдання?')) {
            deleteTask(task.id);
        }
    };

    return (
        <>
            <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
                <div className="task-item__content">
                    <h3 className="task-item__title">{task.title}</h3>
                    <div className="task-item__meta">
                        <span className="task-item__tag">{task.category}</span>
                        <span className={`task-item__priority task-item__priority--${task.priority}`}>{task.priority}</span>
                    </div>
                </div>
                <div className="task-item__actions">
                    <button className="task-item__btn task-item__btn--undo" onClick={() => setIsDetailsOpen(true)}>Деталі</button>
                    <button className="task-item__btn task-item__btn--edit" onClick={() => setEditingTask(task)}>Редаг.</button>
                    <button className={`task-item__btn ${task.completed ? 'task-item__btn--undo' : 'task-item__btn--done'}`} onClick={() => toggleTask(task.id)}>
                        {task.completed ? 'Скасувати' : 'Виконати'}
                    </button>
                    <button className="task-item__btn task-item__btn--delete" onClick={handleDelete}>Видалити</button>
                </div>
            </li>

            {isDetailsOpen && (
                <TaskDetailsModal taskId={task.id} onClose={() => setIsDetailsOpen(false)} />
            )}
        </>
    );
};