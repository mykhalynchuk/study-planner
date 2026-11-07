import React from 'react';

export type FilterType = 'all' | 'completed' | 'uncompleted';

interface TaskFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ currentFilter, onFilterChange }) => {

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