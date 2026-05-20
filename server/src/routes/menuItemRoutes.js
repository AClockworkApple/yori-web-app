const express = require('express');
const router = express.Router();
const menuItemController = require('../controllers/menuItemController');

router.post('/', menuItemController.create);
router.get('/', menuItemController.getAll);
router.get('/general', menuItemController.getGeneralMenu);
router.get('/:id', menuItemController.getById);
router.get('/restaurant/:restaurantId', menuItemController.getByRestaurant);
router.get('/restaurant/:restaurantId/menu', menuItemController.getRestaurantMenu);
router.post('/restaurant/:restaurantId/import', menuItemController.importGeneralMenu);
router.get('/restaurant/:restaurantId/category/:category', menuItemController.getByCategory);
router.get('/restaurant/:restaurantId/categories', menuItemController.getCategories);
router.put('/:id', menuItemController.update);
router.patch('/:id/toggle', menuItemController.toggleAvailability);
router.delete('/:id', menuItemController.delete);

module.exports = router;