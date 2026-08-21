import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'ready' | 'processing' | 'queued' | 'failed' | 'coral' | 'neutral' | 'active';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
}) => {
  const variantStyles = {
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    processing: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse',
    queued: 'bg-blue-50 text-blue-700 border-blue-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    coral: 'bg-coral-50 text-coral-600 border-coral-200',
    neutral: 'bg-card text-ink-muted border-line',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};
