const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('OWNER', 'MANAGER'), auditLogController.getAll);
router.get('/user/:userId', requireRole('OWNER', 'MANAGER'), auditLogController.getByUser);
router.get('/resource/:resource/:resourceId', requireRole('OWNER', 'MANAGER'), auditLogController.getByResource);

module.exports = router;
