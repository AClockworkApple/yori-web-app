const { db } = require('../config/firebase');

const COLLECTION_NAME = 'announcements';

class Announcement {
  static async create(data) {
    const announcementData = {
      message: data.message,
      priority: data.priority || 'INFO',
      createdBy: data.createdBy,
      restaurantId: data.restaurantId,
      active: data.active !== false,
      expiresAt: data.expiresAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(announcementData);
    return { id: docRef.id, ...announcementData };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getAll() {
    const querySnapshot = await db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get();
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    return announcements;
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('restaurantId', '==', restaurantId).get();
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return announcements;
  }

  static async getActiveByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .where('active', '==', true)
      .get();
    const now = new Date().toISOString();
    const announcements = [];
    querySnapshot.forEach((doc) => {
      const a = { id: doc.id, ...doc.data() };
      if (a.expiresAt && a.expiresAt < now) return;
      announcements.push(a);
    });
    announcements.sort((a, b) => {
      const priorityOrder = { IMPORTANT: 0, WARNING: 1, INFO: 2 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
    return announcements;
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

module.exports = Announcement;
