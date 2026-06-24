import { getAuthHeaders } from './api';

const API_URL = '/api/reports';

export const reportService = {
  async getDaily(restaurantId, date) {
    const response = await fetch(`${API_URL}/daily/${restaurantId}/${date}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch daily report');
    return response.json();
  },
};
