import { getAuthHeaders } from './api';

const API_URL = '/api/announcements';

export const announcementService = {
  async getAll() {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch announcements');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch announcements');
    return response.json();
  },

  async getActive(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/active`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch active announcements');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create announcement');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update announcement');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete announcement');
    return response.json();
  },
};
