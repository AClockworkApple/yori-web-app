const RestaurantHour = require('../models/RestaurantHour');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const restaurantHourController = {
  async create(req, res) {
    try {
      const hour = await RestaurantHour.create(req.body);
      res.status(201).json(hour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const hours = await RestaurantHour.getAll();
      res.json(hours);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const hour = await RestaurantHour.getById(req.params.id);
      if (!hour) {
        return res.status(404).json({ error: 'Restaurant hour not found' });
      }
      res.json(hour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const hours = await RestaurantHour.getByRestaurant(req.params.restaurantId);
      res.json(hours);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurantAndDay(req, res) {
    try {
      const { restaurantId, dayOfWeek } = req.params;
      const hour = await RestaurantHour.getByRestaurantAndDay(restaurantId, parseInt(dayOfWeek));
      if (!hour) {
        return res.status(404).json({ error: 'No hours found for this day' });
      }
      res.json(hour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const hour = await RestaurantHour.update(req.params.id, req.body);
      if (!hour) {
        return res.status(404).json({ error: 'Restaurant hour not found' });
      }
      res.json(hour);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await RestaurantHour.delete(req.params.id);
      res.json({ message: 'Restaurant hour deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = restaurantHourController;
