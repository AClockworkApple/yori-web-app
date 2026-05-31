const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.create);
router.get('/', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getAll);
router.get('/:id', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getById);
router.get('/restaurant/:restaurantId', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getByRestaurant);
router.get('/booking/:bookingId', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getByBooking);
router.get('/restaurant/:restaurantId/date/:date', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getByDate);
router.put('/:id', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.update);
router.post('/:id/items', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.addItem);
router.get('/:orderId/items', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getItems);
router.put('/:orderId/items/:itemId', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.updateItem);
router.delete('/:orderId/items/:itemId', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.removeItem);
router.patch('/:id/tip', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.updateTip);
router.post('/:id/payment', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.processPayment);
router.get('/:id/payments', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getPayments);
router.patch('/:id/close', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.closeOrder);
router.patch('/:id/split', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.splitOrder);
router.get('/:orderId/split-groups', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.getSplitGroups);
router.get('/:id/calculate', requireRole('OWNER', 'MANAGER', 'STAFF'), orderController.calculateTotals);
router.delete('/:id', requireRole('OWNER', 'MANAGER'), orderController.delete);

module.exports = router;