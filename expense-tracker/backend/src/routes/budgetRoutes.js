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
  validate([
    body('category_id').isUUID().withMessage('Valid category ID is required'),
    body('amount_limit').isDecimal({ decimal_digits: '2' }).withMessage('Amount limit must be a decimal'),
    body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
    body('start_date').isISO8601().withMessage('Invalid start date'),
  ]),
  budgetController.createBudget
);

// GET /api/budgets
router.get('/', budgetController.getUserBudgets);

// GET /api/budgets/:id
router.get(
  '/:id',
  validate([param('id').isUUID()]),
  budgetController.getBudgetById
);

// PUT /api/budgets/:id
router.put(
  '/:id',
  validate([
    param('id').isUUID(),
    body('amount_limit').optional().isDecimal(),
  ]),
  budgetController.updateBudget
);

// DELETE /api/budgets/:id
router.delete(
  '/:id',
  validate([param('id').isUUID()]),
  budgetController.deleteBudget
);

module.exports = router;
