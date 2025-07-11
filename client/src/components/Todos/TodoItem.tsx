import React from 'react';
import { Button } from '~/components/ui/Button';
import { Trash2, Edit, Play, Pause, CheckCircle } from 'lucide-react';
import { cn } from '~/utils';

// Utility function to format date and time in 12-hour format
const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

const getStatusIcon = (status: Todo['status']) => {
  switch (status) {
    case 'pending':
      return <Play className="w-4 h-4" />;
    case 'in_progress':
      return <Pause className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return <Play className="w-4 h-4" />;
  }
};

const getStatusColor = (status: Todo['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
  }
};

const formatStatus = (status: Todo['status']) => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return 'Unknown';
  }
};

const getNextStatusText = (status: Todo['status']) => {
  switch (status) {
    case 'pending':
      return 'Mark as In Progress';
    case 'in_progress':
      return 'Mark as Completed';
    case 'completed':
      return 'Mark as Pending';
    default:
      return 'Change Status';
  }
};

const TodoItem: React.FC<TodoItemProps> = ({ todo, onEdit, onDelete, onToggleStatus }) => {
  const handleToggleStatus = () => {
    onToggleStatus(todo._id);
  };

  const handleEdit = () => {
    onEdit(todo);
  };

  const handleDelete = () => {
    onDelete(todo._id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={cn(
              "text-lg font-medium truncate dark:text-white",
              todo.status === 'completed' && "line-through text-gray-500 dark:text-gray-400"
            )}>
              {todo.title}
            </h3>
            
            {/* Enhanced Status Badge - More Visible */}
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "text-xs px-3 py-1.5 rounded-md border transition-all duration-200 cursor-pointer",
                  "hover:scale-105 hover:shadow-sm active:scale-95",
                  getStatusColor(todo.status)
                )}
                onClick={handleToggleStatus}
                title={getNextStatusText(todo.status)}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  {getStatusIcon(todo.status)}
                  {formatStatus(todo.status)}
                </span>
              </div>
            </div>
          </div>
          
          {todo.description && (
            <p className={cn(
              "text-gray-600 text-sm mb-3 dark:text-gray-300",
              "overflow-hidden",
              todo.status === 'completed' && "line-through text-gray-400 dark:text-gray-500"
            )}>
              {todo.description.length > 100 
                ? `${todo.description.substring(0, 100)}...` 
                : todo.description
              }
            </p>
          )}
          
          <div className="text-xs text-gray-400 dark:text-gray-500">
            <span>Created: {formatDateTime(todo.createdAt)}</span>
            {todo.updatedAt !== todo.createdAt && (
              <span className="ml-3">Updated: {formatDateTime(todo.updatedAt)}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            className="h-8 w-8 p-0"
            title="Edit todo"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete todo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;