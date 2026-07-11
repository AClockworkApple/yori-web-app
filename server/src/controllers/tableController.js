const Table = require('../models/Table');
const { logAction } = require('../utils/auditLogger');

const tableController = {
  async create(req, res) {
    try {
      const table = await Table.create(req.body);
      logAction(req.user, 'CREATE', 'Table', table.id, { name: table.name, restaurantId: table.restaurantId }, table.restaurantId);
      res.status(201).json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const tables = await Table.getAll();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const table = await Table.getById(req.params.id);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const tables = await Table.getByRestaurant(req.params.restaurantId);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const table = await Table.update(req.params.id, req.body);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }
      logAction(req.user, 'UPDATE', 'Table', table.id, { changes: Object.keys(req.body) }, table.restaurantId);
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const table = await Table.updateStatus(req.params.id, status);
      if (!table) {
        return res.status(404).json({ error: 'Table not found' });
      }
      logAction(req.user, 'STATUS_CHANGE', 'Table', table.id, { toStatus: status }, table.restaurantId);
      res.json(table);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deletedTable = await Table.getById(req.params.id);
      await Table.delete(req.params.id);
      logAction(req.user, 'DELETE', 'Table', req.params.id, deletedTable ? { name: deletedTable.name } : {});
      res.json({ message: 'Table deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = tableController;