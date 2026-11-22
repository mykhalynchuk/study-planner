import React, { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';
import './TaskFormDialog.scss';

export type TaskFormDialogProps = {
    open: boolean;
    mode: 'create' | 'edit';
    task?: Task;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
};

const EMPTY_VALUES: TaskFormData = {
    title: '',
    description: '',
    category: 'General',
    priority: 'medium',
};

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
                                                                  open,
                                                                  mode,
                                                                  task,
                                                                  onClose,
                                                                  onSubmit,
                                                              }) => {
    const titleId = useId();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: EMPTY_VALUES,
    });

    useEffect(() => {
        if (!open) return;

        previousFocusRef.current = document.activeElement as HTMLElement | null;
        setSubmitError(null);

        if (mode === 'edit' && task) {
            reset({
                title: task.title,
                description: task.description,
                category: task.category,
                priority: task.priority,
            });
        } else {
            reset(EMPTY_VALUES);
        }

        const frameId = requestAnimationFrame(() => {
            setFocus('title');
        });

        return () => {
            cancelAnimationFrame(frameId);
            previousFocusRef.current?.focus();
        };
    }, [open, mode, task, reset, setFocus]);

    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, isSubmitting, onClose]);

    if (!open) return null;

    const handleFormSubmit = async (data: TaskFormData) => {
        setSubmitError(null);
        try {
            await onSubmit(data);
            onClose();
        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : 'Не вдалося зберегти завдання. Спробуйте ще раз.'
            );
        }
    };

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget && !isSubmitting) {
            onClose();
        }
    };

    const isEditMode = mode === 'edit';

    return (
        <div className="task-dialog__backdrop" onClick={handleBackdropClick}>
            <div
                className="task-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="task-dialog__header">
                    <h2 id={titleId} className="task-dialog__title">
                        {isEditMode ? 'Редагувати завдання' : 'Нове завдання'}
                    </h2>
                    <button
                        type="button"
                        className="task-dialog__close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Закрити вікно"
                    >
                        ×
                    </button>
                </div>

                {submitError && (
                    <div className="task-dialog__alert" role="alert">
                        {submitError}
                    </div>
                )}

                <form
                    className="task-dialog__form"
                    onSubmit={handleSubmit(handleFormSubmit)}
                    noValidate
                >
                    <div className="task-dialog__field">
                        <label className="task-dialog__label" htmlFor="task-title">
                            Назва *
                        </label>
                        <input
                            id="task-title"
                            type="text"
                            placeholder="Наприклад: Підготуватися до захисту"
                            className={`task-dialog__input ${
                                errors.title ? 'task-dialog__input--error' : ''
                            }`}
                            {...register('title')}
                        />
                        {errors.title && (
                            <span className="task-dialog__error" role="alert">
                                {errors.title.message}
                            </span>
                        )}
                    </div>

                    <div className="task-dialog__field">
                        <label className="task-dialog__label" htmlFor="task-description">
                            Опис
                        </label>
                        <textarea
                            id="task-description"
                            rows={3}
                            placeholder="Деталі або нотатки до завдання"
                            className={`task-dialog__textarea ${
                                errors.description ? 'task-dialog__textarea--error' : ''
                            }`}
                            {...register('description')}
                        />
                        {errors.description && (
                            <span className="task-dialog__error" role="alert">
                                {errors.description.message}
                            </span>
                        )}
                    </div>

                    <div className="task-dialog__row">
                        <div className="task-dialog__field">
                            <label className="task-dialog__label" htmlFor="task-category">
                                Категорія *
                            </label>
                            <input
                                id="task-category"
                                type="text"
                                placeholder="General, Study, Work..."
                                className={`task-dialog__input ${
                                    errors.category ? 'task-dialog__input--error' : ''
                                }`}
                                {...register('category')}
                            />
                            {errors.category && (
                                <span className="task-dialog__error" role="alert">
                                    {errors.category.message}
                                </span>
                            )}
                        </div>

                        <div className="task-dialog__field">
                            <label className="task-dialog__label" htmlFor="task-priority">
                                Пріоритет
                            </label>
                            <select
                                id="task-priority"
                                className="task-dialog__select"
                                {...register('priority')}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="task-dialog__actions">
                        <button
                            type="button"
                            className="task-dialog__btn task-dialog__btn--cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="task-dialog__btn task-dialog__btn--submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Збереження...'
                                : isEditMode
                                    ? 'Зберегти зміни'
                                    : 'Створити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};