import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { otpSent, isLoading, mockLogin, sendOtp, verifyOtp, setName } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [phone, setPhone] = useState('');
  const [name, setNameInput] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');

  const handleSendOtp = async () => {
    if (phone.trim().length < 9) {
      addToast({ message: 'נא להזין מספר טלפון תקין', type: 'warning', emoji: '📱' });
      return;
    }
    const success = await sendOtp(phone.trim());
    if (success) {
      setStep('otp');
      addToast({ message: 'קוד אימות נשלח ל-' + phone, type: 'success', emoji: '📨' });
    } else {
      addToast({ message: 'שגיאה בשליחת קוד, נסה שוב', type: 'error' });
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      addToast({ message: 'נא להזין קוד אימות בן 4 ספרות', type: 'warning' });
      return;
    }
    const success = await verifyOtp(phone.trim(), otp);
    if (success) {
      setStep('name');
    } else {
      addToast({ message: 'קוד שגוי, נסה שוב', type: 'error', emoji: '❌' });
    }
  };

  const handleSetName = () => {
    if (name.trim().length < 2) {
      addToast({ message: 'נא להזין שם מלא', type: 'warning' });
      return;
    }
    setName(name.trim());
    mockLogin(phone.trim(), name.trim());
    addToast({ message: `ברוך הבא, ${name.trim()}! 🎉`, type: 'success' });
    onClose();
  };

  // Quick mock login (skip OTP)
  const handleQuickLogin = () => {
    if (phone.trim().length < 9) {
      addToast({ message: 'נא להזין מספר טלפון', type: 'warning', emoji: '📱' });
      return;
    }
    setStep('name');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#16161f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '32px 28px',
            width: '100%',
            maxWidth: 380,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {step !== 'phone' && (
                <button
                  onClick={() => setStep(step === 'name' ? 'phone' : 'phone')}
                  style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    cursor: 'pointer', display: 'flex', padding: 4,
                  }}
                ><ArrowLeft size={18} /></button>
              )}
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                {step === 'phone' ? '🔐 התחברות' : step === 'otp' ? '📨 קוד אימות' : '👤 מי אתם?'}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none',
                borderRadius: 8, padding: 6, cursor: 'pointer',
                color: '#6b7280', display: 'flex',
              }}
            ><X size={16} /></button>
          </div>

          {/* Step: Phone */}
          {step === 'phone' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                הזינו את מספר הטלפון שלכם כדי לצפות בהזמנות קודמות ולהזמין מהר יותר.
              </p>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  <Phone size={14} style={{ display: 'inline', marginLeft: 4 }} /> מספר טלפון
                </label>
                <input
                  className="input-field"
                  type="tel"
                  dir="ltr"
                  placeholder="050-1234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ textAlign: 'right', fontSize: 18, fontWeight: 600, letterSpacing: 1 }}
                  autoFocus
                />
              </div>
              <button
                onClick={handleQuickLogin}
                disabled={isLoading}
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
                {isLoading ? <Loader2 size={18} className="spin" /> : <Shield size={18} />}
                {isLoading ? 'שולח...' : 'המשך'}
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 11, color: '#4b5563' }}>ללא סיסמא, רק טלפון</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </motion.div>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                שלחנו קוד אימות ל-<strong style={{ color: '#c4b5fd' }}>{phone}</strong>
              </p>
              <input
                className="input-field"
                type="text"
                dir="ltr"
                placeholder="1234"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={{ textAlign: 'center', fontSize: 28, fontWeight: 800, letterSpacing: 8 }}
                autoFocus
                maxLength={6}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                style={{
                  width: '100%', padding: '14px',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  border: 'none', borderRadius: 12,
                  color: 'white', fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isLoading ? 'מאמת...' : 'אימות קוד'}
              </button>
            </motion.div>
          )}

          {/* Step: Name */}
          {step === 'name' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                עוד צעד אחד! איך קוראים לכם?
              </p>
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  <User size={14} style={{ display: 'inline', marginLeft: 4 }} /> שם מלא
                </label>
                <input
                  className="input-field"
                  placeholder="ישראל ישראלי"
                  value={name}
                  onChange={e => setNameInput(e.target.value)}
                  autoFocus
                  style={{ fontSize: 16, fontWeight: 600 }}
                />
              </div>
              <button
                onClick={handleSetName}
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
                🎉 בואו נתחיל!
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
