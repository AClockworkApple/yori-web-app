const cron = require('node-cron');
const Restaurant = require('../models/Restaurant');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

const CRON_SCHEDULE = process.env.RETENTION_CRON || '0 3 * * *';

async function runDataRetention() {
  try {
    const restaurants = await Restaurant.getAll();
    const now = new Date();

    for (const restaurant of restaurants) {
      const retentionDays = restaurant.dataRetentionDays || 30;
      const cutoff = new Date(now.getTime() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

      const bookings = await Booking.getByRestaurant(restaurant.id);
      const oldBookings = bookings.filter(b =>
        b.createdAt < cutoff && ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(b.status)
      );

      for (const booking of oldBookings) {
        const needsAnonymize =
          booking.customerName !== 'Anonymized' &&
          (booking.customerName || booking.customerPhone || booking.customerEmail);

        if (needsAnonymize) {
          await Booking.update(booking.id, {
            customerName: 'Anonymized',
            customerPhone: null,
            customerEmail: null,
            customerId: null,
          });
        }

        const orders = await Order.getByBooking(booking.id);
        for (const order of orders) {
          if (order.status === 'OPEN') continue;
          await OrderItem.deleteByOrder(order.id);
          await Order.delete(order.id);
        }
      }

      if (oldBookings.length > 0) {
        console.log(`[retention] ${restaurant.name}: anonymized ${oldBookings.length} old booking(s) (${retentionDays}d cutoff)`);
      }
    }
  } catch (err) {
    console.error(`[retention] Error: ${err.message}`);
  }
}

function startDataRetentionScheduler() {
  const task = cron.schedule(CRON_SCHEDULE, () => {
    runDataRetention();
  });
  console.log(`[retention] Scheduler started (cron: ${CRON_SCHEDULE})`);
  runDataRetention().catch(err => console.error('[retention] Initial run failed:', err.message));
  return task;
}

module.exports = { startDataRetentionScheduler, runDataRetention };
