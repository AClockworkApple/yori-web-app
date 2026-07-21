const { db } = require('../config/firebase');

const COLLECTION_NAME = 'conversations';
const MESSAGES_COLLECTION = 'messages';

class Conversation {
  static async create(data) {
    const convData = {
      restaurantId: data.restaurantId,
      customerName: data.customerName || null,
      customerEmail: data.customerEmail || null,
      status: 'active',
      messageCount: 0,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION_NAME).add(convData);
    return { id: docRef.id, ...convData };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
  }

  static async getByRestaurant(restaurantId, limit = 50) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }

  static async addMessage(conversationId, role, content) {
    const msgData = {
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString(),
    };

    await db.collection(COLLECTION_NAME).doc(conversationId).update({
      messageCount: db.FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });

    const docRef = await db.collection(COLLECTION_NAME)
      .doc(conversationId)
      .collection(MESSAGES_COLLECTION)
      .add(msgData);

    return { id: docRef.id, ...msgData };
  }

  static async getMessages(conversationId) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .doc(conversationId)
      .collection(MESSAGES_COLLECTION)
      .orderBy('createdAt', 'asc')
      .get();

    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages;
  }

  static async getRecentMessages(conversationId, count = 20) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .doc(conversationId)
      .collection(MESSAGES_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(count)
      .get();

    const messages = [];
    querySnapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    return messages.reverse();
  }

  static async closeConversation(id) {
    await db.collection(COLLECTION_NAME).doc(id).update({
      status: 'closed',
      updatedAt: new Date().toISOString(),
    });
    return this.getById(id);
  }
}

module.exports = Conversation;
