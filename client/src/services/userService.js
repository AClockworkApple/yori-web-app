import { getAuthHeaders } from './api';

const API_URL = '/api/users';

export const userService = {
  async getAll() {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getByRole(role) {
    const response = await fetch(`${API_URL}/role/${role}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },
};
