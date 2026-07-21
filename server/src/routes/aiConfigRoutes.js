const express = require('express');
const router = express.Router();
const aiConfigController = require('../controllers/aiConfigController');
const { requireRole } = require('../middleware/auth');

router.get('/providers', requireRole('OWNER', 'MANAGER'), aiConfigController.getProviders);
router.get('/:restaurantId', requireRole('OWNER', 'MANAGER'), aiConfigController.getConfigs);
router.get('/:restaurantId/active', requireRole('OWNER', 'MANAGER', 'STAFF'), aiConfigController.getActiveConfig);
router.post('/', requireRole('OWNER', 'MANAGER'), aiConfigController.createConfig);
router.put('/:id', requireRole('OWNER', 'MANAGER'), aiConfigController.updateConfig);
router.delete('/:id', requireRole('OWNER'), aiConfigController.deleteConfig);
router.post('/query', requireRole('OWNER', 'MANAGER', 'STAFF'), aiConfigController.query);

module.exports = router;
