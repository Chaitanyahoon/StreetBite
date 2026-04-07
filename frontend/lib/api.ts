import axios from 'axios';

/**
 * Base URL for the API, defaulting to localhost if not set in environment variables.
 */
const API_BASE_URL = '/api';

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
    const requestUrl = error.config?.url || ''
    const isExpectedAnonymousAuthCheck = error.response.status === 401 && requestUrl.includes('/auth/me')

    if (error.response.status !== 403 && !isExpectedAnonymousAuthCheck) {
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
  password: string
  displayName: string
  role: 'USER' | 'VENDOR' | 'ADMIN'
  businessName?: string
  location?: {
    latitude: number
    longitude: number
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}

export type VendorStatus =
  | 'AVAILABLE'
  | 'BUSY'
  | 'UNAVAILABLE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'BANNED'

export interface AuthUser {
  id: number
  email: string
  displayName: string
  phoneNumber?: string
  profilePicture?: string
  role: 'USER' | 'VENDOR' | 'ADMIN' | string
  vendorId?: number
  isActive?: boolean
  emailVerified?: boolean
}

export interface AuthResponse {
  success?: boolean
  user?: AuthUser
  message?: string
  requiresEmailVerification?: boolean
  email?: string
}

export interface ApiUser {
  id: number
  email: string
  displayName?: string
  phoneNumber?: string
  profilePicture?: string
  role: 'USER' | 'VENDOR' | 'ADMIN' | string
  active?: boolean
  emailVerified?: boolean
  xp?: number
  level?: number
  streak?: number
  lastCheckIn?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ApiVendorOwner {
  id: number
  email?: string
  displayName?: string
  profilePicture?: string
  role?: 'USER' | 'VENDOR' | 'ADMIN' | string
  isActive?: boolean
}

export interface ForgotPasswordResponse {
  message?: string
  email?: string
}

export interface ValidateResetTokenResponse {
  valid: boolean
  message?: string
  error?: string
  remainingSeconds?: number
}

export interface PasswordResetRequest {
  token: string
  newPassword: string
  email?: string
}

export interface VendorLocation {
  latitude: number
  longitude: number
}

export interface ApiVendor {
  id: number | string
  owner?: ApiVendorOwner
  slug?: string
  name: string
  address?: string
  cuisine?: string
  rating?: number
  reviews?: number
  image?: string
  displayImageUrl?: string
  latitude?: number | string
  longitude?: number | string
  description?: string
  phone?: string
  hours?: string
  bannerImageUrl?: string
  status?: VendorStatus
  isActive?: boolean
  galleryImages?: string[]
  tags?: string[]
  location?: VendorLocation
  reviewCount?: number
  averageRating?: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiPromotion {
  id: number | string
  promotionId?: number | string
  vendor?: ApiVendor
  vendorId?: number | string
  title: string
  description?: string
  discountType: string
  discountValue: number
  promoCode: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  active?: boolean
  maxUses?: number
  currentUses?: number
  minOrderValue?: number
}

export interface ApiReviewImage {
  id: number
  imageUrl: string
}

export interface ApiReviewUser {
  id: number
  displayName: string
  profilePicture?: string
}

export interface ApiReview {
  id: number
  vendorId?: number
  rating: number
  comment: string
  createdAt: string
  user: ApiReviewUser
  images?: ApiReviewImage[]
}

export interface FavoriteStatusResponse {
  isFavorite: boolean
  message?: string | null
}

export interface LeaderboardUserResponse {
  id: number
  displayName: string
  xp: number
  level: number
  profilePicture?: string
}

export interface UserStatsResponse {
  xp: number
  level: number
  streak: number
  rank: number
  displayName: string
  email?: string
  lastCheckIn: string | null
}

export interface GamificationActionResponse {
  success: boolean
  actionType: string
  newXp: number
  level: number
}

export const authApi = {
  register: (data: RegisterRequest) => api.post('/auth/register', data) as Promise<AuthResponse>,
  login: (data: LoginRequest) => api.post('/auth/login', data) as Promise<AuthResponse>,
  verifyEmail: (data: VerifyEmailRequest) => api.post('/auth/verify-email', data) as Promise<AuthResponse>,
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }) as Promise<AuthResponse>,
  me: () => api.get('/auth/me') as Promise<AuthUser>,
  logout: () => api.post('/auth/logout') as Promise<{ message?: string }>,
  getUser: (id: string) => api.get(`/auth/user/${id}`) as Promise<AuthUser>,
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }) as Promise<ForgotPasswordResponse>,
  validateResetToken: (token: string) => api.get(`/auth/validate-reset-token?token=${token}`) as Promise<ValidateResetTokenResponse>,
  resetPassword: (data: PasswordResetRequest) => api.post('/auth/reset-password', data) as Promise<{ message?: string }>,
};

