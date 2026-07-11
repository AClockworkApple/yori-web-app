const { db } = require('../config/firebase');

const COLLECTION_NAME = 'auditLogs';

class AuditLog {
  static async create(data) {
    const logData = {
      userId: data.userId,
      userName: data.userName || null,
      userRole: data.userRole || null,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId || null,
      details: data.details || null,
      restaurantId: data.restaurantId || null,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION_NAME).add(logData);
    return { id: docRef.id, ...logData };
  }

  static async getAll(limit = 200) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  }

  static async getByRestaurant(restaurantId, limit = 200) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  }

  static async getByUser(userId, limit = 200) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  }

  static async getByResource(resource, resourceId, limit = 200) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('resource', '==', resource)
      .where('resourceId', '==', resourceId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    const logs = [];
    querySnapshot.forEach((doc) => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  }
}

module.exports = AuditLog;
