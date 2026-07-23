const { db } = require('../config/firebase');
const { encrypt, decrypt } = require('../utils/encryption');

const COLLECTION_NAME = 'aiConfigs';
const PROVIDERS = ['gemini', 'openai', 'claude', 'deepseek', 'mistral', 'cohere'];

class AiConfig {
  static async create(data) {
    const { encrypted, iv, authTag } = encrypt(data.apiKey);

    const configData = {
      restaurantId: data.restaurantId,
      provider: data.provider,
      encryptedKey: encrypted,
      iv,
      authTag,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(COLLECTION_NAME).add(configData);
    return { id: docRef.id, restaurantId: configData.restaurantId, provider: configData.provider, isActive: configData.isActive, createdAt: configData.createdAt };
  }

  static async getById(id) {
    const docSnap = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!docSnap.exists) return null;
    const data = docSnap.data();
    const apiKey = decrypt(data.encryptedKey, data.iv, data.authTag);
    return { id: docSnap.id, ...data, apiKey };
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .get();
    const configs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      configs.push({
        id: doc.id,
        restaurantId: data.restaurantId,
        provider: data.provider,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    return configs;
  }

  static async getActiveByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const apiKey = decrypt(data.encryptedKey, data.iv, data.authTag);
    return { id: doc.id, ...data, apiKey };
  }

  static async update(id, data) {
    const updateData = { updatedAt: new Date().toISOString() };

    if (data.apiKey) {
      const { encrypted, iv, authTag } = encrypt(data.apiKey);
      updateData.encryptedKey = encrypted;
      updateData.iv = iv;
      updateData.authTag = authTag;
    }
    if (data.provider) updateData.provider = data.provider;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async deactivate(id) {
    await db.collection(COLLECTION_NAME).doc(id).update({
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }

  static getProviders() {
    return PROVIDERS;
  }
}

module.exports = AiConfig;
