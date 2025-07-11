import type * as t from '~/types';
import todoSchema from '~/schema/todo';

/**
 * Creates or returns the Todo model using the provided mongoose instance and schema
 */
export function createTodoModel(mongoose: typeof import('mongoose')) {
  return mongoose.models.Todo || mongoose.model<t.ITodo>('Todo', todoSchema);
}
