const Announcement = require('../models/Announcement');

const announcementController = {
  async create(req, res) {
    try {
      const { message, priority, expiresAt } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'message is required' });
      }
      if (!req.body.restaurantId) {
        return res.status(400).json({ error: 'restaurantId is required' });
      }
      const announcement = await Announcement.create({
        message,
        priority: priority || 'INFO',
        restaurantId: req.body.restaurantId,
        createdBy: req.userId,
        expiresAt: expiresAt || null,
      });
      res.status(201).json(announcement);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const announcements = await Announcement.getAll();
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const announcements = await Announcement.getByRestaurant(req.params.restaurantId);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getActive(req, res) {
    try {
      const announcements = await Announcement.getActiveByRestaurant(req.params.restaurantId);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const announcement = await Announcement.update(req.params.id, req.body);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const announcement = await Announcement.getById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      await Announcement.delete(req.params.id);
      res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = announcementController;
