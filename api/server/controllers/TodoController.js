const { logger } = require('@librechat/data-schemas');
const {
  createTodo,
  getTodos,
  getTodo,
  updateTodo,
  deleteTodo,
  toggleTodoStatus,
} = require('~/models');

/**
 * Controller to get all todos for the authenticated user
 */
const getTodosController = async (req, res) => {
  try {
    const { status, limit, skip } = req.query;
    const todos = await getTodos(req, { status, limit, skip });
    
    res.status(200).json({
      success: true,
      data: todos,
      count: todos.length,
    });
  } catch (error) {
    logger.error('[getTodosController] Error retrieving todos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve todos',
    });
  }
};

/**
 * Controller to get a specific todo by ID
 */
const getTodoController = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await getTodo(req, id);
    
    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    logger.error('[getTodoController] Error retrieving todo:', error);
    const statusCode = error.message === 'Todo not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve todo',
    });
  }
};

/**
 * Controller to create a new todo
 */
const createTodoController = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const todoData = {
      title: title.trim(),
      description: description?.trim(),
      status: status || 'pending',
    };

    const todo = await createTodo(req, todoData);
    
    logger.info(`[createTodoController] Todo created successfully for user: ${req.user.id}`);
    res.status(201).json({
      success: true,
      data: todo,
      message: 'Todo created successfully',
    });
  } catch (error) {
    logger.error('[createTodoController] Error creating todo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create todo',
    });
  }
};

/**
 * Controller to update an existing todo
 */
const updateTodoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    
    const updateData = {};
    
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      updateData.title = title.trim();
    }
    
    if (description !== undefined) {
      updateData.description = description?.trim();
    }
    
    if (status !== undefined) {
      if (!['pending', 'in_progress', 'completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, in_progress, completed',
        });
      }
      updateData.status = status;
    }

    const todo = await updateTodo(req, id, updateData);
    
    logger.info(`[updateTodoController] Todo ${id} updated successfully for user: ${req.user.id}`);
    res.status(200).json({
      success: true,
      data: todo,
      message: 'Todo updated successfully',
    });
  } catch (error) {
    logger.error('[updateTodoController] Error updating todo:', error);
    const statusCode = error.message === 'Todo not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update todo',
    });
  }
};

/**
 * Controller to delete a todo
 */
const deleteTodoController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTodo(req, id);
    
    logger.info(`[deleteTodoController] Todo ${id} deleted successfully for user: ${req.user.id}`);
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    logger.error('[deleteTodoController] Error deleting todo:', error);
    const statusCode = error.message === 'Todo not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete todo',
    });
  }
};

/**
 * Controller to toggle todo status (pending -> in_progress -> completed -> pending)
 */
const toggleTodoStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await toggleTodoStatus(req, id);
    
    logger.info(`[toggleTodoStatusController] Todo ${id} status changed to ${todo.status} for user: ${req.user.id}`);
    res.status(200).json({
      success: true,
      data: todo,
      message: `Todo status changed to ${todo.status}`,
    });
  } catch (error) {
    logger.error('[toggleTodoStatusController] Error toggling todo status:', error);
    const statusCode = error.message === 'Todo not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to toggle todo status',
    });
  }
};

module.exports = {
  getTodosController,
  getTodoController,
  createTodoController,
  updateTodoController,
  deleteTodoController,
  toggleTodoStatusController,
};
