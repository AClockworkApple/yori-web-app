const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER'), restaurantController.create);
router.get('/', restaurantController.getAll);
router.get('/:id', restaurantController.getById);
router.get('/owner/:ownerId', restaurantController.getByOwner);
router.get('/manager/:managerId', restaurantController.getByManager);
router.put('/:id', requireRole('OWNER', 'MANAGER'), restaurantController.update);
router.delete('/:id', requireRole('OWNER'), restaurantController.delete);

module.exports = router;