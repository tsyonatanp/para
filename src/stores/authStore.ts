import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  fetchCustomers, fetchButchers,
  registerCustomerDb, approveCustomerDb, rejectCustomerDb,
  blockCustomerDb, deleteCustomerDb, resetCustomerPasswordDb,
  findCustomerDb, addButcherDb, removeButcherDb,
  subscribeToCustomers,
} from '../api/customers';

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
  password: string;
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
const ADMIN_PASSWORD = 'Para2026!';

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
  dbReady: boolean;

  butchers: ButcherEntry[];
  customers: CustomerEntry[];

  // Init — load from Supabase
  loadFromDb: () => Promise<void>;

  // Computed helpers
  isLoggedIn: () => boolean;
  isAdmin: () => boolean;
  isButcher: () => boolean;
  canAccessDashboard: () => boolean;

  getPhoneRole: (phone: string) => UserRole;
  findButcher: (phone: string) => ButcherEntry | undefined;

  // Butcher management
  addButcher: (phone: string, name: string, password: string) => void;
  removeButcher: (phone: string) => void;

  // Customer management
  approveCustomer: (phone: string) => void;
  rejectCustomer: (phone: string) => void;
  deleteCustomer: (phone: string) => void;
  blockCustomer: (phone: string) => void;
  resetCustomerPassword: (phone: string) => string;
  findCustomer: (phone: string) => CustomerEntry | undefined;

  // Auth
  loginWithPassword: (phone: string, password: string) => Promise<{ success: boolean; reason?: string }>;
  registerCustomer: (phone: string, name: string, password: string, city?: string) => Promise<{ success: boolean; reason?: string }>;
  loginAsCustomer: (phone: string, name: string, city?: string) => void;
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
      dbReady: false,
      butchers: [],
      customers: [],

      // Load customers & butchers from Supabase
      loadFromDb: async () => {
        if (!supabase) {
          set({ dbReady: true });
          return;
        }
        try {
          // Get current localStorage data before overwriting
          const localCustomers = get().customers;
          const localButchers = get().butchers;

          const [dbCustomers, dbButchers] = await Promise.all([
            fetchCustomers(),
            fetchButchers(),
          ]);

          // One-time migration: push localStorage customers to Supabase
          if (localCustomers.length > 0 && dbCustomers.length === 0) {
            for (const c of localCustomers) {
              if (c.phone && c.name) {
                await registerCustomerDb(c.phone, c.name, c.password || '', c.city);
                // If the customer was already approved locally, approve in DB too
                if (c.status === 'approved') await approveCustomerDb(c.phone);
              }
            }
            // Re-fetch after migration
            const migrated = await fetchCustomers();
            set({ customers: migrated, dbReady: true });
          } else {
            set({ customers: dbCustomers, dbReady: true });
          }

          // One-time migration: push localStorage butchers to Supabase
          if (localButchers.length > 0 && dbButchers.length === 0) {
            for (const b of localButchers) {
              if (b.phone && b.name) {
                await addButcherDb(b.phone, b.name, b.password || '');
              }
            }
            const migratedButchers = await fetchButchers();
            set({ butchers: migratedButchers });
          } else {
            set({ butchers: dbButchers });
          }

          // Subscribe to realtime changes
          subscribeToCustomers((updatedCustomers) => {
            set({ customers: updatedCustomers });
          });
        } catch (err) {
          console.warn('Failed to load from DB, using localStorage:', err);
          set({ dbReady: true });
        }
      },

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
        // Update local state immediately
        set(state => ({
          butchers: state.butchers.some(b => normalizePhone(b.phone) === normalized)
            ? state.butchers
            : [...state.butchers, { phone: normalized, name, password, addedAt: Date.now() }],
        }));
        // Persist to Supabase
        if (supabase) addButcherDb(normalized, name, password);
      },

      removeButcher: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          butchers: state.butchers.filter(b => normalizePhone(b.phone) !== normalized),
        }));
        if (supabase) removeButcherDb(normalized);
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
        if (supabase) approveCustomerDb(normalized);
      },

      rejectCustomer: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          customers: state.customers.filter(c => normalizePhone(c.phone) !== normalized),
        }));
        if (supabase) rejectCustomerDb(normalized);
      },

      deleteCustomer: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          customers: state.customers.filter(c => normalizePhone(c.phone) !== normalized),
        }));
        if (supabase) deleteCustomerDb(normalized);
      },

      blockCustomer: (phone) => {
        const normalized = normalizePhone(phone);
        set(state => ({
          customers: state.customers.map(c =>
            normalizePhone(c.phone) === normalized ? { ...c, status: 'rejected' as CustomerStatus } : c
          ),
        }));
        if (supabase) blockCustomerDb(normalized);
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
        if (supabase) resetCustomerPasswordDb(normalized, newPass);
        return newPass;
      },

      loginWithPassword: async (phone, password) => {
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

        // Butcher login (check local state — loaded from DB on init)
        const butcher = get().butchers.find(b => normalizePhone(b.phone) === normalized);
        if (butcher) {
          if (password !== butcher.password) return { success: false, reason: 'סיסמה שגויה' };
          set({
            user: { id: `butcher-${normalized}`, phone: normalized, name: butcher.name, role: 'butcher' },
            otpSent: false,
          });
          return { success: true };
        }

        // Customer login — try Supabase first, then local state
        let customer: CustomerEntry | undefined | null;
        if (supabase) {
          customer = await findCustomerDb(normalized);
        }
        if (!customer) {
          customer = get().customers.find(c => normalizePhone(c.phone) === normalized);
        }

        if (customer) {
          if (customer.status === 'pending') return { success: false, reason: 'ההרשמה שלך ממתינה לאישור מנהל' };
          if (customer.status === 'rejected') return { success: false, reason: 'החשבון שלך חסום. פנה למנהל' };
          if (!customer.password) return { success: false, reason: 'יש להגדיר סיסמה — השתמש בדף ההרשמה' };
          if (customer.password !== password) return { success: false, reason: 'סיסמה שגויה' };
          set({
            user: { id: `cust-${normalized}`, phone: normalized, name: customer.name, role: 'customer' },
            otpSent: false,
          });
          return { success: true };
        }

        return { success: false, reason: 'מספר הטלפון לא נמצא — נרשמים קודם' };
      },

      registerCustomer: async (phone, name, password, city) => {
        const normalized = normalizePhone(phone);
        if (isAdminPhone(normalized)) return { success: false, reason: 'מספר שמור' };
        if (get().butchers.some(b => normalizePhone(b.phone) === normalized)) return { success: false, reason: 'מספר רשום כשוחט' };

        // Try Supabase first
        if (supabase) {
          const result = await registerCustomerDb(normalized, name, password, city);
          if (result.success) {
            // Refresh local state
            const customers = await fetchCustomers();
            set({ customers });
          }
          return result;
        }

        // Fallback: localStorage
        const existingCustomer = get().customers.find(c => normalizePhone(c.phone) === normalized);
        if (existingCustomer) {
          if (existingCustomer.password) return { success: false, reason: 'מספר כבר רשום' };
          set(state => ({
            customers: state.customers.map(c =>
              normalizePhone(c.phone) === normalized
                ? { ...c, name, password, city: city || c.city, status: c.status }
                : c
            ),
          }));
          return { success: true };
        }

        set(state => ({
          customers: [...state.customers, {
            phone: normalized, name, password, city,
            status: 'pending' as CustomerStatus,
            registeredAt: Date.now(),
          }],
        }));
        return { success: true };
      },

      loginAsCustomer: (phone, name) => {
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
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0 || !version) {
          const state = persisted as any;
          if (state?.customers) {
            state.customers = state.customers.map((c: any) => ({
              ...c,
              password: c.password || '',
              status: c.status || 'approved',
              registeredAt: c.registeredAt || Date.now(),
            }));
          }
        }
        return persisted;
      },
      partialize: (state) => ({
        user: state.user,
        butchers: state.butchers,
        customers: state.customers,
      }),
    }
  )
);
