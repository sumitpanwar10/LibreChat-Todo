const { z } = require('zod');
const { logger } = require('@librechat/data-schemas');
const { Todo } = require('~/db/models');

const todoStatusSchema = z.enum(['pending', 'in_progress', 'completed']);

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  description: z.string().max(1000, 'Description must be 1000 characters or less').optional(),
  status: todoStatusSchema,
  user: z.string().min(1, 'User is required'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Creates a new TODO item
 * 
 * @param {Object} req - Express request object
 * @param {Object} todoData - TODO data object
 * @param {string} todoData.title - TODO title
 * @param {string} [todoData.description] - TODO description
 * @param {string} [todoData.status] - TODO status (defaults to 'pending')
 * @returns {Promise<Object>} The created TODO item
 */
async function createTodo(req, todoData) {
  try {
    if (!req?.user?.id) {
      throw new Error('User not authenticated');
    }

    const validatedData = todoSchema.parse({
      ...todoData,
      user: req.user.id,
      status: todoData.status || 'pending',
    });

    const todo = new Todo(validatedData);
    const savedTodo = await todo.save();

    logger.info(`[createTodo] Todo created: ${savedTodo._id} by user: ${req.user.id}`);
    return savedTodo;
  } catch (error) {
    logger.error('[createTodo] Error creating todo:', error);
    throw error;
  }
}

/**
 * Gets all TODO items for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} query - Query parameters
 * @param {string} [query.status] - Filter by status
 * @param {number} [query.limit] - Limit number of results
 * @param {number} [query.skip] - Skip number of results
 * @returns {Promise<Array>} Array of TODO items
 */
async function getTodos(req, query = {}) {
  try {
    if (!req?.user?.id) {
      throw new Error('User not authenticated');
    }

    const { status, limit = 50, skip = 0 } = query;
    const filter = { user: req.user.id };

    if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
      filter.status = status;
    }

    const todos = await Todo.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    return todos;
  } catch (error) {
    logger.error('[getTodos] Error getting todos:', error);
    throw error;
  }
}

/**
 * Gets a specific TODO item by ID
 * 
 * @param {Object} req - Express request object
 * @param {string} todoId - TODO ID
 * @returns {Promise<Object>} The TODO item
 */
async function getTodo(req, todoId) {
  try {
    if (!req?.user?.id) {
      throw new Error('User not authenticated');
    }

    const todo = await Todo.findOne({
      _id: todoId,
      user: req.user.id,
    }).lean();

    if (!todo) {
      throw new Error('Todo not found');
    }

    return todo;
  } catch (error) {
    logger.error('[getTodo] Error getting todo:', error);
    throw error;
  }
}

/**
 * Updates a TODO item
 * 
 * @param {Object} req - Express request object
 * @param {string} todoId - TODO ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} The updated TODO item
 */
async function updateTodo(req, todoId, updateData) {
  try {
    if (!req?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Validate the update data
    const validatedData = todoSchema.partial().parse({
      ...updateData,
      user: req.user.id,
    });

    const todo = await Todo.findOneAndUpdate(
      {
        _id: todoId,
        user: req.user.id,
      },
      {
        ...validatedData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!todo) {
      throw new Error('Todo not found');
    }

    logger.info(`[updateTodo] Todo updated: ${todoId} by user: ${req.user.id}`);
    return todo;
  } catch (error) {
    logger.error('[updateTodo] Error updating todo:', error);
    throw error;
  }
}

/**
 * Deletes a TODO item
 * 
 * @param {Object} req - Express request object
 * @param {string} todoId - TODO ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteTodo(req, todoId) {
  try {
    if (!req?.user?.id) {
      throw new Error('User not authenticated');
    }

    const result = await Todo.deleteOne({
      _id: todoId,
      user: req.user.id,
    });

    if (result.deletedCount === 0) {
      throw new Error('Todo not found');
    }

    logger.info(`[deleteTodo] Todo deleted: ${todoId} by user: ${req.user.id}`);
    return true;
  } catch (error) {
    logger.error('[deleteTodo] Error deleting todo:', error);
    throw error;
  }
}

/**
 * Toggles the status of a TODO item
 * 
 * @param {Object} req - Express request object
 * @param {string} todoId - TODO ID
 * @returns {Promise<Object>} The updated TODO item
 */
async function toggleTodoStatus(req, todoId) {
  try {
    if (!req?.user?.id) {
      throw new Error('User not authenticated');
    }

    const todo = await Todo.findOne({
      _id: todoId,
      user: req.user.id,
    });

    if (!todo) {
      throw new Error('Todo not found');
    }

    // Toggle status logic
    let newStatus;
    switch (todo.status) {
      case 'pending':
        newStatus = 'in_progress';
        break;
      case 'in_progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'pending';
        break;
      default:
        newStatus = 'pending';
    }

    const updatedTodo = await Todo.findOneAndUpdate(
      {
        _id: todoId,
        user: req.user.id,
      },
      {
        status: newStatus,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).lean();

    logger.info(`[toggleTodoStatus] Todo status toggled: ${todoId} to ${newStatus} by user: ${req.user.id}`);
    return updatedTodo;
  } catch (error) {
    logger.error('[toggleTodoStatus] Error toggling todo status:', error);
    throw error;
  }
}

module.exports = {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
  todoSchema,
  todoStatusSchema,
};
