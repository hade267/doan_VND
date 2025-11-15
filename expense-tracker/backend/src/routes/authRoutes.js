const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerRules, loginRules, validate } = require('../middleware/validation');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerRules(), validate, authController.register);
router.post('/login', loginRules(), validate, authController.login);
router.post('/verify-2fa', authController.verifyTwoFactor);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', protect, authController.logoutAll);
router.post('/2fa/setup', protect, authController.initiateTwoFactorSetup);
router.post('/2fa/enable', protect, authController.enableTwoFactor);
router.post('/2fa/disable', protect, authController.disableTwoFactor);

module.exports = router;
