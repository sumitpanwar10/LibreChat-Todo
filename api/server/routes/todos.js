const express = require('express');
const { logger } = require('@librechat/data-schemas');
const {
  getTodosController,
  getTodoController,
  createTodoController,
  updateTodoController,
  deleteTodoController,
  toggleTodoStatusController,
} = require('~/server/controllers/TodoController');
const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

// Custom authentication middleware for todos that returns JSON errors
const todoAuthMiddleware = (req, res, next) => {
  requireJwtAuth(req, res, (err) => {
    if (err) {
      logger.warn('[todoAuthMiddleware] Authentication error:', err.message);
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
    }
    
    if (!req.user) {
      logger.warn('[todoAuthMiddleware] No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'UNAUTHORIZED',
      });
    }
    
    next();
  });
};

// Request logging middleware for debugging
router.use((req, res, next) => {
  logger.debug(`[TODO API] ${req.method} ${req.url} - User: ${req.user?.id || 'Anonymous'}`);
  next();
});

// All todo routes require authentication
router.use(todoAuthMiddleware);

/**
 * @route GET /api/todos
 * @desc Get all todos for the authenticated user
 * @query {string} [status] - Filter by status (pending, in_progress, completed)
 * @query {number} [limit=50] - Limit number of results
 * @query {number} [skip=0] - Skip number of results
 * @access Private
 */
router.get('/', getTodosController);

/**
 * @route POST /api/todos
 * @desc Create a new todo
 * @body {string} title - Todo title (required)
 * @body {string} [description] - Todo description
 * @body {string} [status=pending] - Todo status
 * @access Private
 */
router.post('/', createTodoController);

/**
 * @route GET /api/todos/:id
 * @desc Get a specific todo by ID
 * @param {string} id - Todo ID
 * @access Private
 */
router.get('/:id', getTodoController);

/**
 * @route PUT /api/todos/:id
 * @desc Update a todo
 * @param {string} id - Todo ID
 * @body {string} [title] - Todo title
 * @body {string} [description] - Todo description
 * @body {string} [status] - Todo status
 * @access Private
 */
router.put('/:id', updateTodoController);

/**
 * @route DELETE /api/todos/:id
 * @desc Delete a todo
 * @param {string} id - Todo ID
 * @access Private
 */
router.delete('/:id', deleteTodoController);

/**
 * @route PATCH /api/todos/:id/toggle
 * @desc Toggle todo status (pending -> in_progress -> completed -> pending)
 * @param {string} id - Todo ID
 * @access Private
 */
router.patch('/:id/toggle', toggleTodoStatusController);

module.exports = router;
