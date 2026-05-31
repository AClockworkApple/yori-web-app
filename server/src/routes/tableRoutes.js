const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER', 'MANAGER'), tableController.create);
router.get('/', tableController.getAll);
router.get('/:id', tableController.getById);
router.get('/restaurant/:restaurantId', tableController.getByRestaurant);
router.put('/:id', requireRole('OWNER', 'MANAGER'), tableController.update);
router.patch('/:id/status', requireRole('OWNER', 'MANAGER', 'STAFF'), tableController.updateStatus);
router.delete('/:id', requireRole('OWNER'), tableController.delete);

module.exports = router;