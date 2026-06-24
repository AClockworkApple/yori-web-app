import { getAuthHeaders } from './api';

const API_URL = '/api/gdpr';

export const gdprService = {
  async lookup(email) {
    const response = await fetch(`${API_URL}/lookup/${encodeURIComponent(email)}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to lookup customer data');
    return response.json();
  },

  async erase(email) {
    const response = await fetch(`${API_URL}/erase/${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to erase customer data');
    return response.json();
  },

  async exportData(email) {
    const response = await fetch(`${API_URL}/export/${encodeURIComponent(email)}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to export customer data');
    return response.json();
  },
};
