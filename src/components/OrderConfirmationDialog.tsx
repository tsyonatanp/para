import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, MapPin, CreditCard } from 'lucide-react';
import { CartItem } from '../stores/cartStore';
import { ProcessingOption } from '../types';

const PROCESSING_LABELS: Record<ProcessingOption, string> = {
  whole: 'שלם', sliced: 'פרוס', cubed: 'קוביות', ground: 'טחון',
};

interface Props {
  isOpen: boolean;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress: string;
  paymentType: 'deposit' | 'full';
  subtotal: number;
  deliveryFee: number;
  amountDue: number;
  customerNotes?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const OrderConfirmationDialog: React.FC<Props> = ({
  isOpen, items, customerName, customerPhone,
  deliveryType, deliveryAddress, paymentType,
  subtotal, deliveryFee, amountDue, customerNotes,
  onConfirm, onCancel, isLoading,
}) => {
  const total = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, backdropFilter: 'blur(4px)',
          }}
          onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            style={{
              width: '100%', maxWidth: 480,
              background: '#16161f',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, overflow: 'hidden',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, background: '#16161f', zIndex: 1,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>
                📋 אישור הזמנה
              </div>
              <button
                onClick={onCancel}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: 'none',
                  borderRadius: '50%', width: 34, height: 34,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#94a3b8',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Customer */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>פרטי לקוח</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{customerName}</div>
                <div style={{ fontSize: 13, color: '#94a3b8', direction: 'ltr', textAlign: 'right' }}>{customerPhone}</div>
              </div>

              {/* Items */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, fontWeight: 600 }}>פריטים</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map(item => (
                    <div key={item.partId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{item.partEmoji}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{item.partNameHe}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {item.kg} ק"ג · {PROCESSING_LABELS[item.processing]}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.subtotal.toFixed(0)} ₪</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 14,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <MapPin size={16} color="#8b5cf6" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                    {deliveryType === 'pickup' ? 'איסוף עצמי' : 'משלוח'}
                  </div>
                  {deliveryType === 'delivery' && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{deliveryAddress}</div>
                  )}
                </div>
              </div>

              {/* Price summary */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: 14,
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2, fontWeight: 600 }}>סיכום מחיר</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
                  <span>סכום ביניים</span><span>{subtotal.toFixed(0)} ₪</span>
                </div>
                {deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
                    <span>דמי משלוח</span><span>{deliveryFee} ₪</span>
                  </div>
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 16, fontWeight: 800, color: '#f1f5f9',
                  borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 2,
                }}>
                  <span>סה"כ</span><span>{total.toFixed(0)} ₪</span>
                </div>
                <div style={{
                  display: 'flex', gap: 8, alignItems: 'center', marginTop: 2,
                  background: 'rgba(139,92,246,0.1)', borderRadius: 8, padding: '8px 10px',
                }}>
                  <CreditCard size={14} color="#c4b5fd" />
                  <span style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 600 }}>
                    {paymentType === 'deposit'
                      ? `לתשלום עכשיו: ${amountDue} ₪ (מקדמה 30%)`
                      : `תשלום מלא: ${amountDue} ₪`}
                  </span>
                </div>
              </div>

              {customerNotes && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: 14, fontSize: 13, color: '#94a3b8',
                }}>
                  <span style={{ fontWeight: 600, color: '#f1f5f9' }}>הערות: </span>{customerNotes}
                </div>
              )}

              {/* CTAs */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  style={{
                    flex: 1, padding: '13px 0',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, color: '#94a3b8',
                    fontFamily: 'Heebo, sans-serif', fontSize: 15, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  עריכה
                </button>
                <motion.button
                  onClick={onConfirm}
                  disabled={isLoading}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 2, padding: '13px 0',
                    background: isLoading
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none', borderRadius: 12,
                    color: isLoading ? '#4b5563' : 'white',
                    fontFamily: 'Heebo, sans-serif', fontSize: 15, fontWeight: 700,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: isLoading ? 'none' : '0 6px 24px rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {isLoading ? (
                    'שולח...'
                  ) : (
                    <><CheckCircle size={18} /> אשר הזמנה</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderConfirmationDialog;
