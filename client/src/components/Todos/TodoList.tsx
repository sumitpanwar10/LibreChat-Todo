import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '~/components/ui/Button';
import { Plus, ListTodo } from 'lucide-react';
import { useToastContext } from '~/Providers/ToastContext';
import { request } from 'librechat-data-provider';
import { logger } from '~/utils';
import TodoItem, { type Todo } from './TodoItem';
import TodoForm from './TodoForm';
import TodoFilters from './TodoFilters';

type TodoStatus = 'all' | 'pending' | 'in_progress' | 'completed';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Helper function to handle API errors properly
const handleApiError = (error: any): string => {
  logger.error('TODO API Error', error);
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.status === 401) {
    return 'Please log in to access your todos';
  }
  
  if (error?.response?.status === 403) {
    return 'You do not have permission to access this resource';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Custom API service for todos using LibreChat's request pattern
const todoService = {
  async getTodos(status?: string): Promise<ApiResponse<Todo[]>> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      logger.debug('TODO Service', `Fetching todos with params: ${params.toString()}`);
      const response = await request.get(`/api/todos?${params.toString()}`) as ApiResponse<Todo[]>;
      logger.debug('TODO Service', 'Todos fetched successfully', { count: response?.data?.length });
      return response;
    } catch (error) {
      logger.error('TODO Service', 'Error fetching todos:', error);
      throw new Error(handleApiError(error));
    }
  },

  async createTodo(todoData: Partial<Todo>): Promise<ApiResponse<Todo>> {
    try {
      logger.debug('TODO Service', 'Creating todo with data:', todoData);
      const response = await request.post('/api/todos', todoData);
      logger.debug('TODO Service', 'Todo created successfully:', response?.data);
      return response;
    } catch (error) {
      logger.error('TODO Service', 'Error creating todo:', error);
      throw new Error(handleApiError(error));
    }
  },

  async updateTodo(id: string, todoData: Partial<Todo>): Promise<ApiResponse<Todo>> {
    try {
      logger.debug('TODO Service', `Updating todo ${id} with data:`, todoData);
      const response = await request.put(`/api/todos/${id}`, todoData);
      logger.debug('TODO Service', 'Todo updated successfully:', response?.data);
      return response;
    } catch (error) {
      logger.error('TODO Service', 'Error updating todo:', error);
      throw new Error(handleApiError(error));
    }
  },

  async deleteTodo(id: string): Promise<ApiResponse<null>> {
    try {
      logger.debug('TODO Service', `Deleting todo: ${id}`);
      const response = await request.delete(`/api/todos/${id}`) as ApiResponse<null>;
      logger.debug('TODO Service', 'Todo deleted successfully');
      return response;
    } catch (error) {
      logger.error('TODO Service', 'Error deleting todo:', error);
      throw new Error(handleApiError(error));
    }
  },

  async toggleTodoStatus(id: string): Promise<ApiResponse<Todo>> {
    try {
      logger.debug('TODO Service', `Toggling status for todo: ${id}`);
      const response = await request.patch(`/api/todos/${id}/toggle`);
      logger.debug('TODO Service', 'Todo status toggled successfully:', response?.data);
      return response;
    } catch (error) {
      logger.error('TODO Service', 'Error toggling todo status:', error);
      throw new Error(handleApiError(error));
    }
  },
};

