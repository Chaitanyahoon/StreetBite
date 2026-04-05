import axios from 'axios';

/**
 * Base URL for the API, defaulting to localhost if not set in environment variables.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api';

/**
 * Axios instance configured with base URL, default headers, and cookie credentials.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies on every request
});

/**
 * Response interceptor for global error handling and data extraction.
 * Automatically unwraps response data.
 */
api.interceptors.response.use((res) => res.data, (error: any) => {
  if (error.response) {
    if (error.response.status !== 403) {
      console.warn('API Error Details:', {
        status: error.response.status,
        data: error.response.data,
        message: error.message,
        url: error.config?.url
      })
    }
  } else {
    console.error('API Error (Network/Unknown):', error.message || 'Network Error')
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
  me: () => api.get('/auth/me') as Promise<any>,
  logout: () => api.post('/auth/logout') as Promise<any>,
  getUser: (id: string) => api.get(`/auth/user/${id}`) as Promise<any>,
  getUserByUid: (uid: string) => api.get(`/auth/user/uid/${uid}`) as Promise<any>,
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }) as Promise<any>,
  validateResetToken: (token: string) => api.get(`/auth/validate-reset-token?token=${token}`) as Promise<any>,
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
  getAllAdmin: () => api.get('/vendors/admin/all') as Promise<any>,
  getById: (id: string) => api.get(`/vendors/${id}`) as Promise<any>,
  getBySlug: (slug: string) => api.get(`/vendors/slug/${slug}`) as Promise<any>,
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
  update: (reviewId: number, data: { userId: number; rating?: number; comment?: string }) =>
    api.put(`/reviews/${reviewId}`, data) as Promise<any>,
  delete: (reviewId: number, userId: number) =>
    api.delete(`/reviews/${reviewId}?userId=${userId}`) as Promise<any>,
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
  getHot: () => api.get('/announcements/hot') as Promise<any>,
  getAll: () => api.get('/announcements') as Promise<any>,
  create: (data: any) => api.post('/announcements', data) as Promise<any>,
  updateStatus: (id: string | number, isActive: boolean) => api.put(`/announcements/${id}/status`, { isActive }) as Promise<any>,
  delete: (id: string | number) => api.delete(`/announcements/${id}`) as Promise<any>,
};

export const reportApi = {
  getAll: () => api.get('/reports') as Promise<any>,
  getByStatus: (status: string) => api.get(`/reports/status/${status}`) as Promise<any>,
  create: (data: any) => api.post('/reports', data) as Promise<any>,
  updateStatus: (id: string | number, status: string) => api.put(`/reports/${id}/status`, { status }) as Promise<any>,
};

export const hotTopicApi = {
  getAllActive: () => api.get('/hottopics') as Promise<any>,
  getAll: () => api.get('/hottopics/admin/all') as Promise<any>,
  create: (data: any) => api.post('/hottopics', data) as Promise<any>,
  update: (id: string | number, data: any) => api.put(`/hottopics/${id}`, data) as Promise<any>,
  delete: (id: string | number) => api.delete(`/hottopics/${id}`) as Promise<any>,
  addComment: (id: string | number, text: string) => api.post(`/hottopics/${id}/comment`, { text }) as Promise<any>,
  toggleLike: (id: string | number) => api.post(`/hottopics/${id}/like`, {}) as Promise<any>,
};

export const zodiacApi = {
  getHoroscope: (sign: string) => api.get(`/zodiac/sign/${sign}`) as Promise<any>,
};

export default api;
