const express = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation');
const { body } = require('express-validator');

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  validate([
    body('username').notEmpty().withMessage('Username is required').isLength({ min: 3 }),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ]),
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

module.exports = router;
