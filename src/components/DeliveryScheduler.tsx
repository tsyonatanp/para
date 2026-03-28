import React from 'react';
import { useCartStore } from '../stores/cartStore';

const TIME_SLOTS = [
  { id: 'morning' as const, label: 'בוקר', sub: '09:00–12:00' },
  { id: 'afternoon' as const, label: 'צהריים', sub: '12:00–17:00' },
  { id: 'evening' as const, label: 'ערב', sub: '17:00–21:00' },
];

const DeliveryScheduler: React.FC = () => {
  const { deliveryDate, deliveryTimeSlot, setDeliveryDate, setDeliveryTimeSlot } = useCartStore();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const maxDateObj = new Date(today);
  maxDateObj.setDate(today.getDate() + 14);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      {/* Date picker */}
      <div>
        <label className="label">תאריך משלוח</label>
        <input
          type="date"
          className="input-field"
          value={deliveryDate || ''}
          min={minDate}
          max={maxDate}
          onChange={e => setDeliveryDate(e.target.value)}
          style={{ direction: 'ltr', textAlign: 'right' }}
        />
      </div>

      {/* Time slots */}
      {deliveryDate && (
        <div>
          <label className="label">שעת משלוח</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {TIME_SLOTS.map(slot => (
              <button
                key={slot.id}
                onClick={() => setDeliveryTimeSlot(slot.id)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10,
                  border: '1px solid',
                  borderColor: deliveryTimeSlot === slot.id ? '#8b5cf6' : 'rgba(255,255,255,0.08)',
                  background: deliveryTimeSlot === slot.id ? 'rgba(139,92,246,0.15)' : 'transparent',
                  color: deliveryTimeSlot === slot.id ? '#c4b5fd' : '#94a3b8',
                  cursor: 'pointer', fontFamily: 'Heebo, sans-serif', fontSize: 13,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontWeight: 600 }}>{slot.label}</span>
                <span style={{ fontSize: 11 }}>{slot.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryScheduler;
