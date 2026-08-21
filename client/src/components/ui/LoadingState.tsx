import React from 'react';

export const LoadingState: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-card rounded-xl w-1/4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 bg-card rounded-2xl w-full border border-line" />
        ))}
      </div>
    </div>
  );
};
