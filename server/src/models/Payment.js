const { db } = require('../config/firebase');

const COLLECTION_NAME = 'payments';

class Payment {
  static async create(data) {
    const paymentData = {
      orderId: data.orderId,
      amount: data.amount,
      method: data.method,
      amountReceived: data.amountReceived || null,
      changeGiven: data.changeGiven || null,
      paidAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(paymentData);
    return { id: docRef.id, ...paymentData };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getByOrder(orderId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('orderId', '==', orderId).get();
    const payments = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    return payments;
  }

  static async getByDate(restaurantId, date) {
    const restaurantSnapshot = await db.collection('restaurants').get();
    const paymentsData = [];

    for (const restDoc of restaurantSnapshot.docs) {
      if (restDoc.id !== restaurantId) continue;

      const paymentsSnapshot = await db.collection(COLLECTION_NAME)
        .where('paidAt', '>=', `${date}T00:00:00`)
        .where('paidAt', '<=', `${date}T23:59:59`)
        .get();

      paymentsSnapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...doc.data() });
      });
    }

    return paymentsData;
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }
}

module.exports = Payment;
