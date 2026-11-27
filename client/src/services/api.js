const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

export function getToken() {
  return localStorage.getItem('labledger_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('labledger_token', token);
  } else {
    localStorage.removeItem('labledger_token');
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // If token invalid, clear token but allow component to handle redirect
    localStorage.removeItem('labledger_token');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Deep sanitize replacement characters (e.g. \uFFFD from historical degree symbols)
  const sanitize = (val) => {
    if (typeof val === 'string') return val.replace(/\uFFFD/g, '°');
    if (Array.isArray(val)) return val.map(sanitize);
    if (val !== null && typeof val === 'object') {
      const copy = {};
      for (const k in val) copy[k] = sanitize(val[k]);
      return copy;
    }
    return val;
  };

  return sanitize(data);
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => apiRequest('/auth/me'),
  getUsers: () => apiRequest('/auth/users'),
  updateUserRole: (id, role) => apiRequest(`/auth/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),

  // Samples
  getSamples: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/samples${query ? `?${query}` : ''}`);
  },
  getSampleById: (id) => apiRequest(`/samples/${id}`),
  lookupBySampleId: (sampleId) => apiRequest(`/samples/by-id/${sampleId}`),
  createSample: (data) => apiRequest('/samples', { method: 'POST', body: JSON.stringify(data) }),
  updateSample: (id, data) => apiRequest(`/samples/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSample: (id) => apiRequest(`/samples/${id}`, { method: 'DELETE' }),
  getExpiringAlerts: (days = 7) => apiRequest(`/samples/alerts/expiring?days=${days}`),
  triggerExpiryCron: (days = 7) => apiRequest('/samples/alerts/trigger-cron', { method: 'POST', body: JSON.stringify({ days }) }),

  // Storage
  getStorageTree: () => apiRequest('/storage/tree'),
  getBoxGrid: (boxId) => apiRequest(`/storage/box/${boxId}`),
  createStorageNode: (data) => apiRequest('/storage/nodes', { method: 'POST', body: JSON.stringify(data) }),
  deleteStorageNode: (id) => apiRequest(`/storage/nodes/${id}`, { method: 'DELETE' }),

  // Transfers
  getTransfers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/transfers${query ? `?${query}` : ''}`);
  },
  createTransfer: (data) => apiRequest('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  approveTransfer: (id) => apiRequest(`/transfers/${id}/approve`, { method: 'PUT' }),

  // Experiments
  getExperiments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/experiments${query ? `?${query}` : ''}`);
  },
  getExperimentById: (id) => apiRequest(`/experiments/${id}`),
  createExperiment: (data) => apiRequest('/experiments', { method: 'POST', body: JSON.stringify(data) }),
  updateExperiment: (id, data) => apiRequest(`/experiments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExperiment: (id) => apiRequest(`/experiments/${id}`, { method: 'DELETE' }),

  // Audit
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/audit${query ? `?${query}` : ''}`);
  },
  exportAuditLogs: (format = 'csv') => `${API_BASE}/audit/export?format=${format}`,

  // Stats & Settings
  getStats: () => apiRequest('/stats'),
  getSettings: () => apiRequest('/stats/settings'),
  updateSettings: (data) => apiRequest('/stats/settings', { method: 'PUT', body: JSON.stringify(data) })
};
