import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type UserRole = 'customer' | 'butcher' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
}

export interface ButcherEntry {
  phone: string;
  name: string;
  password: string; // hashed in production, plain for mock
  addedAt: number;
}

// Admin credentials
const ADMIN_PHONE = '0547274527';
const ADMIN_PASSWORD = 'Para2026!'; // Change this in production

function normalizePhone(phone: string): string {
  return phone.replace(/[-\s()]/g, '');
}

function isAdminPhone(phone: string): boolean {
  return normalizePhone(phone) === normalizePhone(ADMIN_PHONE);
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  otpSent: boolean;

  // Managed butcher list (persisted)
  butchers: ButcherEntry[];

  // Computed helpers
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  isButcher: () => boolean;
  canAccessDashboard: () => boolean;

  // Check if phone is known (admin or butcher)
  getPhoneRole: (phone: string) => UserRole;
  findButcher: (phone: string) => ButcherEntry | undefined;

  // Butcher management (admin only)
  addButcher: (phone: string, name: string, password: string) => void;
  removeButcher: (phone: string) => void;

  // Auth
  loginWithPassword: (phone: string, password: string) => boolean;
  loginAsCustomer: (phone: string, name: string) => void;
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  setName: (name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      otpSent: false,
      butchers: [],

      isLoggedIn: () => get().user !== null,
      isAdmin: () => get().user?.role === 'admin',
      isButcher: () => get().user?.role === 'butcher',
      canAccessDashboard: () => {
        const role = get().user?.role;
        return role === 'admin' || role === 'butcher';
      },

      getPhoneRole: (phone) => {
        const normalized = normalizePhone(phone);
        if (isAdminPhone(normalized)) return 'admin';
        if (get().butchers.some(b => normalizePhone(b.phone) === normalized)) return 'butcher';
        return 'customer';
      },

      findButcher: (phone) => {
        const normalized = normalizePhone(phone);
        return get().butchers.find(b => normalizePhone(b.phone) === normalized);
      },

      addButcher: (phone, name, password) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          butchers: state.butchers.some(b => normalizePhone(b.phone) === normalized)
            ? state.butchers
            : [...state.butchers, { phone: normalized, name, password, addedAt: Date.now() }],
        }));
      },

      removeButcher: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          butchers: state.butchers.filter(b => normalizePhone(b.phone) !== normalized),
        }));
      },

      loginWithPassword: (phone, password) => {
        const normalized = normalizePhone(phone);

        // Admin login
        if (isAdminPhone(normalized)) {
          if (password !== ADMIN_PASSWORD) return false;
          set({
            user: { id: 'admin', phone: normalized, name: 'מנהל מערכת', role: 'admin' },
            otpSent: false,
          });
          return true;
        }

        // Butcher login
        const butcher = get().butchers.find(b => normalizePhone(b.phone) === normalized);
        if (butcher) {
          if (password !== butcher.password) return false;
          set({
            user: { id: `butcher-${normalized}`, phone: normalized, name: butcher.name, role: 'butcher' },
            otpSent: false,
          });
          return true;
        }

        return false;
      },

      loginAsCustomer: (phone, name) => {
        set({
          user: { id: `cust-${Date.now()}`, phone, name, role: 'customer' },
          otpSent: false,
        });
      },

      sendOtp: async (phone) => {
        if (!supabase) {
          set({ otpSent: true });
          return true;
        }
        set({ isLoading: true });
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.replace(/^0/, '+972'),
        });
        set({ isLoading: false, otpSent: !error });
        if (error) {
          console.error('OTP send error:', error.message);
          return false;
        }
        return true;
      },

      verifyOtp: async (phone, otp) => {
        if (!supabase) {
          if (otp.length >= 4) {
            const role = get().getPhoneRole(phone);
            const name = role === 'admin' ? 'מנהל מערכת' : '';
            set({
              user: { id: `mock-${Date.now()}`, phone, name, role },
              otpSent: false,
            });
            return true;
          }
          return false;
        }

        set({ isLoading: true });
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phone.replace(/^0/, '+972'),
          token: otp,
          type: 'sms',
        });
        set({ isLoading: false });

        if (error || !data.user) {
          console.error('OTP verify error:', error?.message);
          return false;
        }

        const role = get().getPhoneRole(phone);
        set({
          user: {
            id: data.user.id,
            phone,
            name: data.user.user_metadata?.name || '',
            role,
          },
          otpSent: false,
        });
        return true;
      },

      setName: (name) => {
        set(state => ({
          user: state.user ? { ...state.user, name } : null,
        }));
      },

      logout: () => {
        if (supabase) supabase.auth.signOut();
        set({ user: null, otpSent: false });
      },
    }),
    {
      name: 'freshcut-auth',
      partialize: (state) => ({
        user: state.user,
        butchers: state.butchers,
      }),
    }
  )
);
