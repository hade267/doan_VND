const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param } = require('express-validator');

const router = express.Router();

// All routes are protected
router.use(protect);

// POST /api/categories - Create a new category
router.post(
  '/',
  validate([
    body('name').notEmpty().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be either "income" or "expense"'),
  ]),
  categoryController.createCategory
);

// GET /api/categories - Get all categories for the user
router.get('/', categoryController.getUserCategories);

// GET /api/categories/:id - Get a single category
router.get(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid category ID')]),
  categoryController.getCategoryById
);

// PUT /api/categories/:id - Update a category
router.put(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Invalid category ID'),
    body('name').notEmpty().withMessage('Category name is required'),
  ]),
  categoryController.updateCategory
);

// DELETE /api/categories/:id - Delete a category
router.delete(
  '/:id',
  validate([param('id').isUUID().withMessage('Invalid category ID')]),
  categoryController.deleteCategory
);

module.exports = router;
