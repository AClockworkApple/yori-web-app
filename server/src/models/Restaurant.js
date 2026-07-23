const { db } = require('../config/firebase');

const COLLECTION_NAME = 'restaurants';

class Restaurant {
  static async create(data) {
    const restaurantData = {
      name: data.name,
      address: data.address || '',
      phone: data.phone || '',
      taxNumber: data.taxNumber || '',
      mode: data.mode || 'AUTO',
      maxExtensionMinutes: data.maxExtensionMinutes || 60,
      warningBeforeMinutes: data.warningBeforeMinutes || 15,
      slotDurationMinutes: data.slotDurationMinutes || 120,
      bufferMinutes: data.bufferMinutes || 30,
      taxRate: data.taxRate || 0,
      serviceFeeRate: data.serviceFeeRate || 0,
      overbookingPercentage: data.overbookingPercentage || 30,
      dataRetentionDays: data.dataRetentionDays || 30,
      logoUrl: data.logoUrl || '',
      heroImageUrl: data.heroImageUrl || '',
      heroVideoUrl: data.heroVideoUrl || '',
      storyImageUrl: data.storyImageUrl || '',
      ownerId: data.ownerId,
      managerId: data.managerId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(restaurantData);
    return { id: docRef.id, ...restaurantData };
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
    const restaurants = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    return restaurants;
  }

  static async getByOwner(ownerId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('ownerId', '==', ownerId).get();
    const restaurants = [];
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    return restaurants;
  }

  static async getByManager(managerId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('managerId', '==', managerId).get();
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
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }
}

module.exports = Restaurant;
