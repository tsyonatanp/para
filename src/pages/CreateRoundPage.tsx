import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimalType } from '../types';
import { MOCK_PARTS } from '../data/mockData';
import { useAuthStore } from '../stores/authStore';

const ANIMAL_EMOJI: Record<AnimalType, string> = {
  cow: '🐄', calf: '🐂', lamb: '🐑', chicken: '🐓',
};
const ANIMAL_NAME: Record<AnimalType, string> = {
  cow: 'פרה', calf: 'עגל', lamb: 'כבש', chicken: 'עוף',
};

const DEFAULT_PARTS = [
  { id: 'entrecote', nameHe: 'אנטריקוט', pct: 8, emoji: '🥩' },
  { id: 'sirloin', nameHe: 'סינטה', pct: 6, emoji: '🥩' },
  { id: 'fillet', nameHe: 'פילה', pct: 4, emoji: '🥩' },
  { id: 'ribs', nameHe: 'צלעות', pct: 12, emoji: '🍖' },
  { id: 'shoulder', nameHe: 'כתף', pct: 15, emoji: '🥩' },
  { id: 'shank', nameHe: 'שוק', pct: 10, emoji: '🍖' },
  { id: 'neck', nameHe: 'צוואר', pct: 8, emoji: '🍖' },
  { id: 'ground', nameHe: 'טחון', pct: 20, emoji: '🫙' },
  { id: 'bones', nameHe: 'עצמות / ציר', pct: 10, emoji: '🦴' },
  { id: 'other', nameHe: 'כבד / לב / לשון', pct: 7, emoji: '🫀' },
];

const DEFAULT_PRICES: Record<string, number> = {
  entrecote: 120, sirloin: 110, fillet: 165, ribs: 80,
  shoulder: 65, shank: 55, neck: 45, ground: 55, bones: 20, other: 40,
};

const CreateRoundPage: React.FC = () => {
  const canAccess = useAuthStore(s => s.canAccessDashboard());
  if (!canAccess) return <Navigate to="/" replace />;

  const [animal, setAnimal] = useState<AnimalType>('calf');
  const [slaughterDate, setSlaughterDate] = useState('2026-03-20');
  const [closeDate, setCloseDate] = useState('2026-03-19');
  const [totalKg, setTotalKg] = useState(250);
  const [basePrice, setBasePrice] = useState(70);
  const [parts, setParts] = useState(DEFAULT_PARTS.map(p => ({
    ...p,
    kg: Math.round((totalKg * p.pct) / 100),
    price: DEFAULT_PRICES[p.id],
  })));
  const [published, setPublished] = useState(false);

  const updateTotalKg = (kg: number) => {
    setTotalKg(kg);
    setParts(prev => prev.map(p => ({
      ...p,
      kg: Math.round((kg * p.pct) / 100),
    })));
  };

  const updatePartPct = (id: string, pct: number) => {
    setParts(prev => prev.map(p =>
      p.id === id ? { ...p, pct, kg: Math.round((totalKg * pct) / 100) } : p
    ));
  };

  const updatePartPrice = (id: string, price: number) => {
    setParts(prev => prev.map(p => p.id === id ? { ...p, price } : p));
  };

  const totalPct = parts.reduce((s, p) => s + p.pct, 0);
  const expectedRevenue = parts.reduce((s, p) => s + p.kg * p.price, 0);

  if (published) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }} style={{ fontSize: 72 }}>🎉</motion.div>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>הסבב פורסם!</h1>
        <p style={{ color: '#94a3b8', maxWidth: 340 }}>הלקוחות יקבלו התראה ויוכלו להתחיל להזמין</p>
        <Link to="/butcher" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">← חזור לדשבורד</button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/butcher" style={{ color: '#94a3b8', fontSize: 13, textDecoration: 'none' }}>← חזור לדשבורד</Link>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginTop: 8, color: '#f1f5f9' }}>פתיחת סבב חדש</h1>
        </div>

        {/* Animal type */}
        <div style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <label className="label">סוג בעל חיים</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(Object.keys(ANIMAL_EMOJI) as AnimalType[]).map(a => (
              <button
                key={a}
                onClick={() => setAnimal(a)}
                style={{
                  padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
                  border: '1px solid', fontFamily: 'Heebo, sans-serif',
                  borderColor: animal === a ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                  background: animal === a ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: animal === a ? '#c4b5fd' : '#94a3b8',
                  fontSize: 15, fontWeight: animal === a ? 700 : 400,
                  transition: 'all 0.2s',
                }}
              >
                {ANIMAL_EMOJI[a]} {ANIMAL_NAME[a]}
              </button>
            ))}
          </div>
        </div>

        {/* Dates & weight */}
        <div style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="label">תאריך שחיטה</label>
              <input type="date" className="input-field" value={slaughterDate} onChange={e => setSlaughterDate(e.target.value)} />
            </div>
            <div>
              <label className="label">סגירת הזמנות</label>
              <input type="date" className="input-field" value={closeDate} onChange={e => setCloseDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="label">משקל כולל (ק"ג)</label>
              <input
                type="number" className="input-field" min={50} max={800}
                value={totalKg}
                onChange={e => updateTotalKg(+e.target.value)}
              />
            </div>
            <div>
              <label className="label">מחיר בסיס לק"ג (₪)</label>
              <input
                type="number" className="input-field" min={10} max={300}
                value={basePrice}
                onChange={e => setBasePrice(+e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Parts */}
        <div style={{ background: '#16161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>חלוקה לחלקים</div>
            <div style={{ fontSize: 13, color: totalPct > 100 ? '#ef4444' : totalPct === 100 ? '#22c55e' : '#94a3b8' }}>
              סה"כ: {totalPct}%
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {parts.map(part => (
              <div key={part.id} style={{
                display: 'grid', gridTemplateColumns: '24px 1fr 80px 80px 70px',
                gap: 10, alignItems: 'center',
                padding: '8px 10px', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: 16 }}>{part.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{part.nameHe}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number" min={0} max={100} step={1}
                      value={part.pct}
                      onChange={e => updatePartPct(part.id, +e.target.value)}
                      style={{
                        width: '100%', background: '#1c1c28',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                        padding: '4px 8px', color: '#f1f5f9',
                        fontFamily: 'Heebo, sans-serif', fontSize: 13,
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: 11, color: '#6b7280' }}>%</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' as const }}>
                  {part.kg} ק"ג
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="number" min={5} max={500}
                    value={part.price}
                    onChange={e => updatePartPrice(part.id, +e.target.value)}
                    style={{
                      width: '100%', background: '#1c1c28',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
                      padding: '4px 6px', color: '#f1f5f9',
                      fontFamily: 'Heebo, sans-serif', fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 10, color: '#6b7280' }}>₪</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(139,92,246,0.06)', borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>הכנסה צפויה:</span>
            <span style={{ fontWeight: 800, color: '#c4b5fd' }}>{expectedRevenue.toLocaleString()} ₪</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            * 10% buffer אוטומטי לכל חלק (לא יימכר)
          </div>
        </div>

        {/* Publish */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setPublished(true)}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 17, borderRadius: 14 }}
        >
          🚀 פרסם סבב ציבורי
        </motion.button>
      </div>
    </div>
  );
};

export default CreateRoundPage;
