const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');

const COLLECTION_NAME = 'restaurants';

class Restaurant {
  static async create(data) {
    const restaurantData = {
      name: data.name,
      address: data.address || '',
      phone: data.phone || '',
      taxNumber: data.taxNumber || '',
      mode: data.mode || 'SEMI_AUTO',
      maxExtensionMinutes: data.maxExtensionMinutes || 60,
      warningBeforeMinutes: data.warningBeforeMinutes || 15,
      slotDurationMinutes: data.slotDurationMinutes || 120,
      bufferMinutes: data.bufferMinutes || 30,
      taxRate: data.taxRate || 0,
      serviceFeeRate: data.serviceFeeRate || 0,
      overbookingPercentage: data.overbookingPercentage || 30,
      dataRetentionDays: data.dataRetentionDays || 30,
      ownerId: data.ownerId,
      managerId: data.managerId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), restaurantData);
    return { id: docRef.id, ...restaurantData };
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
    const restaurants = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    return restaurants;
  }

  static async getByOwner(ownerId) {
    const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', ownerId));
    const querySnapshot = await getDocs(q);
    const restaurants = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    return restaurants;
  }

  static async getByManager(managerId) {
    const q = query(collection(db, COLLECTION_NAME), where('managerId', '==', managerId));
    const querySnapshot = await getDocs(q);
    const restaurants = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    return restaurants;
  }

  static async update(id, data) {
    const updateData = {
      ...data,
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

module.exports = Restaurant;