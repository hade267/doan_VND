const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { query } = require('express-validator');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.use(protect);

router.get(
  '/summary',
  [
    query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO date'),
  ],
  validate,
  reportController.getSummary,
);

module.exports = router;
