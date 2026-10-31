import React from 'react';

export type FilterType = 'all' | 'completed' | 'uncompleted';

interface TaskFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ currentFilter, onFilterChange }) => {
    return (
        <div className="filters">
            <button
                className={`filters__btn ${currentFilter === 'all' ? 'filters__btn--active' : ''}`}
                onClick={() => onFilterChange('all')}
            >Всі</button>
            <button
                className={`filters__btn ${currentFilter === 'uncompleted' ? 'filters__btn--active' : ''}`}
                onClick={() => onFilterChange('uncompleted')}
            >Не виконані</button>
            <button
                className={`filters__btn ${currentFilter === 'completed' ? 'filters__btn--active' : ''}`}
                onClick={() => onFilterChange('completed')}
            >Виконані</button>
        </div>
    );
};