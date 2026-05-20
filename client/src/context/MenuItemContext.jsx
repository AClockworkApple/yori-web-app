import { createContext, useContext, useState } from 'react';
import { menuItemService } from '../services/menuItemService';

const MenuItemContext = createContext();

export function MenuItemProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [generalMenuItems, setGeneralMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuItemService.getAll();
      setMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneralMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuItemService.getGeneralMenu();
      setGeneralMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItemsByRestaurant = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuItemService.getByRestaurant(restaurantId);
      setMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantMenu = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await menuItemService.getRestaurantMenu(restaurantId);
      setMenuItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (restaurantId) => {
    try {
      const data = await menuItemService.getCategories(restaurantId);
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const importGeneralMenu = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await menuItemService.importGeneralMenu(restaurantId);
      await fetchMenuItemsByRestaurant(restaurantId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createMenuItem = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newItem = await menuItemService.create(data);
      setMenuItems([...menuItems, newItem]);
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItem = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await menuItemService.update(id, data);
      setMenuItems(menuItems.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuItemAvailability = async (id) => {
    setError(null);
    try {
      const updated = await menuItemService.toggleAvailability(id);
      setMenuItems(menuItems.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMenuItem = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await menuItemService.delete(id);
      setMenuItems(menuItems.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MenuItemContext.Provider value={{
      menuItems,
      generalMenuItems,
      categories,
      loading,
      error,
      fetchMenuItems,
      fetchGeneralMenu,
      fetchMenuItemsByRestaurant,
      fetchRestaurantMenu,
      fetchCategories,
      importGeneralMenu,
      createMenuItem,
      updateMenuItem,
      toggleMenuItemAvailability,
      deleteMenuItem,
    }}>
      {children}
    </MenuItemContext.Provider>
  );
}

export function useMenuItems() {
  const context = useContext(MenuItemContext);
  if (!context) {
    throw new Error('useMenuItems must be used within MenuItemProvider');
  }
  return context;
}