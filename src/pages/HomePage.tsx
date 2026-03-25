import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Bell } from 'lucide-react';
import { useRoundStore } from '../stores/roundStore';
import { getRoundStats, getPartAvailability } from '../data/mockData';
import CountdownTimer from '../components/CountdownTimer';

const ANIMAL_EMOJI: Record<string, string> = {
  cow: '🐄', calf: '🐂', lamb: '🐑', chicken: '🐓',
};

const ANIMAL_NAME: Record<string, string> = {
  cow: 'פרת אנגוס', calf: 'עגל', lamb: 'כבש', chicken: 'עוף',
};

const RECENT_ACTIVITY = [
  { name: 'יוסי כ.', part: 'אנטריקוט', kg: 1.5, ago: '5 דקות' },
  { name: 'שרה מ.', part: 'צלעות', kg: 2.0, ago: '12 דקות' },
  { name: 'אחמד ה.', part: 'טחון', kg: 3.0, ago: '28 דקות' },
];

const HomePage: React.FC = () => {
  const { round, parts } = useRoundStore();
  const [waitlistPhone, setWaitlistPhone] = useState('');
  const [joined, setJoined] = useState(false);
  const [activityIdx, setActivityIdx] = useState(0);

  const stats = getRoundStats(parts);

  useEffect(() => {
    const id = setInterval(() => {
      setActivityIdx(i => (i + 1) % RECENT_ACTIVITY.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  if (!round || round.status !== 'open') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📭</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>אין סבב פעיל כרגע</h1>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>הצטרפו לרשימת ההמתנה – נעדכן אתכם ברגע שהסבב הבא נפתח.</p>
          {joined ? (
            <div style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>✅ נרשמתם! נחזור אליכם בקרוב.</div>
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
        </div>
      </div>
    );
  }

  const slaughterDate = new Date(round.slaughterDate);
  const dayName = slaughterDate.toLocaleDateString('he-IL', { weekday: 'long' });
  const dateStr = slaughterDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  return (
    <div className="gradient-hero" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Live badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span className="live-badge">
              <span className="live-dot" />
              סבב פעיל
            </span>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>שחיטה {dayName}, {dateStr}</span>
          </div>

          <h1 className="page-title" style={{ fontSize: '2.8rem', marginBottom: 8 }}>
            {ANIMAL_EMOJI[round.animalType]} {ANIMAL_NAME[round.animalType]}
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 32 }}>
            {round.butcherName} · {round.location} · {round.totalWeightKg} ק"ג כולל
          </p>

          {/* Main round card */}
          <div className="card" style={{ marginBottom: 24 }}>
            {/* Stats row */}
            <div className="stats-grid-3">
              <div className="card-inner">
                <div style={{ fontSize: 28, fontWeight: 900, color: '#22c55e' }}>{stats.soldPercent}%</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>נמכר</div>
              </div>
              <div className="card-inner">
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9' }}>23</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>הזמנות</div>
              </div>
              <div className="card-inner">
                <div style={{ fontSize: 28, fontWeight: 900, color: '#c4b5fd' }}>{stats.totalAvailable.toFixed(0)}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>ק"ג נשאר</div>
              </div>
            </div>

            {/* Big progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div className="summary-row">
                <span style={{ fontSize: 13, color: '#94a3b8' }}>מלאי זמין</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: stats.soldPercent > 70 ? '#f97316' : '#22c55e' }}>
                  {100 - stats.soldPercent}% נשאר
                </span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.soldPercent}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 999,
                    background: stats.soldPercent > 85
                      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                      : stats.soldPercent > 60
                      ? 'linear-gradient(90deg, #f97316, #ea580c)'
                      : 'linear-gradient(90deg, #22c55e, #16a34a)',
                  }}
                />
              </div>
            </div>

            {/* Countdown */}
            <div style={{
              padding: 16, background: 'rgba(255,255,255,0.02)',
              borderRadius: 12, marginBottom: 20,
              display: 'flex', justifyContent: 'center',
            }}>
              <CountdownTimer targetDate={round.orderCloseDate} />
            </div>

            {/* Recent activity ticker */}
            <div className="activity-ticker" style={{ marginBottom: 20 }}>
              <span>🔥</span>
              <motion.span
                key={activityIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {RECENT_ACTIVITY[activityIdx].name} הזמין {RECENT_ACTIVITY[activityIdx].kg} ק״ג {RECENT_ACTIVITY[activityIdx].part} לפני {RECENT_ACTIVITY[activityIdx].ago}
              </motion.span>
            </div>

            {/* Hot parts quick view */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {parts
                .filter(p => {
                  const pct = getPartAvailability(p);
                  return pct > 0 && pct < 40;
                })
                .slice(0, 4)
                .map(p => {
                  const pct = getPartAvailability(p);
                  return (
                    <span
                      key={p.id}
                      className={`hot-badge ${pct < 10 ? 'hot-badge-critical' : 'hot-badge-urgent'}`}
                    >
                      {p.emoji} {p.nameHe} – {(p.totalKg - p.soldKg - p.bufferKg).toFixed(1)} ק"ג נשאר
                    </span>
                  );
                })}
            </div>

            {/* CTA */}
            <Link to="/cow" style={{ display: 'block', textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  borderRadius: 14, padding: '18px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 8px 32px rgba(139,92,246,0.35)',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>בחר את החלקים שלך</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>לחץ לבחירה ויזואלית על הפרה</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 28 }}>🐄</span>
                  <ChevronLeft size={20} color="rgba(255,255,255,0.7)" />
                </div>
              </motion.div>
            </Link>
          </div>

          {/* Info cards */}
          <div className="info-cards-grid">
            {[
              { icon: '✅', title: 'בשר טרי', desc: 'שחיטה ביום הזמנתך, לא מלאי ישן' },
              { icon: '🔍', title: 'שקיפות מלאה', desc: 'יודע בדיוק מאיזה חלק הוזמן' },
              { icon: '💬', title: 'עדכונים ב-WhatsApp', desc: 'מהזמנה עד איסוף' },
              { icon: '⚡', title: 'הזמנה ב-3 קליקים', desc: 'ללא פקקים, ללא שיחות' },
            ].map(item => (
              <div key={item.title} className="info-card">
                <div className="info-card-icon">{item.icon}</div>
                <div className="info-card-title">{item.title}</div>
                <div className="info-card-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
