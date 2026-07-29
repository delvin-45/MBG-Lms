const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Fungsi utama pemicu HTTP Request ke Backend (Single Gateway)
export async function request(endpoint, options = {}) {
  const { headers: extraHeaders, body, ...restOptions } = options;

  const headers = {};

  // Jika payload BUKAN FormData (bukan upload file), set format JSON biasa.
  // Khusus FormData, Content-Type sengaja dikosongkan agar browser otomatis buat boundary.
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    Object.assign(headers, extraHeaders || {});
  }

  // Otomatis tempelkan token JWT dari localStorage jika user sudah login
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    body,
    headers
  });

  // Jika Token expired (Error 401), coba minta token baru pakai Refresh Token secara otomatis
  if (response.status === 401 && !options._retry) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      options._retry = true; // Tandai agar tidak looping terus
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.status === 'success' && refreshData.data) {
            // Simpan token baru
            localStorage.setItem('accessToken', refreshData.data.accessToken);
            localStorage.setItem('refreshToken', refreshData.data.refreshToken);
            
            // Ulangi request asli yang sempat gagal tadi pakai token baru
            headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
            response = await fetch(`${API_URL}${endpoint}`, {
              ...restOptions,
              body,
              headers
            });
          }
        } else {
          // Jika refresh token juga hangus -> Paksa user keluar ke halaman login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Gagal memperbarui token autentikasi:', err);
      }
    }
  }

  // Tangkap pesan error dari backend agar tidak crash
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Terjadi kesalahan sistem' }));
    throw new Error(error.message || 'Gagal memproses permintaan');
  }

  return response.json();
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { 
    method: 'POST', 
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options 
  }),
  put: (endpoint, body, options) => request(endpoint, { 
    method: 'PUT', 
    body: body instanceof FormData ? body : JSON.stringify(body),
    ...options 
  }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options })
};
