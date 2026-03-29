import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserPlus, Trash2, Phone, ArrowRight, Users, Lock, Eye, EyeOff, Copy, Check, MapPin, Calendar, CheckCircle, XCircle, RefreshCw, Ban, Search, UserX } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import type { CustomerEntry } from '../stores/authStore';

const AdminPage: React.FC = () => {
  const isAdmin = useAuthStore(s => s.isAdmin());
  const butchers = useAuthStore(s => s.butchers);
  const customers = useAuthStore(s => s.customers || []);
  const addButcher = useAuthStore(s => s.addButcher);
  const removeButcher = useAuthStore(s => s.removeButcher);
  const approveCustomer = useAuthStore(s => s.approveCustomer);
  const rejectCustomer = useAuthStore(s => s.rejectCustomer);
  const deleteCustomer = useAuthStore(s => s.deleteCustomer);
  const blockCustomer = useAuthStore(s => s.blockCustomer);
  const resetCustomerPassword = useAuthStore(s => s.resetCustomerPassword);
  const addToast = useToastStore(s => s.addToast);

  const pendingCustomers = customers.filter(c => c.status === 'pending');
  const approvedCustomers = customers.filter(c => c.status === 'approved');
  const blockedCustomers = customers.filter(c => c.status === 'rejected');

  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [customerSearch, setCustomerSearch] = useState('');

  // Only admin can access
  if (!isAdmin) return <Navigate to="/" replace />;

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewPassword(pass);
    setShowNewPassword(true);
  };

  const handleAdd = () => {
    const phone = newPhone.replace(/[-\s()]/g, '');
    if (phone.length < 9) {
      addToast({ message: 'מספר טלפון לא תקין', type: 'warning', emoji: '📱' });
      return;
    }
    if (!newName.trim()) {
      addToast({ message: 'נא להזין שם השוחט', type: 'warning' });
      return;
    }
    if (newPassword.length < 4) {
      addToast({ message: 'סיסמה חייבת להכיל 4 תווים לפחות', type: 'warning', emoji: '🔑' });
      return;
    }
    if (butchers.some(b => b.phone === phone)) {
      addToast({ message: 'השוחט כבר קיים במערכת', type: 'warning' });
      return;
    }
    addButcher(phone, newName.trim(), newPassword);
    addToast({ message: `✅ שוחט ${newName.trim()} נוסף בהצלחה!`, type: 'success' });
    setNewPhone('');
    setNewName('');
    setNewPassword('');
    setShowNewPassword(false);
  };

  const handleRemove = (phone: string, name: string) => {
    removeButcher(phone);
    addToast({ message: `❌ שוחט ${name} הוסר`, type: 'info' });
  };

  const handleCopyCredentials = (phone: string, password: string, name: string) => {
    const text = `🔪 FreshCut – פרטי כניסה\n\nשם: ${name}\nטלפון: ${phone}\nסיסמא: ${password}\n\nכניסה: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedPhone(phone);
    addToast({ message: '📋 פרטי הכניסה הועתקו', type: 'success' });
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', padding: '24px 16px 80px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: '#94a3b8', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            ← חזור
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: 0 }}>
                ניהול מערכת
              </h1>
              <p style={{ fontSize: 13, color: '#f97316', margin: 0, fontWeight: 600 }}>
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Add new butcher */}
        <div style={{
          background: '#16161f',
          border: '1px solid rgba(249,115,22,0.15)',
          borderRadius: 16, padding: 20,
          marginBottom: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserPlus size={18} color="#f97316" />
            הוסף שוחט חדש
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Phone */}
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                <Phone size={12} style={{ display: 'inline', marginLeft: 4 }} /> מספר טלפון
              </label>
              <input
                className="input-field"
                type="tel"
                dir="ltr"
                placeholder="050-1234567"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1 }}
              />
            </div>

            {/* Name */}
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                👤 שם השוחט
              </label>
              <input
                className="input-field"
                placeholder="שם מלא"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ fontSize: 16 }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span><Lock size={12} style={{ display: 'inline', marginLeft: 4 }} /> סיסמה</span>
                <button
                  onClick={generatePassword}
                  type="button"
                  style={{
                    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: 6, padding: '2px 8px',
                    color: '#c4b5fd', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  🎲 סיסמה אקראית
                </button>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showNewPassword ? 'text' : 'password'}
                  dir="ltr"
                  placeholder="סיסמה לשוחט"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ fontSize: 16, fontWeight: 600, paddingLeft: 44 }}
                />
                <button
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  type="button"
                  style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#6b7280',
                    cursor: 'pointer', display: 'flex', padding: 2,
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                border: 'none', borderRadius: 12,
                color: 'white', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
              }}
            >
              <UserPlus size={18} />
              הוסף שוחט
            </motion.button>
          </div>
        </div>

        {/* Butcher list */}
        <div style={{
          background: '#16161f',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="#22c55e" />
            שוחטים מורשים
            <span style={{
              background: 'rgba(34,197,94,0.15)', color: '#86efac',
              padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800,
            }}>
              {butchers.length}
            </span>
          </h3>

          {butchers.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              color: '#4b5563', fontSize: 14,
            }}>
              <Users size={36} color="#374151" style={{ marginBottom: 8 }} />
              <p>אין שוחטים במערכת עדיין</p>
              <p style={{ fontSize: 12 }}>הוסף שוחטים למעלה כדי שיוכלו לנהל סבבים</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {butchers.map((butcher, idx) => (
                  <motion.div
                    key={butcher.phone}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      padding: '14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(34,197,94,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                      }}>
                        🔪
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                          {butcher.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>
                          📱 {butcher.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopyCredentials(butcher.phone, butcher.password, butcher.name)}
                          title="העתק פרטי כניסה"
                          style={{
                            background: 'rgba(139,92,246,0.1)',
                            border: '1px solid rgba(139,92,246,0.2)',
                            borderRadius: 8, padding: '6px 8px',
                            color: '#c4b5fd', cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          {copiedPhone === butcher.phone ? <Check size={14} /> : <Copy size={14} />}
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(butcher.phone, butcher.name)}
                          title="הסר שוחט"
                          style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, padding: '6px 8px',
                            color: '#ef4444', cursor: 'pointer',
                            display: 'flex',
                          }}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Password row */}
                    <div style={{
                      marginTop: 8, paddingTop: 8,
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Lock size={12} color="#6b7280" />
                      <span style={{ fontSize: 12, color: '#6b7280' }}>סיסמה:</span>
                      <span style={{
                        fontSize: 13, color: '#94a3b8', fontWeight: 600,
                        fontFamily: 'monospace', direction: 'ltr',
                      }}>
                        {showPasswords[butcher.phone] ? butcher.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPasswords(prev => ({ ...prev, [butcher.phone]: !prev[butcher.phone] }))}
                        style={{
                          background: 'none', border: 'none', color: '#6b7280',
                          cursor: 'pointer', display: 'flex', padding: 2,
                        }}
                      >
                        {showPasswords[butcher.phone] ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pending approval - always visible */}
        <div style={{
          background: '#16161f',
          border: `1px solid ${pendingCustomers.length > 0 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 16, padding: 20,
          marginTop: 20,
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
            ⏳ ממתינים לאישור
            <span style={{
              background: pendingCustomers.length > 0 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
              color: pendingCustomers.length > 0 ? '#fbbf24' : '#6b7280',
              padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800,
            }}>
              {pendingCustomers.length}
            </span>
          </h3>

          {pendingCustomers.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '24px 16px',
              color: '#4b5563', fontSize: 14,
            }}>
              <CheckCircle size={32} color="#374151" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0 }}>אין בקשות חדשות</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingCustomers.map((customer) => (
                <motion.div
                  key={customer.phone}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    background: 'rgba(251,191,36,0.05)',
                    border: '1px solid rgba(251,191,36,0.15)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(251,191,36,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>
                      ⏳
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{customer.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 12, marginTop: 2 }}>
                        <span style={{ direction: 'ltr' }}>📱 {customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</span>
                        {customer.city && <span><MapPin size={10} style={{ display: 'inline' }} /> {customer.city}</span>}
                        <span><Calendar size={10} style={{ display: 'inline' }} /> {new Date(customer.registeredAt).toLocaleDateString('he-IL')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { approveCustomer(customer.phone); addToast({ message: `${customer.name} אושר!`, type: 'success' }); }}
                        style={{
                          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
                          borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                          color: '#22c55e', fontFamily: 'Heebo, sans-serif', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        <CheckCircle size={14} /> אשר
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { rejectCustomer(customer.phone); addToast({ message: `${customer.name} נדחה`, type: 'info' }); }}
                        title="דחה ומחק"
                        style={{
                          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                          color: '#ef4444', display: 'flex',
                        }}
                      >
                        <XCircle size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Approved customers */}
        <div style={{
          background: '#16161f',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 20,
          marginTop: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="#8b5cf6" />
              לקוחות מאושרים
              <span style={{
                background: 'rgba(139,92,246,0.15)', color: '#c4b5fd',
                padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800,
              }}>
                {approvedCustomers.length}
              </span>
            </h3>
          </div>

          {/* Search */}
          {approvedCustomers.length > 2 && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={14} color="#6b7280" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-field"
                placeholder="חיפוש לפי שם או טלפון..."
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                style={{ fontSize: 13, paddingRight: 36 }}
              />
            </div>
          )}

          {approvedCustomers.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '32px 16px',
              color: '#4b5563', fontSize: 14,
            }}>
              <Users size={36} color="#374151" style={{ marginBottom: 8 }} />
              <p>אין לקוחות מאושרים עדיין</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {[...approvedCustomers]
                  .filter(c => {
                    if (!customerSearch.trim()) return true;
                    const q = customerSearch.trim().toLowerCase();
                    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
                  })
                  .sort((a,b) => b.registeredAt - a.registeredAt)
                  .map((customer, idx) => (
                  <motion.div
                    key={customer.phone}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      padding: '14px',
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'rgba(139,92,246,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, color: '#c4b5fd', flexShrink: 0,
                      }}>
                        👤
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {customer.name}
                          {customer.city && (
                            <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <MapPin size={10} /> {customer.city}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 12, marginTop: 4 }}>
                           <span style={{ direction: 'ltr' }}>📱 {customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={10} /> {new Date(customer.registeredAt).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const newPass = resetCustomerPassword(customer.phone);
                            const text = `🔑 סיסמה חדשה ל-FreshCut\n\nשם: ${customer.name}\nטלפון: ${customer.phone}\nסיסמה חדשה: ${newPass}\n\nכניסה: ${window.location.origin}`;
                            navigator.clipboard.writeText(text);
                            addToast({ message: `סיסמה חדשה הועתקה: ${newPass}`, type: 'success' });
                          }}
                          title="אפס סיסמה והעתק"
                          style={{
                            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                            color: '#fbbf24', fontFamily: 'Heebo, sans-serif', fontSize: 11, fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          <RefreshCw size={12} /> איפוס
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { blockCustomer(customer.phone); addToast({ message: `${customer.name} נחסם`, type: 'warning' }); }}
                          title="חסום לקוח"
                          style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                            color: '#ef4444', display: 'flex',
                          }}
                        >
                          <Ban size={14} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Blocked customers */}
        {blockedCustomers.length > 0 && (
          <div style={{
            background: '#16161f',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 16, padding: 20,
            marginTop: 20,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ban size={18} color="#ef4444" />
              לקוחות חסומים
              <span style={{
                background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 800,
              }}>
                {blockedCustomers.length}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {blockedCustomers.map((customer) => (
                <div
                  key={customer.phone}
                  style={{
                    padding: '14px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.03)',
                    border: '1px solid rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <UserX size={18} color="#ef4444" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#94a3b8', textDecoration: 'line-through' }}>{customer.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', direction: 'ltr', textAlign: 'right' }}>
                      📱 {customer.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { approveCustomer(customer.phone); addToast({ message: `${customer.name} שוחרר מחסימה`, type: 'success' }); }}
                      title="בטל חסימה"
                      style={{
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                        borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                        color: '#22c55e', fontFamily: 'Heebo, sans-serif', fontSize: 11, fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <CheckCircle size={12} /> שחרר
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { deleteCustomer(customer.phone); addToast({ message: `${customer.name} נמחק לצמיתות`, type: 'info' }); }}
                      title="מחק לצמיתות"
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                        color: '#ef4444', display: 'flex',
                      }}
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <Link
            to="/butcher"
            style={{
              flex: 1, padding: '12px', borderRadius: 12,
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.2)',
              textDecoration: 'none', textAlign: 'center',
              color: '#86efac', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            דשבורד שוחט
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
