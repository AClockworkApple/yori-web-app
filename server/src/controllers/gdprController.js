const Booking = require('../models/Booking');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

async function findCustomerData(email) {
  const emailLower = email.toLowerCase().trim();
  const allBookings = await Booking.getAll();
  return allBookings.filter(b =>
    b.customerEmail && b.customerEmail.toLowerCase() === emailLower
  );
}

const gdprController = {
  async lookup(req, res) {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const bookings = await findCustomerData(email);

      const enriched = await Promise.all(bookings.map(async (b) => {
        const orders = await Order.getByBooking(b.id);
        const ordersWithPayments = await Promise.all(orders.map(async (o) => {
          const payments = await Payment.getByOrder(o.id);
          return {
            id: o.id,
            status: o.status,
            total: o.total,
            createdAt: o.createdAt,
            closedAt: o.closedAt,
            payments: payments.map(p => ({
              method: p.method,
              amount: p.amount,
              paidAt: p.paidAt,
            })),
          };
        }));

        return {
          id: b.id,
          customerName: b.customerName,
          customerPhone: b.customerPhone,
          customerEmail: b.customerEmail,
          partySize: b.partySize,
          scheduledStart: b.scheduledStart,
          status: b.status,
          source: b.source,
          createdAt: b.createdAt,
          orders: ordersWithPayments,
        };
      }));

      res.json({
        email,
        found: enriched.length > 0,
        data: enriched,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async erase(req, res) {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const bookings = await findCustomerData(email);

      if (bookings.length === 0) {
        return res.json({ message: 'No data found for this email', anonymized: 0 });
      }

      for (const booking of bookings) {
        await Booking.update(booking.id, {
          customerName: 'Anonymized',
          customerPhone: null,
          customerEmail: null,
          customerId: null,
        });
      }

      res.json({
        message: `Anonymized ${bookings.length} booking(s) for ${email}`,
        anonymized: bookings.length,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async exportData(req, res) {
    try {
      const { email } = req.params;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const bookings = await findCustomerData(email);

      const enriched = await Promise.all(bookings.map(async (b) => {
        const orders = await Order.getByBooking(b.id);
        const ordersWithPayments = await Promise.all(orders.map(async (o) => {
          const payments = await Payment.getByOrder(o.id);
          return {
            orderId: o.id,
            status: o.status,
            subtotal: o.subtotal,
            taxAmount: o.taxAmount,
            serviceFeeAmount: o.serviceFeeAmount,
            tip: o.tip,
            total: o.total,
            createdAt: o.createdAt,
            closedAt: o.closedAt,
            payments: payments.map(p => ({
              method: p.method,
              amount: p.amount,
              paidAt: p.paidAt,
            })),
          };
        }));

        return {
          bookingId: b.id,
          name: b.customerName,
          phone: b.customerPhone,
          email: b.customerEmail,
          partySize: b.partySize,
          scheduledStart: b.scheduledStart,
          status: b.status,
          source: b.source,
          createdAt: b.createdAt,
          orders: ordersWithPayments,
        };
      }));

      const exportData = {
        exportedAt: new Date().toISOString(),
        subjectEmail: email,
        data: enriched,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="gdpr-export-${email}.json"`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = gdprController;
