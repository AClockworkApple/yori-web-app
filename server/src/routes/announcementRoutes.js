const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { requireRole } = require('../middleware/auth');

router.post('/', requireRole('OWNER', 'MANAGER'), announcementController.create);
router.get('/', requireRole('OWNER', 'MANAGER'), announcementController.getAll);
router.get('/restaurant/:restaurantId', requireRole('OWNER', 'MANAGER', 'STAFF'), announcementController.getByRestaurant);
router.get('/restaurant/:restaurantId/active', requireRole('OWNER', 'MANAGER', 'STAFF'), announcementController.getActive);
router.put('/:id', requireRole('OWNER', 'MANAGER'), announcementController.update);
router.delete('/:id', requireRole('OWNER', 'MANAGER'), announcementController.delete);

module.exports = router;
