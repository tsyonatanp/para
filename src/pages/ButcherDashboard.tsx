import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Plus, ChevronDown } from 'lucide-react';
import { useRoundStore } from '../stores/roundStore';
import { useOrderStore } from '../stores/orderStore';
import { getRoundStats, getPartAvailability } from '../data/mockData';
import { Order, OrderStatus } from '../types';
import CountdownTimer from '../components/CountdownTimer';

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'ממתין', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  confirmed: { label: 'אושר', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  prepared: { label: 'הוכן', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  in_delivery: { label: 'בדרך', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  delivered: { label: 'נמסר', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'prepared',
  prepared: 'in_delivery',
  in_delivery: 'delivered',
  delivered: null,
};

const ButcherDashboard: React.FC = () => {
  const { round, parts } = useRoundStore();
  const { orders, setOrderStatus } = useOrderStore();
  const stats = getRoundStats(parts);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const expectedRevenue = stats.expectedRevenue;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const remainingParts = parts.filter(p => getPartAvailability(p) > 0);

  const hoursToClose = round
    ? Math.max(0, (new Date(round.orderCloseDate).getTime() - Date.now()) / 3600000)
    : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>דשבורד שוחט</div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}>
              🐄 פרה אנגוס · שחיטה 20.3
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-secondary"
              onClick={() => alert('ייצוא PDF – בקרוב!')}
              style={{ fontSize: 13 }}
            >
              <Download size={15} /> ייצוא PDF
            </button>
            <Link to="/butcher/create" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ fontSize: 13 }}>
                <Plus size={15} /> סבב חדש
              </button>
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'הכנסה צפויה', value: `${expectedRevenue.toLocaleString()} ₪`, color: '#22c55e' },
            { label: 'נמכר', value: `${stats.totalSold.toFixed(0)} / ${stats.totalKg} ק"ג`, color: '#8b5cf6' },
            { label: 'הזמנות', value: orders.length.toString(), color: '#3b82f6' },
            { label: 'ממתינות לאישור', value: pendingOrders.toString(), color: pendingOrders > 0 ? '#f97316' : '#22c55e' },
          ].map(stat => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="stat-card"
            >
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Parts overview */}
        <div style={{
          background: '#16161f', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>מצב מלאי לפי חלק</div>
            {round && (
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'left center' }}>
                <CountdownTimer targetDate={round.orderCloseDate} label="סגירה בעוד" />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {parts.map(part => {
              const avail = getPartAvailability(part);
              const available = Math.max(0, part.totalKg - part.soldKg - part.bufferKg);
              const soldPct = (part.soldKg / part.totalKg) * 100;

              return (
                <div key={part.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 20, textAlign: 'center', fontSize: 16 }}>{part.emoji}</span>
                  <div style={{ width: 80, fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{part.nameHe}</div>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: `${Math.min(soldPct, 100)}%`,
                      background: avail < 10 ? '#ef4444' : avail < 30 ? '#f97316' : avail < 60 ? '#eab308' : '#22c55e',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <div style={{ width: 65, fontSize: 12, color: '#94a3b8', textAlign: 'left' as const }}>
                    {available.toFixed(1)} ק"ג
                  </div>
                  <div style={{
                    width: 50, fontSize: 12, fontWeight: 700,
                    color: avail <= 0 ? '#6b7280' : '#f1f5f9',
                    textAlign: 'left' as const,
                  }}>
                    {part.pricePerKg}₪
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders table */}
        <div style={{
          background: '#16161f', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20,
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            📋 הזמנות ({orders.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.map(order => {
              const statusInfo = STATUS_LABELS[order.status];
              const nextStatus = STATUS_FLOW[order.status];
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  {/* Row header */}
                  <div
                    style={{
                      padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{order.userName}</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        {(order.items ?? []).map(i => i.partNameHe).join(', ')} · {(order.items ?? []).reduce((s, i) => s + i.kg, 0).toFixed(1)} ק"ג
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>{order.totalPrice.toFixed(0)} ₪</div>
                      <div style={{ fontSize: 11, color: order.amountPaid >= order.totalPrice ? '#22c55e' : '#f97316' }}>
                        {order.amountPaid >= order.totalPrice ? '✅ שולם' : `⏳ שולם ${order.amountPaid} ₪`}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 10px', borderRadius: 20,
                      background: statusInfo.bg, color: statusInfo.color,
                      fontSize: 12, fontWeight: 600,
                      border: `1px solid ${statusInfo.color}30`,
                      minWidth: 60, textAlign: 'center',
                    }}>
                      {statusInfo.label}
                    </div>
                    <ChevronDown size={16} color="#6b7280" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid rgba(255,255,255,0.05)',
                      padding: '12px 14px',
                      background: 'rgba(0,0,0,0.2)',
                    }}>
                      {/* Items */}
                      <div style={{ marginBottom: 12 }}>
                        {(order.items ?? []).map((item, i) => (
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between',
                            fontSize: 13, padding: '4px 0', color: '#94a3b8',
                          }}>
                            <span>{item.partEmoji} {item.partNameHe} · {item.kg} ק"ג · {item.processing}</span>
                            <span style={{ color: '#f1f5f9' }}>{item.subtotal.toFixed(0)} ₪</span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery info */}
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                        {order.deliveryType === 'pickup' ? '📍 איסוף עצמי' : `🚚 משלוח: ${order.deliveryAddress}`}
                        <span style={{ marginRight: 12 }}>📱 {order.userPhone}</span>
                      </div>

                      {/* Status progression */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        {nextStatus && (
                          <motion.button
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setOrderStatus(order.id, nextStatus)}
                            style={{
                              padding: '8px 16px', borderRadius: 8,
                              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                              border: 'none', color: 'white',
                              fontFamily: 'Heebo, sans-serif', fontWeight: 700, fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            העבר ל: {STATUS_LABELS[nextStatus].label} →
                          </motion.button>
                        )}
                        {order.status === 'delivered' && (
                          <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 600, padding: '8px 0' }}>
                            ✅ הושלם
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButcherDashboard;
