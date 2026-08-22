import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-surface dark:bg-dark-surface rounded-2xl border border-line dark:border-dark-line p-6 shadow-sm ${
        hoverEffect
          ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/40'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
