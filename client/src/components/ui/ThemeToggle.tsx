import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-500 ${
        isDark
          ? 'bg-dark-surface border border-dark-line'
          : 'bg-ink/10 border border-ink/10'
      } ${className}`}
    >
      {/* Sliding knob */}
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ${
          isDark
            ? 'translate-x-6 bg-coral-500 text-white'
            : 'translate-x-0 bg-white text-ink'
        }`}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
};
