import { getAuthHeaders } from './api';

const API_URL = '/api/menu-items';

export const menuItemService = {
  async getAll() {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch menu item');
    return response.json();
  },

  async getGeneralMenu() {
    const response = await fetch(`${API_URL}/general`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch general menu');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getRestaurantMenu(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/menu`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch restaurant menu');
    return response.json();
  },

  async importGeneralMenu(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to import general menu');
    return response.json();
  },

  async getByCategory(restaurantId, category) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/category/${category}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return response.json();
  },

  async getCategories(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/categories`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create menu item');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update menu item');
    return response.json();
  },

  async toggleAvailability(id) {
    const response = await fetch(`${API_URL}/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to toggle availability');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete menu item');
    return response.json();
  },

  async deleteCategory(restaurantId, category) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/category/${category}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete category');
    return response.json();
  },

  async renameCategory(restaurantId, category, newName) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/category/${category}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newName }),
    });
    if (!response.ok) throw new Error('Failed to rename category');
    return response.json();
  },
};