import { create } from 'zustand';
import { Order, CreateOrderPayload, createOrder, fetchOrdersByRound, updateOrderStatus } from '../api/orders';

interface OrderStore {
  orders: Order[];
  loading: boolean;
  error: string | null;

  // Fetch all orders for a specific round
  fetchOrders: (roundId: string) => Promise<void>;

  // Place a new order
  placeOrder: (payload: CreateOrderPayload) => Promise<Order | null>;

  // Update order status (butcher)
  setOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (roundId) => {
    set({ loading: true, error: null });
    try {
      const orders = await fetchOrdersByRound(roundId);
      set({ orders, loading: false });
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
        set(state => ({
          orders: [order, ...state.orders],
          loading: false,
        }));
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
      set(state => ({
        orders: state.orders.map(o =>
          o.id === orderId ? { ...o, status } : o
        ),
      }));
    }
    return success;
  },
}));
