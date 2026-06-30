const { db } = require('../config/firebase');

const COLLECTION_NAME = 'booking_tables';

class BookingTable {
  static async create(bookingId, tableId) {
    const data = {
      bookingId,
      tableId,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION_NAME).add(data);
    return { id: docRef.id, ...data };
  }

  static async getByBooking(bookingId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('bookingId', '==', bookingId).get();
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async getByTable(tableId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('tableId', '==', tableId).get();
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async remove(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }

  static async removeByBookingAndTable(bookingId, tableId) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('bookingId', '==', bookingId)
      .where('tableId', '==', tableId)
      .get();
    const deletions = [];
    querySnapshot.forEach((doc) => {
      deletions.push(doc.ref.delete());
    });
    await Promise.all(deletions);
    return { success: true };
  }

  static async removeByBooking(bookingId) {
    const records = await this.getByBooking(bookingId);
    const deletions = records.map(r => db.collection(COLLECTION_NAME).doc(r.id).delete());
    await Promise.all(deletions);
    return { success: true };
  }
}

module.exports = BookingTable;
