const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');

router.post('/', tableController.create);
router.get('/', tableController.getAll);
router.get('/:id', tableController.getById);
router.get('/restaurant/:restaurantId', tableController.getByRestaurant);
router.put('/:id', tableController.update);
router.patch('/:id/status', tableController.updateStatus);
router.delete('/:id', tableController.delete);

module.exports = router;