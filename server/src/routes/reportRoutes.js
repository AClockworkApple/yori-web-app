const express = require('express');
const router = express.Router();
const { getDailyReport } = require('../controllers/reportController');
const { requireRole } = require('../middleware/auth');

router.get('/daily/:restaurantId/:date', requireRole('OWNER', 'MANAGER', 'STAFF'), getDailyReport);

module.exports = router;
