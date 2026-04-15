import { create } from 'zustand';
import { ProductOption } from '@/lib/api';

// ── Cart Store ────────────────────────

interface CartItem {
  name: string;
  normalizedName: string;
  selectedOption: ProductOption;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (normalizedName: string) => void;
  clearCart: () => void;
  totalCost: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.findIndex(
        (i) => i.normalizedName === item.normalizedName,
      );
      if (existing >= 0) {
        const updated = [...state.items];
        updated[existing] = item;
        return { items: updated };
      }
      return { items: [...state.items, item] };
    }),

  removeItem: (normalizedName) =>
    set((state) => ({
      items: state.items.filter((i) => i.normalizedName !== normalizedName),
    })),

  clearCart: () => set({ items: [] }),

  totalCost: () =>
    get().items.reduce((sum, i) => sum + i.selectedOption.price * i.quantity, 0),
}));

// ── Auth Store ────────────────────────

interface AuthStore {
  isLoggedIn: boolean;
  email: string | null;
  login: (email: string, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoggedIn: false,
  email: null,

  login: (email, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user_email', email);
    }
    set({ isLoggedIn: true, email });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
    }
    set({ isLoggedIn: false, email: null });
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const email = localStorage.getItem('user_email');
      if (token && email) {
        set({ isLoggedIn: true, email });
      }
    }
  },
}));

// ── Preferences Store ─────────────────

interface PreferencesStore {
  pincode: string;
  mode: 'cheapest' | 'fastest' | 'balanced';
  setPincode: (pincode: string) => void;
  setMode: (mode: 'cheapest' | 'fastest' | 'balanced') => void;
  hydrate: () => void;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  pincode: '560067',
  mode: 'balanced',
  setPincode: (pincode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_pincode', pincode);
    }
    set({ pincode });
  },
  setMode: (mode) => set({ mode }),
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_pincode');
      if (saved) set({ pincode: saved });
    }
  },
}));
