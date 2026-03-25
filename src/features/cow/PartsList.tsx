import React from 'react';
import { MeatPart } from '../../types';
import { getPartAvailability, getPartColor, getAvailabilityLabel } from '../../data/mockData';

interface PartsListProps {
  parts: MeatPart[];
  selectedPartId: string | null;
  cartPartIds: Set<string>;
  filter: 'all' | 'available' | 'popular' | 'cheap';
  onFilterChange: (f: 'all' | 'available' | 'popular' | 'cheap') => void;
  onPartClick: (part: MeatPart) => void;
  onPartHover?: (partId: string | null) => void;
}

const PartsList: React.FC<PartsListProps> = ({
  parts,
  selectedPartId,
  cartPartIds,
  filter,
  onFilterChange,
  onPartClick,
  onPartHover,
}) => {
  const filteredParts = parts.filter(p => {
    const pct = getPartAvailability(p);
    if (filter === 'available') return pct > 0;
    if (filter === 'popular') return p.soldKg / p.totalKg > 0.5;
    if (filter === 'cheap') return p.pricePerKg < 70;
    return true;
  }).sort((a, b) => {
    if (filter === 'cheap') return a.pricePerKg - b.pricePerKg;
    return 0;
  });

  const filters: { key: 'all' | 'available' | 'popular' | 'cheap'; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'available', label: 'זמין' },
    { key: 'popular', label: '🔥 מבוקש' },
    { key: 'cheap', label: '💰 מחיר' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        padding: '0 0 12px 0',
        flexWrap: 'wrap',
      }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: filter === f.key ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
              background: filter === f.key ? 'rgba(139,92,246,0.2)' : 'transparent',
              color: filter === f.key ? '#c4b5fd' : '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Heebo, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Parts list */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filteredParts.map(part => {
          const pct = getPartAvailability(part);
          const available = Math.max(0, part.totalKg - part.soldKg - part.bufferKg);
          const color = getPartColor(pct, selectedPartId === part.id);
          const isInCart = cartPartIds.has(part.id);
          const isSold = pct <= 0;

          return (
            <div
              key={part.id}
              onClick={() => !isSold && onPartClick(part)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid',
                borderColor: selectedPartId === part.id
                  ? '#3b82f6'
                  : isInCart
                  ? 'rgba(59,130,246,0.3)'
                  : 'rgba(255,255,255,0.06)',
                background: selectedPartId === part.id
                  ? 'rgba(59,130,246,0.1)'
                  : isInCart
                  ? 'rgba(59,130,246,0.05)'
                  : 'rgba(255,255,255,0.02)',
                cursor: isSold ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isSold ? 0.5 : 1,
              }}
              onMouseEnter={e => {
                if (!isSold) {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.15)';
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)';
                  if (onPartHover) onPartHover(part.id);
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  selectedPartId === part.id ? '#3b82f6' : isInCart ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLDivElement).style.background =
                  selectedPartId === part.id ? 'rgba(59,130,246,0.1)' : isInCart ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)';
                if (onPartHover) onPartHover(null);
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{part.emoji}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: '#f1f5f9' }}>{part.nameHe}</span>
                {isInCart && <span style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700 }}>✓ בסל</span>}
                <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{part.pricePerKg}₪</span>
              </div>

              {/* Mini progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999 }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 999,
                    width: `${Math.min(pct, 100)}%`,
                    background: color,
                    transition: 'width 0.5s',
                  }} />
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color,
                  minWidth: 50,
                  textAlign: 'left' as const,
                }}>
                  {isSold ? 'אזל' : `${available.toFixed(1)} ק"ג`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PartsList;
