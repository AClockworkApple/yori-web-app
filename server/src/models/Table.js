const { db } = require('../config/firebase');

const COLLECTION_NAME = 'tables';

class Table {
  static async create(data) {
    const tableData = {
      restaurantId: data.restaurantId,
      name: data.name,
      seats: data.seats,
      isMergeable: data.isMergeable || false,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(tableData);
    return { id: docRef.id, ...tableData };
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
    const tables = [];
    querySnapshot.forEach((doc) => {
      tables.push({ id: doc.id, ...doc.data() });
    });
    return tables;
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('restaurantId', '==', restaurantId).get();
    const tables = [];
    querySnapshot.forEach((doc) => {
      tables.push({ id: doc.id, ...doc.data() });
    });
    return tables;
  }

  static async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async updateStatus(id, status) {
    const updateData = {
      status,
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

module.exports = Table;