import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

const shimmerStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.5s infinite',
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}) => (
  <div style={{ width, height, borderRadius, ...shimmerStyle, ...style }} />
);

export const SkeletonPartCard: React.FC = () => (
  <div style={{
    background: '#16161f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Skeleton width={36} height={36} borderRadius={8} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={11} />
      </div>
      <Skeleton width={52} height={22} borderRadius={6} />
    </div>
    <Skeleton width="100%" height={6} borderRadius={999} />
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton width="30%" height={12} />
      <Skeleton width="25%" height={12} />
    </div>
  </div>
);

export const SkeletonOrderCard: React.FC = () => (
  <div style={{
    background: '#16161f',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="45%" height={14} />
      <Skeleton width={80} height={26} borderRadius={20} />
    </div>
    <div style={{ display: 'flex', gap: 16 }}>
      <Skeleton width="30%" height={12} />
      <Skeleton width="25%" height={12} />
    </div>
    <Skeleton width="55%" height={12} />
  </div>
);
