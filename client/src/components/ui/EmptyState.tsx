import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-card/60 rounded-3xl border border-dashed border-line">
      <div className="w-14 h-14 rounded-2xl bg-white border border-line flex items-center justify-center text-coral-500 mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-ink font-display">{title}</h3>
      <p className="text-sm text-ink-muted mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
