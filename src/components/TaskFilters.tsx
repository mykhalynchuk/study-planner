import React from 'react';
import type { FilterType } from '../types/task';
import { useTaskContext } from '../hooks/useTaskContext';

export const TaskFilters: React.FC = () => {
    const { filter: currentFilter, setFilter: onFilterChange } = useTaskContext();

    const filterOptions: { value: FilterType; label: string }[] = [
        { value: 'all', label: 'Всі' },
        { value: 'uncompleted', label: 'Не виконані' },
        { value: 'completed', label: 'Виконані' },
    ];

    return (
        <div className="filters">
            {filterOptions.map((option) => (
                <button
                    key={option.value}
                    className={`filters__btn ${currentFilter === option.value ? 'filters__btn--active' : ''}`}
                    onClick={() => onFilterChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};