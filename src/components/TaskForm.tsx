import React, { useState, useEffect } from 'react';
import type { Priority } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';

export const TaskForm: React.FC = () => {
    const { addTask, updateTask, editingTask, setEditingTask, clearCompleted, resetTasks } = useTaskContext();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description);
            setCategory(editingTask.category);
            setPriority(editingTask.priority);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [editingTask]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Назва обов\'язкова!'); return; }

        const taskData = { title: title.trim(), description: description.trim(), category: category.trim() || 'Загальне', priority };
        editingTask ? updateTask({ ...editingTask, ...taskData }) : addTask(taskData);

        setTitle(''); setDescription(''); setCategory(''); setPriority('medium'); setError('');
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <form className="task-form" onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
                <h2 className="task-form__title">{editingTask ? 'Редагувати завдання' : 'Додати нове завдання'}</h2>
                <div className="task-form__field">
                    <input type="text" placeholder="Назва завдання *" value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} className="task-form__input" />
                    {error && <span className="task-form__error">{error}</span>}
                </div>
                <div className="task-form__field">
                    <textarea placeholder="Опис" value={description} onChange={(e) => setDescription(e.target.value)} className="task-form__input task-form__input--textarea" />
                </div>
                <div className="task-form__row">
                    <input type="text" placeholder="Категорія" value={category} onChange={(e) => setCategory(e.target.value)} className="task-form__input" />
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="task-form__input">
                        <option value="low">Низький пріоритет</option>
                        <option value="medium">Середній пріоритет</option>
                        <option value="high">Високий пріоритет</option>
                    </select>
                </div>
                <div className="task-form__actions">
                    <button type="submit" className="task-form__button">{editingTask ? 'Зберегти' : 'Додати'}</button>
                    {editingTask && <button type="button" className="task-form__button task-form__button--cancel" onClick={() => { setEditingTask(null); setTitle(''); setDescription(''); }}>Скасувати</button>}
                </div>
            </form>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="filters__btn" onClick={clearCompleted}>Очистити виконані</button>
                <button className="filters__btn filters__btn--active" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={resetTasks}>Скинути дані</button>
            </div>
        </div>
    );
};