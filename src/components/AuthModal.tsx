import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, User, ArrowLeft, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore, UserRole } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';

interface AuthModalProps {
  onClose: () => void;
}

type Step = 'phone' | 'password' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { isLoading, loginWithPassword, registerCustomer } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setNameInput] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>('phone');
  const [detectedRole, setDetectedRole] = useState<UserRole>('customer');
  const [loginError, setLoginError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const handlePhoneContinue = () => {
    const trimmed = phone.trim();
    const cleanPhone = trimmed.replace(/[-\s()]/g, '');
    if (cleanPhone.length < 9) {
      addToast({ message: 'נא להזין מספר טלפון תקין', type: 'warning', emoji: '📱' });
      return;
    }

    const { getPhoneRole, findCustomer } = useAuthStore.getState();
    const role = getPhoneRole(trimmed);
    setDetectedRole(role);
    setLoginError('');

    if (role === 'admin' || role === 'butcher') {
      setIsNewUser(false);
      setStep('password');
    } else {
      const customer = findCustomer(trimmed);
      if (customer) {
        // Existing customer → needs password
        setIsNewUser(false);
        setStep('password');
      } else {
        // New customer → register
        setIsNewUser(true);
        setStep('register');
      }
    }
  };

  const handlePasswordLogin = () => {
    if (password.length < 1) {
      setLoginError('נא להזין סיסמה');
      return;
    }

    const result = loginWithPassword(phone.trim(), password);
    if (result.success) {
      const user = useAuthStore.getState().user;
      addToast({ message: `ברוך הבא, ${user?.name || ''}! 🎉`, type: 'success' });
      onClose();
    } else {
      setLoginError(result.reason || 'שגיאת התחברות');
      setPassword('');
    }
  };

  const handleRegister = () => {
    if (name.trim().length < 2) {
      addToast({ message: 'נא להזין שם מלא', type: 'warning' });
      return;
    }
    if (regPassword.length < 4) {
      setLoginError('סיסמה חייבת להכיל לפחות 4 תווים');
      return;
    }

    const result = registerCustomer(phone.trim(), name.trim(), regPassword);
    if (result.success) {
      addToast({ message: 'ההרשמה נשלחה! ממתין לאישור מנהל ⏳', type: 'info', emoji: '📋' });
      onClose();
    } else {
      setLoginError(result.reason || 'שגיאה ברישום');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'phone') handlePhoneContinue();
      else if (step === 'password') handlePasswordLogin();
      else if (step === 'register') handleRegister();
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
                  onClick={() => { setStep('phone'); setLoginError(''); setPassword(''); setRegPassword(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#94a3b8',
                    cursor: 'pointer', display: 'flex', padding: 4,
                  }}
                ><ArrowLeft size={18} /></button>
              )}
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                {step === 'phone' ? '🔐 התחברות' : step === 'password' ? '🔑 הזדהות' : '📝 הרשמה'}
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
                הזינו את מספר הטלפון שלכם כדי להתחבר או להירשם.
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
            </motion.div>
          )}

          {/* Step: Password (all roles) */}
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

          {/* Step: Register (new customer) */}
          {step === 'register' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                לקוח חדש? מלאו את הפרטים וממתינים לאישור.
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

              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' }}>
                  <Lock size={14} style={{ display: 'inline', marginLeft: 4 }} /> בחרו סיסמה (4+ תווים)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    placeholder="סיסמה"
                    value={regPassword}
                    onChange={e => { setRegPassword(e.target.value); setLoginError(''); }}
                    style={{
                      textAlign: 'right', fontSize: 16, fontWeight: 600, paddingLeft: 44,
                      borderColor: loginError ? '#ef4444' : undefined,
                    }}
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
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: '#ef4444', fontSize: 13, fontWeight: 600,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.1)',
                  }}
                >
                  ❌ {loginError}
                </motion.div>
              )}

              <button
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
              </button>

              <div style={{
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 10, padding: '10px 12px',
                fontSize: 12, color: '#fbbf24', lineHeight: 1.6,
              }}>
                ⏳ לאחר ההרשמה, המנהל יאשר את החשבון שלכם. תוכלו להתחבר רק אחרי האישור.
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
