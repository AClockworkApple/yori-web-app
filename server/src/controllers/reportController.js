const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

async function getDailyReport(req, res) {
  try {
    const { restaurantId, date } = req.params;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(date)) {
      return res.status(400).json({ error: 'Date must be in YYYY-MM-DD format' });
    }

    const allBookings = await Booking.getByRestaurant(restaurantId);
    const dayBookings = allBookings.filter(b => {
      const d = new Date(b.scheduledStart).toISOString().split('T')[0];
      return d === date;
    });

    const activeBookings = dayBookings.filter(b =>
      !['CANCELLED', 'NO_SHOW'].includes(b.status)
    );
    const completedBookings = dayBookings.filter(b =>
      ['COMPLETED', 'SEATED'].includes(b.status)
    );
    const noShowBookings = dayBookings.filter(b => b.status === 'NO_SHOW');
    const cancelledBookings = dayBookings.filter(b => b.status === 'CANCELLED');
    const walkInBookings = dayBookings.filter(b => b.source === 'walk-in');

    const covers = completedBookings.reduce((sum, b) => sum + (b.partySize || 0), 0);

    const allOrders = await Order.getByRestaurant(restaurantId);
    const dayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d === date;
    });
    const closedOrders = dayOrders.filter(o => o.status === 'CLOSED' || o.status === 'SPLIT');

    const totalRevenue = closedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalTips = closedOrders.reduce((sum, o) => sum + (o.tip || 0), 0);
    const totalTax = closedOrders.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
    const totalServiceFees = closedOrders.reduce((sum, o) => sum + (o.serviceFeeAmount || 0), 0);
    const totalSubtotal = closedOrders.reduce((sum, o) => sum + (o.subtotal || 0), 0);

    const paymentBreakdown = {};
    for (const order of closedOrders) {
      const payments = await Payment.getByOrder(order.id);
      for (const p of payments) {
        const method = p.method || 'OTHER';
        if (!paymentBreakdown[method]) paymentBreakdown[method] = { count: 0, total: 0 };
        paymentBreakdown[method].count++;
        paymentBreakdown[method].total += p.amount || 0;
      }
    }

    const orderCount = closedOrders.length;
    const bookingCount = activeBookings.length;

    res.json({
      date,
      covers,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTips: Math.round(totalTips * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      totalServiceFees: Math.round(totalServiceFees * 100) / 100,
      totalSubtotal: Math.round(totalSubtotal * 100) / 100,
      orderCount,
      bookingCount,
      walkInCount: walkInBookings.length,
      noShowCount: noShowBookings.length,
      cancelledCount: cancelledBookings.length,
      paymentBreakdown,
      averageCheckPerPerson: covers > 0 ? Math.round((totalRevenue / covers) * 100) / 100 : 0,
      averageCheckPerOrder: orderCount > 0 ? Math.round((totalRevenue / orderCount) * 100) / 100 : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getDailyReport };
