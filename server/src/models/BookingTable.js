const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDocs, getDoc, deleteDoc, query, where } = require('firebase/firestore');

const COLLECTION_NAME = 'booking_tables';

class BookingTable {
  static async create(bookingId, tableId) {
    const data = {
      bookingId,
      tableId,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), data);
    return { id: docRef.id, ...data };
  }

  static async getByBooking(bookingId) {
    const q = query(collection(db, COLLECTION_NAME), where('bookingId', '==', bookingId));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async getByTable(tableId) {
    const q = query(collection(db, COLLECTION_NAME), where('tableId', '==', tableId));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async remove(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }

  static async removeByBookingAndTable(bookingId, tableId) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('bookingId', '==', bookingId),
      where('tableId', '==', tableId)
    );
    const querySnapshot = await getDocs(q);
    const deletions = [];
    querySnapshot.forEach((doc) => {
      deletions.push(deleteDoc(doc.ref));
    });
    await Promise.all(deletions);
    return { success: true };
  }

  static async removeByBooking(bookingId) {
    const records = await this.getByBooking(bookingId);
    const deletions = records.map(r => deleteDoc(doc(db, COLLECTION_NAME, r.id)));
    await Promise.all(deletions);
    return { success: true };
  }
}

module.exports = BookingTable;
