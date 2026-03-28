import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Clock, ChevronDown, ChevronUp, ShoppingBag, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';
import { useRoundStore } from '../stores/roundStore';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';
import { SkeletonOrderCard } from '../components/Skeleton';
import { Order } from '../api/orders';

const STATUS_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: 'ממתין לאישור', color: '#f97316', emoji: '⏳' },
  confirmed: { label: 'אושר', color: '#3b82f6', emoji: '✅' },
  prepared: { label: 'הוכן', color: '#8b5cf6', emoji: '📦' },
  in_delivery: { label: 'בדרך אליך', color: '#06b6d4', emoji: '🚚' },
  delivered: { label: 'נמסר', color: '#22c55e', emoji: '🎉' },
};

const OrderHistoryPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const allOrders = useOrderStore(s => s.orders);
  const loading = useOrderStore(s => s.loading);
  const subscribeToOrders = useOrderStore(s => s.subscribeToOrders);
  const roundId = useRoundStore(s => s.round?.id);
  const addItem = useCartStore(s => s.addItem);
  const clearCart = useCartStore(s => s.clearCart);
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();
  const orders = user
    ? allOrders.filter(o => o.userPhone === user.phone)
    : [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!roundId) return;
    const unsubscribe = subscribeToOrders(roundId);
    return unsubscribe;
  }, [roundId, subscribeToOrders]);

  const handleReorder = (order: Order) => {
    clearCart();
    order.items.forEach(item => addItem({
      partId: item.partId,
      kg: item.kg,
      processing: item.processing,
      notes: item.notes || '',
      pricePerKg: item.pricePerKg,
      subtotal: item.kg * item.pricePerKg,
      partNameHe: item.partNameHe,
      partEmoji: item.partEmoji || '🥩',
    }));
    addToast({ message: 'הפריטים נוספו לסל!', type: 'success', emoji: '🛒' });
    navigate('/cart');
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
      }}>
        <Package size={64} color="#4b5563" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>התחבר כדי לראות הזמנות</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>
          הזמנות קודמות, מעקב סטטוס ואפשרות הזמנה חוזרת
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            ← חזור
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 className="page-title" style={{ fontSize: 24, margin: 0 }}>📋 ההזמנות שלי</h1>
            <div style={{
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 10, padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, color: '#c4b5fd',
            }}>
              👤 {user.name}
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonOrderCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '48px 24px',
            background: '#16161f', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <ShoppingBag size={48} color="#4b5563" style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
              עדיין אין הזמנות
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: 20 }}>ההזמנות שלכם יופיעו כאן</p>
            <Link to="/cow" style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: 'white', padding: '10px 20px', borderRadius: 10,
              textDecoration: 'none', fontWeight: 700, fontSize: 14,
            }}>
              הזמן עכשיו →
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, idx) => {
              const status = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const isExpanded = expandedId === order.id;
              const date = new Date(order.createdAt);

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-compact"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Order header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: `${status.color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {status.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                          {order.items?.length || 0} פריטים
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6,
                          background: `${status.color}20`,
                          border: `1px solid ${status.color}40`,
                          color: status.color, fontSize: 11, fontWeight: 700,
                        }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={11} />
                        {date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                        {' · '}
                        {date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>
                        {order.totalPrice.toFixed(0)} ₪
                      </div>
                    </div>
                    <div style={{ color: '#6b7280', flexShrink: 0 }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{
                        marginTop: 14, paddingTop: 14,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                        {(order.items || []).map((item, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                            <span style={{ fontSize: 16 }}>{item.partEmoji}</span>
                            <span style={{ flex: 1, color: '#e2e8f0' }}>
                              {item.partNameHe}
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: 12 }}>
                              {item.kg} ק"ג
                            </span>
                            <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 13 }}>
                              {item.subtotal.toFixed(0)} ₪
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery info */}
                      <div style={{
                        display: 'flex', gap: 16, fontSize: 12, color: '#6b7280',
                        padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
                        borderRadius: 8,
                      }}>
                        <span>
                          {order.deliveryType === 'pickup' ? '📍 איסוף עצמי' : `🚚 ${order.deliveryAddress}`}
                        </span>
                        <span>
                          💳 {order.paymentType === 'deposit'
                            ? `מקדמה ${order.amountPaid.toFixed(0)}₪ / ${order.totalPrice.toFixed(0)}₪`
                            : `שולם ${order.amountPaid.toFixed(0)}₪`
                          }
                        </span>
                      </div>

                      {/* Status timeline */}
                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {['pending', 'confirmed', 'prepared', 'delivered'].map((s, i) => {
                            const statusInfo = STATUS_MAP[s];
                            const statusOrder = ['pending', 'confirmed', 'prepared', 'in_delivery', 'delivered'];
                            const currentIdx = statusOrder.indexOf(order.status);
                            const thisIdx = statusOrder.indexOf(s);
                            const isReached = thisIdx <= currentIdx;

                            return (
                              <div key={s} style={{ flex: 1 }}>
                                <div style={{
                                  height: 4, borderRadius: 2,
                                  background: isReached ? statusInfo.color : 'rgba(255,255,255,0.06)',
                                  transition: 'background 0.3s',
                                }} />
                                <div style={{
                                  fontSize: 10, color: isReached ? statusInfo.color : '#4b5563',
                                  marginTop: 4, textAlign: 'center',
                                }}>
                                  {statusInfo.label}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Reorder button */}
                      <button
                        onClick={e => { e.stopPropagation(); handleReorder(order); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          margin: '14px 0 4px', padding: '10px', width: '100%',
                          background: 'rgba(139,92,246,0.1)',
                          border: '1px solid rgba(139,92,246,0.2)',
                          borderRadius: 10, cursor: 'pointer',
                          color: '#c4b5fd', fontSize: 13, fontWeight: 600,
                          fontFamily: 'Heebo, sans-serif',
                        }}
                      >
                        <RefreshCw size={14} />
                        הזמן שוב
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
