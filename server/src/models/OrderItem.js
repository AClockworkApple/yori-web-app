const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

const COLLECTION_NAME = 'orderItems';

class OrderItem {
  static async create(data) {
    const orderItemData = {
      orderId: data.orderId,
      menuItemId: data.menuItemId,
      menuItemName: data.menuItemName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice: data.unitPrice * data.quantity,
      notes: data.notes || '',
      splitGroup: data.splitGroup || 'default',
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), orderItemData);
    return { id: docRef.id, ...orderItemData };
  }

  static async getById(id) {
    const docSnap = await getDoc(doc(db, COLLECTION_NAME, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getByOrder(orderId) {
    const q = query(collection(db, COLLECTION_NAME), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }

  static async getBySplitGroup(orderId, splitGroup) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('orderId', '==', orderId),
      where('splitGroup', '==', splitGroup)
    );
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }

  static async getSplitGroups(orderId) {
    const items = await this.getByOrder(orderId);
    const groups = [...new Set(items.map(item => item.splitGroup))];
    return groups;
  }

  static async update(id, data) {
    const updateData = { ...data };
    if (data.quantity !== undefined && data.unitPrice !== undefined) {
      updateData.totalPrice = data.unitPrice * data.quantity;
    }
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async updateQuantity(id, quantity) {
    const item = await this.getById(id);
    if (!item) return null;
    
    const updateData = {
      quantity,
      totalPrice: item.unitPrice * quantity
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return { success: true };
  }

  static async deleteByOrder(orderId) {
    const q = query(collection(db, COLLECTION_NAME), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    const deleted = [];
    querySnapshot.forEach((doc) => {
      deleted.push(doc.id);
      deleteDoc(doc(db, COLLECTION_NAME, doc.id));
    });
    return deleted;
  }
}

module.exports = OrderItem;