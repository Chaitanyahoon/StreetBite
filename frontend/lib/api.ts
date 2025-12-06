import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token if available
api.interceptors.request.use(async (config) => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

// Add a response interceptor to handle errors
api.interceptors.response.use((res) => res.data, (error: any) => {
  if (error.response) {
    // Don't log 403 errors to console to avoid development overlay for banned users
    if (error.response.status !== 403) {
      console.error('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        message: error.message,
        url: error.config?.url
      })
    }
  } else {
    console.error('API Error (Network/Unknown):', error.message || 'Network Error')
  }
  // If 401 Unauthorized, clear token and redirect to login
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Optionally redirect to login
    // window.location.href = '/signin';
  }

  return Promise.reject(error)
})

export interface RegisterRequest {
  email: string
  displayName: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'
  businessName?: string
  location?: {
    latitude: number
    longitude: number
  }
}

export const authApi = {
  register: (data: any) => api.post('/auth/register', data) as Promise<any>,
  login: (data: any) => api.post('/auth/login', data) as Promise<any>,
  getUser: (id: string) => api.get(`/auth/user/${id}`) as Promise<any>,
  getUserByUid: (uid: string) => api.get(`/auth/user/uid/${uid}`) as Promise<any>,
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }) as Promise<any>,
  resetPassword: (data: any) => api.post('/auth/reset-password', data) as Promise<any>,
};

export const userApi = {
  getAll: () => api.get('/users') as Promise<any>,
  getById: (id: string) => api.get(`/users/${id}`) as Promise<any>,
  update: (id: string, data: any) => api.put(`/users/${id}`, data) as Promise<any>,
  updateStatus: (id: string | number, isActive: boolean) => api.put(`/users/${id}/status`, { isActive }) as Promise<any>,
  getByFirebaseUid: (uid: string) => api.get(`/users/firebase/${uid}`) as Promise<any>,
};

export const vendorApi = {
  getAll: () => api.get('/vendors') as Promise<any>,
  getById: (id: string) => api.get(`/vendors/${id}`) as Promise<any>,
  create: (data: any) => api.post('/vendors', data) as Promise<any>,
  update: (id: string, data: any) => api.put(`/vendors/${id}`, data) as Promise<any>,
  updateStatus: (id: string | number, status: string) => api.put(`/vendors/${id}/status`, { status }) as Promise<any>,
  delete: (id: string | number) => api.delete(`/vendors/${id}`) as Promise<any>,
  search: (lat: number, lng: number, radius: number = 2000) =>
    api.get(`/vendors/search`, { params: { lat, lng, radius } }) as Promise<any>,
};

export const menuApi = {
  getByVendor: (vendorId: string | number) => api.get(`/menu/vendor/${vendorId}`) as Promise<any>,
  getById: (id: string | number) => api.get(`/menu/${id}`) as Promise<any>,
  create: (data: any) => api.post('/menu', data) as Promise<any>,
  update: (id: string | number, data: any) => api.put(`/menu/${id}`, data) as Promise<any>,
  delete: (id: string | number) => api.delete(`/menu/${id}`) as Promise<any>,
};

export const reviewApi = {
  getByVendor: (vendorId: string) => api.get(`/reviews/vendor/${vendorId}`) as Promise<any>,
  create: (data: any) => api.post('/reviews', data) as Promise<any>,
};

export const orderApi = {
  create: (data: any) => api.post('/orders', data) as Promise<any>,
  getByUser: (userId: string) => api.get(`/orders/user/${userId}`) as Promise<any>,
  getByVendor: (vendorId: string) => api.get(`/orders/vendor/${vendorId}`) as Promise<any>,
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }) as Promise<any>,
};

export const promotionApi = {
  getAll: () => api.get('/promotions/all') as Promise<any>,
  getAllActive: () => api.get('/promotions/active') as Promise<any>,
  getByVendor: (vendorId: string) => api.get(`/promotions/vendor/${vendorId}`) as Promise<any>,
  getActiveByVendor: (vendorId: string) => api.get(`/promotions/vendor/${vendorId}/active`) as Promise<any>,
  create: (data: any) => api.post('/promotions', data) as Promise<any>,
  update: (id: string, data: any) => api.put(`/promotions/${id}`, data) as Promise<any>,
  delete: (id: string) => api.delete(`/promotions/${id}`) as Promise<any>,
};

export const analyticsApi = {
  getVendorAnalytics: (vendorId: string) => api.get(`/analytics/vendor/${vendorId}`) as Promise<any>,
  getPlatformAnalytics: () => api.get('/analytics/platform') as Promise<any>,
  logEvent: (vendorId: string | number, eventType: string, additionalData: any = {}) =>
    api.post('/analytics/event', { vendorId, eventType, ...additionalData }) as Promise<any>,
};

export const favoriteApi = {
  getUserFavorites: () => api.get('/favorites') as Promise<any>,
  checkFavorite: (vendorId: string) => api.get(`/favorites/check/${vendorId}`) as Promise<{ isFavorite: boolean }>,
  addFavorite: (vendorId: string) => api.post(`/favorites/${vendorId}`) as Promise<any>,
  removeFavorite: (vendorId: string) => api.delete(`/favorites/${vendorId}`) as Promise<any>,
};

export const gamificationApi = {
  getLeaderboard: () => api.get('/gamification/leaderboard') as Promise<any>,
  getUserStats: () => api.get('/gamification/stats') as Promise<any>,
  performAction: (actionType: string) => api.post(`/gamification/action/${actionType}`) as Promise<any>,
};

export const announcementApi = {
  getActive: () => api.get('/announcements/active') as Promise<any>,
  getAll: () => api.get('/announcements') as Promise<any>,
  create: (data: any) => api.post('/announcements', data) as Promise<any>,
  updateStatus: (id: string | number, isActive: boolean) => api.put(`/announcements/${id}/status`, { isActive }) as Promise<any>,
};

export const reportApi = {
  getAll: () => api.get('/reports') as Promise<any>,
  getByStatus: (status: string) => api.get(`/reports/status/${status}`) as Promise<any>,
  create: (data: any) => api.post('/reports', data) as Promise<any>,
  updateStatus: (id: string | number, status: string) => api.put(`/reports/${id}/status`, { status }) as Promise<any>,
};

export default api;
