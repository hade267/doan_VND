const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const nlpController = require('../controllers/nlpController');

const router = express.Router();

router.use(protect);

router.get(
  '/logs',
  authorize('admin'),
  [query('status').optional().isIn(['success', 'failed'])],
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
    body('incomeKeywords').optional().isArray(),
    body('expenseKeywords').optional().isArray(),
    body('categories').optional().isArray(),
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
