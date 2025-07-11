import React from 'react';
import { Button } from '~/components/ui/Button';
import { Filter, X } from 'lucide-react';
import { cn } from '~/utils';

type TodoStatus = 'all' | 'pending' | 'in_progress' | 'completed';

interface TodoFiltersProps {
  currentFilter: TodoStatus;
  onFilterChange: (filter: TodoStatus) => void;
  todoCounts: {
    all: number;
    pending: number;
    in_progress: number;
    completed: number;
  };
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  currentFilter,
  onFilterChange,
  todoCounts,
}) => {
  const filterOptions = [
    { key: 'all' as TodoStatus, label: 'All', count: todoCounts.all },
    { key: 'pending' as TodoStatus, label: 'Pending', count: todoCounts.pending },
    { key: 'in_progress' as TodoStatus, label: 'In Progress', count: todoCounts.in_progress },
    { key: 'completed' as TodoStatus, label: 'Completed', count: todoCounts.completed },
  ];

  const getFilterButtonClass = (filterKey: TodoStatus) => {
    const isActive = currentFilter === filterKey;
    const baseClass = "text-sm px-3 py-2 rounded-lg transition-colors border";
    
    if (isActive) {
      switch (filterKey) {
        case 'pending':
          return cn(baseClass, "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700");
        case 'in_progress':
          return cn(baseClass, "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700");
        case 'completed':
          return cn(baseClass, "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700");
        default:
          return cn(baseClass, "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600");
      }
    }
    
    return cn(baseClass, "text-gray-600 hover:bg-gray-50 border-transparent dark:text-gray-300 dark:hover:bg-gray-700");
  };

  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.key}
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(option.key)}
            className={getFilterButtonClass(option.key)}
          >
            <span className="flex items-center gap-2">
              {option.label}
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-gray-800/70 min-w-[20px] text-center">
                {option.count}
              </span>
            </span>
          </Button>
        ))}
      </div>
      
      {currentFilter !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange('all')}
          className="text-gray-500 hover:text-gray-700 px-2 dark:text-gray-400 dark:hover:text-gray-200"
          title="Clear filter"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default TodoFilters;
