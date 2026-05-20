const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

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

    const docRef = await addDoc(collection(db, COLLECTION_NAME), paymentData);
    return { id: docRef.id, ...paymentData };
  }

  static async getById(id) {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getByOrder(orderId) {
    const q = query(collection(db, COLLECTION_NAME), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    const payments = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    return payments;
  }

  static async getByDate(restaurantId, date) {
    const restaurantRef = collection(db, 'restaurants');
    const ordersRef = collection(db, COLLECTION_NAME);
    
    const restaurantSnapshot = await getDocs(restaurantRef);
    const paymentsData = [];
    
    for (const restDoc of restaurantSnapshot.docs) {
      if (restDoc.id !== restaurantId) continue;
      
      const q = query(ordersRef, where('paidAt', '>=', `${date}T00:00:00`), where('paidAt', '<=', `${date}T23:59:59`));
      const paymentsSnapshot = await getDocs(q);
      
      paymentsSnapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...doc.data() });
      });
    }
    
    return paymentsData;
  }

  static async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }
}

module.exports = Payment;