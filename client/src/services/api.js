const API_BASE = '';

let refreshPromise = null;

export function getAuthHeaders() {
  const token = localStorage.getItem('yori_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function tryRefreshToken() {
  if (refreshPromise) return refreshPromise;
  const refreshToken = localStorage.getItem('yori_refresh');
  if (!refreshToken) return false;
  refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then(async (res) => {
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    localStorage.setItem('yori_token', data.idToken);
    if (data.refreshToken) {
      localStorage.setItem('yori_refresh', data.refreshToken);
    }
    return true;
  }).catch(() => {
    localStorage.removeItem('yori_token');
    localStorage.removeItem('yori_refresh');
    localStorage.removeItem('yori_user');
    return false;
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const headers = getAuthHeaders();
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newHeaders = getAuthHeaders();
      if (options.headers) Object.assign(newHeaders, options.headers);
      return fetch(`${API_BASE}${path}`, { ...options, headers: newHeaders });
    }
    window.location.href = '/login';
  }
  return response;
}
