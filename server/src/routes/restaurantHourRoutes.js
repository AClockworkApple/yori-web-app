const express = require('express');
const router = express.Router();
const restaurantHourController = require('../controllers/restaurantHourController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER', 'MANAGER'), restaurantHourController.create);
router.get('/', restaurantHourController.getAll);
router.get('/:id', restaurantHourController.getById);
router.get('/restaurant/:restaurantId', restaurantHourController.getByRestaurant);
router.get('/restaurant/:restaurantId/day/:dayOfWeek', restaurantHourController.getByRestaurantAndDay);
router.put('/:id', requireRole('OWNER', 'MANAGER'), restaurantHourController.update);
router.delete('/:id', requireRole('OWNER', 'MANAGER'), restaurantHourController.delete);

module.exports = router;
