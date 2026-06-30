const { db } = require('../config/firebase');

const COLLECTION_NAME = 'restaurantHours';

class RestaurantHour {
  static async create(data) {
    const docData = {
      restaurantId: data.restaurantId,
      dayOfWeek: data.dayOfWeek,
      openTime: data.openTime,
      closeTime: data.closeTime,
      breakStart: data.breakStart || null,
      breakEnd: data.breakEnd || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION_NAME).add(docData);
    return { id: docRef.id, ...docData };
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
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('restaurantId', '==', restaurantId).get();
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async getByRestaurantAndDay(restaurantId, dayOfWeek) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .where('dayOfWeek', '==', dayOfWeek)
      .get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
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

module.exports = RestaurantHour;
