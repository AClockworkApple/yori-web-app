const { db } = require('../config/firebase');

const COLLECTION_NAME = 'orders';

class Order {
  static async create(data) {
    const orderData = {
      restaurantId: data.restaurantId,
      bookingId: data.bookingId || null,
      employeeId: data.employeeId || null,
      subtotal: 0,
      taxRate: data.taxRate || 0,
      taxAmount: 0,
      serviceFeeRate: data.serviceFeeRate || 0,
      serviceFeeAmount: 0,
      tip: 0,
      total: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      closedAt: null
    };

    const docRef = await db.collection(COLLECTION_NAME).add(orderData);
    return { id: docRef.id, ...orderData };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getAll() {
    const querySnapshot = await db.collection(COLLECTION_NAME).get();
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('restaurantId', '==', restaurantId).get();
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }

  static async getByBooking(bookingId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('bookingId', '==', bookingId).get();
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }

  static async getByDate(restaurantId, date) {
    const orders = await this.getByRestaurant(restaurantId);
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
      return orderDate === date;
    });
  }

  static async calculateTotals(orderId) {
    const order = await this.getById(orderId);
    if (!order) return null;

    const itemsSnapshot = await db.collection('orderItems').where('orderId', '==', orderId).get();
    
    let subtotal = 0;
    itemsSnapshot.forEach((doc) => {
      subtotal += doc.data().totalPrice * doc.data().quantity;
    });

    const taxAmount = subtotal * (order.taxRate / 100);
    const serviceFeeAmount = subtotal * (order.serviceFeeRate / 100);
    const total = subtotal + taxAmount + serviceFeeAmount + order.tip;

    const updateData = {
      subtotal,
      taxAmount,
      serviceFeeAmount,
      total,
      updatedAt: new Date().toISOString()
    };

    await db.collection(COLLECTION_NAME).doc(orderId).update(updateData);
    return this.getById(orderId);
  }

  static async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async updateTip(id, tip) {
    const updateData = {
      tip,
      total: await this.calculateTotalWithTip(id, tip),
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async calculateTotalWithTip(orderId, tip) {
    const order = await this.getById(orderId);
    if (!order) return 0;
    return order.subtotal + order.taxAmount + order.serviceFeeAmount + tip;
  }

  static async closeOrder(id) {
    const updateData = {
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async splitOrder(id) {
    const updateData = {
      status: 'SPLIT',
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async delete(id) {
    const itemsSnapshot = await db.collection('orderItems').where('orderId', '==', id).get();
    
    for (const itemDoc of itemsSnapshot.docs) {
      await db.collection('orderItems').doc(itemDoc.id).delete();
    }

    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }
}

module.exports = Order;
