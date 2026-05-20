const API_URL = '/api/tables';

export const tableService = {
  async getAll() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch tables');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch table');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
    if (!response.ok) throw new Error('Failed to fetch tables');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create table');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update table');
    return response.json();
  },

  async updateStatus(id, status) {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete table');
    return response.json();
  },
};