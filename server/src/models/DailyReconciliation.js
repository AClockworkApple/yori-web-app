const { db } = require('../config/firebase');

const COLLECTION_NAME = 'dailyReconciliations';

class DailyReconciliation {
  static async create(data) {
    const docData = {
      restaurantId: data.restaurantId,
      date: data.date,
      expectedCash: data.expectedCash || 0,
      expectedCard: data.expectedCard || 0,
      expectedOther: data.expectedOther || 0,
      expectedTotal: data.expectedTotal || 0,
      declaredCash: data.declaredCash || 0,
      declaredCard: data.declaredCard || 0,
      declaredOther: data.declaredOther || 0,
      declaredTotal: data.declaredTotal || 0,
      cashVariance: (data.declaredCash || 0) - (data.expectedCash || 0),
      cardVariance: (data.declaredCard || 0) - (data.expectedCard || 0),
      notes: data.notes || '',
      status: data.status || 'PENDING',
      reconciledBy: data.reconciledBy || null,
      reconciledAt: data.reconciledAt || null,
      openingBalance: data.openingBalance || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION_NAME).add(docData);
    return { id: docRef.id, ...docData };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
  }

  static async getByRestaurantAndDate(restaurantId, date) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .where('date', '==', date)
      .limit(1)
      .get();
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async getByRestaurant(restaurantId, limit = 90) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .orderBy('date', 'desc')
      .limit(limit)
      .get();
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async update(id, data) {
    const updateData = { ...data, updatedAt: new Date().toISOString() };
    if ('declaredCash' in data) {
      const existing = await this.getById(id);
      if (existing) {
        updateData.cashVariance = (data.declaredCash || 0) - (existing.expectedCash || 0);
      }
    }
    if ('declaredCard' in data) {
      const existing = await this.getById(id);
      if (existing) {
        updateData.cardVariance = (data.declaredCard || 0) - (existing.expectedCard || 0);
      }
    }
    if ('declaredCash' in data || 'declaredCard' in data || 'declaredOther' in data) {
      const existing = await this.getById(id);
      if (existing) {
        const dCash = data.declaredCash !== undefined ? data.declaredCash : existing.declaredCash;
        const dCard = data.declaredCard !== undefined ? data.declaredCard : existing.declaredCard;
        const dOther = data.declaredOther !== undefined ? data.declaredOther : existing.declaredOther;
        updateData.declaredTotal = dCash + dCard + dOther;
      }
    }
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async reconcile(id, userId) {
    const updateData = {
      status: 'RECONCILED',
      reconciledBy: userId,
      reconciledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }
}

module.exports = DailyReconciliation;
