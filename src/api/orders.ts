import { supabase } from '../lib/supabase';
import { CartItem } from '../types';

export interface CreateOrderPayload {
  roundId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  paymentType: 'deposit' | 'full';
  totalPrice: number;
  amountPaid: number;
  notes?: string;
  items: CartItem[];
}

export interface Order {
  id: string;
  roundId: string;
  userName: string;
  userPhone: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  paymentType: 'deposit' | 'full';
  amountPaid: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'prepared' | 'in_delivery' | 'delivered';
  notes?: string;
  createdAt: string;
  items?: CartItem[];
}

// ============================================
// ORDERS API
// ============================================

/** Create a new order with its items */
export async function createOrder(payload: CreateOrderPayload): Promise<Order | null> {
  if (!supabase) {
    // Mock mode – simulate order creation
    console.log('📦 Mock order created:', payload);
    return {
      id: `mock-${Date.now()}`,
      roundId: payload.roundId,
      userName: payload.customerName,
      userPhone: payload.customerPhone,
      deliveryType: payload.deliveryType,
      deliveryAddress: payload.deliveryAddress,
      paymentType: payload.paymentType,
      amountPaid: payload.amountPaid,
      totalPrice: payload.totalPrice,
      status: 'pending',
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      items: payload.items,
    };
  }

  // 1. Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      round_id: payload.roundId,
      user_name: payload.customerName,
      user_phone: payload.customerPhone,
      delivery_type: payload.deliveryType,
      delivery_address: payload.deliveryAddress,
      payment_type: payload.paymentType,
      total_price: payload.totalPrice,
      amount_paid: payload.amountPaid,
      notes: payload.notes,
      status: 'pending',
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Failed to create order:', orderError?.message);
    return null;
  }

  // 2. Create order items (the trigger will auto-update sold_kg)
  const orderItems = payload.items.map(item => ({
    order_id: order.id,
    part_id: item.partId,
    round_id: payload.roundId,
    part_name_he: item.partNameHe,
    part_emoji: item.partEmoji,
    kg: item.kg,
    processing: item.processing,
    notes: item.notes,
    price_per_kg: item.pricePerKg,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    console.error('Failed to create order items:', itemsError.message);
    // Order was created but items failed – still return the order
  }

  return mapOrderFromDb(order);
}

/** Fetch all orders for a round (butcher dashboard) */
export async function fetchOrdersByRound(roundId: string): Promise<Order[]> {
  if (!supabase) {
    // Return mock orders
    const { mockOrders } = await import('../data/mockData');
    return mockOrders;
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('round_id', roundId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Failed to fetch orders:', error?.message);
    return [];
  }

  return data.map((row: any) => ({
    ...mapOrderFromDb(row),
    items: row.order_items?.map(mapOrderItemFromDb) || [],
  }));
}

/** Update order status (butcher only) */
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
  if (!supabase) {
    console.log('📦 Mock: order', orderId, 'status →', status);
    return true;
  }

  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('Failed to update order status:', error.message);
    return false;
  }

  return true;
}

/** Subscribe to real-time order updates for a round */
export function subscribeToOrderUpdates(
  roundId: string,
  onUpdate: () => void
) {
  if (!supabase) return null;

  const channel = supabase
    .channel(`orders-${roundId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `round_id=eq.${roundId}`,
      },
      () => onUpdate()
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

// ============================================
// DB MAPPERS
// ============================================

function mapOrderFromDb(row: any): Order {
  return {
    id: row.id,
    roundId: row.round_id,
    userName: row.user_name,
    userPhone: row.user_phone,
    deliveryType: row.delivery_type,
    deliveryAddress: row.delivery_address,
    paymentType: row.payment_type,
    amountPaid: Number(row.amount_paid),
    totalPrice: Number(row.total_price),
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

function mapOrderItemFromDb(row: any): CartItem {
  return {
    partId: row.part_id,
    partNameHe: row.part_name_he,
    partEmoji: row.part_emoji || '🥩',
    kg: Number(row.kg),
    processing: row.processing,
    notes: row.notes,
    pricePerKg: Number(row.price_per_kg),
    subtotal: Number(row.subtotal),
  };
}
