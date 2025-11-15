const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validation');

const router = express.Router();

const sanitizeEmptyQuery = (req, res, next) => {
  if (req?.query) {
    Object.keys(req.query).forEach((key) => {
      if (req.query[key] === '') {
        delete req.query[key];
      }
    });
  }
  next();
};

router.use(protect, authorize('admin'), sanitizeEmptyQuery);

router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional({ checkFalsy: true }).isIn(['user', 'admin']),
    query('status').optional({ checkFalsy: true }).isIn(['active', 'inactive']),
  ],
  validate,
  adminController.listUsers
);

router.patch(
  '/users/:id',
  [
    param('id').isUUID(),
    body('role').optional().isIn(['user', 'admin']),
    body('is_active').optional().isBoolean(),
  ],
  validate,
  adminController.updateUser
);

router.get('/stats', adminController.getStats);
router.get(
  '/audit-logs',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 200 }),
    query('userId').optional().isUUID(),
    query('action').optional().isLength({ min: 2, max: 120 }),
  ],
  validate,
  adminController.listAuditLogs,
);

module.exports = router;
