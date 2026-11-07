import React from 'react';
import type { Task } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';

export const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const { toggleTask, requestDelete, setEditingTask } = useTaskContext();

    return (
        <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
            <div className="task-item__content">
                <h3 className="task-item__title">{task.title}</h3>
                {task.description && <p className="task-item__desc">{task.description}</p>}
                <div className="task-item__meta">
                    <span className="task-item__tag">{task.category}</span>
                    <span className={`task-item__priority task-item__priority--${task.priority}`}>{task.priority}</span>
                </div>
            </div>
            <div className="task-item__actions">
                <button className="task-item__btn task-item__btn--edit" onClick={() => setEditingTask(task)}>Редаг.</button>
                <button className={`task-item__btn ${task.completed ? 'task-item__btn--undo' : 'task-item__btn--done'}`} onClick={() => toggleTask(task.id)}>
                    {task.completed ? 'Скасувати' : 'Виконати'}
                </button>
                <button className="task-item__btn task-item__btn--delete" onClick={() => requestDelete(task.id)}>Видалити</button>
            </div>
        </li>
    );
};