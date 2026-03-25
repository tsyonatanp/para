import React from 'react';
import { MeatPart } from '../../types';
import { getPartAvailability, getAvailabilityLabel } from '../../data/mockData';

interface PartTooltipProps {
  part: MeatPart;
  mouseX: number;
  mouseY: number;
  isInCart: boolean;
}

const PartTooltip: React.FC<PartTooltipProps> = ({ part, mouseX, mouseY, isInCart }) => {
  const pct = getPartAvailability(part);
  const available = Math.max(0, part.totalKg - part.soldKg - part.bufferKg);

  const style: React.CSSProperties = {
    position: 'fixed',
    left: mouseX + 16,
    top: mouseY - 10,
    zIndex: 1000,
    pointerEvents: 'none',
    minWidth: 200,
  };

  // Flip to left if too close to right edge
  if (mouseX > window.innerWidth - 240) {
    style.left = mouseX - 216;
  }

  return (
    <div style={style}>
      <div style={{
        background: 'rgba(22, 22, 31, 0.97)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 12,
        padding: '12px 14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>{part.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>{part.nameHe}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{part.nameEn}</div>
          </div>
          {isInCart && (
            <span style={{
              marginRight: 'auto',
              background: 'rgba(59,130,246,0.2)',
              color: '#3b82f6',
              padding: '2px 8px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
            }}>בסל ✓</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>מחיר לק"ג</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{part.pricePerKg} ₪</span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>נשאר</span>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: pct < 10 ? '#ef4444' : pct < 30 ? '#f97316' : '#22c55e'
            }}>{available.toFixed(1)} ק"ג</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
            <div style={{
              height: '100%',
              borderRadius: 999,
              width: `${Math.min(pct, 100)}%`,
              background: pct < 10 ? '#ef4444' : pct < 30 ? '#f97316' : pct < 60 ? '#eab308' : '#22c55e',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: pct <= 0 ? '#6b7280' : pct < 10 ? '#ef4444' : pct < 30 ? '#f97316' : '#22c55e',
        }}>
          {pct <= 0 ? '❌ אזל המלאי' : getAvailabilityLabel(pct)}
          {pct > 0 && pct < 30 && <span style={{ color: '#94a3b8', fontWeight: 400, marginRight: 6 }}>לחץ לבחור</span>}
        </div>
      </div>
    </div>
  );
};

export default PartTooltip;
