import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Textarea } from '~/components/ui/Textarea';
import { Label } from '~/components/ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/Dialog';
import { Play, Pause, CheckCircle } from 'lucide-react';
import { cn } from '~/utils';
import type { Todo } from './TodoItem';

interface TodoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (todoData: Partial<Todo>) => void;
  editingTodo?: Todo | null;
  isLoading?: boolean;
}

const statusOptions = [
  {
    value: 'pending' as const,
    label: 'Pending',
    icon: <Play className="w-4 h-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700'
  },
  {
    value: 'in_progress' as const,
    label: 'In Progress',
    icon: <Pause className="w-4 h-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
  },
  {
    value: 'completed' as const,
    label: 'Completed',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
  }
];

const TodoForm: React.FC<TodoFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTodo,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setStatus(editingTodo.status);
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
    }
    setErrors({});
  }, [editingTodo, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length > 255) {
      newErrors.title = 'Title must be 255 characters or less';
    }

    if (description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const todoData: Partial<Todo> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
    };

    onSubmit(todoData);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('pending');
    setErrors({});
    onClose();
  };

  const currentStatusOption = statusOptions.find(option => option.value === status);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] mx-auto max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold">
              {editingTodo ? 'Edit Todo' : 'Create New Todo'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter todo title..."
                className={cn(
                  "w-full",
                  errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                )}
                maxLength={255}
                autoFocus
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter todo description (optional)..."
                className={cn(
                  "w-full resize-none",
                  errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                )}
                rows={4}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {description.length}/1000 characters
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Status</Label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      status === option.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                        : "border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value as 'pending' | 'in_progress' | 'completed')}
                      className="sr-only"
                    />
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium",
                      option.color
                    )}>
                      {option.icon}
                      {option.label}
                    </div>
                    {status === option.value && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6"
              >
                {isLoading ? 'Saving...' : (editingTodo ? 'Update Todo' : 'Create Todo')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TodoForm;
