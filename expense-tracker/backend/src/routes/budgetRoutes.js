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
    body('amount_limit').isDecimal({ decimal_digits: '2' }).withMessage('Amount limit must be a decimal'),
    body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
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
    body('amount_limit').optional().isDecimal(),
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
