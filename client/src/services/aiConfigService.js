import { getAuthHeaders } from './api';

const API_URL = '/api/ai';

export const aiConfigService = {
  async getProviders() {
    const response = await fetch(`${API_URL}/providers`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch providers');
    return response.json();
  },

  async getConfigs(restaurantId) {
    const response = await fetch(`${API_URL}/${restaurantId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch AI configs');
    return response.json();
  },

  async getActiveConfig(restaurantId) {
    const response = await fetch(`${API_URL}/${restaurantId}/active`, { headers: getAuthHeaders() });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch active AI config');
    }
    return response.json();
  },

  async createConfig(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create AI config');
    return response.json();
  },

  async updateConfig(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update AI config');
    return response.json();
  },

  async deleteConfig(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete AI config');
    return response.json();
  },

  async query(restaurantId, query) {
    const response = await fetch(`${API_URL}/query`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ restaurantId, query }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Query failed');
    }
    return response.json();
  },
};
