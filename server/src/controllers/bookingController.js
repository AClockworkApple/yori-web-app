const Booking = require('../models/Booking');

const bookingController = {
  async create(req, res) {
    try {
      const booking = await Booking.create(req.body);
      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const bookings = await Booking.getAll();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const booking = await Booking.getById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const bookings = await Booking.getByRestaurant(req.params.restaurantId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByTable(req, res) {
    try {
      const bookings = await Booking.getByTable(req.params.tableId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByStatus(req, res) {
    try {
      const { restaurantId, status } = req.params;
      const bookings = await Booking.getByStatus(restaurantId, status);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByDate(req, res) {
    try {
      const { restaurantId, date } = req.params;
      const bookings = await Booking.getByDate(restaurantId, date);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const booking = await Booking.update(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'WAITLISTED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const booking = await Booking.updateStatus(req.params.id, status);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async seatCustomer(req, res) {
    try {
      const { tableId, actualStart } = req.body;
      const booking = await Booking.seatCustomer(req.params.id, tableId, actualStart);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async completeBooking(req, res) {
    try {
      const { actualEnd } = req.body;
      const booking = await Booking.completeBooking(req.params.id, actualEnd);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async extendBooking(req, res) {
    try {
      const { newEndTime, employeeId } = req.body;
      const booking = await Booking.extendBooking(req.params.id, newEndTime, employeeId);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      await Booking.delete(req.params.id);
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bookingController;