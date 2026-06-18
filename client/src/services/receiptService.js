import { getAuthHeaders } from './api';

const API_URL = '/api/receipts';

export const receiptService = {
  async generate(orderId) {
    const response = await fetch(`${API_URL}/order/${orderId}/generate`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to generate receipt');
    return response.json();
  },

  async save(orderId) {
    const response = await fetch(`${API_URL}/order/${orderId}/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to save receipt');
    return response.json();
  },

  async getByOrder(orderId) {
    const response = await fetch(`${API_URL}/order/${orderId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch receipt');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch receipt');
    return response.json();
  },

  async getAll() {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch receipts');
    return response.json();
  },
};
