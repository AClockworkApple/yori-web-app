const API_URL = '/api/menu-items';

export const menuItemService = {
  async getAll() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch menu item');
    return response.json();
  },

  async getGeneralMenu() {
    const response = await fetch(`${API_URL}/general`);
    if (!response.ok) throw new Error('Failed to fetch general menu');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getRestaurantMenu(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/menu`);
    if (!response.ok) throw new Error('Failed to fetch restaurant menu');
    return response.json();
  },

  async importGeneralMenu(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/import`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to import general menu');
    return response.json();
  },

  async getByCategory(restaurantId, category) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/category/${category}`);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getCategories(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create menu item');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update menu item');
    return response.json();
  },

  async toggleAvailability(id) {
    const response = await fetch(`${API_URL}/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to toggle availability');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete menu item');
    return response.json();
  },
};