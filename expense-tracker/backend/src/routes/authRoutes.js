const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Nhập các quy tắc và middleware validation
const { registerRules, loginRules, validate } = require('../middleware/validation');

// Route POST /api/auth/register
router.post('/register', registerRules(), validate, authController.register);

// Route POST /api/auth/login
router.post('/login', loginRules(), validate, authController.login);

module.exports = router;