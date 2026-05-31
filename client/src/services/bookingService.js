import { getAuthHeaders } from './api';

const API_URL = '/api/bookings';

export const bookingService = {
  async getAll() {
    const response = await fetch(API_URL, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  },

  async getByRestaurant(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getByDate(restaurantId, date) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/date/${date}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async getWalkIns(restaurantId) {
    const response = await fetch(`${API_URL}/restaurant/${restaurantId}/walk-ins`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch walk-ins');
    return response.json();
  },

  async create(data) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  },

  async update(id, data) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update booking');
    return response.json();
  },

  async updateStatus(id, status) {
    const response = await fetch(`${API_URL}/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  },

  async seatCustomer(id, actualStart) {
    const response = await fetch(`${API_URL}/${id}/seat`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ actualStart }),
    });
    if (!response.ok) throw new Error('Failed to seat customer');
    return response.json();
  },

  async getBookingTables(bookingId) {
    const response = await fetch(`${API_URL}/${bookingId}/tables`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch booking tables');
    return response.json();
  },

  async addBookingTable(bookingId, tableId) {
    const response = await fetch(`${API_URL}/${bookingId}/tables`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tableId }),
    });
    if (!response.ok) throw new Error('Failed to add table to booking');
    return response.json();
  },

  async removeBookingTable(bookingId, tableId) {
    const response = await fetch(`${API_URL}/${bookingId}/tables/${tableId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to remove table from booking');
    return response.json();
  },

  async completeBooking(id, actualEnd) {
    const response = await fetch(`${API_URL}/${id}/complete`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ actualEnd }),
    });
    if (!response.ok) throw new Error('Failed to complete booking');
    return response.json();
  },

  async extendBooking(id, newEndTime, employeeId) {
    const response = await fetch(`${API_URL}/${id}/extend`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newEndTime, employeeId }),
    });
    if (!response.ok) throw new Error('Failed to extend booking');
    return response.json();
  },

  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete booking');
    return response.json();
  },
};
