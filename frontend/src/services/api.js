const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function request(endpoint, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  // Only set application/json if we are not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Inject Bearer token
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle Token Expiration and Refresh (once per request)
  if (response.status === 401 && !options._retry) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      options._retry = true;
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.status === 'success' && refreshData.data) {
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            localStorage.setItem('refreshToken', refreshData.data.refreshToken);
            
            // Retry original request with new token
            headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            response = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers
            });
          }
        } else {
          // Token renewal failed, log out user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Failed to refresh authentication token:', err);
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Something went wrong' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => {
    const isMultipart = body instanceof FormData;
    return request(endpoint, { 
      method: 'POST', 
      body: isMultipart ? body : JSON.stringify(body), 
      ...options 
    });
  },
  put: (endpoint, body, options) => {
    const isMultipart = body instanceof FormData;
    return request(endpoint, { 
      method: 'PUT', 
      body: isMultipart ? body : JSON.stringify(body), 
      ...options 
    });
  },
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options })
};
