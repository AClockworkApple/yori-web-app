const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER', 'MANAGER'), menuItemController.create);
router.get('/', menuItemController.getAll);
router.get('/general', menuItemController.getGeneralMenu);
router.get('/:id', menuItemController.getById);
router.get('/restaurant/:restaurantId', menuItemController.getByRestaurant);
router.get('/restaurant/:restaurantId/menu', menuItemController.getRestaurantMenu);
router.post('/restaurant/:restaurantId/import', requireRole('OWNER', 'MANAGER'), menuItemController.importGeneralMenu);
router.get('/restaurant/:restaurantId/category/:category', menuItemController.getByCategory);
router.get('/restaurant/:restaurantId/categories', menuItemController.getCategories);
router.put('/:id', requireRole('OWNER', 'MANAGER'), menuItemController.update);
router.patch('/:id/toggle', requireRole('OWNER', 'MANAGER'), menuItemController.toggleAvailability);
router.delete('/:id', requireRole('OWNER', 'MANAGER'), menuItemController.delete);

module.exports = router;