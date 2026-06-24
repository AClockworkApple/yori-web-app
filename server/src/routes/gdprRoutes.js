const express = require('express');
const router = express.Router();
const gdprController = require('../controllers/gdprController');
const { requireRole } = require('../middleware/auth');

router.get('/lookup/:email', requireRole('OWNER', 'MANAGER'), gdprController.lookup);
router.delete('/erase/:email', requireRole('OWNER', 'MANAGER'), gdprController.erase);
router.get('/export/:email', requireRole('OWNER', 'MANAGER'), gdprController.exportData);

module.exports = router;
