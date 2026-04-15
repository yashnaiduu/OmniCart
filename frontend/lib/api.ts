import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token + X-Request-ID to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Enterprise: unique request ID per 06_API_CONTRACTS.md §2.2
  config.headers['X-Request-ID'] = `web-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  config.headers['X-Client-Version'] = '1.0.0';
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Try refresh
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = res.data.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const authApi = {
  signup: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/auth/signup', { email, password }),

  login: (email: string, password: string) =>
    api.post<{ data: AuthResponse }>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    api.post<{ data: AuthResponse }>('/auth/refresh', { refresh_token: refreshToken }),
};

// ── Search ────────────────────────────

export interface ProductOption {
  name: string;
  normalized_name: string;
  price: number;
  currency: string;
  quantity: string;
  platform: string;
  eta_minutes: number;
  in_stock: boolean;
  product_url?: string;
  image_url?: string;
}

export interface SearchItem {
  name: string;
  normalized_name: string;
  options: ProductOption[];
  recommended: {
    platform: string;
    reason: string;
  } | null;
}

export interface SearchResponse {
  items: SearchItem[];
  suggestions: string[];
  parsed_items: { item: string; quantity?: string }[];
  platforms_responded: string[];
  platforms_failed: string[];
}

export const searchApi = {
  search: (query: string, pincode: string, mode = 'balanced') =>
    api.post<{ data: SearchResponse }>('/search', { query, pincode, mode }),

  suggestions: (q: string) =>
    api.get<{ data: { suggestions: string[] } }>('/search/suggestions', { params: { q } }),
};

// ── Collections ───────────────────────

export interface Collection {
  id: string;
  name: string;
  type?: string;
  frequency?: string;
  createdAt: string;
  items: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  name: string;
  quantity?: string;
  normalizedName?: string;
}

export const collectionsApi = {
  getAll: () => api.get<{ data: Collection[] }>('/collections'),

  getOne: (id: string) => api.get<{ data: Collection }>(`/collections/${id}`),

  create: (name: string, type?: string, frequency?: string) =>
    api.post<{ data: Collection }>('/collections', { name, type, frequency }),

  addItem: (collectionId: string, name: string, quantity?: string) =>
    api.post<{ data: CollectionItem }>(`/collections/${collectionId}/items`, { name, quantity }),

  removeItem: (collectionId: string, itemId: string) =>
    api.delete(`/collections/${collectionId}/items/${itemId}`),

  deleteCollection: (id: string) =>
    api.delete(`/collections/${id}`),
};

// ── Feed ──────────────────────────────

export interface FeedResponse {
  refill_suggestions: { item: string; last_purchased: string; suggested_date: string }[];
  deals: { platform: string; item: string; original_price: number; deal_price: number; discount_percent: number; valid_until: string }[];
  price_drops: { item: string; platform: string; old_price: number; new_price: number; drop_percent: number }[];
  recommendations: string[];
}

export const feedApi = {
  getFeed: () => api.get<{ data: FeedResponse }>('/feed'),
};

// ── Refill ────────────────────────────

export const refillApi = {
  refill: (collectionId: string, pincode?: string, mode?: string) =>
    api.post('/refill', { collection_id: collectionId, pincode, mode }),
};

// ── Budget ────────────────────────────

export const budgetApi = {
  set: (monthlyLimit: number) =>
    api.post('/budget', { monthly_limit: monthlyLimit }),
  get: () => api.get('/budget'),
  check: (cartTotal: number) =>
    api.post('/budget/check', { cart_total: cartTotal }),
};

// ── Alerts ────────────────────────────

export const alertsApi = {
  create: (item: string, platform: string, targetPrice: number) =>
    api.post('/alerts', { item, platform, target_price: targetPrice }),
  getAll: () => api.get('/alerts'),
  delete: (id: string) => api.delete(`/alerts/${id}`),
};

export default api;
