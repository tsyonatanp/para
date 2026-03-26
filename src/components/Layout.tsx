import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ClipboardList, LogOut, User, Shield, Settings } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import AuthModal from './AuthModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const items = useCartStore(s => s.items);
  const { user, logout } = useAuthStore();
  const canAccessDashboard = useAuthStore(s => s.canAccessDashboard());
  const isAdminUser = useAuthStore(s => s.isAdmin());
  const location = useLocation();
  const navigate = useNavigate();
  const isButcherPage = location.pathname.startsWith('/butcher');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleLogout = () => {
    logout();
    if (isButcherPage) navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0f' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,15,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 20px',
        height: 60,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🥩</span>
          <span style={{
            fontSize: 20, fontWeight: 900,
            background: 'linear-gradient(135deg, #f1f5f9, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>FreshCut</span>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links desktop-only">
          {!isButcherPage && (
            <>
              <Link
                to="/cow"
                style={{
                  color: location.pathname === '/cow' ? '#c4b5fd' : '#94a3b8',
                  textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  padding: '6px 12px', borderRadius: 8,
                  background: location.pathname === '/cow' ? 'rgba(139,92,246,0.1)' : 'transparent',
                }}
              >הזמן</Link>

              <Link
                to="/orders"
                style={{
                  color: location.pathname === '/orders' ? '#c4b5fd' : '#94a3b8',
                  textDecoration: 'none', fontSize: 14, fontWeight: 500,
                  padding: '6px 12px', borderRadius: 8,
                  background: location.pathname === '/orders' ? 'rgba(139,92,246,0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <ClipboardList size={14} />
                הזמנות
              </Link>
            </>
          )}

          {/* Butcher dashboard – for admin or butcher role */}
          {canAccessDashboard && (
            <Link
              to={isButcherPage ? '/' : '/butcher'}
              style={{
                color: isButcherPage ? '#f97316' : '#94a3b8',
                textDecoration: 'none', fontSize: 14,
                padding: '6px 12px', borderRadius: 8,
                background: isButcherPage ? 'rgba(249,115,22,0.1)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 600,
              }}
            >
              <Shield size={15} />
              {isButcherPage ? '← חזור לחנות' : 'ניהול'}
            </Link>
          )}

          {/* Admin panel – only for super admin */}
          {isAdminUser && (
            <Link
              to="/admin"
              style={{
                color: location.pathname === '/admin' ? '#f97316' : '#94a3b8',
                textDecoration: 'none', fontSize: 14,
                padding: '6px 12px', borderRadius: 8,
                background: location.pathname === '/admin' ? 'rgba(249,115,22,0.1)' : 'transparent',
                display: 'flex', alignItems: 'center', gap: 6,
                fontWeight: 600,
              }}
            >
              <Settings size={15} />
              מנהל
            </Link>
          )}

          {/* Auth button / User info */}
          {user ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: isAdminUser ? 'rgba(249,115,22,0.1)' : canAccessDashboard ? 'rgba(34,197,94,0.1)' : 'rgba(139,92,246,0.1)',
              border: `1px solid ${isAdminUser ? 'rgba(249,115,22,0.2)' : canAccessDashboard ? 'rgba(34,197,94,0.2)' : 'rgba(139,92,246,0.2)'}`,
              borderRadius: 10, padding: '6px 12px',
            }}>
              {isAdminUser && (
                <span style={{ fontSize: 10, background: '#f97316', color: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                  ADMIN
                </span>
              )}
              <span style={{ fontSize: 13, color: isAdminUser ? '#fdba74' : canAccessDashboard ? '#86efac' : '#c4b5fd', fontWeight: 600 }}>
                👤 {user.name || user.phone}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none', border: 'none', color: '#6b7280',
                  cursor: 'pointer', display: 'flex', padding: 2,
                }}
                title="התנתק"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 10, padding: '6px 14px',
                color: '#c4b5fd', cursor: 'pointer',
                fontWeight: 600, fontSize: 13,
                fontFamily: 'Heebo, sans-serif',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <User size={14} />
              התחבר
            </button>
          )}

          {!isButcherPage && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                background: items.length > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${items.length > 0 ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                color: items.length > 0 ? '#c4b5fd' : '#94a3b8',
                textDecoration: 'none', fontWeight: 600, fontSize: 14,
              }}
            >
              <ShoppingCart size={16} />
              <span>סל</span>
              {items.length > 0 && (
                <span style={{
                  background: '#8b5cf6', color: 'white',
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800,
                }}>{items.length}</span>
              )}
            </Link>
          )}
        </div>

        {/* Mobile: cart icon + hamburger */}
        <div className="mobile-only" style={{ gap: 8, alignItems: 'center' }}>
          {!isButcherPage && (
            <Link
              to="/cart"
              style={{
                position: 'relative',
                background: items.length > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${items.length > 0 ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 6,
                color: items.length > 0 ? '#c4b5fd' : '#94a3b8',
                textDecoration: 'none', fontWeight: 600, fontSize: 13,
              }}
            >
              <ShoppingCart size={16} />
              {items.length > 0 && (
                <span style={{
                  background: '#8b5cf6', color: 'white',
                  borderRadius: '50%', width: 18, height: 18,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                }}>{items.length}</span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none', border: 'none',
              color: '#94a3b8', cursor: 'pointer',
              padding: 6, display: 'flex',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'sticky', top: 60, zIndex: 99,
              background: 'rgba(10,10,15,0.97)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {!isButcherPage && (
                <>
                  <Link
                    to="/cow"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: location.pathname === '/cow' ? '#c4b5fd' : '#94a3b8',
                      textDecoration: 'none', fontSize: 15, fontWeight: 500,
                      padding: '10px 12px', borderRadius: 10,
                      background: location.pathname === '/cow' ? 'rgba(139,92,246,0.1)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >🥩 הזמן בשר</Link>

                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      color: location.pathname === '/orders' ? '#c4b5fd' : '#94a3b8',
                      textDecoration: 'none', fontSize: 15, fontWeight: 500,
                      padding: '10px 12px', borderRadius: 10,
                      background: location.pathname === '/orders' ? 'rgba(139,92,246,0.1)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                  >📋 ההזמנות שלי</Link>
                </>
              )}

              {/* Dashboard link – mobile (admin or butcher) */}
              {canAccessDashboard && (
                <Link
                  to={isButcherPage ? '/' : '/butcher'}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: isButcherPage ? '#f97316' : '#94a3b8',
                    textDecoration: 'none', fontSize: 15, fontWeight: 600,
                    padding: '10px 12px', borderRadius: 10,
                    background: isButcherPage ? 'rgba(249,115,22,0.1)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Shield size={16} />
                  {isButcherPage ? '← חזור לחנות' : '🔧 ניהול'}
                </Link>
              )}

              {/* Admin panel – mobile (admin only) */}
              {isAdminUser && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#f97316',
                    textDecoration: 'none', fontSize: 15, fontWeight: 600,
                    padding: '10px 12px', borderRadius: 10,
                    background: location.pathname === '/admin' ? 'rgba(249,115,22,0.1)' : 'transparent',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Settings size={16} />
                  ⚙️ ניהול מערכת
                </Link>
              )}

              {/* Auth in mobile */}
              {user ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: 10,
                  background: isAdminUser ? 'rgba(249,115,22,0.08)' : canAccessDashboard ? 'rgba(34,197,94,0.08)' : 'rgba(139,92,246,0.08)',
                  marginTop: 4,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isAdminUser && (
                      <span style={{ fontSize: 10, background: '#f97316', color: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                        ADMIN
                      </span>
                    )}
                    {canAccessDashboard && !isAdminUser && (
                      <span style={{ fontSize: 10, background: '#22c55e', color: 'white', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                        שוחט
                      </span>
                    )}
                    <span style={{ fontSize: 14, color: isAdminUser ? '#fdba74' : canAccessDashboard ? '#86efac' : '#c4b5fd', fontWeight: 600 }}>
                      👤 {user.name || user.phone}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 8, padding: '4px 10px',
                      color: '#ef4444', cursor: 'pointer',
                      fontSize: 12, fontFamily: 'Heebo, sans-serif',
                    }}
                  >
                    התנתק
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setShowAuth(true); setMobileMenuOpen(false); }}
                  style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    color: '#c4b5fd', cursor: 'pointer',
                    fontSize: 15, fontWeight: 600,
                    fontFamily: 'Heebo, sans-serif',
                    display: 'flex', alignItems: 'center', gap: 8,
                    marginTop: 4, width: '100%',
                  }}
                >
                  🔐 התחבר
                </button>
              )}

              {!isButcherPage && (
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: '#94a3b8', textDecoration: 'none', fontSize: 15,
                    padding: '10px 12px', borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <ShoppingCart size={16} />
                  סל ({items.length} פריטים)
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Page content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        textAlign: 'center',
        color: '#4b5563',
        fontSize: 12,
      }}>
        © 2026 FreshCut · בשר טרי לפי הזמנה · קשר: 054-7274527
      </footer>
    </div>
  );
};

export default Layout;
