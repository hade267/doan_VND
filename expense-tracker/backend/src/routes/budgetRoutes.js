const express = require('express');
const budgetController = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param } = require('express-validator');

const router = express.Router();

router.use(protect);

// POST /api/budgets
router.post(
  '/',
  [
    body('category_id').isUUID().withMessage('Valid category ID is required'),
    body('amount_limit')
      .isDecimal()
      .withMessage('Amount limit must be a decimal number.')
      .custom((value) => Number(value) > 0)
      .withMessage('Amount limit must be greater than 0.'),
    body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validate,
  budgetController.createBudget
);

// GET /api/budgets
router.get('/', budgetController.getUserBudgets);

// GET /api/budgets/:id
router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  budgetController.getBudgetById
);

// PUT /api/budgets/:id
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('amount_limit')
      .optional()
      .isDecimal()
      .withMessage('Amount limit must be a decimal number.')
      .custom((value) => (value === undefined ? true : Number(value) > 0))
      .withMessage('Amount limit must be greater than 0.'),
    body('period').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    body('start_date').optional().isISO8601().withMessage('Invalid start date'),
    body('end_date').optional().isISO8601().withMessage('Invalid end date'),
    body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  ],
  validate,
  budgetController.updateBudget
);

// DELETE /api/budgets/:id
router.delete(
  '/:id',
  [param('id').isUUID()],
  validate,
  budgetController.deleteBudget
);

module.exports = router;
