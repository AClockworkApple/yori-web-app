const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER'), userController.create);
router.get('/', requireRole('OWNER', 'MANAGER'), userController.getAll);
router.get('/role/:role', requireRole('OWNER', 'MANAGER'), userController.getByRole);
router.get('/restaurant/:restaurantId', requireRole('OWNER', 'MANAGER'), userController.getByRestaurant);
router.get('/:id', userController.getById);
router.put('/:id', requireRole('OWNER', 'MANAGER'), userController.update);
router.delete('/:id', requireRole('OWNER'), userController.delete);

module.exports = router;
