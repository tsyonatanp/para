import { create } from 'zustand';
import { Order, CreateOrderPayload, createOrder, fetchOrdersByRound, updateOrderStatus } from '../api/orders';
import { supabase } from '../lib/supabase';
import { useToastStore } from './toastStore';
import { useAuthStore } from './authStore';
import { useRoundStore } from './roundStore';

const STATUS_TOAST: Record<string, { message: string; emoji: string }> = {
  confirmed:   { message: 'ההזמנה שלך אושרה!', emoji: '✅' },
  prepared:    { message: 'ההזמנה שלך הוכנה ומוכנה', emoji: '📦' },
  in_delivery: { message: 'ההזמנה בדרך אליך!', emoji: '🚚' },
  delivered:   { message: 'ההזמנה נמסרה. בתיאבון!', emoji: '🎉' },
};

const ORDERS_STORAGE_KEY = 'freshcut_orders';

function persistOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch { /* quota exceeded or private mode */ }
}

function loadPersistedOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null;

  /** Load orders – from Supabase or localStorage (mock mode) */
  initOrders: (roundId: string) => Promise<void>;
  fetchOrders: (roundId: string) => Promise<void>;
  placeOrder: (payload: CreateOrderPayload) => Promise<Order | null>;
  setOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  subscribeToOrders: (roundId: string) => () => void;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  initOrders: async (roundId) => {
    if (supabase) {
      // Supabase mode – fetch from DB
      await get().fetchOrders(roundId);
    } else {
      // Mock mode – load from localStorage
      const persisted = loadPersistedOrders();
      set({ orders: persisted });
      useRoundStore.getState().recalculateSoldKg(persisted);
    }
  },

  fetchOrders: async (roundId) => {
    set({ loading: true, error: null });
    try {
      const orders = await fetchOrdersByRound(roundId);
      set({ orders, loading: false });
      // Sync soldKg in roundStore from real order data
      useRoundStore.getState().recalculateSoldKg(orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      set({ loading: false, error: 'שגיאה בטעינת ההזמנות' });
    }
  },

  placeOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const order = await createOrder(payload);
      if (order) {
        set(state => {
          const newOrders = [order, ...state.orders];
          persistOrders(newOrders);
          useRoundStore.getState().recalculateSoldKg(newOrders);
          return { orders: newOrders, loading: false };
        });
        return order;
      }
      set({ loading: false, error: 'שגיאה ביצירת ההזמנה' });
      return null;
    } catch (err) {
      console.error('Failed to place order:', err);
      set({ loading: false, error: 'שגיאה ביצירת ההזמנה' });
      return null;
    }
  },

  setOrderStatus: async (orderId, status) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      set(state => {
        const newOrders = state.orders.map(o =>
          o.id === orderId ? { ...o, status } : o
        );
        persistOrders(newOrders);
        return { orders: newOrders };
      });
    }
    return success;
  },

  subscribeToOrders: (roundId) => {
    if (!supabase) return () => {};

    const channel = supabase
      .channel(`orders:round:${roundId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `round_id=eq.${roundId}` },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          if (eventType === 'INSERT') {
            set(state => ({
              orders: state.orders.some(o => o.id === (newRecord as Order).id)
                ? state.orders
                : [newRecord as Order, ...state.orders],
            }));
          } else if (eventType === 'UPDATE') {
            const updated = newRecord as Order;
            const previous = get().orders.find(o => o.id === updated.id);
            set(state => ({
              orders: state.orders.map(o =>
                o.id === updated.id ? { ...o, ...updated } : o
              ),
            }));
            // Toast only for the current user's orders when status changes
            const currentUser = useAuthStore.getState().user;
            if (
              currentUser &&
              updated.userPhone === currentUser.phone &&
              previous?.status !== updated.status &&
              STATUS_TOAST[updated.status]
            ) {
              const { message, emoji } = STATUS_TOAST[updated.status];
              useToastStore.getState().addToast({ message, type: 'success', emoji });
            }
          } else if (eventType === 'DELETE') {
            set(state => ({
              orders: state.orders.filter(o => o.id !== (oldRecord as Order).id),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  },
}));
