import React from 'react';
import { TodoList } from '~/components/Todos';

const TodoRoute: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-auto">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading todos...</p>
            </div>
          </div>
        }>
          <TodoList />
        </React.Suspense>
      </div>
    </div>
  );
};

export default TodoRoute;
