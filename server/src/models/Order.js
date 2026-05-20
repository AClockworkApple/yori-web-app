const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

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

    const docRef = await addDoc(collection(db, COLLECTION_NAME), orderData);
    return { id: docRef.id, ...orderData };
  }

  static async getById(id) {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }

  static async getByRestaurant(restaurantId) {
    const q = query(collection(db, COLLECTION_NAME), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  }

  static async getByBooking(bookingId) {
    const q = query(collection(db, COLLECTION_NAME), where('bookingId', '==', bookingId));
    const querySnapshot = await getDocs(q);
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

    const orderItemsRef = collection(db, 'orderItems');
    const q = query(orderItemsRef, where('orderId', '==', orderId));
    const itemsSnapshot = await getDocs(q);
    
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

    await updateDoc(doc(db, COLLECTION_NAME, orderId), updateData);
    return this.getById(orderId);
  }

  static async update(req, res) {
    try {
      const order = await Order.update(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateTip(id, tip) {
    const updateData = {
      tip,
      total: await this.calculateTotalWithTip(id, tip),
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
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
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async splitOrder(id) {
    const updateData = {
      status: 'SPLIT',
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async delete(id) {
    const orderItemsRef = collection(db, 'orderItems');
    const q = query(orderItemsRef, where('orderId', '==', id));
    const itemsSnapshot = await getDocs(q);
    
    for (const itemDoc of itemsSnapshot.docs) {
      await deleteDoc(doc(db, 'orderItems', itemDoc.id));
    }

    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }
}

module.exports = Order;