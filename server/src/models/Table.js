const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

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

    const docRef = await addDoc(collection(db, COLLECTION_NAME), tableData);
    return { id: docRef.id, ...tableData };
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
    const tables = [];
    querySnapshot.forEach((doc) => {
      tables.push({ id: doc.id, ...doc.data() });
    });
    return tables;
  }

  static async getByRestaurant(restaurantId) {
    const q = query(collection(db, COLLECTION_NAME), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);
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

  static async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }
}

module.exports = Table;