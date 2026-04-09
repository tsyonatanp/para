import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, CheckCircle, Edit3, MessageCircle } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useRoundStore } from '../../stores/roundStore';
import { useOrderStore } from '../../stores/orderStore';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/toastStore';
import { ProcessingOption } from '../../types';
import OrderConfirmationDialog from '../../components/OrderConfirmationDialog';
import DeliveryScheduler from '../../components/DeliveryScheduler';

const PROCESSING_LABELS: Record<ProcessingOption, string> = {
  whole: 'שלם', sliced: 'פרוס', cubed: 'קוביות', ground: 'טחון',
};

const Cart: React.FC = () => {
  const { items, deliveryType, deliveryAddress, paymentType, removeItem, updateItem, setDeliveryType, setDeliveryAddress, setPaymentType, clearCart } = useCartStore();
  const roundLocation = useRoundStore(s => s.round?.location || 'ישראל');
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const deliveryFee = deliveryType === 'delivery' ? 30 : 0;
  const total = subtotal + deliveryFee;
  const depositAmount = Math.ceil(total * 0.3);
  const amountDue = paymentType === 'deposit' ? depositAmount : total;
  const [ordered, setOrdered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  const updatePartSold = useRoundStore(s => s.updatePartSold);
  const addToast = useToastStore(s => s.addToast);
  const navigate = useNavigate();

  // Auto-fill from auth
  const authUser = useAuthStore(s => s.user);

  // Customer details
  const [customerName, setCustomerName] = useState(authUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(authUser?.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');

  const isFormValid =
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 9 &&
    (deliveryType !== 'delivery' || deliveryAddress.trim().length >= 5);

  const generateWhatsAppText = () => {
    const itemsList = items.map(i =>
      `• ${i.partEmoji} ${i.partNameHe} – ${i.kg} ק"ג (${PROCESSING_LABELS[i.processing]}) – ${i.subtotal.toFixed(0)}₪`
    ).join('\n');
    return encodeURIComponent(
      `🥩 הזמנה חדשה מ-FreshCut\n\n` +
      `👤 שם: ${customerName}\n📱 טלפון: ${customerPhone}\n\n` +
      `📋 פריטים:\n${itemsList}\n\n` +
      `🚚 ${deliveryType === 'pickup' ? 'איסוף עצמי' : `משלוח: ${deliveryAddress}`}\n` +
      `💳 ${paymentType === 'deposit' ? `מקדמה ${depositAmount}₪` : `תשלום מלא ${total.toFixed(0)}₪`}\n` +
      `💰 סה"כ: ${total.toFixed(0)}₪\n` +
      (customerNotes ? `\n📝 הערות: ${customerNotes}` : '')
    );
  };

  const handleOrder = () => {
    if (!isFormValid) {
      addToast({ message: 'נא למלא שם וטלפון', type: 'warning', emoji: '📝' });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    const round = useRoundStore.getState().round;
    const { placeOrder } = useOrderStore.getState();

    const order = await placeOrder({
      roundId: round?.id || 'round-001',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
      paymentType,
      totalPrice: total,
      amountPaid: amountDue,
      notes: customerNotes.trim() || undefined,
      items,
    });

    setIsSubmitting(false);
    setShowConfirm(false);

    if (order) {
      items.forEach(item => updatePartSold(item.partId, item.kg));
      setOrdered(true);
      addToast({ message: 'ההזמנה נשלחה בהצלחה!', type: 'success', emoji: '🎉' });
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3000);
    } else {
      addToast({ message: 'שגיאה בשליחת ההזמנה, נסה שוב', type: 'error', emoji: '❌' });
    }
  };

  if (ordered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 24, textAlign: 'center',
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.1) 0%, transparent 70%), #0a0a0f',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          style={{ fontSize: 72, marginBottom: 24 }}
        >✅</motion.div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', marginBottom: 12 }}>
          ההזמנה התקבלה!
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 340, lineHeight: 1.7 }}>
          תישלח הודעת אישור ב-WhatsApp בקרוב.<br />
          השוחט יעדכן אותך ביום השחיטה.
        </p>
        <div style={{ marginTop: 16, color: '#22c55e', fontSize: 15, fontWeight: 600 }}>
          מעביר אותך לדף הבית...
        </div>
      </motion.div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24,
      }}>
        <ShoppingBag size={64} color="#4b5563" />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>הסל ריק</h2>
        <p style={{ color: '#94a3b8' }}>בחרו חלקים כדי להתחיל</p>
        <Link to="/cow" style={{
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          color: 'white', padding: '12px 24px', borderRadius: 12,
          textDecoration: 'none', fontWeight: 700, fontSize: 15,
        }}>
          לבחירת חלקים →
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '24px 16px 80px' }}>
      <div className="cart-container">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/cow" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            ← חזור לבחירת חלקים
          </Link>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9' }}>🛒 סל ההזמנה שלי</h1>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <AnimatePresence>
            {items.map(item => {
              const isEditing = editingPartId === item.partId;
              return (
                <motion.div
                  key={item.partId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    background: '#16161f',
                    border: `1px solid ${isEditing ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 14, padding: '14px 16px',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Item row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{item.partEmoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{item.partNameHe}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        {item.kg} ק"ג · {PROCESSING_LABELS[item.processing]}
                        {item.notes && ` · ${item.notes}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>{item.subtotal.toFixed(0)} ₪</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{item.pricePerKg}₪/ק"ג</div>
                    </div>
                    <button
                      onClick={() => setEditingPartId(isEditing ? null : item.partId)}
                      style={{
                        background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                        borderRadius: 8, width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#8b5cf6',
                      }}
                    ><Edit3 size={14} /></button>
                    <button
                      className="btn-icon-delete"
                      onClick={() => {
                        removeItem(item.partId);
                        addToast({ message: `${item.partEmoji} ${item.partNameHe} הוסר מהסל`, type: 'info', emoji: '🗑️' });
                      }}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8, width: 34, height: 34,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#ef4444',
                      }}
                    ><Trash2 size={14} /></button>
                  </div>

                  {/* Inline edit panel */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          marginTop: 12, paddingTop: 12,
                          borderTop: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex', flexDirection: 'column', gap: 10,
                        }}>
                          {/* Quantity */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', minWidth: 50 }}>כמות:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <button
                                onClick={() => {
                                  const newKg = Math.max(0.5, item.kg - 0.5);
                                  updateItem(item.partId, newKg, item.processing, item.notes);
                                }}
                                style={{
                                  width: 32, height: 32, borderRadius: 8,
                                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                                  color: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'Heebo, sans-serif', fontSize: 16,
                                }}
                              >−</button>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', minWidth: 50, textAlign: 'center' }}>
                                {item.kg} ק"ג
                              </span>
                              <button
                                onClick={() => {
                                  const newKg = Math.min(10, item.kg + 0.5);
                                  updateItem(item.partId, newKg, item.processing, item.notes);
                                }}
                                style={{
                                  width: 32, height: 32, borderRadius: 8,
                                  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                                  color: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontFamily: 'Heebo, sans-serif', fontSize: 16,
                                }}
                              >+</button>
                            </div>
                          </div>
                          {/* Processing */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, color: '#94a3b8', minWidth: 50 }}>עיבוד:</span>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {(['whole', 'sliced', 'cubed', 'ground'] as ProcessingOption[]).map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => updateItem(item.partId, item.kg, opt, item.notes)}
                                  style={{
                                    padding: '4px 10px', borderRadius: 6, fontSize: 12,
                                    border: '1px solid',
                                    borderColor: item.processing === opt ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                                    background: item.processing === opt ? 'rgba(139,92,246,0.2)' : 'transparent',
                                    color: item.processing === opt ? '#c4b5fd' : '#94a3b8',
                                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                                  }}
                                >{PROCESSING_LABELS[opt]}</button>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setEditingPartId(null);
                              addToast({ message: `${item.partEmoji} ${item.partNameHe} עודכן`, type: 'success' });
                            }}
                            style={{
                              alignSelf: 'flex-start',
                              padding: '6px 14px', borderRadius: 8,
                              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                              color: '#c4b5fd', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                              fontSize: 13, fontWeight: 600,
                            }}
                          >✓ סגור</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Customer Details */}
        <div style={{
          background: '#16161f', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>👤 פרטי הלקוח</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="label">שם מלא *</label>
              <input
                className="input-field"
                placeholder="ישראל ישראלי"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="label">טלפון *</label>
              <input
                className="input-field"
                placeholder="050-1234567"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                type="tel"
                dir="ltr"
                style={{ textAlign: 'right' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>הערות כלליות (אופציונלי)</label>
                <span style={{ fontSize: 11, color: customerNotes.length > 200 ? '#ef4444' : '#6b7280' }}>
                  {customerNotes.length}/240
                </span>
              </div>
              <textarea
                value={customerNotes}
                maxLength={240}
                onChange={e => setCustomerNotes(e.target.value.slice(0, 240))}
                placeholder="הערות מיוחדות, אלרגיות, העדפות..."
                rows={2}
                style={{
                  width: '100%', background: '#1c1c28',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '10px 12px',
                  color: '#f1f5f9', fontFamily: 'Heebo, sans-serif',
                  fontSize: 14, resize: 'none', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#8b5cf6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: '#16161f', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8' }}>סה"כ בשר</span>
            <span style={{ fontWeight: 600 }}>{items.reduce((s, i) => s + i.kg, 0).toFixed(1)} ק"ג</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#94a3b8' }}>ביניים</span>
            <span style={{ fontWeight: 600 }}>{subtotal.toFixed(0)} ₪</span>
          </div>
          {deliveryFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#94a3b8' }}>משלוח</span>
              <span style={{ fontWeight: 600 }}>+{deliveryFee} ₪</span>
            </div>
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>סה"כ</span>
            <span style={{ fontWeight: 900, fontSize: 20, color: '#f1f5f9' }}>{total.toFixed(0)} ₪</span>
          </div>
        </div>

        {/* Delivery */}
        <div style={{
          background: '#16161f', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 20, marginBottom: 16,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🚚 אספקה</div>
          {[
            { type: 'pickup' as const, label: 'איסוף עצמי (חינם)', sub: `📍 ${roundLocation}` },
            { type: 'delivery' as const, label: 'משלוח (+30 ₪)', sub: '🏠 אל הבית' },
          ].map(opt => (
            <div
              key={opt.type}
              className="radio-option"
              onClick={() => setDeliveryType(opt.type)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: '1px solid',
                borderColor: deliveryType === opt.type ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                background: deliveryType === opt.type ? 'rgba(139,92,246,0.08)' : 'transparent',
                marginBottom: 8, transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', marginTop: 2, flexShrink: 0,
                border: '2px solid',
                borderColor: deliveryType === opt.type ? '#8b5cf6' : '#4b5563',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {deliveryType === opt.type && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{opt.sub}</div>
              </div>
            </div>
          ))}
          {deliveryType === 'delivery' && (
            <>
              <input
                className="input-field"
                placeholder="הכנס כתובת מלאה..."
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                style={{ marginTop: 4 }}
              />
              <DeliveryScheduler />
            </>
          )}
        </div>

        {/* Payment */}
        <div style={{
          background: '#16161f', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: 20, marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>💳 תשלום</div>
          {[
            { type: 'deposit' as const, label: `מקדמה 30% (${depositAmount} ₪ עכשיו)`, sub: 'יתרה בעת האיסוף' },
            { type: 'full' as const, label: `תשלום מלא (${total.toFixed(0)} ₪)`, sub: 'עסקה אחת' },
          ].map(opt => (
            <div
              key={opt.type}
              onClick={() => setPaymentType(opt.type)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: '1px solid',
                borderColor: paymentType === opt.type ? '#8b5cf6' : 'rgba(255,255,255,0.06)',
                background: paymentType === opt.type ? 'rgba(139,92,246,0.08)' : 'transparent',
                marginBottom: 8, transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', marginTop: 2, flexShrink: 0,
                border: '2px solid',
                borderColor: paymentType === opt.type ? '#8b5cf6' : '#4b5563',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {paymentType === opt.type && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{opt.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <motion.button
            className="btn-cta-green"
            whileTap={{ scale: 0.97 }}
            onClick={handleOrder}
            disabled={!isFormValid}
            style={{
              width: '100%', padding: '16px 24px',
              background: isFormValid
                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                : 'rgba(255,255,255,0.05)',
              border: 'none', borderRadius: 14,
              color: isFormValid ? 'white' : '#4b5563',
              fontWeight: 800, fontSize: 18,
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              fontFamily: 'Heebo, sans-serif',
              boxShadow: isFormValid ? '0 8px 30px rgba(34,197,94,0.3)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.3s',
            }}
          >
            <CheckCircle size={22} />
            שלם {amountDue.toFixed(0)} ₪ {paymentType === 'deposit' ? '(מקדמה)' : ''}
          </motion.button>

          {/* WhatsApp order button */}
          <a
            href={`https://wa.me/972501234567?text=${generateWhatsAppText()}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%', padding: '14px 24px',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none', borderRadius: 14,
              color: 'white', fontWeight: 700, fontSize: 16,
              textDecoration: 'none', fontFamily: 'Heebo, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
            }}
          >
            <MessageCircle size={20} />
            שלח הזמנה ב-WhatsApp
          </a>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#4b5563', marginTop: 10 }}>
          תשלום מאובטח · ניתן לביטול עד 48 שעות לפני השחיטה
        </p>
      </div>

      <OrderConfirmationDialog
        isOpen={showConfirm}
        items={items}
        customerName={customerName}
        customerPhone={customerPhone}
        deliveryType={deliveryType}
        deliveryAddress={deliveryAddress}
        paymentType={paymentType}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        amountDue={amountDue}
        customerNotes={customerNotes}
        onConfirm={handleConfirmOrder}
        onCancel={() => setShowConfirm(false)}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Cart;
