const User = require('../models/User');
const { hashPassword } = require('../utils/auth');
const { logAction } = require('../utils/auditLogger');

const userController = {
  async create(req, res) {
    try {
      const data = { ...req.body };
      if (!data.email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const existing = await User.getByEmail(data.email);
      if (existing) {
        return res.status(409).json({ error: 'A user with this email already exists' });
      }
      if (data.password) {
        data.passwordHash = hashPassword(data.password);
        delete data.password;
      }
      const user = await User.create(data);
      logAction(req.user, 'CREATE', 'User', user.id, { email: user.email, role: user.role }, user.restaurantId);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const user = await User.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRole(req, res) {
    try {
      const users = await User.getByRole(req.params.role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const users = await User.getByRestaurant(req.params.restaurantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const user = await User.update(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      logAction(req.user, 'UPDATE', 'User', user.id, { changes: Object.keys(req.body) }, user.restaurantId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deletedUser = await User.getById(req.params.id);
      await User.delete(req.params.id);
      logAction(req.user, 'DELETE', 'User', req.params.id, deletedUser ? { email: deletedUser.email } : {}, null);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;
