import { getAuthHeaders } from './api';

const API_URL = '/api/reconciliation';

export const reconciliationService = {
  async get(restaurantId, date) {
    const response = await fetch(`${API_URL}/${restaurantId}/${date}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch reconciliation data');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create reconciliation');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update reconciliation');
    return response.json();
  },

  async reconcile(id) {
    const response = await fetch(`${API_URL}/${id}/reconcile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to reconcile');
    return response.json();
  },

  async getHistory(restaurantId, limit = 90) {
    const response = await fetch(`${API_URL}/history/${restaurantId}?limit=${limit}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch reconciliation history');
    return response.json();
  },
};
