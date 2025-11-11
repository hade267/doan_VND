const express = require('express');
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

const router = express.Router();

router.use(protect);

// POST /api/transactions
router.post(
  '/',
  [
    body('amount').isDecimal({ decimal_digits: '2' }).withMessage('Amount must be a decimal'),
    body('type').isIn(['income', 'expense']).withMessage('Invalid transaction type'),
    body('transaction_date').isISO8601().withMessage('Invalid date format'),
    body('category_id').optional().isUUID().withMessage('Invalid category ID'),
  ],
  validate,
  transactionController.createTransaction
);

router.post(
  '/nlp',
  [body('text').isString().isLength({ min: 3 }).withMessage('Text is required')],
  validate,
  transactionController.createTransactionFromNLP
);

// GET /api/transactions
router.get(
  '/',
  [
    query('type').optional().isIn(['income', 'expense']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1 }),
  ],
  validate,
  transactionController.getUserTransactions
);

// GET /api/transactions/:id
router.get(
  '/:id',
  [param('id').isUUID()],
  validate,
  transactionController.getTransactionById
);

// PUT /api/transactions/:id
router.put(
  '/:id',
  [
    param('id').isUUID(),
    body('amount').optional().isDecimal(),
    body('transaction_date').optional().isISO8601(),
  ],
  validate,
  transactionController.updateTransaction
);

// DELETE /api/transactions/:id
router.delete(
  '/:id',
  [param('id').isUUID()],
  validate,
  transactionController.deleteTransaction
);

module.exports = router;
