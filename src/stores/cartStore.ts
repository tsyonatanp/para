import { create } from 'zustand';
import { CartItem, ProcessingOption } from '../types';

export type { CartItem };

type TimeSlot = 'morning' | 'afternoon' | 'evening';

interface CartStore {
  items: CartItem[];
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress: string;
  deliveryDate: string | null;
  deliveryTimeSlot: TimeSlot | null;
  paymentType: 'deposit' | 'full';
  addItem: (item: CartItem) => void;
  removeItem: (partId: string) => void;
  updateItem: (partId: string, kg: number, processing: ProcessingOption, notes: string) => void;
  setDeliveryType: (type: 'pickup' | 'delivery') => void;
  setDeliveryAddress: (address: string) => void;
  setDeliveryDate: (date: string) => void;
  setDeliveryTimeSlot: (slot: TimeSlot) => void;
  setPaymentType: (type: 'deposit' | 'full') => void;
  clearCart: () => void;
  get totalKg(): number;
  get subtotal(): number;
  get deliveryFee(): number;
  get totalPrice(): number;
  get depositAmount(): number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  deliveryType: 'pickup',
  deliveryAddress: '',
  deliveryDate: null,
  deliveryTimeSlot: null,
  paymentType: 'full',

  addItem: (item) => set(state => {
    const exists = state.items.find(i => i.partId === item.partId);
    if (exists) {
      return {
        items: state.items.map(i =>
          i.partId === item.partId ? item : i
        )
      };
    }
    return { items: [...state.items, item] };
  }),

  removeItem: (partId) => set(state => ({
    items: state.items.filter(i => i.partId !== partId)
  })),

  updateItem: (partId, kg, processing, notes) => set(state => ({
    items: state.items.map(i =>
      i.partId === partId
        ? { ...i, kg, processing, notes, subtotal: kg * i.pricePerKg }
        : i
    )
  })),

  setDeliveryType: (type) => set({ deliveryType: type }),
  setDeliveryAddress: (address) => set({ deliveryAddress: address }),
  setDeliveryDate: (date) => set({ deliveryDate: date }),
  setDeliveryTimeSlot: (slot) => set({ deliveryTimeSlot: slot }),
  setPaymentType: (type) => set({ paymentType: type }),
  clearCart: () => set({ items: [], deliveryType: 'pickup', deliveryAddress: '', deliveryDate: null, deliveryTimeSlot: null, paymentType: 'full' }),

  get totalKg() {
    return get().items.reduce((sum, i) => sum + i.kg, 0);
  },
  get subtotal() {
    return get().items.reduce((sum, i) => sum + i.subtotal, 0);
  },
  get deliveryFee() {
    return get().deliveryType === 'delivery' ? 30 : 0;
  },
  get totalPrice() {
    return get().subtotal + get().deliveryFee;
  },
  get depositAmount() {
    return Math.ceil(get().totalPrice * 0.3);
  },
}));
