const Booking = require('../models/Booking');
const BookingTable = require('../models/BookingTable');
const Restaurant = require('../models/Restaurant');
const RestaurantHour = require('../models/RestaurantHour');
const Table = require('../models/Table');
const { sendConfirmation, sendCancellation, sendStatusUpdate } = require('../utils/emailService');
const { logAction } = require('../utils/auditLogger');
const { emitBookingUpdate } = require('../socket/setup');
const { assignTablesForBooking } = require('../utils/tableAssignment');

function doTimeRangesOverlap(startA, endA, startB, endB) {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
}

async function validateBookingTime(scheduledStart, restaurantId) {
  const restaurant = await Restaurant.getById(restaurantId);
  if (!restaurant) {
    return { error: 'Restaurant not found' };
  }

  const startDate = new Date(scheduledStart);
  const dayOfWeek = startDate.getDay();
  const hours = await RestaurantHour.getByRestaurantAndDay(restaurantId, dayOfWeek);

  const toTimeStr = (d) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  if (hours) {
    const startTimeStr = toTimeStr(startDate);

    if (startTimeStr < hours.openTime || startTimeStr >= hours.closeTime) {
      return { error: `Restaurant is closed at ${startTimeStr}. Operating hours: ${hours.openTime} - ${hours.closeTime}` };
    }

    if (hours.breakStart && hours.breakEnd) {
      if (startTimeStr >= hours.breakStart && startTimeStr < hours.breakEnd) {
        return { error: `Cannot book during break time (${hours.breakStart} - ${hours.breakEnd})` };
      }
    }
  }

  const slotDuration = restaurant.slotDurationMinutes || 120;
  const endDate = new Date(startDate.getTime() + slotDuration * 60000);
  const scheduledEnd = endDate.toISOString();

  if (hours) {
    const endTimeStr = toTimeStr(endDate);

    if (endTimeStr > hours.closeTime) {
      return { error: `Booking end time (${endTimeStr}) exceeds closing time (${hours.closeTime})` };
    }

    if (hours.breakStart && hours.breakEnd) {
      if (endTimeStr > hours.breakStart && endTimeStr <= hours.breakEnd) {
        return { error: `Booking end time (${endTimeStr}) falls within break time (${hours.breakStart} - ${hours.breakEnd})` };
      }
    }
  }

  return { scheduledEnd };
}

