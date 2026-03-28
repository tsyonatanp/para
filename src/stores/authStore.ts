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

export type CustomerStatus = 'pending' | 'approved' | 'rejected';

export interface CustomerEntry {
  phone: string;
  name: string;
  password: string;
  city?: string;
  status: CustomerStatus;
  registeredAt: number;
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
  
  // Registered customers list (persisted)
  customers: CustomerEntry[];

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

  // Customer management (admin)
  approveCustomer: (phone: string) => void;
  rejectCustomer: (phone: string) => void;
  resetCustomerPassword: (phone: string) => string;
  findCustomer: (phone: string) => CustomerEntry | undefined;

  // Auth
  loginWithPassword: (phone: string, password: string) => { success: boolean; reason?: string };
  registerCustomer: (phone: string, name: string, password: string, city?: string) => { success: boolean; reason?: string };
  loginAsCustomer: (phone: string, name: string, city?: string) => void; // legacy compat
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
      customers: [],

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

      findCustomer: (phone) => {
        const normalized = normalizePhone(phone);
        return get().customers.find(c => normalizePhone(c.phone) === normalized);
      },

      approveCustomer: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          customers: state.customers.map(c =>
            normalizePhone(c.phone) === normalized ? { ...c, status: 'approved' as CustomerStatus } : c
          ),
        }));
      },

      rejectCustomer: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          customers: state.customers.filter(c => normalizePhone(c.phone) !== normalized),
        }));
      },

      resetCustomerPassword: (phone) => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let newPass = '';
        for (let i = 0; i < 8; i++) newPass += chars.charAt(Math.floor(Math.random() * chars.length));
        const normalized = normalizePhone(phone);
        set(state => ({
          customers: state.customers.map(c =>
            normalizePhone(c.phone) === normalized ? { ...c, password: newPass } : c
          ),
        }));
        return newPass;
      },

      loginWithPassword: (phone, password) => {
        const normalized = normalizePhone(phone);

        // Admin login
        if (isAdminPhone(normalized)) {
          if (password !== ADMIN_PASSWORD) return { success: false, reason: 'סיסמה שגויה' };
          set({
            user: { id: 'admin', phone: normalized, name: 'מנהל מערכת', role: 'admin' },
            otpSent: false,
          });
          return { success: true };
        }

        // Butcher login
        const butcher = get().butchers.find(b => normalizePhone(b.phone) === normalized);
        if (butcher) {
          if (password !== butcher.password) return { success: false, reason: 'סיסמה שגויה' };
          set({
            user: { id: `butcher-${normalized}`, phone: normalized, name: butcher.name, role: 'butcher' },
            otpSent: false,
          });
          return { success: true };
        }

        // Customer login
        const customer = get().customers.find(c => normalizePhone(c.phone) === normalized);
        if (customer) {
          if (customer.status === 'pending') return { success: false, reason: 'ההרשמה שלך ממתינה לאישור מנהל' };
          if (customer.password !== password) return { success: false, reason: 'סיסמה שגויה' };
          set({
            user: { id: `cust-${normalized}`, phone: normalized, name: customer.name, role: 'customer' },
            otpSent: false,
          });
          return { success: true };
        }

        return { success: false, reason: 'מספר הטלפון לא נמצא — נרשמים קודם' };
      },

      registerCustomer: (phone, name, password, city) => {
        const normalized = normalizePhone(phone);
        if (isAdminPhone(normalized)) return { success: false, reason: 'מספר שמור' };
        if (get().butchers.some(b => normalizePhone(b.phone) === normalized)) return { success: false, reason: 'מספר רשום כשוחט' };
        if (get().customers.some(c => normalizePhone(c.phone) === normalized)) return { success: false, reason: 'מספר כבר רשום' };

        set(state => ({
          customers: [...state.customers, {
            phone: normalized, name, password, city,
            status: 'pending' as CustomerStatus,
            registeredAt: Date.now(),
          }],
        }));
        return { success: true };
      },

      // Legacy compat – used by reorder
      loginAsCustomer: (phone, name, city) => {
        const normalized = normalizePhone(phone);
        set({
          user: { id: `cust-${Date.now()}`, phone: normalized, name, role: 'customer' },
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
        customers: state.customers,
      }),
    }
  )
);
