import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Users } from 'lucide-react';
import { useRoundStore } from '../stores/roundStore';
import { useCartStore } from '../stores/cartStore';
import { MeatPart } from '../types';
import { getPartAvailability } from '../data/mockData';
import CowSVG from '../features/cow/CowSVG';
import PartsList from '../features/cow/PartsList';
import PartTooltip from '../features/cow/PartTooltip';
import PartModal from '../features/order/PartModal';

const CowPage: React.FC = () => {
  const { parts, simulatePurchase } = useRoundStore();
  const cartItems = useCartStore(s => s.items);
  const [selectedPart, setSelectedPart] = useState<MeatPart | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pulsingPartId, setPulsingPartId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'popular' | 'cheap'>('all');
  const [showMobileList, setShowMobileList] = useState(false);
  const [viewersCount] = useState(Math.floor(Math.random() * 6) + 3);

  const cartPartIds = new Set(cartItems.map(i => i.partId));

  // Simulate real-time purchases
  useEffect(() => {
    const id = setInterval(() => {
      const eligibleParts = parts.filter(p => getPartAvailability(p) > 5);
      if (eligibleParts.length === 0) return;
      const rp = eligibleParts[Math.floor(Math.random() * eligibleParts.length)];
      setPulsingPartId(rp.id);
      simulatePurchase();
      setTimeout(() => setPulsingPartId(null), 2000);
    }, 15000);
    return () => clearInterval(id);
  }, [parts]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handlePartClick = (part: MeatPart) => {
    setSelectedPart(part);
  };

  const totalKg = cartItems.reduce((s, i) => s + i.kg, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.subtotal, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }} onMouseMove={handleMouseMove}>
      {/* Top bar */}
      <div className="cow-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 13 }}>← חזור</Link>
          <span style={{ color: '#4b5563' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
            <Users size={14} />
            <span>{viewersCount} צופים כרגע</span>
          </div>
        </div>
        <div className="desktop-only" style={{ fontSize: 13, color: '#94a3b8' }}>
          לחץ על חלק בפרה לבחירה
        </div>
      </div>

      {/* Main layout: SVG + sidebar */}
      <div className="cow-page-layout">
        {/* SVG area */}
        <div style={{ minWidth: 0 }}>
          {/* FOMO ticker */}
          {pulsingPartId && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginBottom: 12, padding: '8px 14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, fontSize: 13, color: '#fca5a5',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              🔴 מישהו הזמין כרגע מהמלאי!
            </motion.div>
          )}

          {/* Legend */}
          <div className="cow-legend">
            {[
              { color: '#22c55e', label: 'זמין' },
              { color: '#eab308', label: 'בינוני' },
              { color: '#f97316', label: 'מעט' },
              { color: '#ef4444', label: 'אחרון!' },
              { color: '#4b5563', label: 'אזל' },
              { color: '#3b82f6', label: 'בסל' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                {label}
              </div>
            ))}
          </div>

          <CowSVG
            parts={parts}
            selectedPartId={cartPartIds.size > 0 ? [...cartPartIds][cartPartIds.size - 1] : null}
            hoveredPartId={hoveredPartId}
            onPartClick={handlePartClick}
            onPartHover={setHoveredPartId}
            pulsingPartId={pulsingPartId}
          />

          {/* Mobile list toggle */}
          <button
            className="mobile-parts-toggle"
            onClick={() => setShowMobileList(!showMobileList)}
          >
            📋 {showMobileList ? 'הסתר רשימת חלקים' : 'הצג רשימת חלקים'} {showMobileList ? '▲' : '▼'}
          </button>

          {/* Mobile parts list (below SVG) */}
          {showMobileList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mobile-only"
              style={{ paddingTop: 16, flexDirection: 'column' }}
            >
              <PartsList
                parts={parts}
                selectedPartId={null}
                cartPartIds={cartPartIds}
                filter={filter}
                onFilterChange={setFilter}
                onPartClick={handlePartClick}
                onPartHover={setHoveredPartId}
              />
            </motion.div>
          )}
        </div>

        {/* Side panel - desktop only */}
        <div className="cow-side-panel desktop-only" style={{ flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#f1f5f9' }}>
            🥩 כל החלקים
          </div>
          <PartsList
            parts={parts}
            selectedPartId={null}
            cartPartIds={cartPartIds}
            filter={filter}
            onFilterChange={setFilter}
            onPartClick={handlePartClick}
            onPartHover={setHoveredPartId}
          />
        </div>
      </div>

      {/* Tooltip - desktop only */}
      {hoveredPartId && (() => {
        const part = parts.find(p => p.id === hoveredPartId);
        if (!part) return null;
        return (
          <PartTooltip
            part={part}
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            isInCart={cartPartIds.has(part.id)}
          />
        );
      })()}

      {/* Part modal */}
      <AnimatePresence>
        {selectedPart && (
          <PartModal
            part={selectedPart}
            onClose={() => setSelectedPart(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating cart bar */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="floating-cart-bar"
          style={{
            position: 'fixed', bottom: 20, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: 16, padding: '14px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 8px 40px rgba(139,92,246,0.5)',
            minWidth: 320,
          }}
        >
          <ShoppingCart size={20} color="white" />
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15 }}>
              {cartItems.length} פריטים · {totalKg.toFixed(1)} ק"ג
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              {totalPrice.toFixed(0)} ₪
            </div>
          </div>
          <Link to="/cart" style={{
            background: 'white', color: '#6d28d9',
            padding: '8px 16px', borderRadius: 10,
            textDecoration: 'none', fontWeight: 800, fontSize: 14,
          }}>
            לסל →
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default CowPage;
