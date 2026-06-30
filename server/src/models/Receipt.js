const { db } = require('../config/firebase');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Restaurant = require('./Restaurant');

const COLLECTION_NAME = 'receipts';

class Receipt {
  static async generate(orderId) {
    const order = await Order.getById(orderId);
    if (!order) return null;

    const [items, payments, restaurant] = await Promise.all([
      OrderItem.getByOrder(orderId),
      Payment.getByOrder(orderId),
      Restaurant.getById(order.restaurantId),
    ]);

    const itemVatRates = {};

    const lineItems = items.map((item, idx) => {
      const totalNet = item.unitPrice * item.quantity;
      const vatRate = item.vatRate || (restaurant ? restaurant.taxRate : 19);
      if (!itemVatRates[vatRate]) itemVatRates[vatRate] = { net: 0, vat: 0 };
      const vatAmount = totalNet * (vatRate / 100);
      itemVatRates[vatRate].net += totalNet;
      itemVatRates[vatRate].vat += vatAmount;
      return {
        pos: idx + 1,
        name: item.menuItemName,
        notes: item.notes || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalNet: Math.round(totalNet * 100) / 100,
        splitGroup: item.splitGroup,
        vatRate,
      };
    });

    const vatBreakdown = Object.entries(itemVatRates).map(([rate, amounts]) => ({
      rate: parseFloat(rate),
      net: Math.round(amounts.net * 100) / 100,
      vat: Math.round(amounts.vat * 100) / 100,
    }));

    const calculatedSubtotal = lineItems.reduce((s, i) => s + i.totalNet, 0);
    const calculatedVat = vatBreakdown.reduce((s, v) => s + v.vat, 0);
    const calculatedServiceFee = order.serviceFeeRate
      ? Math.round(calculatedSubtotal * (order.serviceFeeRate / 100) * 100) / 100
      : 0;
    const calculatedGross = Math.round((calculatedSubtotal + calculatedVat + calculatedServiceFee + (order.tip || 0)) * 100) / 100;

    const receiptNumber = `R-${orderId.slice(-8).toUpperCase()}-${new Date(order.createdAt).toISOString().slice(0, 10).replace(/-/g, '')}`;

    return {
      receiptNumber,
      orderId: order.id,
      restaurant: restaurant ? {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        taxNumber: restaurant.taxNumber,
        taxRate: restaurant.taxRate,
        serviceFeeRate: restaurant.serviceFeeRate,
      } : null,
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        closedAt: order.closedAt,
        employeeId: order.employeeId,
        bookingId: order.bookingId,
      },
      lineItems,
      vatBreakdown,
      subtotalNet: calculatedSubtotal,
      vatTotal: calculatedVat,
      serviceFeeNet: calculatedServiceFee,
      tip: order.tip || 0,
      grossTotal: calculatedGross,
      payments: payments.map(p => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        amountReceived: p.amountReceived,
        changeGiven: p.changeGiven,
        paidAt: p.paidAt,
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  static async save(orderId) {
    const data = await this.generate(orderId);
    if (!data) return null;

    const existing = await this.getByOrder(orderId);
    if (existing) {
      await db.collection(COLLECTION_NAME).doc(existing.id).update({ ...data, updatedAt: new Date().toISOString() });
      return { id: existing.id, ...data };
    }

    const docRef = await db.collection(COLLECTION_NAME).add({ ...data, createdAt: new Date().toISOString() });
    return { id: docRef.id, ...data };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getByOrder(orderId) {
    const snapshot = await db.collection(COLLECTION_NAME).where('orderId', '==', orderId).get();
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  }

  static async getAll() {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const receipts = [];
    snapshot.forEach(doc => receipts.push({ id: doc.id, ...doc.data() }));
    return receipts;
  }

  static async getByRestaurant(restaurantId) {
    const snapshot = await db.collection(COLLECTION_NAME).where('restaurant.id', '==', restaurantId).get();
    const receipts = [];
    snapshot.forEach(doc => receipts.push({ id: doc.id, ...doc.data() }));
    return receipts;
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }
}

module.exports = Receipt;
