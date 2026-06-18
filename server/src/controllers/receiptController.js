const Receipt = require('../models/Receipt');

const receiptController = {
  async generate(req, res) {
    try {
      const receipt = await Receipt.generate(req.params.orderId);
      if (!receipt) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async save(req, res) {
    try {
      const receipt = await Receipt.save(req.params.orderId);
      if (!receipt) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(201).json(receipt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const receipt = await Receipt.getById(req.params.id);
      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByOrder(req, res) {
    try {
      const receipt = await Receipt.getByOrder(req.params.orderId);
      if (!receipt) {
        return res.status(404).json({ error: 'Receipt not found' });
      }
      res.json(receipt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const receipts = await Receipt.getAll();
      res.json(receipts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = receiptController;
