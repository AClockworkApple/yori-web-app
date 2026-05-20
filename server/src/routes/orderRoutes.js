const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.create);
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.get('/restaurant/:restaurantId', orderController.getByRestaurant);
router.get('/booking/:bookingId', orderController.getByBooking);
router.get('/restaurant/:restaurantId/date/:date', orderController.getByDate);
router.put('/:id', orderController.update);
router.post('/:id/items', orderController.addItem);
router.get('/:orderId/items', orderController.getItems);
router.put('/:orderId/items/:itemId', orderController.updateItem);
router.delete('/:orderId/items/:itemId', orderController.removeItem);
router.patch('/:id/tip', orderController.updateTip);
router.post('/:id/payment', orderController.processPayment);
router.get('/:id/payments', orderController.getPayments);
router.patch('/:id/close', orderController.closeOrder);
router.patch('/:id/split', orderController.splitOrder);
router.get('/:orderId/split-groups', orderController.getSplitGroups);
router.get('/:id/calculate', orderController.calculateTotals);
router.delete('/:id', orderController.delete);

module.exports = router;