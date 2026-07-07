const Restaurant = require('../models/Restaurant');

const restaurantController = {
  async create(req, res) {
    try {
      const data = { ...req.body, ownerId: req.body.ownerId || req.userId };
      const restaurant = await Restaurant.create(data);
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
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await Restaurant.delete(req.params.id);
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = restaurantController;