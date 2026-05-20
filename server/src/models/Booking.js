const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

const COLLECTION_NAME = 'bookings';

class Booking {
  static async create(data) {
    const bookingData = {
      restaurantId: data.restaurantId,
      tableId: data.tableId || null,
      customerId: data.customerId || null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      partySize: data.partySize,
      scheduledStart: data.scheduledStart,
      scheduledEnd: data.scheduledEnd,
      actualStart: null,
      actualEnd: null,
      status: 'PENDING',
      isOverbooked: data.isOverbooked || false,
      employeeId: data.employeeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), bookingData);
    return { id: docRef.id, ...bookingData };
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
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  }

  static async getByRestaurant(restaurantId) {
    const q = query(collection(db, COLLECTION_NAME), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  }

  static async getByTable(tableId) {
    const q = query(collection(db, COLLECTION_NAME), where('tableId', '==', tableId));
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  }

  static async getByStatus(restaurantId, status) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('restaurantId', '==', restaurantId),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    return bookings;
  }

  static async getByDate(restaurantId, date) {
    const bookings = await this.getByRestaurant(restaurantId);
    return bookings.filter(b => {
      const bookingDate = new Date(b.scheduledStart).toISOString().split('T')[0];
      return bookingDate === date;
    });
  }

  static async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async updateStatus(id, status) {
    const updateData = {
      status,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async seatCustomer(id, tableId, actualStart) {
    const updateData = {
      tableId,
      status: 'SEATED',
      actualStart: actualStart || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async completeBooking(id, actualEnd) {
    const updateData = {
      status: 'COMPLETED',
      actualEnd: actualEnd || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async extendBooking(id, newEndTime, employeeId) {
    const booking = await this.getById(id);
    const extensions = booking.extensions || [];
    extensions.push({
      extendedTo: newEndTime,
      extendedBy: employeeId,
      extendedAt: new Date().toISOString()
    });
    
    const updateData = {
      scheduledEnd: newEndTime,
      extensions,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }
}

module.exports = Booking;