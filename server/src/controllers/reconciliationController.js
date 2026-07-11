const DailyReconciliation = require('../models/DailyReconciliation');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { logAction } = require('../utils/auditLogger');

async function getReconciliation(req, res) {
  try {
    const { restaurantId, date } = req.params;

    const existing = await DailyReconciliation.getByRestaurantAndDate(restaurantId, date);

    const allOrders = await Order.getByRestaurant(restaurantId);
    const dayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d === date;
    });
    const closedOrders = dayOrders.filter(o => o.status === 'CLOSED' || o.status === 'SPLIT');

    let expectedCash = 0;
    let expectedCard = 0;
    let expectedOther = 0;
    for (const order of closedOrders) {
      const payments = await Payment.getByOrder(order.id);
      for (const p of payments) {
        const method = (p.method || '').toLowerCase();
        if (method === 'bar') {
          expectedCash += p.amount || 0;
        } else if (method === 'karte' || method === 'ec') {
          expectedCard += p.amount || 0;
        } else {
          expectedOther += p.amount || 0;
        }
      }
    }
    expectedCash = Math.round(expectedCash * 100) / 100;
    expectedCard = Math.round(expectedCard * 100) / 100;
    expectedOther = Math.round(expectedOther * 100) / 100;
    const expectedTotal = Math.round((expectedCash + expectedCard + expectedOther) * 100) / 100;

    res.json({
      existing,
      expected: { cash: expectedCash, card: expectedCard, other: expectedOther, total: expectedTotal },
      orderCount: closedOrders.length,
      date,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createReconciliation(req, res) {
  try {
    const { restaurantId, date, declaredCash, declaredCard, declaredOther, notes, openingBalance } = req.body;

    if (!restaurantId || !date) {
      return res.status(400).json({ error: 'restaurantId and date are required' });
    }

    const existing = await DailyReconciliation.getByRestaurantAndDate(restaurantId, date);
    if (existing) {
      return res.status(409).json({ error: 'Reconciliation already exists for this date', existing });
    }

    const allOrders = await Order.getByRestaurant(restaurantId);
    const dayOrders = allOrders.filter(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      return d === date;
    });
    const closedOrders = dayOrders.filter(o => o.status === 'CLOSED' || o.status === 'SPLIT');

    let expectedCash = 0;
    let expectedCard = 0;
    let expectedOther = 0;
    for (const order of closedOrders) {
      const payments = await Payment.getByOrder(order.id);
      for (const p of payments) {
        const method = (p.method || '').toLowerCase();
        if (method === 'bar') expectedCash += p.amount || 0;
        else if (method === 'karte' || method === 'ec') expectedCard += p.amount || 0;
        else expectedOther += p.amount || 0;
      }
    }

    const record = await DailyReconciliation.create({
      restaurantId,
      date,
      expectedCash: Math.round(expectedCash * 100) / 100,
      expectedCard: Math.round(expectedCard * 100) / 100,
      expectedOther: Math.round(expectedOther * 100) / 100,
      expectedTotal: Math.round((expectedCash + expectedCard + expectedOther) * 100) / 100,
      declaredCash: declaredCash || 0,
      declaredCard: declaredCard || 0,
      declaredOther: declaredOther || 0,
      declaredTotal: (declaredCash || 0) + (declaredCard || 0) + (declaredOther || 0),
      notes: notes || '',
      openingBalance: openingBalance || 0,
      status: 'PENDING',
    });

    await logAction(req.user, 'CREATE', 'reconciliation', record.id,
      `Reconciliation created for ${date}`, restaurantId);

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateReconciliation(req, res) {
  try {
    const { id } = req.params;
    const { declaredCash, declaredCard, declaredOther, notes, openingBalance } = req.body;

    const existing = await DailyReconciliation.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    const updateData = {};
    if (declaredCash !== undefined) updateData.declaredCash = declaredCash;
    if (declaredCard !== undefined) updateData.declaredCard = declaredCard;
    if (declaredOther !== undefined) updateData.declaredOther = declaredOther;
    if (notes !== undefined) updateData.notes = notes;
    if (openingBalance !== undefined) updateData.openingBalance = openingBalance;

    const updated = await DailyReconciliation.update(id, updateData);

    await logAction(req.user, 'UPDATE', 'reconciliation', id,
      `Reconciliation updated for ${existing.date}`, existing.restaurantId);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function reconcileDay(req, res) {
  try {
    const { id } = req.params;

    const existing = await DailyReconciliation.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    if (existing.status === 'RECONCILED') {
      return res.status(400).json({ error: 'Already reconciled' });
    }

    const updated = await DailyReconciliation.reconcile(id, req.user.id);

    await logAction(req.user, 'UPDATE', 'reconciliation', id,
      `Day ${existing.date} reconciled. Cash variance: ${updated.cashVariance}, Card variance: ${updated.cardVariance}`,
      existing.restaurantId);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getReconciliationHistory(req, res) {
  try {
    const { restaurantId } = req.params;
    const limit = parseInt(req.query.limit) || 90;
    const records = await DailyReconciliation.getByRestaurant(restaurantId, limit);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getReconciliation, createReconciliation, updateReconciliation, reconcileDay, getReconciliationHistory };