const bookingController = {
  async create(req, res) {
    try {
      const { scheduledStart, restaurantId, customerEmail, partySize } = req.body;

      if (!scheduledStart) {
        return res.status(400).json({ error: 'scheduledStart is required' });
      }

      if (req.body.source !== 'walk-in') {
        if (!customerEmail) {
          return res.status(400).json({ error: 'customerEmail is required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
      }

      const result = await validateBookingTime(scheduledStart, restaurantId);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      const scheduledEnd = result.scheduledEnd;

      const restaurant = await Restaurant.getById(restaurantId);

      const tables = await Table.getByRestaurant(restaurantId);
      const totalCapacity = tables.reduce((sum, t) => sum + (t.seats || 2), 0);

      const allBookings = await Booking.getByRestaurant(restaurantId);
      const overlapping = allBookings.filter(b => {
        if (b.status === 'CANCELLED' || b.status === 'NO_SHOW') return false;
        return doTimeRangesOverlap(b.scheduledStart, b.scheduledEnd, scheduledStart, scheduledEnd);
      });

      const activeSeats = overlapping
        .filter(b => b.status !== 'WAITLISTED')
        .reduce((sum, b) => sum + (b.partySize || 0), 0);

      const waitlistedSeats = overlapping
        .filter(b => b.status === 'WAITLISTED')
        .reduce((sum, b) => sum + (b.partySize || 0), 0);

      const isOverbooked = activeSeats + (partySize || 0) > totalCapacity;
      const overbookingLimit = Math.round(totalCapacity * (restaurant.overbookingPercentage || 30) / 100);

      if (isOverbooked && waitlistedSeats + (partySize || 0) > overbookingLimit) {
        if (!req.body.confirmedOverbook) {
          return res.json({
            requiresConfirmation: true,
            message: `This time slot already exceeds the overbooking limit (${overbookingLimit} waitlisted seats on ${totalCapacity} total capacity). Confirm to proceed as waitlisted.`,
            details: { totalCapacity, activeSeats, waitlistedSeats, partySize, overbookingLimit }
          });
        }
      }

      const autoTableIds = await assignTablesForBooking(restaurantId, partySize, scheduledStart, scheduledEnd);

      const booking = await Booking.create({
        ...req.body,
        scheduledEnd,
        isOverbooked: isOverbooked || false,
        status: isOverbooked ? 'WAITLISTED' : (req.body.status || 'PENDING'),
        tableIds: autoTableIds,
      });

      if (req.body.source !== 'walk-in') {
        sendConfirmation(booking, restaurant).then(result => {
          if (result.success) {
            Booking.update(booking.id, { confirmationEmailSentAt: new Date().toISOString() });
          }
        }).catch(err => console.error('[email] Confirmation send error:', err.message));
      }

      logAction(req.user, 'CREATE', 'Booking', booking.id, {
        customerName: booking.customerName, partySize: booking.partySize, source: booking.source
      }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'created', booking });
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

  async getWalkIns(req, res) {
    try {
      const { restaurantId } = req.params;
      const walkIns = await Booking.getWalkInsByRestaurant(restaurantId);
      res.json(walkIns);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { scheduledStart, customerEmail } = req.body;

      if (customerEmail !== undefined) {
        if (!customerEmail) {
          return res.status(400).json({ error: 'customerEmail is required' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }
      }

      if (scheduledStart) {
        const existing = await Booking.getById(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        const result = await validateBookingTime(scheduledStart, existing.restaurantId);
        if (result.error) {
          return res.status(400).json({ error: result.error });
        }
        req.body.scheduledEnd = result.scheduledEnd;
      }

      const oldBooking = await Booking.getById(req.params.id);
      const booking = await Booking.update(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (booking.customerEmail && req.body.status && oldBooking?.status !== req.body.status) {
        Restaurant.getById(booking.restaurantId).then(restaurant => {
          if (!restaurant) return;
          if (req.body.status === 'CANCELLED') sendCancellation(booking, restaurant);
          else sendStatusUpdate(booking, restaurant);
        }).catch(() => {});
      }
      logAction(req.user, 'UPDATE', 'Booking', booking.id, {
        changes: Object.keys(req.body),
        ...(req.body.status && oldBooking ? { fromStatus: oldBooking.status, toStatus: req.body.status } : {})
      }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'updated', booking });
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

      if (status === 'CANCELLED') {
        Restaurant.getById(booking.restaurantId).then(restaurant => {
          if (restaurant) sendCancellation(booking, restaurant);
        }).catch(() => {});
      } else if (!['PENDING', 'WAITLISTED'].includes(status)) {
        Restaurant.getById(booking.restaurantId).then(restaurant => {
          if (restaurant) sendStatusUpdate(booking, restaurant);
        }).catch(() => {});
      }

      logAction(req.user, 'STATUS_CHANGE', 'Booking', booking.id, { toStatus: status }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'statusChanged', booking });
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async seatCustomer(req, res) {
    try {
      const { actualStart } = req.body;
      const booking = await Booking.seatCustomer(req.params.id, actualStart);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      if (booking.customerEmail) {
        Restaurant.getById(booking.restaurantId).then(restaurant => {
          if (restaurant) sendStatusUpdate(booking, restaurant);
        }).catch(() => {});
      }
      logAction(req.user, 'SEAT', 'Booking', booking.id, { customerName: booking.customerName }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'seated', booking });
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
      if (booking.customerEmail) {
        Restaurant.getById(booking.restaurantId).then(restaurant => {
          if (restaurant) sendStatusUpdate(booking, restaurant);
        }).catch(() => {});
      }
      logAction(req.user, 'COMPLETE', 'Booking', booking.id, { customerName: booking.customerName }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'completed', booking });
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
      logAction(req.user, 'EXTEND', 'Booking', booking.id, { newEndTime, employeeId }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'extended', booking });
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const booking = await Booking.getById(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      await BookingTable.removeByBooking(req.params.id);
      await Booking.delete(req.params.id);

      Restaurant.getById(booking.restaurantId).then(restaurant => {
        if (restaurant && booking.customerEmail) sendCancellation(booking, restaurant);
      }).catch(() => {});

      logAction(req.user, 'DELETE', 'Booking', booking.id, { customerName: booking.customerName }, booking.restaurantId);
      emitBookingUpdate(booking.restaurantId, { action: 'deleted', bookingId: req.params.id });
      res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBookingTables(req, res) {
    try {
      const tables = await BookingTable.getByBooking(req.params.id);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async addBookingTable(req, res) {
    try {
      const { tableId } = req.body;
      if (!tableId) {
        return res.status(400).json({ error: 'tableId is required' });
      }
      const record = await BookingTable.create(req.params.id, tableId);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async removeBookingTable(req, res) {
    try {
      await BookingTable.removeByBookingAndTable(req.params.id, req.params.tableId);
      res.json({ message: 'Table removed from booking successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = bookingController;
module.exports.validateBookingTime = validateBookingTime;
module.exports.doTimeRangesOverlap = doTimeRangesOverlap;