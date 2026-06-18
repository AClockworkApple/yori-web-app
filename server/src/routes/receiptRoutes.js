const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const { requireRole } = require('../middleware/auth');

router.get('/order/:orderId/generate', requireRole('OWNER', 'MANAGER', 'STAFF'), receiptController.generate);
router.post('/order/:orderId/save', requireRole('OWNER', 'MANAGER', 'STAFF'), receiptController.save);
router.get('/order/:orderId', requireRole('OWNER', 'MANAGER', 'STAFF'), receiptController.getByOrder);
router.get('/', requireRole('OWNER', 'MANAGER'), receiptController.getAll);
router.get('/:id', requireRole('OWNER', 'MANAGER', 'STAFF'), receiptController.getById);

module.exports = router;
