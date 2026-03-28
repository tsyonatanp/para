import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { MeatPart, ProcessingOption } from '../../types';
import { getPartAvailability } from '../../data/mockData';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';

interface PartModalProps {
  part: MeatPart;
  onClose: () => void;
}

const PROCESSING_LABELS: Record<ProcessingOption, string> = {
  whole: 'שלם',
  sliced: 'פרוס',
  cubed: 'קוביות',
  ground: 'טחון',
};

const PartModal: React.FC<PartModalProps> = ({ part, onClose }) => {
  const [kg, setKg] = useState(1.0);
  const [processing, setProcessing] = useState<ProcessingOption>(part.processingOptions[0]);
  const [notes, setNotes] = useState('');
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(s => s.addItem);
  const items = useCartStore(s => s.items);
  const addToast = useToastStore(s => s.addToast);

  const available = Math.max(0, part.totalKg - part.soldKg - part.bufferKg);
  const maxKg = Math.min(available, 10);
  const total = +(kg * part.pricePerKg).toFixed(2);
  const existingItem = items.find(i => i.partId === part.id);

  useEffect(() => {
    if (existingItem) {
      setKg(existingItem.kg);
      setProcessing(existingItem.processing);
      setNotes(existingItem.notes);
    }
  }, []);

  const handleAdd = () => {
    addItem({
      partId: part.id,
      kg,
      processing,
      notes,
      pricePerKg: part.pricePerKg,
      subtotal: total,
      partNameHe: part.nameHe,
      partEmoji: part.emoji,
    });
    setAdded(true);
    addToast({
      message: existingItem
        ? `${part.emoji} ${part.nameHe} עודכן – ${kg} ק"ג`
        : `${part.emoji} ${part.nameHe} נוסף לסל – ${kg} ק"ג`,
      type: 'success',
      emoji: '🛒',
    });
    setTimeout(() => onClose(), 700);
  };

  const adjustKg = (delta: number) => {
    setKg(prev => +(Math.min(maxKg, Math.max(0.5, prev + delta))).toFixed(1));
  };

  const pct = getPartAvailability(part);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end',
          backdropFilter: 'blur(4px)',
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: 520,
            margin: '0 auto',
            background: '#16161f',
            borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderBottom: 'none',
            padding: '0 0 32px 0',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            position: 'sticky', top: 0,
            background: '#16161f',
            zIndex: 1,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 28 }}>{part.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>{part.nameHe}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{part.nameEn}</div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: '50%',
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#94a3b8',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '20px 20px 0' }}>
            {/* Almost sold out banner */}
            {pct < 10 && pct > 0 && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '8px 12px',
                marginBottom: 14,
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 700, color: '#ef4444',
              }}>
                ⚡ נשאר {available.toFixed(1)} ק"ג בלבד — הזדרז לפני שנגמר!
              </div>
            )}

            {/* Description */}
            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
              {part.description}
            </p>

            {/* Cooking suggestions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
              {part.cookingSuggestions.map(s => (
                <span key={s} style={{
                  padding: '3px 10px',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  borderRadius: 20, fontSize: 12, color: '#c4b5fd',
                }}>{s}</span>
              ))}
            </div>

            {/* Price + Availability */}
            <div style={{
              display: 'flex', gap: 12, marginBottom: 20,
              padding: 16, background: 'rgba(255,255,255,0.03)',
              borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{part.pricePerKg} ₪</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>לק"ג</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  color: pct < 10 ? '#ef4444' : pct < 30 ? '#f97316' : '#22c55e',
                }}>{available.toFixed(1)}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>ק"ג נשאר</div>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ flex: 1, textAlign: 'center' as const }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{Math.round(pct)}%</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>זמינות</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${Math.min(100 - pct, 100)}%`,
                  background: pct < 10 ? '#ef4444' : pct < 30 ? '#f97316' : pct < 60 ? '#eab308' : '#22c55e',
                  transition: 'width 0.5s',
                }} />
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'left' as const }}>
                {part.soldKg.toFixed(1)} ק"ג נמכר מתוך {part.totalKg} ק"ג
              </div>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">כמות (ק"ג)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={() => adjustKg(-0.5)}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                ><Minus size={16} /></button>
                <div style={{
                  flex: 1, textAlign: 'center',
                  fontSize: 24, fontWeight: 800, color: '#f1f5f9',
                }}>{kg.toFixed(1)} ק"ג</div>
                <button
                  onClick={() => adjustKg(0.5)}
                  disabled={kg >= maxKg}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: kg >= maxKg ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                    color: kg >= maxKg ? '#4b5563' : '#f1f5f9',
                    cursor: kg >= maxKg ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                ><Plus size={16} /></button>
              </div>
              {/* Slider */}
              <input
                type="range"
                min={0.5} max={maxKg} step={0.5}
                value={kg}
                onChange={e => setKg(+e.target.value)}
                style={{ width: '100%', marginTop: 10, accentColor: '#8b5cf6', cursor: 'pointer' }}
              />
            </div>

            {/* Processing */}
            <div style={{ marginBottom: 20 }}>
              <label className="label">אופן עיבוד</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {part.processingOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setProcessing(opt)}
                    style={{
                      padding: '8px 16px', borderRadius: 8,
                      border: '1px solid',
                      borderColor: processing === opt ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                      background: processing === opt ? 'rgba(139,92,246,0.2)' : 'transparent',
                      color: processing === opt ? '#c4b5fd' : '#94a3b8',
                      cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontSize: 14,
                      fontWeight: processing === opt ? 600 : 400,
                      transition: 'all 0.2s',
                    }}
                  >{PROCESSING_LABELS[opt]}</button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="label" style={{ margin: 0 }}>הערות (אופציונלי)</label>
                <span style={{ fontSize: 11, color: notes.length > 120 ? '#ef4444' : '#6b7280' }}>
                  {notes.length}/140
                </span>
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value.slice(0, 140))}
                placeholder="פרוס דק, T-bone אם אפשר..."
                rows={2}
                maxLength={140}
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

            {/* Total + CTA */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 0 0',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>סה"כ לתשלום</div>
                <motion.div
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9' }}
                >
                  {total.toFixed(0)} ₪
                </motion.div>
              </div>

              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '14px 28px',
                  background: added ? '#22c55e' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  border: 'none', borderRadius: 12,
                  color: 'white', fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  transition: 'background 0.3s',
                  boxShadow: added ? '0 4px 20px rgba(34,197,94,0.4)' : '0 4px 20px rgba(139,92,246,0.4)',
                }}
              >
                {added ? '✓ נוסף לסל!' : existingItem ? 'עדכן בסל' : 'הוסף לסל 🛒'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PartModal;
