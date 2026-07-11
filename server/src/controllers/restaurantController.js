const Restaurant = require('../models/Restaurant');
const { logAction } = require('../utils/auditLogger');

const restaurantController = {
  async create(req, res) {
    try {
      const data = { ...req.body, ownerId: req.body.ownerId || req.userId };
      const restaurant = await Restaurant.create(data);
      logAction(req.user, 'CREATE', 'Restaurant', restaurant.id, { name: restaurant.name });
      res.status(201).json(restaurant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const restaurants = await Restaurant.getAll();
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const restaurant = await Restaurant.getById(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByOwner(req, res) {
    try {
      const restaurants = await Restaurant.getByOwner(req.params.ownerId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByManager(req, res) {
    try {
      const restaurants = await Restaurant.getByManager(req.params.managerId);
      res.json(restaurants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const restaurant = await Restaurant.update(req.params.id, req.body);
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      logAction(req.user, 'UPDATE', 'Restaurant', restaurant.id, { changes: Object.keys(req.body) });
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deletedRestaurant = await Restaurant.getById(req.params.id);
      await Restaurant.delete(req.params.id);
      logAction(req.user, 'DELETE', 'Restaurant', req.params.id, deletedRestaurant ? { name: deletedRestaurant.name } : {});
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = restaurantController;