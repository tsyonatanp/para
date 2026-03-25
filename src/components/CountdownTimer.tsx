import React, { useState, useEffect } from 'react';
import { SlaughterRound } from '../types';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, label = 'סגירת הזמנות בעוד' }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ hours, minutes, seconds });
      if (hours < 2) setUrgency('critical');
      else if (hours < 6) setUrgency('warning');
      else setUrgency('normal');
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const color = urgency === 'critical' ? '#ef4444' : urgency === 'warning' ? '#f97316' : '#22c55e';

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {[
          { val: pad(timeLeft.hours), unit: 'שעות' },
          { val: ':', unit: '' },
          { val: pad(timeLeft.minutes), unit: 'דקות' },
          { val: ':', unit: '' },
          { val: pad(timeLeft.seconds), unit: 'שניות' },
        ].map((item, i) =>
          item.unit === '' ? (
            <span key={i} style={{
              fontSize: 20, fontWeight: 800, color,
              animation: urgency === 'critical' ? 'countdown-pulse 1s ease infinite' : 'none',
            }}>:</span>
          ) : (
            <div key={i} style={{ textAlign: 'center' as const }}>
              <div style={{
                fontSize: 22, fontWeight: 900, color,
                minWidth: 44,
                background: `${color}15`,
                border: `1px solid ${color}30`,
                borderRadius: 8, padding: '4px 8px',
                fontVariantNumeric: 'tabular-nums',
              }}>{item.val}</div>
              <div style={{ fontSize: 9, color: '#6b7280', marginTop: 3 }}>{item.unit}</div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
