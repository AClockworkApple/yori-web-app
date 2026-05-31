const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireRole } = require('../middleware/auth');

router.post('/', bookingController.create);
router.get('/', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.getAll);
router.get('/:id', bookingController.getById);
router.get('/restaurant/:restaurantId', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.getByRestaurant);
router.get('/restaurant/:restaurantId/status/:status', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.getByStatus);
router.get('/restaurant/:restaurantId/date/:date', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.getByDate);
router.get('/restaurant/:restaurantId/walk-ins', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.getWalkIns);
router.put('/:id', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.update);
router.patch('/:id/status', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.updateStatus);
router.patch('/:id/seat', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.seatCustomer);
router.patch('/:id/complete', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.completeBooking);
router.patch('/:id/extend', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.extendBooking);
router.get('/:id/tables', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.getBookingTables);
router.post('/:id/tables', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.addBookingTable);
router.delete('/:id/tables/:tableId', requireRole('OWNER', 'MANAGER', 'STAFF'), bookingController.removeBookingTable);
router.delete('/:id', requireRole('OWNER', 'MANAGER'), bookingController.delete);

module.exports = router;