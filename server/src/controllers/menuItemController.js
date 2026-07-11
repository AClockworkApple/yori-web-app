const MenuItem = require('../models/MenuItem');
const { logAction } = require('../utils/auditLogger');

const menuItemController = {
  async create(req, res) {
    try {
      const menuItem = await MenuItem.create(req.body);
      logAction(req.user, 'CREATE', 'MenuItem', menuItem.id, { name: menuItem.name, restaurantId: menuItem.restaurantId }, menuItem.restaurantId);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const menuItems = await MenuItem.getAll();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req, res) {
    try {
      const menuItem = await MenuItem.getById(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getGeneralMenu(req, res) {
    try {
      const menuItems = await MenuItem.getGeneralMenu();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByRestaurant(req, res) {
    try {
      const menuItems = await MenuItem.getByRestaurant(req.params.restaurantId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getRestaurantMenu(req, res) {
    try {
      const menuItems = await MenuItem.getRestaurantMenu(req.params.restaurantId);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async importGeneralMenu(req, res) {
    try {
      const { restaurantId } = req.params;
      const importedItems = await MenuItem.importGeneralMenu(restaurantId);
      logAction(req.user, 'IMPORT', 'MenuItem', null, { restaurantId, count: importedItems.length }, restaurantId);
      res.status(201).json({
        message: `Imported ${importedItems.length} items from general menu`,
        items: importedItems
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getByCategory(req, res) {
    try {
      const { restaurantId, category } = req.params;
      const menuItems = await MenuItem.getByCategory(restaurantId, category);
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await MenuItem.getCategories(req.params.restaurantId);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const menuItem = await MenuItem.update(req.params.id, req.body);
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      logAction(req.user, 'UPDATE', 'MenuItem', menuItem.id, { changes: Object.keys(req.body) }, menuItem.restaurantId);
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async toggleAvailability(req, res) {
    try {
      const menuItem = await MenuItem.toggleAvailability(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      logAction(req.user, 'TOGGLE_AVAILABILITY', 'MenuItem', menuItem.id, { isAvailable: menuItem.isAvailable }, menuItem.restaurantId);
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deletedItem = await MenuItem.getById(req.params.id);
      await MenuItem.delete(req.params.id);
      logAction(req.user, 'DELETE', 'MenuItem', req.params.id, deletedItem ? { name: deletedItem.name } : {});
      res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { restaurantId, category } = req.params;
      const result = await MenuItem.deleteCategory(restaurantId, category);
      logAction(req.user, 'DELETE_CATEGORY', 'MenuItem', null, { restaurantId, category }, restaurantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async renameCategory(req, res) {
    try {
      const { restaurantId, category } = req.params;
      const { newName } = req.body;
      if (!newName) return res.status(400).json({ error: 'newName is required' });
      const result = await MenuItem.renameCategory(restaurantId, category, newName);
      logAction(req.user, 'RENAME_CATEGORY', 'MenuItem', null, { restaurantId, category, newName }, restaurantId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = menuItemController;