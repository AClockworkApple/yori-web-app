const API_URL = '/api/orders';

export const orderService = {
  async getAll() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async getByDate(restaurantId, date) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/date/${date}`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },

  async addItem(orderId, itemData) {
    const response = await fetch(`${API_URL}/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error('Failed to add item');
    return response.json();
  },

  async getItems(orderId) {
    const response = await fetch(`${API_URL}/${orderId}/items`);
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  },

  async updateItem(orderId, itemId, data) {
    const response = await fetch(`${API_URL}/${orderId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  },

  async removeItem(orderId, itemId) {
    const response = await fetch(`${API_URL}/${orderId}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove item');
    return response.json();
  },

  async updateTip(id, tip) {
    const response = await fetch(`${API_URL}/${id}/tip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tip }),
    });
    if (!response.ok) throw new Error('Failed to update tip');
    return response.json();
  },

  async processPayment(id, paymentData) {
    const response = await fetch(`${API_URL}/${id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) throw new Error('Failed to process payment');
    return response.json();
  },

  async getPayments(id) {
    const response = await fetch(`${API_URL}/${id}/payments`);
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  },

  async closeOrder(id) {
    const response = await fetch(`${API_URL}/${id}/close`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to close order');
    return response.json();
  },

  async splitOrder(id) {
    const response = await fetch(`${API_URL}/${id}/split`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to split order');
    return response.json();
  },

  async calculateTotals(id) {
    const response = await fetch(`${API_URL}/${id}/calculate`);
    if (!response.ok) throw new Error('Failed to calculate totals');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
    return response.json();
  },
};