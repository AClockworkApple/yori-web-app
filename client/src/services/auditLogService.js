import { getAuthHeaders } from './api';

const API_URL = '/api/audit-logs';

export const auditLogService = {
  async getAll(restaurantId, limit) {
    const params = new URLSearchParams();
    if (restaurantId) params.set('restaurantId', restaurantId);
    if (limit) params.set('limit', limit);
    const response = await fetch(`${API_URL}?${params}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  async getByUser(userId) {
    const response = await fetch(`${API_URL}/user/${userId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  async getByResource(resource, resourceId) {
    const response = await fetch(`${API_URL}/resource/${resource}/${resourceId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },
};
