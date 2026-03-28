import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Bell, Shield, Truck, Clock, Star, ArrowLeft } from 'lucide-react';
import { useRoundStore } from '../stores/roundStore';
import { getRoundStats, getPartAvailability } from '../data/mockData';
import CountdownTimer from '../components/CountdownTimer';

const ANIMAL_EMOJI: Record<string, string> = {
  cow: '🐄', calf: '🐂', lamb: '🐑', chicken: '🐓',
};

const ANIMAL_NAME: Record<string, string> = {
  cow: 'פרת אנגוס', calf: 'עגל', lamb: 'כבש', chicken: 'עוף',
};

const TESTIMONIALS = [
  { name: 'יוסי כהן', text: 'הבשר הכי טרי שאכלתי. מהשוחט ישר לגריל!', city: 'חיפה' },
  { name: 'שרה לוי', text: 'שקיפות מלאה, יודעת בדיוק מה אני מקבלת. מומלץ בחום.', city: 'ת"א' },
  { name: 'גיל שפירא', text: 'שירות מעולה, מחירים הוגנים, ואיכות ללא פשרות.', city: 'ראשון לציון' },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

const HomePage: React.FC = () => {
  const { round, parts } = useRoundStore();
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [joined, setJoined] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const stats = getRoundStats(parts);

  useEffect(() => {
    const id = setInterval(() => {
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!round || round.status !== 'open') {
    return (
      <div className="gradient-hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', maxWidth: 440 }}
        >
          <div style={{ fontSize: 72, marginBottom: 20, filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }}>📭</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12, color: '#f1f5f9' }}>אין סבב פעיל כרגע</h1>
          <p style={{ color: '#94a3b8', marginBottom: 28, lineHeight: 1.7, fontSize: 16 }}>
            הצטרפו לרשימת ההמתנה – נעדכן אתכם ברגע שהסבב הבא נפתח.
          </p>
          {joined ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: '#22c55e', fontWeight: 700, fontSize: 16, padding: 16, background: 'rgba(34,197,94,0.08)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)' }}
            >
              ✅ נרשמתם! נחזור אליכם בקרוב.
            </motion.div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input-field"
                placeholder="050-0000000"
                value={waitlistPhone}
                onChange={e => setWaitlistPhone(e.target.value)}
                style={{ flex: 1 }}
              />
              <button onClick={() => setJoined(true)} className="btn-primary" style={{ flexShrink: 0 }}>
                <Bell size={16} /> הצטרף
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const slaughterDate = new Date(round.slaughterDate);
  const dayName = slaughterDate.toLocaleDateString('he-IL', { weekday: 'long' });
  const dateStr = slaughterDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  const hotParts = parts
    .filter(p => {
      const pct = getPartAvailability(p);
      return pct > 0 && pct < 40;
    })
    .slice(0, 5);

  return (
    <div className="gradient-hero" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 20px 60px' }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {/* Hero Section */}
          <motion.div variants={fadeUp}>
            {/* Live badge + date row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
              <span className="live-badge">
                <span className="live-dot" />
                סבב פעיל
              </span>
              <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                שחיטה {dayName}, {dateStr}
              </span>
            </div>

            {/* Main headline */}
            <h1 className="page-title" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', marginBottom: 12, letterSpacing: '-0.02em' }}>
              {ANIMAL_EMOJI[round.animalType]} {ANIMAL_NAME[round.animalType]}
            </h1>
            <p style={{ fontSize: 17, color: '#94a3b8', marginBottom: 36, lineHeight: 1.6 }}>
              {round.butcherName} · {round.location} · {round.totalWeightKg} ק"ג כולל
            </p>
          </motion.div>

          {/* Main round card */}
          <motion.div variants={fadeUp}>
            <div className="card" style={{ marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
              {/* Decorative glow */}
              <div style={{
                position: 'absolute', top: -60, left: -60,
                width: 200, height: 200,
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Stats row */}
              <div className="stats-grid-3">
                <div className="card-inner">
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{stats.soldPercent}%</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 500 }}>נמכר</div>
                </div>
                <div className="card-inner">
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>{parts.length}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 500 }}>סוגי חלקים</div>
                </div>
                <div className="card-inner">
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#a78bfa', lineHeight: 1 }}>{stats.totalAvailable.toFixed(0)}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 500 }}>ק"ג נשאר</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 24 }}>
                <div className="summary-row">
                  <span style={{ fontSize: 13, color: '#94a3b8' }}>מלאי זמין</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700,
                    color: stats.soldPercent > 70 ? '#f97316' : '#22c55e',
                  }}>
                    {100 - stats.soldPercent}% נשאר
                  </span>
                </div>
                <div style={{
                  height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 999,
                  overflow: 'hidden', position: 'relative',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.soldPercent}%` }}
                    transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                    style={{
                      height: '100%', borderRadius: 999,
                      background: stats.soldPercent > 85
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : stats.soldPercent > 60
                        ? 'linear-gradient(90deg, #f97316, #ea580c)'
                        : 'linear-gradient(90deg, #22c55e, #16a34a)',
                      position: 'relative',
                    }}
                  >
                    {/* Shimmer effect on progress bar */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 2s ease-in-out infinite',
                    }} />
                  </motion.div>
                </div>
              </div>

              {/* Countdown */}
              <div style={{
                padding: 20, background: 'rgba(255,255,255,0.015)',
                borderRadius: 14, marginBottom: 24,
                display: 'flex', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <CountdownTimer targetDate={round.orderCloseDate} />
              </div>

              {/* Hot parts */}
              {hotParts.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                  {hotParts.map(p => {
                    const pct = getPartAvailability(p);
                    return (
                      <motion.span
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`hot-badge ${pct < 10 ? 'hot-badge-critical' : 'hot-badge-urgent'}`}
                      >
                        {p.emoji} {p.nameHe} – {(p.totalKg - p.soldKg - p.bufferKg).toFixed(1)} ק"ג
                      </motion.span>
                    );
                  })}
                </div>
              )}

              {/* CTA Button */}
              <Link to="/cow" style={{ display: 'block', textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                    borderRadius: 16, padding: '20px 28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 12px 40px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  {/* Shimmer overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: 'white', marginBottom: 2 }}>
                      בחרו את החלקים שלכם
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                      בחירה ויזואלית אינטראקטיבית על מפת הפרה
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
                    <span style={{ fontSize: 32 }}>🐄</span>
                    <ArrowLeft size={20} color="rgba(255,255,255,0.7)" />
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Trust & Benefits Section */}
          <motion.div variants={fadeUp}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9' }}>למה FreshCut?</h2>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="info-cards-grid" style={{ marginBottom: 36 }}>
              {[
                { icon: '🥩', title: 'טריות מוחלטת', desc: 'שחיטה ביום הזמנתך. לא מלאי ישן, לא הקפאה.', color: '#22c55e' },
                { icon: '🔍', title: 'שקיפות מלאה', desc: 'בחירה ויזואלית — יודעים בדיוק מאיזה חלק.', color: '#3b82f6' },
                { icon: '⚡', title: '3 קליקים להזמנה', desc: 'ללא פקקים, ללא שיחות, ללא המתנה.', color: '#f97316' },
                { icon: '💬', title: 'עדכונים חיים', desc: 'מהזמנה עד איסוף — WhatsApp בזמן אמת.', color: '#8b5cf6' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="info-card"
                >
                  <div className="info-card-icon">{item.icon}</div>
                  <div className="info-card-title">{item.title}</div>
                  <div className="info-card-desc">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Proof / Testimonials */}
          <motion.div variants={fadeUp}>
            <div style={{
              padding: 24,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: 36,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Decorative quote mark */}
              <div style={{
                position: 'absolute', top: -8, right: 16,
                fontSize: 80, color: 'rgba(139,92,246,0.06)', fontWeight: 900,
                lineHeight: 1, pointerEvents: 'none',
              }}>"</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Star size={16} color="#eab308" fill="#eab308" />
                <Star size={16} color="#eab308" fill="#eab308" />
                <Star size={16} color="#eab308" fill="#eab308" />
                <Star size={16} color="#eab308" fill="#eab308" />
                <Star size={16} color="#eab308" fill="#eab308" />
                <span style={{ fontSize: 13, color: '#64748b', marginRight: 4 }}>מתוך 47 ביקורות</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIdx}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.4 }}
                >
                  <p style={{ fontSize: 17, color: '#e2e8f0', fontWeight: 500, lineHeight: 1.7, marginBottom: 12 }}>
                    "{TESTIMONIALS[testimonialIdx].text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: 'white',
                    }}>
                      {TESTIMONIALS[testimonialIdx].name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
                        {TESTIMONIALS[testimonialIdx].name}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        {TESTIMONIALS[testimonialIdx].city}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                {TESTIMONIALS.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setTestimonialIdx(i)}
                    style={{
                      width: i === testimonialIdx ? 20 : 6,
                      height: 6,
                      borderRadius: 999,
                      background: i === testimonialIdx ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Trust indicators row */}
          <motion.div variants={fadeUp}>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap',
              padding: '20px 0', marginBottom: 20,
            }}>
              {[
                { icon: <Shield size={18} />, text: 'תשלום מאובטח', color: '#22c55e' },
                { icon: <Truck size={18} />, text: 'משלוח עד הבית', color: '#3b82f6' },
                { icon: <Clock size={18} />, text: 'ביטול עד 48 שעות', color: '#f97316' },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 13, fontWeight: 500 }}>
                  <span style={{ color: item.color, display: 'flex' }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
