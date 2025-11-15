const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const nlpController = require('../controllers/nlpController');

const router = express.Router();

router.use(protect);

const validateKeywordArray = (value) => {
  if (!Array.isArray(value)) {
    throw new Error('Value must be an array.');
  }
  value.forEach((keyword) => {
    if (typeof keyword !== 'string' || !keyword.trim()) {
      throw new Error('Each keyword must be a non-empty string.');
    }
  });
  return true;
};

const validateCategoriesArray = (value) => {
  if (!Array.isArray(value)) {
    throw new Error('Categories must be an array.');
  }
  value.forEach((category, index) => {
    if (typeof category !== 'object' || category === null) {
      throw new Error(`Category at index ${index} must be an object.`);
    }
    if (typeof category.name !== 'string' || !category.name.trim()) {
      throw new Error(`Category at index ${index} requires a valid name.`);
    }
    if (category.type && !['expense', 'income'].includes(category.type)) {
      throw new Error(`Category at index ${index} has invalid type.`);
    }
    if (category.keywords) {
      validateKeywordArray(category.keywords);
    }
  });
  return true;
};

router.get(
  '/logs',
  authorize('admin'),
  [
    query('status').optional().isIn(['success', 'failed']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  nlpController.listLogs
);

router.patch(
  '/logs/:id',
  authorize('admin'),
  [
    param('id').isUUID(),
    body('is_success').optional().isBoolean(),
    body('feedback').optional().isString(),
    body('corrections').optional().isObject(),
  ],
  validate,
  nlpController.updateLog
);

router.post(
  '/logs/:id/reapply',
  authorize('admin'),
  [param('id').isUUID()],
  validate,
  nlpController.reapplyLog
);

router.get('/config', authorize('admin'), nlpController.getConfig);
router.put(
  '/config',
  authorize('admin'),
  [
    body('incomeKeywords').optional().custom(validateKeywordArray),
    body('expenseKeywords').optional().custom(validateKeywordArray),
    body('categories').optional().custom(validateCategoriesArray),
    body('confirm').optional().isBoolean(),
  ],
  validate,
  nlpController.updateConfig
);

router.post(
  '/parse',
  [body('text').isString().isLength({ min: 3 })],
  validate,
  nlpController.quickParse
);

router.post(
  '/ask',
  [body('text').isString().isLength({ min: 3 })],
  validate,
  nlpController.askSummary
);

module.exports = router;
