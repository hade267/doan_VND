const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.use(protect);

router.get('/summary', reportController.getSummary);

module.exports = router;
