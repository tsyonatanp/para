import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, ArrowLeft, Loader2, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore, UserRole } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { isLoading, loginWithPassword, loginAsCustomer } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'phone' | 'password' | 'name'>('phone');
  const [detectedRole, setDetectedRole] = useState<UserRole>('customer');
  const [loginError, setLoginError] = useState('');

  // Detect role on phone change
  const handlePhoneContinue = () => {
    const trimmed = phone.trim();
    const cleanPhone = trimmed.replace(/[-\s()]/g, '');
    if (cleanPhone.length < 9) {
      addToast({ message: 'נא להזין מספר טלפון תקין', type: 'warning', emoji: '📱' });
      return;
    }

    const { getPhoneRole, customers } = useAuthStore.getState();
    const role = getPhoneRole(trimmed);
    setDetectedRole(role);
    setLoginError('');

    if (role === 'admin' || role === 'butcher') {
      // Known user – needs password
      setStep('password');
    } else {
      // Customer – check if already registered
      const existingCustomer = customers?.find(c => c.phone === cleanPhone);
      if (existingCustomer) {
        loginAsCustomer(existingCustomer.phone, existingCustomer.name, existingCustomer.city);
        addToast({ message: `ברוך שובך, ${existingCustomer.name}! 🎉`, type: 'success' });
        onClose();
      } else {
        // New customer – needs name
        setStep('name');
      }
    }
  };

  const handlePasswordLogin = () => {
    if (password.length < 1) {
      setLoginError('נא להזין סיסמה');
      return;
    }

    const success = loginWithPassword(phone.trim(), password);
    if (success) {
      const roleName = detectedRole === 'admin' ? 'מנהל מערכת' : 'שוחט';
      addToast({ message: `ברוך הבא, ${roleName}! 🎉`, type: 'success' });
      onClose();
    } else {
      setLoginError('סיסמה שגויה');
      setPassword('');
    }
  };

  const handleCustomerLogin = () => {
    if (name.trim().length < 2) {
      addToast({ message: 'נא להזין שם מלא', type: 'warning' });
      return;
    }
    loginAsCustomer(phone.trim(), name.trim());
    addToast({ message: `ברוך הבא, ${name.trim()}! 🎉`, type: 'success' });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'phone') handlePhoneContinue();
      else if (step === 'password') handlePasswordLogin();
      else if (step === 'name') handleCustomerLogin();
    }
  };

  const getRoleLabel = () => {
    if (detectedRole === 'admin') return '🔑 מנהל מערכת';
    if (detectedRole === 'butcher') {
      const butcher = useAuthStore.getState().findButcher(phone.trim());
      return `🔪 שוחט${butcher?.name ? ` – ${butcher.name}` : ''}`;
    }
    return '👤 לקוח';
  };

  const getRoleColor = () => {
    if (detectedRole === 'admin') return '#f97316';
    if (detectedRole === 'butcher') return '#22c55e';
    return '#8b5cf6';
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
          onKeyDown={handleKeyDown}
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
                  onClick={() => { setStep('phone'); setLoginError(''); setPassword(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    cursor: 'pointer', display: 'flex', padding: 4,
                  }}
                ><ArrowLeft size={18} /></button>
              )}
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                {step === 'phone' ? '🔐 התחברות' : step === 'password' ? '🔑 הזדהות' : '👤 מי אתם?'}
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
                הזינו את מספר הטלפון שלכם כדי להתחבר.
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
                onClick={handlePhoneContinue}
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
                <Shield size={18} />
                המשך
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ fontSize: 11, color: '#4b5563' }}>ללא סיסמא, רק טלפון</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
            </motion.div>
          )}

          {/* Step: Password (admin/butcher) */}
          {step === 'password' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              {/* Role badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 12,
                background: `${getRoleColor()}15`,
                border: `1px solid ${getRoleColor()}30`,
              }}>
                <span style={{ fontSize: 13, color: getRoleColor(), fontWeight: 700 }}>
                  {getRoleLabel()}
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                הזינו את הסיסמה כדי להתחבר.
              </p>

              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  <Lock size={14} style={{ display: 'inline', marginLeft: 4 }} /> סיסמה
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                    style={{
                      textAlign: 'right', fontSize: 18, fontWeight: 600,
                      paddingLeft: 44,
                      borderColor: loginError ? '#ef4444' : undefined,
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    style={{
                      position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#6b7280',
                      cursor: 'pointer', display: 'flex', padding: 2,
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: '#ef4444', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)',
                  }}
                >
                  ❌ {loginError}
                </motion.div>
              )}

              <button
                onClick={handlePasswordLogin}
                style={{
                  width: '100%', padding: '14px',
                  background: `linear-gradient(135deg, ${getRoleColor()}, ${getRoleColor()}cc)`,
                  border: 'none', borderRadius: 12,
                  color: 'white', fontWeight: 700, fontSize: 16,
                  cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: `0 4px 20px ${getRoleColor()}50`,
                }}
              >
                <Lock size={18} />
                התחבר
              </button>
            </motion.div>
          )}

          {/* Step: Name (customer) */}
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
                onClick={handleCustomerLogin}
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
