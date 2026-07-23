const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const bookingController = require('../controllers/bookingController');
const { handleChat, getConversationHistory } = require('../controllers/chatController');

router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.getAll();
    res.json(restaurants.map(r => ({
      id: r.id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      taxNumber: r.taxNumber,
      logoUrl: r.logoUrl || '',
      heroImageUrl: r.heroImageUrl || '',
      heroVideoUrl: r.heroVideoUrl || '',
      storyImageUrl: r.storyImageUrl || '',
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/restaurants/:id/menu', async (req, res) => {
  try {
    const items = await MenuItem.getRestaurantMenu(req.params.id);
    res.json(items.filter(i => i.isAvailable !== false));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bookings', (req, res, next) => {
  req.body.source = req.body.source || 'pre-booking';
  next();
}, bookingController.create);

router.post('/chat', handleChat);
router.get('/chat/:conversationId', getConversationHistory);

module.exports = router;
