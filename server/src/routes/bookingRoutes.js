const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.create);
router.get('/', bookingController.getAll);
router.get('/:id', bookingController.getById);
router.get('/restaurant/:restaurantId', bookingController.getByRestaurant);
router.get('/restaurant/:restaurantId/status/:status', bookingController.getByStatus);
router.get('/restaurant/:restaurantId/date/:date', bookingController.getByDate);
router.put('/:id', bookingController.update);
router.patch('/:id/status', bookingController.updateStatus);
router.patch('/:id/seat', bookingController.seatCustomer);
router.patch('/:id/complete', bookingController.completeBooking);
router.patch('/:id/extend', bookingController.extendBooking);
router.get('/:id/tables', bookingController.getBookingTables);
router.post('/:id/tables', bookingController.addBookingTable);
router.delete('/:id/tables/:tableId', bookingController.removeBookingTable);
router.delete('/:id', bookingController.delete);

module.exports = router;