const TodoList: React.FC = () => {
  const [currentFilter, setCurrentFilter] = useState<TodoStatus>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  
  // Fetch todos with proper error handling
  const { data: todosResponse, isLoading, error } = useQuery({
    queryKey: ['todos', currentFilter],
    queryFn: () => todoService.getTodos(currentFilter === 'all' ? undefined : currentFilter),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('log in') || error?.message?.includes('permission')) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error: Error) => {
      logger.error('TODO Query', 'Query error:', error);
      showToast({ 
        message: error.message, 
        severity: 'error' as any
      });
    },
  });
  
  const todos = todosResponse?.data || [];
  
  // Calculate counts for filters
  const todoCounts = {
    all: todos.length,
    pending: todos.filter(todo => todo.status === 'pending').length,
    in_progress: todos.filter(todo => todo.status === 'in_progress').length,
    completed: todos.filter(todo => todo.status === 'completed').length,
  };
  
  // Create todo mutation
  const createMutation = useMutation({
    mutationFn: todoService.createTodo,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsFormOpen(false);
      logger.info('TODO Mutation', 'Todo created successfully');
      showToast({ message: response.message || 'Todo created successfully', severity: 'success' as any });
    },
    onError: (error: Error) => {
      logger.error('TODO Mutation', 'Create error:', error);
      showToast({ message: error.message, severity: 'error' as any });
    },
  });
  
  // Update todo mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...todoData }: Partial<Todo> & { id: string }) => 
      todoService.updateTodo(id, todoData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsFormOpen(false);
      setEditingTodo(null);
      logger.info('TODO Mutation', 'Todo updated successfully');
      showToast({ message: response.message || 'Todo updated successfully', severity: 'success' as any });
    },
    onError: (error: Error) => {
      logger.error('TODO Mutation', 'Update error:', error);
      showToast({ message: error.message, severity: 'error' as any });
    },
  });
  
  // Delete todo mutation
  const deleteMutation = useMutation({
    mutationFn: todoService.deleteTodo,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      logger.info('TODO Mutation', 'Todo deleted successfully');
      showToast({ message: response.message || 'Todo deleted successfully', severity: 'success' as any });
    },
    onError: (error: Error) => {
      logger.error('TODO Mutation', 'Delete error:', error);
      showToast({ message: error.message, severity: 'error' as any });
    },
  });
  
  // Toggle status mutation
  const toggleMutation = useMutation({
    mutationFn: todoService.toggleTodoStatus,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      logger.info('TODO Mutation', 'Todo status toggled successfully');
      showToast({ message: response.message || 'Todo status updated', severity: 'success' as any });
    },
    onError: (error: Error) => {
      logger.error('TODO Mutation', 'Toggle error:', error);
      showToast({ message: error.message, severity: 'error' as any });
    },
  });
  
  const handleCreateTodo = () => {
    setEditingTodo(null);
    setIsFormOpen(true);
  };
  
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsFormOpen(true);
  };
  
  const handleFormSubmit = (todoData: Partial<Todo>) => {
    try {
      if (editingTodo) {
        updateMutation.mutate({ id: editingTodo._id, ...todoData });
      } else {
        createMutation.mutate(todoData);
      }
    } catch (error) {
      logger.error('TODO Form', 'Submit error:', error);
      showToast({ message: 'Failed to submit todo', severity: 'error' as any });
    }
  };
  
  const handleDeleteTodo = (id: string) => {
    if (window.confirm('Are you sure you want to delete this todo?')) {
      deleteMutation.mutate(id);
    }
  };
  
  const handleToggleStatus = (id: string) => {
    toggleMutation.mutate(id);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTodo(null);
  };
  
  // Error boundary for the component
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <div className="text-red-500 mb-4">
          <ListTodo className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-medium">Error Loading Todos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Something went wrong while loading your todos.'}
          </p>
          {error instanceof Error && error.message.includes('log in') && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <a href="/login" className="underline">Click here to log in</a>
            </p>
          )}
        </div>
        <Button onClick={() => {
          queryClient.invalidateQueries({ queryKey: ['todos'] });
          window.location.reload();
        }}>
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTodo className="w-7 h-7" />
            My Todos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and stay organized
          </p>
        </div>
        <Button onClick={handleCreateTodo} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Todo
        </Button>
      </div>
      
      {/* Filters */}
      <TodoFilters
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        todoCounts={todoCounts}
      />
      
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      )}
      
      {/* Todo List */}
      {!isLoading && (
        <div className="space-y-4">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <ListTodo className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                {currentFilter === 'all' ? 'No todos yet' : `No ${currentFilter.replace('_', ' ')} todos`}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 mb-4">
                {currentFilter === 'all' 
                  ? 'Create your first todo to get started!' 
                  : `You don't have any ${currentFilter.replace('_', ' ')} todos.`
                }
              </p>
              {currentFilter === 'all' && (
                <Button onClick={handleCreateTodo} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Todo
                </Button>
              )}
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
                onToggleStatus={handleToggleStatus}
              />
            ))
          )}
        </div>
      )}
      
      {/* Todo Form Modal */}
      <TodoForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingTodo={editingTodo}
        isLoading={createMutation.isLoading || updateMutation.isLoading}
      />
    </div>
  );
};

export default TodoList;
