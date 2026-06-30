const { db } = require('../config/firebase');

const COLLECTION_NAME = 'users';

class User {
  static async create(data) {
    const userData = {
      firebaseUid: data.firebaseUid || null,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash || null,
      role: data.role || 'STAFF',
      restaurantId: data.restaurantId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const validRoles = ['OWNER', 'MANAGER', 'STAFF', 'CUSTOMER'];
    if (!validRoles.includes(userData.role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const docRef = await db.collection(COLLECTION_NAME).add(userData);
    return { id: docRef.id, ...userData };
  }

  static async getByFirebaseUid(firebaseUid) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('firebaseUid', '==', firebaseUid).get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
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
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  }

  static async getByRole(role) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('role', '==', role).get();
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('restaurantId', '==', restaurantId).get();
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  }

  static async getByEmail(email) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('email', '==', email).get();
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

module.exports = User;
