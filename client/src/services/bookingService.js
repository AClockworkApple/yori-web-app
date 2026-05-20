const API_URL = '/api/bookings';

export const bookingService = {
  async getAll() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getByTable(tableId) {
    const response = await fetch(`${API_URL}/table/${tableId}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getByDate(restaurantId, date) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/date/${date}`);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update booking');
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

  async seatCustomer(id, tableId, actualStart) {
    const response = await fetch(`${API_URL}/${id}/seat`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, actualStart }),
    });
    if (!response.ok) throw new Error('Failed to seat customer');
    return response.json();
  },

  async completeBooking(id, actualEnd) {
    const response = await fetch(`${API_URL}/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actualEnd }),
    });
    if (!response.ok) throw new Error('Failed to complete booking');
    return response.json();
  },

  async extendBooking(id, newEndTime, employeeId) {
    const response = await fetch(`${API_URL}/${id}/extend`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newEndTime, employeeId }),
    });
    if (!response.ok) throw new Error('Failed to extend booking');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    return response.json();
  },
};