export const userApi = {
  getAll: () => api.get('/users') as Promise<ApiUser[]>,
  getById: (id: string) => api.get(`/users/${id}`) as Promise<ApiUser>,
  update: (id: string, data: { displayName?: string; phoneNumber?: string; profilePicture?: string }) =>
    api.put(`/users/${id}`, data) as Promise<ApiUser>,
  updateStatus: (id: string | number, isActive: boolean) =>
    api.put(`/users/${id}/status`, { isActive }) as Promise<ApiUser>,
};

export const vendorApi = {
  getAll: () => api.get('/vendors') as Promise<ApiVendor[]>,
  getAllAdmin: () => api.get('/vendors/admin/all') as Promise<ApiVendor[]>,
  getById: (id: string) => api.get(`/vendors/${id}`) as Promise<ApiVendor>,
  getBySlug: (slug: string) => api.get(`/vendors/slug/${slug}`) as Promise<ApiVendor>,
  create: (data: any) => api.post('/vendors', data) as Promise<ApiVendor>,
  update: (id: string, data: any) => api.put(`/vendors/${id}`, data) as Promise<ApiVendor>,
  updateStatus: (id: string | number, status: string) => api.put(`/vendors/${id}/status`, { status }) as Promise<ApiVendor>,
  delete: (id: string | number) => api.delete(`/vendors/${id}`) as Promise<void>,
  search: (lat: number, lng: number, radius: number = 2000) =>
    api.get(`/vendors/search`, { params: { lat, lng, radius } }) as Promise<ApiVendor[]>,
};

export const menuApi = {
  getByVendor: (vendorId: string | number) => api.get(`/menu/vendor/${vendorId}`) as Promise<any>,
  getById: (id: string | number) => api.get(`/menu/${id}`) as Promise<any>,
  create: (data: any) => api.post('/menu', data) as Promise<any>,
  update: (id: string | number, data: any) => api.put(`/menu/${id}`, data) as Promise<any>,
  delete: (id: string | number) => api.delete(`/menu/${id}`) as Promise<any>,
};

export const reviewApi = {
  getByVendor: (vendorId: string) => api.get(`/reviews/vendor/${vendorId}`) as Promise<ApiReview[]>,
  create: (data: { vendorId: number; rating: number; comment: string; imageUrls?: string[] }) =>
    api.post('/reviews', data) as Promise<ApiReview>,
  update: (reviewId: number, data: { rating?: number; comment?: string; imageUrls?: string[] }) =>
    api.put(`/reviews/${reviewId}`, data) as Promise<ApiReview>,
  delete: (reviewId: number) =>
    api.delete(`/reviews/${reviewId}`) as Promise<{ success: boolean; message: string }>,
};

export const orderApi = {
  create: (data: any) => api.post('/orders', data) as Promise<any>,
  getByUser: (userId: string) => api.get(`/orders/user/${userId}`) as Promise<any>,
  getByVendor: (vendorId: string) => api.get(`/orders/vendor/${vendorId}`) as Promise<any>,
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }) as Promise<any>,
};

export const promotionApi = {
  getAll: () => api.get('/promotions/all') as Promise<ApiPromotion[]>,
  getAllActive: () => api.get('/promotions/active') as Promise<ApiPromotion[]>,
  getByVendor: (vendorId: string) => api.get(`/promotions/vendor/${vendorId}`) as Promise<ApiPromotion[]>,
  getActiveByVendor: (vendorId: string) => api.get(`/promotions/vendor/${vendorId}/active`) as Promise<ApiPromotion[]>,
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
  getUserFavorites: () => api.get('/favorites') as Promise<ApiVendor[]>,
  checkFavorite: (vendorId: string) => api.get(`/favorites/check/${vendorId}`) as Promise<FavoriteStatusResponse>,
  addFavorite: (vendorId: string | number) => api.post(`/favorites/${vendorId}`) as Promise<FavoriteStatusResponse>,
  removeFavorite: (vendorId: string | number) => api.delete(`/favorites/${vendorId}`) as Promise<FavoriteStatusResponse>,
};

export const gamificationApi = {
  getLeaderboard: () => api.get('/gamification/leaderboard') as Promise<LeaderboardUserResponse[]>,
  getUserStats: () => api.get('/gamification/stats') as Promise<UserStatsResponse>,
  performAction: (actionType: string) => api.post(`/gamification/action/${actionType}`) as Promise<GamificationActionResponse>,
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
  createCommunity: (data: { title: string; content: string; imageUrl?: string }) =>
    api.post('/hottopics/community', data) as Promise<{ message?: string; topicId?: number | string }>,
  update: (id: string | number, data: any) => api.put(`/hottopics/${id}`, data) as Promise<any>,
  delete: (id: string | number) => api.delete(`/hottopics/${id}`) as Promise<any>,
  addComment: (id: string | number, text: string) => api.post(`/hottopics/${id}/comment`, { text }) as Promise<any>,
  toggleLike: (id: string | number) => api.post(`/hottopics/${id}/like`, {}) as Promise<any>,
};

export const zodiacApi = {
  getHoroscope: (sign: string) => api.get(`/zodiac/sign/${sign}`) as Promise<any>,
};

export default api;
