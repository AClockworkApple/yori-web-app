const { db } = require('../config/firebase');
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where } = require('firebase/firestore');

const COLLECTION_NAME = 'menuItems';

class MenuItem {
  static async create(data) {
    const menuItemData = {
      restaurantId: data.restaurantId || null,
      name: data.name,
      description: data.description || '',
      price: data.price,
      category: data.category || 'General',
      isAvailable: data.isAvailable !== false,
      isGeneral: data.isGeneral || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), menuItemData);
    return { id: docRef.id, ...menuItemData };
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
    const menuItems = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    return menuItems;
  }

  static async getGeneralMenu() {
    const q = query(collection(db, COLLECTION_NAME), where('isGeneral', '==', true));
    const querySnapshot = await getDocs(q);
    const menuItems = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    return menuItems;
  }

  static async getByRestaurant(restaurantId) {
    const q = query(collection(db, COLLECTION_NAME), where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);
    const menuItems = [];
    querySnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    return menuItems;
  }

  static async getRestaurantMenu(restaurantId) {
    const q1 = query(collection(db, COLLECTION_NAME), where('isGeneral', '==', true));
    const q2 = query(collection(db, COLLECTION_NAME), where('restaurantId', '==', restaurantId));
    
    const [generalSnapshot, customSnapshot] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    const menuItems = [];
    generalSnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data(), source: 'general' });
    });
    customSnapshot.forEach((doc) => {
      menuItems.push({ id: doc.id, ...doc.data(), source: 'custom' });
    });
    return menuItems;
  }

  static async importGeneralMenu(restaurantId) {
    const generalItems = await this.getGeneralMenu();
    const importedItems = [];
    
    for (const item of generalItems) {
      const imported = await this.create({
        restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable,
        isGeneral: false,
      });
      importedItems.push(imported);
    }
    
    return importedItems;
  }

  static async getByCategory(restaurantId, category) {
    const menuItems = await this.getRestaurantMenu(restaurantId);
    return menuItems.filter(item => item.category === category);
  }

  static async getCategories(restaurantId) {
    const menuItems = await this.getRestaurantMenu(restaurantId);
    const categories = [...new Set(menuItems.map(item => item.category))];
    return categories.sort();
  }

  static async update(id, data) {
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(doc(db, COLLECTION_NAME, id), updateData);
    return this.getById(id);
  }

  static async toggleAvailability(id) {
    const menuItem = await this.getById(id);
    if (!menuItem) return null;
    
    const updateData = {
      isAvailable: !menuItem.isAvailable,
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

module.exports = MenuItem;