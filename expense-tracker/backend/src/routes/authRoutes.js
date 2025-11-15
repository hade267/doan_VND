const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerRules(), validate, authController.register);
router.post('/login', loginRules(), validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', protect, authController.logoutAll);

module.exports = router;
