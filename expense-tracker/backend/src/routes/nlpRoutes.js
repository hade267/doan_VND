const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const nlpController = require('../controllers/nlpController');

const router = express.Router();

router.use(protect);

router.get(
  '/logs',
  [query('status').optional().isIn(['success', 'failed'])],
  nlpController.listLogs
);

router.patch(
  '/logs/:id',
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
  [param('id').isUUID()],
  validate,
  nlpController.reapplyLog
);

router.get('/config', nlpController.getConfig);
router.put(
  '/config',
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

module.exports = router;
