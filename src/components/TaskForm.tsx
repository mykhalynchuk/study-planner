import React, { useState } from 'react';
import type {Priority, Task} from '../types/task';

interface TaskFormProps {
    onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Назва завдання є обов\'язковою!');
            return;
        }

        onAddTask({
            title: title.trim(),
            description: description.trim(),
            category: category.trim() || 'Загальне',
            priority,
        });

        // Очищення форми
        setTitle('');
        setDescription('');
        setCategory('');
        setPriority('medium');
        setError('');
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <h2 className="task-form__title">Додати нове завдання</h2>

            <div className="task-form__field">
                <input
                    type="text"
                    placeholder="Назва завдання *"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setError(''); }}
                    className="task-form__input"
                />
                {error && <span className="task-form__error">{error}</span>}
            </div>

            <div className="task-form__field">
        <textarea
            placeholder="Опис завдання"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="task-form__input task-form__input--textarea"
        />
            </div>

            <div className="task-form__row">
                <input
                    type="text"
                    placeholder="Категорія"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="task-form__input"
                />
                <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="task-form__input"
                >
                    <option value="low">Низький пріоритет</option>
                    <option value="medium">Середній пріоритет</option>
                    <option value="high">Високий пріоритет</option>
                </select>
            </div>

            <button type="submit" className="task-form__button">Додати</button>
        </form>
    );
};