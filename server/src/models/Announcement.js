const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } = require('firebase/firestore');

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

    const docRef = await addDoc(collection(db, COLLECTION_NAME), announcementData);
    return { id: docRef.id, ...announcementData };
  }

  static async getById(id) {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getAll() {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    return announcements;
  }

  static async getByRestaurant(restaurantId) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('restaurantId', '==', restaurantId)
    );
    const querySnapshot = await getDocs(q);
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return announcements;
  }

  static async getActiveByRestaurant(restaurantId) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('restaurantId', '==', restaurantId),
      where('active', '==', true)
    );
    const querySnapshot = await getDocs(q);
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
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }
}

module.exports = Announcement;
