import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'customer' | 'butcher';
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  otpSent: boolean;

  // Mock login (no Supabase)
  mockLogin: (phone: string, name: string) => void;

  // Send OTP (Supabase)
  sendOtp: (phone: string) => Promise<boolean>;

  // Verify OTP + set user
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;

  // Update name
  setName: (name: string) => void;

  // Logout
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      otpSent: false,

      mockLogin: (phone, name) => {
        set({
          user: {
            id: `mock-${Date.now()}`,
            phone,
            name,
            role: 'customer',
          },
          otpSent: false,
        });
      },

      sendOtp: async (phone) => {
        if (!supabase) {
          // Mock mode – just pretend we sent OTP
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
          // Mock mode – any 4-digit code works
          if (otp.length >= 4) {
            const name = get().user?.name || '';
            set({
              user: {
                id: `mock-${Date.now()}`,
                phone,
                name,
                role: 'customer',
              },
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

        set({
          user: {
            id: data.user.id,
            phone,
            name: data.user.user_metadata?.name || '',
            role: data.user.user_metadata?.role || 'customer',
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
      partialize: (state) => ({ user: state.user }),
    }
  )
);
