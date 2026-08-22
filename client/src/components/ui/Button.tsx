import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  arrowChip?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  arrowChip = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coral-400 focus:ring-offset-2 dark:focus:ring-offset-dark-surface disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-coral-500 hover:bg-coral-600 text-white shadow-sm hover:shadow hover:shadow-coral-500/20',
    secondary:
      'bg-white dark:bg-dark-card hover:bg-card dark:hover:bg-dark-line text-ink dark:text-dark-ink border border-line dark:border-dark-line shadow-sm',
    outline:
      'bg-transparent border border-ink/20 dark:border-dark-line hover:border-ink/50 dark:hover:border-dark-ink-muted text-ink dark:text-dark-ink',
    ghost:
      'bg-transparent hover:bg-ink/5 dark:hover:bg-white/5 text-ink-muted dark:text-dark-ink-muted hover:text-ink dark:hover:text-dark-ink',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
          {arrowChip && (
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs ml-1 shrink-0">
              →
            </span>
          )}
        </>
      )}
    </button>
  );
};
