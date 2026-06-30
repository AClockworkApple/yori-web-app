const { db } = require('../config/firebase');

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

    const docRef = await db.collection(COLLECTION_NAME).add(orderItemData);
    return { id: docRef.id, ...orderItemData };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  static async getByOrder(orderId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('orderId', '==', orderId).get();
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }

  static async getBySplitGroup(orderId, splitGroup) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('orderId', '==', orderId)
      .where('splitGroup', '==', splitGroup)
      .get();
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
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async updateQuantity(id, quantity) {
    const item = await this.getById(id);
    if (!item) return null;

    const updateData = {
      quantity,
      totalPrice: item.unitPrice * quantity
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }

  static async deleteByOrder(orderId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('orderId', '==', orderId).get();
    const deleted = [];
    querySnapshot.forEach((doc) => {
      deleted.push(doc.id);
      db.collection(COLLECTION_NAME).doc(doc.id).delete();
    });
    return deleted;
  }
}

module.exports = OrderItem;
