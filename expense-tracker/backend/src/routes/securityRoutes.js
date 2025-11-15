const express = require('express');
const { attachCsrfToken } = require('../middleware/csrfMiddleware');

const router = express.Router();

router.get('/csrf-token', attachCsrfToken);

module.exports = router;
