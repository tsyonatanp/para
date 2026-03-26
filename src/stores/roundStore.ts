import { create } from 'zustand';
import { SlaughterRound, MeatPart } from '../types';
import { activeRound, meatParts as mockParts } from '../data/mockData';
import { fetchActiveRound, subscribeToPartsUpdates } from '../api/rounds';
import { isSupabaseConfigured } from '../lib/supabase';

interface RoundStore {
  round: SlaughterRound | null;
  parts: MeatPart[];
  loading: boolean;
  error: string | null;
  initialized: boolean;

  // Initialize – fetch from Supabase or use mock
  initialize: () => Promise<void>;

  // Update sold kg for a specific part
  updatePartSold: (partId: string, addKg: number) => void;

  // Update price or total kg for a specific part (butcher/admin)
  updatePart: (partId: string, updates: Partial<Pick<MeatPart, 'pricePerKg' | 'totalKg'>>) => void;

  // Set parts (used by realtime subscription)
  setParts: (parts: MeatPart[]) => void;
}

export const useRoundStore = create<RoundStore>((set, get) => ({
  round: activeRound,
  parts: [...mockParts],
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true, error: null });

    try {
      const result = await fetchActiveRound();
      if (result) {
        set({
          round: result.round,
          parts: result.parts,
          loading: false,
          initialized: true,
        });

        // Set up real-time subscription if Supabase is configured
        if (isSupabaseConfigured() && result.round) {
          subscribeToPartsUpdates(result.round.id, (updatedParts) => {
            set({ parts: updatedParts });
          });
        }
      } else {
        set({ loading: false, initialized: true });
      }
    } catch (err) {
      console.error('Failed to initialize round store:', err);
      set({
        loading: false,
        error: 'שגיאה בטעינת הנתונים',
        initialized: true,
      });
    }
  },

  updatePartSold: (partId, addKg) => {
    set(state => ({
      parts: state.parts.map(p =>
        p.id === partId
          ? { ...p, soldKg: Math.min(p.totalKg - p.bufferKg, p.soldKg + addKg) }
          : p
      ),
    }));
  },

  updatePart: (partId, updates) => {
    set(state => ({
      parts: state.parts.map(p =>
        p.id === partId ? { ...p, ...updates } : p
      ),
    }));
  },

  setParts: (parts) => set({ parts }),
}));
