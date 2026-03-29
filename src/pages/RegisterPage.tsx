import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, MapPin, ArrowLeft, Check, ShoppingCart, Bell, Clock, Shield, Sparkles, ChevronLeft, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

const FLOATING_ITEMS = ['🥩', '🔪', '🐄', '🥓', '🍖', '✨', '🥩', '🐂', '🍗', '🥩'];

const FloatingEmoji = ({ emoji, delay }: { emoji: string; delay: number }) => {
  const left = Math.random() * 100;
  const duration = 12 + Math.random() * 8;
  const size = 16 + Math.random() * 20;

  return (
    <motion.div
      initial={{ y: '110vh', x: `${left}vw`, opacity: 0 }}
      animate={{
        y: '-10vh',
        opacity: [0, 0.3, 0.3, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        position: 'fixed',
        fontSize: size,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {emoji}
    </motion.div>
  );
};

const BENEFITS = [
  {
    icon: <ShoppingCart size={24} />,
    title: 'הזמנה מהירה',
    desc: 'הזמינו בשר טרי ב-3 קליקים, ישר מהפרה',
    color: '#8b5cf6',
  },
  {
    icon: <Clock size={24} />,
    title: 'מעקב בזמן אמת',
    desc: 'תדעו בדיוק מה הסטטוס של ההזמנה שלכם',
    color: '#22c55e',
  },
  {
    icon: <Bell size={24} />,
    title: 'עדכוני WhatsApp',
    desc: 'קבלו התראות ישירות לווטסאפ על סבבי שחיטה חדשים',
    color: '#3b82f6',
  },
  {
    icon: <Shield size={24} />,
    title: 'שקיפות מלאה',
    desc: 'ראו בדיוק מאיזה חלק מגיע הבשר שלכם',
    color: '#f97316',
  },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, registerCustomer, getPhoneRole, findCustomer } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [step, setStep] = useState(0); // 0=intro, 1=phone, 2=details, 3=success
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate('/');
  }, []);

  const handlePhoneNext = () => {
    const cleaned = phone.replace(/[-\s()]/g, '');
    if (cleaned.length < 9) {
      setPhoneError('מספר טלפון לא תקין');
      return;
    }

    const role = getPhoneRole(cleaned);
    if (role !== 'customer') {
      setPhoneError('מספר זה רשום כשוחט/מנהל – השתמש בדף ההתחברות');
      return;
    }

    const existing = findCustomer(cleaned);
    if (existing && existing.password) {
      setPhoneError('מספר כבר רשום — השתמש בדף ההתחברות');
      return;
    }

    setPhoneError('');
    setStep(2);
  };

  const handleRegister = async () => {
    if (name.trim().length < 2) {
      addToast({ message: 'נא להזין שם מלא', type: 'warning' });
      return;
    }
    if (password.length < 4) {
      addToast({ message: 'סיסמה חייבת להכיל לפחות 4 תווים', type: 'warning', emoji: '🔑' });
      return;
    }

    const result = await registerCustomer(phone.trim(), name.trim(), password, city.trim());
    if (result.success) {
      setStep(3);
    } else {
      addToast({ message: result.reason || 'שגיאה ברישום', type: 'warning' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 1) handlePhoneNext();
      if (step === 2) handleRegister();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a0f 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating background emojis */}
      {FLOATING_ITEMS.map((emoji, i) => (
        <FloatingEmoji key={i} emoji={emoji} delay={i * 1.5} />
      ))}

      {/* Gradient orbs */}
      <div style={{
        position: 'fixed', top: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 480, margin: '0 auto',
        padding: '40px 20px 80px',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Back button */}
        {step > 0 && step < 3 && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setStep(step - 1)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '8px 14px',
              color: '#94a3b8', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontFamily: 'Heebo, sans-serif',
              alignSelf: 'flex-start', marginBottom: 24,
            }}
          >
            <ArrowLeft size={14} />
            חזור
          </motion.button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: Intro/Welcome */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{ textAlign: 'center', marginBottom: 32 }}
              >
                <div style={{ fontSize: 64, marginBottom: 8 }}>🥩</div>
                <h1 style={{
                  fontSize: 36, fontWeight: 900, margin: 0,
                  background: 'linear-gradient(135deg, #f1f5f9, #c4b5fd)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  FreshCut
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 16, marginTop: 8, lineHeight: 1.6 }}>
                  בשר טרי לפי הזמנה – ישר מהמשחטה 🐄
                </p>
              </motion.div>

              {/* Benefits grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 12, marginBottom: 32,
              }}>
                {BENEFITS.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 16, padding: '16px 14px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${b.color}15`, color: b.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 10px',
                    }}>
                      {b.icon}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
                      {b.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>
                      {b.desc}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  style={{
                    width: '100%', padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: 'none', borderRadius: 14,
                    color: 'white', fontWeight: 800, fontSize: 18,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '50%', height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    }}
                  />
                  <Sparkles size={20} />
                  הירשמו עכשיו – בחינם!
                </motion.button>

                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: 'none', border: 'none',
                    color: '#6b7280', cursor: 'pointer',
                    fontSize: 14, padding: '8px',
                    fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  כבר יש לי חשבון? <span style={{ color: '#c4b5fd', fontWeight: 600 }}>התחברות</span>
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* STEP 1: Phone */}
          {step === 1 && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))',
                  border: '2px solid rgba(139,92,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', fontSize: 36,
                }}
              >
                📱
              </motion.div>

              <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px 0' }}>
                מספר הטלפון שלכם
              </h2>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, margin: '0 0 32px 0' }}>
                נשתמש בו כדי לזהות ולשמור את ההזמנות שלכם
              </p>

              <div style={{
                background: '#16161f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: 24,
              }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} /> מספר טלפון
                </label>
                <input
                  className="input-field"
                  type="tel"
                  dir="ltr"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                  style={{
                    textAlign: 'right', fontSize: 22, fontWeight: 700,
                    letterSpacing: 2, marginBottom: 16,
                    borderColor: phoneError ? '#ef4444' : undefined,
                  }}
                  autoFocus
                />

                {phoneError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: '#ef4444', fontSize: 13, margin: '0 0 12px 0',
                      background: 'rgba(239,68,68,0.1)',
                      padding: '8px 12px', borderRadius: 8,
                    }}
                  >
                    ❌ {phoneError}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePhoneNext}
                  style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: 'none', borderRadius: 12,
                    color: 'white', fontWeight: 700, fontSize: 16,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
                  }}
                >
                  המשך
                  <ChevronLeft size={18} />
                </motion.button>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    width: s === 1 ? 24 : 8, height: 8, borderRadius: 4,
                    background: s === 1 ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  width: 80, height: 80, borderRadius: 24,
                  background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
                  border: '2px solid rgba(34,197,94,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px', fontSize: 36,
                }}
              >
                👤
              </motion.div>

              <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, color: '#f1f5f9', margin: '0 0 8px 0' }}>
                ספרו לנו קצת על עצמכם
              </h2>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, margin: '0 0 32px 0' }}>
                כדי שנוכל להתאים לכם את החוויה
              </p>

              <div style={{
                background: '#16161f',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: 24,
              }}>
                {/* Phone display */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  marginBottom: 16,
                }}>
                  <Phone size={14} color="#8b5cf6" />
                  <span style={{ color: '#c4b5fd', fontSize: 14, fontWeight: 600, direction: 'ltr' }}>
                    {phone}
                  </span>
                  <Check size={14} color="#22c55e" style={{ marginRight: 'auto' }} />
                </div>

                {/* Name */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> שם מלא *
                  </label>
                  <input
                    className="input-field"
                    placeholder="איך קוראים לכם?"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    style={{ fontSize: 16, fontWeight: 600 }}
                  />
                </div>

                {/* Password */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} /> בחרו סיסמה *
                  </label>
                  <input
                    className="input-field"
                    type="password"
                    dir="ltr"
                    placeholder="4 תווים לפחות"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ fontSize: 16, fontWeight: 600, textAlign: 'right' }}
                  />
                </div>

                {/* City (optional) */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} /> עיר / ישוב <span style={{ fontSize: 11, color: '#4b5563' }}>(אופציונלי)</span>
                  </label>
                  <input
                    className="input-field"
                    placeholder="לדוגמה: רחובות"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={{ fontSize: 16 }}
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRegister}
                  style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none', borderRadius: 12,
                    color: 'white', fontWeight: 700, fontSize: 16,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 20px rgba(34,197,94,0.3)',
                  }}
                >
                  📋 שלח לאישור
                </motion.button>

                <div style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: 10, padding: '10px 12px', marginTop: 12,
                  fontSize: 12, color: '#fbbf24', lineHeight: 1.6,
                }}>
                  ⏳ לאחר ההרשמה, המנהל יאשר את החשבון. תוכלו להתחבר רק אחרי האישור.
                </div>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    width: s === 2 ? 24 : 8, height: 8, borderRadius: 4,
                    background: s === 2 ? '#22c55e' : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s',
                  }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
            >
              {/* Confetti-like check */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                style={{
                  width: 100, height: 100, borderRadius: 30,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
                  border: '3px solid rgba(251,191,36,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24, position: 'relative',
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <Clock size={48} color="#fbbf24" strokeWidth={3} />
                </motion.div>

                {/* Floating particles */}
                {['🎉', '✨', '🥩', '🎊', '⭐'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                      x: [0, (i % 2 === 0 ? 1 : -1) * (40 + i * 15)],
                      y: [0, -(30 + i * 12)],
                    }}
                    transition={{ delay: 0.6 + i * 0.15, duration: 1.2 }}
                    style={{ position: 'absolute', fontSize: 20 }}
                  >
                    {emoji}
                  </motion.span>
                ))}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px 0' }}
              >
                ההרשמה נשלחה! ⏳
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ color: '#94a3b8', fontSize: 16, margin: '0 0 32px 0', maxWidth: 280 }}
              >
                המנהל יבדוק את הבקשה ויאשר. תוכלו להתחבר לאחר האישור.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%', padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    border: 'none', borderRadius: 14,
                    color: 'white', fontWeight: 800, fontSize: 17,
                    cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
                  }}
                >
                  🏠 חזרה לדף הבית
                </motion.button>

                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '14px',
                    color: '#94a3b8', cursor: 'pointer',
                    fontSize: 14, fontWeight: 600,
                    fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  חזור לדף הבית
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RegisterPage;
