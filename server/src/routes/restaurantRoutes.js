const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

router.post('/', restaurantController.create);
router.get('/', restaurantController.getAll);
router.get('/:id', restaurantController.getById);
router.get('/owner/:ownerId', restaurantController.getByOwner);
router.get('/manager/:managerId', restaurantController.getByManager);
router.put('/:id', restaurantController.update);
router.delete('/:id', restaurantController.delete);

module.exports = router;