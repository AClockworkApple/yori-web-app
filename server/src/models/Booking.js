const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');
const BookingTable = require('./BookingTable');

const COLLECTION_NAME = 'bookings';

class Booking {
  static async create(data) {
    const { tableIds, ...rest } = data;
    const bookingData = {
      restaurantId: rest.restaurantId,
      customerId: rest.customerId || null,
      customerName: rest.customerName,
      customerPhone: rest.customerPhone || null,
      customerEmail: rest.customerEmail || null,
      partySize: rest.partySize,
      scheduledStart: rest.scheduledStart,
      scheduledEnd: rest.scheduledEnd,
      actualStart: null,
      actualEnd: null,
      status: rest.status || 'PENDING',
      source: rest.source || 'pre-booking',
      isOverbooked: rest.isOverbooked || false,
      employeeId: rest.employeeId || null,
      confirmationEmailSentAt: null,
      reminderEmailSentAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), bookingData);
    const booking = { id: docRef.id, ...bookingData };

    if (tableIds && tableIds.length > 0) {
      const tableRecords = await Promise.all(
        tableIds.map(tableId => BookingTable.create(booking.id, tableId))
      );
      booking.tables = tableRecords;
    }

    return booking;
  }

  static async getById(id) {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      const booking = { id: docSnap.id, ...docSnap.data() };
      booking.tables = await BookingTable.getByBooking(id);
      return booking;
    }
    return null;
  }

  static async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    await Promise.all(bookings.map(async (b) => {
      b.tables = await BookingTable.getByBooking(b.id);
    }));
    return bookings;
  }

  static async getByRestaurant(restaurantId) {
    const q = query(collection(db, COLLECTION_NAME), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);
    const bookings = [];
    querySnapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    await Promise.all(bookings.map(async (b) => {
      b.tables = await BookingTable.getByBooking(b.id);
    }));
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

  static async getWalkInsByRestaurant(restaurantId) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('restaurantId', '==', restaurantId),
      where('source', '==', 'walk-in')
    );
    const querySnapshot = await getDocs(q);
    const walkIns = [];
    querySnapshot.forEach((doc) => {
      walkIns.push({ id: doc.id, ...doc.data() });
    });
    walkIns.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return walkIns;
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

  static async seatCustomer(id, actualStart) {
    const updateData = {
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