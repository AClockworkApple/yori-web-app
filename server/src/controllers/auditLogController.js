const AuditLog = require('../models/AuditLog');

const auditLogController = {
  async getAll(req, res) {
    try {
      const { restaurantId, limit } = req.query;
      let logs;
      if (restaurantId) {
        logs = await AuditLog.getByRestaurant(restaurantId, parseInt(limit) || 200);
      } else {
        logs = await AuditLog.getAll(parseInt(limit) || 200);
      }
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByUser(req, res) {
    try {
      const logs = await AuditLog.getByUser(req.params.userId, parseInt(req.query.limit) || 200);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByResource(req, res) {
    try {
      const logs = await AuditLog.getByResource(req.params.resource, req.params.resourceId, parseInt(req.query.limit) || 200);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = auditLogController;
