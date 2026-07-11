const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const { emitOrderUpdate } = require('../socket/setup');

const orderController = {
  async create(req, res) {
    try {
      const order = await Order.create(req.body);
      emitOrderUpdate(order.restaurantId, { action: 'created', order });
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const orders = await Order.getAll();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const order = await Order.getById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const orders = await Order.getByRestaurant(req.params.restaurantId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByBooking(req, res) {
    try {
      const orders = await Order.getByBooking(req.params.bookingId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByDate(req, res) {
    try {
      const { restaurantId, date } = req.params;
      const orders = await Order.getByDate(restaurantId, date);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const order = await Order.update(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addItem(req, res) {
    try {
      const { menuItemId, menuItemName, quantity, unitPrice, notes, splitGroup } = req.body;
      const orderItem = await OrderItem.create({
        orderId: req.params.id,
        menuItemId,
        menuItemName,
        quantity,
        unitPrice,
        notes,
        splitGroup
      });
      
      await Order.calculateTotals(req.params.id);
      res.status(201).json(orderItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getItems(req, res) {
    try {
      const items = await OrderItem.getByOrder(req.params.orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateItem(req, res) {
    try {
      const { quantity, notes, splitGroup } = req.body;
      const item = await OrderItem.update(req.params.itemId, { quantity, notes, splitGroup });
      if (!item) {
        return res.status(404).json({ error: 'Order item not found' });
      }
      
      await Order.calculateTotals(req.params.orderId);
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async removeItem(req, res) {
    try {
      await OrderItem.delete(req.params.itemId);
      await Order.calculateTotals(req.params.orderId);
      res.json({ message: 'Item removed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateTip(req, res) {
    try {
      const { tip } = req.body;
      const order = await Order.updateTip(req.params.id, tip);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async processPayment(req, res) {
    try {
      const { amount, method, amountReceived, changeGiven } = req.body;
      
      const payment = await Payment.create({
        orderId: req.params.id,
        amount,
        method,
        amountReceived,
        changeGiven
      });

      const order = await Order.getById(req.params.id);
      if (order) {
        emitOrderUpdate(order.restaurantId, { action: 'payment', orderId: req.params.id, payment });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPayments(req, res) {
    try {
      const payments = await Payment.getByOrder(req.params.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async closeOrder(req, res) {
    try {
      const order = await Order.closeOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      emitOrderUpdate(order.restaurantId, { action: 'closed', order });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async splitOrder(req, res) {
    try {
      const order = await Order.splitOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      emitOrderUpdate(order.restaurantId, { action: 'split', order });
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSplitGroups(req, res) {
    try {
      const groups = await OrderItem.getSplitGroups(req.params.orderId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async calculateTotals(req, res) {
    try {
      const order = await Order.calculateTotals(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const order = await Order.getById(req.params.id);
      await Order.delete(req.params.id);
      if (order) {
        emitOrderUpdate(order.restaurantId, { action: 'deleted', orderId: req.params.id });
      }
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController;