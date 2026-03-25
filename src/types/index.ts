export type AnimalType = 'cow' | 'calf' | 'lamb' | 'chicken';
export type RoundStatus = 'draft' | 'open' | 'closed' | 'slaughtered' | 'completed';
export type Visibility = 'public' | 'private';
export type ProcessingOption = 'whole' | 'sliced' | 'cubed' | 'ground';
export type DeliveryType = 'pickup' | 'delivery';
export type PaymentType = 'deposit' | 'full';
export type OrderStatus = 'pending' | 'confirmed' | 'prepared' | 'in_delivery' | 'delivered';

export type AvailabilityLevel = 'high' | 'medium' | 'low' | 'critical' | 'sold' | 'selected';

export interface SlaughterRound {
  id: string;
  butcherId: string;
  butcherName: string;
  animalType: AnimalType;
  slaughterDate: string; // ISO string
  orderCloseDate: string; // ISO string
  totalWeightKg: number;
  bufferPercent: number;
  status: RoundStatus;
  visibility: Visibility;
  createdAt: string;
  location: string;
}

export interface MeatPart {
  id: string;
  roundId: string;
  nameHe: string;
  nameEn: string;
  description: string;
  cookingSuggestions: string[];
  svgPathId: string;
  totalKg: number;
  soldKg: number;
  bufferKg: number;
  pricePerKg: number;
  processingOptions: ProcessingOption[];
  defaultPercent: number;
  emoji: string;
}

export interface CartItem {
  partId: string;
  kg: number;
  processing: ProcessingOption;
  notes: string;
  pricePerKg: number;
  subtotal: number;
  partNameHe: string;
  partEmoji: string;
}

export interface OrderItem {
  partId: string;
  partNameHe: string;
  partEmoji: string;
  kg: number;
  processing: ProcessingOption;
  notes: string;
  pricePerKg: number;
  subtotal: number;
}

export interface Order {
  id: string;
  roundId: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  paymentType: PaymentType;
  amountPaid: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  id: string;
  role: 'customer' | 'butcher';
  name: string;
  phone: string;
}
