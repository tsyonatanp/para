import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useToastStore, Toast as ToastType } from '../stores/toastStore';

const TYPE_STYLES: Record<ToastType['type'], { bg: string; border: string; color: string; defaultEmoji: string }> = {
  success: {
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.3)',
    color: '#22c55e',
    defaultEmoji: '✅',
  },
  warning: {
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.3)',
    color: '#f97316',
    defaultEmoji: '⚠️',
  },
  error: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    color: '#ef4444',
    defaultEmoji: '❌',
  },
  info: {
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
    color: '#c4b5fd',
    defaultEmoji: 'ℹ️',
  },
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div style={{
      position: 'fixed',
      top: 72,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
      width: '100%',
      maxWidth: 420,
      padding: '0 16px',
    }}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const style = TYPE_STYLES[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(22,22,31,0.95)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${style.border}`,
                borderRadius: 14,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${style.border}`,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>
                {toast.emoji || style.defaultEmoji}
              </span>
              <span style={{
                flex: 1,
                fontSize: 14,
                fontWeight: 600,
                color: '#f1f5f9',
                lineHeight: 1.4,
              }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
