// API utility functions for backend communication

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081';

export interface RegisterRequest {
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role?: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  businessName?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
  };
}

export interface LoginRequest {
  email: string;
  password?: string; // Note: Actual auth handled by Firebase client SDK
}

export interface Vendor {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  cuisine?: string;
  phone?: string;
  hours?: string;
  description?: string;
  [key: string]: any;
}

// Auth APIs
export async function registerUser(data: RegisterRequest) {
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Registration failed:', response.status, errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.error || errorJson.message || `Registration failed: ${response.status}`);
    } catch (e) {
      throw new Error(`Registration failed: ${response.status} - ${errorText}`);
    }
  }

  return response.json();
}

export async function loginUser(data: LoginRequest) {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return response.json();
}

export async function getUser(userId: string) {
  const response = await fetch(`${BACKEND_URL}/api/auth/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user');
  }

  return response.json();
}

export async function updateUserProfile(userId: string, data: Partial<{
  displayName?: string;
  phoneNumber?: string;
  photoUrl?: string;
  location?: any;
}>) {
  const response = await fetch(`${BACKEND_URL}/api/auth/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user profile');
  }

  return response.json();
}

// Vendor APIs
export async function registerVendor(data: {
  name: string;
  address: string;
  cuisine?: string;
  phone?: string;
  hours?: string;
  description?: string;
}) {
  const response = await fetch(`${BACKEND_URL}/api/vendors/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Vendor registration failed');
  }

  return response.json();
}

export async function searchNearbyVendors(lat: number, lng: number, radius: number = 2000) {
  const response = await fetch(
    `${BACKEND_URL}/api/vendors/search?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  return response.json();
}

export async function getAllVendors() {
  const response = await fetch(`${BACKEND_URL}/api/vendors/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch vendors');
  }

  return response.json();
}

export async function getVendor(vendorId: string) {
  const response = await fetch(`${BACKEND_URL}/api/vendors/${vendorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch vendor');
  }

  return response.json();
}

export async function updateVendor(vendorId: string, data: Partial<Vendor>) {
  const response = await fetch(`${BACKEND_URL}/api/vendors/${vendorId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update vendor');
  }

  return response.json();
}

// Menu Item APIs
export interface MenuItem {
  itemId?: string;
  vendorId: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  preparationTime?: number;
  rating?: number;
  totalOrders?: number;
}

export async function createMenuItem(vendorId: string, data: Omit<MenuItem, 'itemId' | 'vendorId'>) {
  const response = await fetch(`${BACKEND_URL}/api/menu/${vendorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create menu item');
  }

  return response.json();
}

export async function getVendorMenu(vendorId: string): Promise<MenuItem[]> {
  const response = await fetch(`${BACKEND_URL}/api/menu/vendor/${vendorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch menu');
  }

  return response.json();
}

export async function getMenuItem(itemId: string): Promise<MenuItem> {
  const response = await fetch(`${BACKEND_URL}/api/menu/${itemId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch menu item');
  }

  return response.json();
}

export async function updateMenuItem(itemId: string, data: Partial<MenuItem>) {
  const response = await fetch(`${BACKEND_URL}/api/menu/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update menu item');
  }

  return response.json();
}

export async function deleteMenuItem(itemId: string) {
  const response = await fetch(`${BACKEND_URL}/api/menu/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete menu item');
  }

  return response.json();
}

// Analytics APIs
export interface VendorAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageRating: number;
  activeCustomers: number;
  revenueByDay?: Array<{ date: string; revenue: number; orders: number }>;
  topItems?: Array<{ name: string; sales: number; revenue: number }>;
}

export async function getVendorAnalytics(vendorId: string): Promise<VendorAnalytics> {
  const response = await fetch(`${BACKEND_URL}/api/analytics/vendor/${vendorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch analytics');
  }


  return response.json();
}

// Promotion APIs
export interface PromotionAPI {
  promotionId?: string;
  vendorId: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  promoCode: string;
  startDate?: string;
  endDate: string;
  isActive: boolean;
  maxUses: number;
  currentUses?: number;
}

export async function getVendorPromotions(vendorId: string): Promise<PromotionAPI[]> {
  const response = await fetch(`${BACKEND_URL}/api/promotions/vendor/${vendorId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch promotions');
  }

  const data = await response.json();
  return data.promotions || [];
}

export async function createPromotion(vendorId: string, data: Omit<PromotionAPI, 'promotionId' | 'vendorId' | 'currentUses'>): Promise<PromotionAPI> {
  const response = await fetch(`${BACKEND_URL}/api/promotions/${vendorId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create promotion');
  }

  const result = await response.json();
  return result.promotion;
}

export async function updatePromotion(promotionId: string, data: Partial<PromotionAPI>): Promise<PromotionAPI> {
  const response = await fetch(`${BACKEND_URL}/api/promotions/${promotionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update promotion');
  }

  const result = await response.json();
  return result.promotion;
}

export async function deletePromotion(promotionId: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/promotions/${promotionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete promotion');
  }
}
