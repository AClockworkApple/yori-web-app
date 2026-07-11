const express = require('express');
const router = express.Router();
const { getReconciliation, createReconciliation, updateReconciliation, reconcileDay, getReconciliationHistory } = require('../controllers/reconciliationController');
const { requireRole } = require('../middleware/auth');

router.get('/history/:restaurantId', requireRole('OWNER', 'MANAGER'), getReconciliationHistory);
router.get('/:restaurantId/:date', requireRole('OWNER', 'MANAGER', 'STAFF'), getReconciliation);
router.post('/', requireRole('OWNER', 'MANAGER'), createReconciliation);
router.put('/:id', requireRole('OWNER', 'MANAGER'), updateReconciliation);
router.patch('/:id/reconcile', requireRole('OWNER', 'MANAGER'), reconcileDay);

module.exports = router;
