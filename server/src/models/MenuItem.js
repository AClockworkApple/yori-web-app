const { db } = require('../config/firebase');

const COLLECTION_NAME = 'menuItems';
const DEFAULT_CATEGORIES = ['General', 'Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Side Dish', 'Soup', 'Salad'];

class MenuItem {
  static async create(data) {
    const menuItemData = {
      restaurantId: data.restaurantId || null,
      name: data.name,
      description: data.description || '',
      price: data.price,
      category: data.category || 'General',
      itemNumber: data.itemNumber || '',
      imageUrl: data.imageUrl || '',
      isAvailable: data.isAvailable !== false,
      isGeneral: data.isGeneral || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(COLLECTION_NAME).add(menuItemData);
    return { id: docRef.id, ...menuItemData };
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
    const menuItems = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    return menuItems;
  }

  static async getGeneralMenu() {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('isGeneral', '==', true).get();
    const menuItems = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    return menuItems;
  }

  static async getByRestaurant(restaurantId) {
    const querySnapshot = await db.collection(COLLECTION_NAME).where('restaurantId', '==', restaurantId).get();
    const menuItems = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    return menuItems;
  }

  static async getRestaurantMenu(restaurantId) {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('restaurantId', '==', restaurantId).get();

    const menuItems = [];
    snapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data(), source: 'custom' });
    });
    return menuItems;
  }

  static async importGeneralMenu(restaurantId) {
    const generalItems = await this.getGeneralMenu();
    const restaurantItems = await this.getByRestaurant(restaurantId);
    const results = [];

    for (const general of generalItems) {
      const existing = restaurantItems.find(r => r.name === general.name);

      if (!existing) {
        const created = await this.create({
          restaurantId,
          name: general.name,
          description: general.description,
          price: general.price,
          category: general.category,
          itemNumber: general.itemNumber || '',
          imageUrl: general.imageUrl || '',
          isAvailable: general.isAvailable,
          isGeneral: false,
        });
        results.push({ action: 'created', item: created });
      } else if (
        existing.itemNumber !== (general.itemNumber || '') ||
        existing.price !== general.price ||
        existing.description !== (general.description || '') ||
        existing.category !== general.category
      ) {
        const updated = await this.update(existing.id, {
          name: general.name,
          description: general.description,
          price: general.price,
          category: general.category,
          itemNumber: general.itemNumber || '',
          imageUrl: general.imageUrl || '',
          isAvailable: general.isAvailable,
        });
        results.push({ action: 'updated', item: updated });
      } else {
        results.push({ action: 'skipped', item: existing });
      }
    }

    return results;
  }

  static async getByCategory(restaurantId, category) {
    const menuItems = await this.getRestaurantMenu(restaurantId);
    return menuItems.filter(item => item.category === category);
  }

  static async getCategories(restaurantId) {
    const menuItems = await this.getRestaurantMenu(restaurantId);
    const existingCategories = [...new Set(menuItems.map(item => item.category))];
    const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories])];
    return allCategories.sort();
  }

  static async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async toggleAvailability(id) {
    const menuItem = await this.getById(id);
    if (!menuItem) return null;

    const updateData = {
      isAvailable: !menuItem.isAvailable,
      updatedAt: new Date().toISOString()
    };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    return this.getById(id);
  }

  static async delete(id) {
    await db.collection(COLLECTION_NAME).doc(id).delete();
    return { success: true };
  }

  static async deleteCategory(restaurantId, category) {
    const items = await this.getByRestaurant(restaurantId);
    const toUpdate = items.filter(i => i.category === category);
    for (const item of toUpdate) {
      await this.update(item.id, { category: 'General' });
    }
    return { renamed: toUpdate.length };
  }

  static async renameCategory(restaurantId, oldName, newName) {
    const items = await this.getByRestaurant(restaurantId);
    const toUpdate = items.filter(i => i.category === oldName);
    for (const item of toUpdate) {
      await this.update(item.id, { category: newName });
    }
    return { renamed: toUpdate.length };
  }
}

module.exports = MenuItem;
module.exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
