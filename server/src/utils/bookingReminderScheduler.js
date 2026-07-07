const cron = require('node-cron');
const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const { sendReminder } = require('./emailService');

const REMINDER_HOURS = parseInt(process.env.REMINDER_HOURS_BEFORE || '1', 10);
const CRON_SCHEDULE = process.env.REMINDER_CRON || '*/15 * * * *';

async function processReminders() {
  const now = new Date();
  const windowStart = new Date(now.getTime() + REMINDER_HOURS * 60 * 60 * 1000);
  const windowEnd = new Date(windowStart.getTime() + 15 * 60 * 1000);

  const restaurantCache = {};

  async function getRestaurant(id) {
    if (!restaurantCache[id]) {
      restaurantCache[id] = await Restaurant.getById(id);
    }
    return restaurantCache[id];
  }

  try {
    const allBookings = await Booking.getAll();

    const due = allBookings.filter(b => {
      if (b.status === 'CANCELLED' || b.status === 'NO_SHOW' || b.status === 'COMPLETED') return false;
      if (b.reminderEmailSentAt) return false;
      const start = new Date(b.scheduledStart);
      return start >= windowStart && start < windowEnd;
    });

    for (const booking of due) {
      const restaurant = await getRestaurant(booking.restaurantId);
      if (!restaurant) {
        console.warn(`[reminder] Restaurant not found for booking ${booking.id}`);
        continue;
      }
      const result = await sendReminder(booking, restaurant);
      if (result.success || result.simulated) {
        await Booking.update(booking.id, { reminderEmailSentAt: new Date().toISOString() });
        console.log(`[reminder] Marked booking ${booking.id} as reminded`);
      }
    }

    if (due.length > 0) {
      console.log(`[reminder] Processed ${due.length} booking(s) for reminders`);
    }
  } catch (err) {
    console.error(`[reminder] Error processing reminders: ${err.message}`);
  }
}

function startReminderScheduler() {
  const hasEmail = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!hasEmail) {
    console.log('[reminder] No SMTP credentials set — reminders simulated (logged to console)');
  }

  const task = cron.schedule(CRON_SCHEDULE, () => {
    processReminders();
  });

  console.log(`[reminder] Scheduler started (cron: ${CRON_SCHEDULE}, ${REMINDER_HOURS}h before booking)`);

  processReminders().catch(err => {
    console.error(`[reminder] Initial reminder check failed: ${err.message}`);
  });

  return task;
}

module.exports = { startReminderScheduler, processReminders };
