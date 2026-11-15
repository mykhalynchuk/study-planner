import React, { useEffect, useState } from 'react';
import type { Task } from '../types/task';
import { taskRepository } from '../repositories/taskRepository';

interface TaskDetailsModalProps {
    taskId: number;
    onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ taskId, onClose }) => {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchDetails = async () => {
            try {
                const data = await taskRepository.getById(taskId, abortController.signal);
                setTask(data);
            } catch (err: any) {
                if (err.name === 'CanceledError') return;
                setError('Не вдалося завантажити деталі завдання.');
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();

        return () => abortController.abort();
    }, [taskId]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                {loading && <p>Завантаження деталей...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {task && (
                    <>
                        <h2>{task.title}</h2>
                        <p><strong>Статус:</strong> {task.completed ? 'Виконано' : 'В процесі'}</p>
                        <p><strong>Категорія:</strong> {task.category}</p>
                        <p><strong>Пріоритет:</strong> {task.priority}</p>
                        {task.description && <p><strong>Опис:</strong> {task.description}</p>}
                    </>
                )}
                <button onClick={onClose} className="task-form__button" style={{ marginTop: '1rem', width: '100%' }}>Закрити</button>
            </div>
        </div>
    );
};