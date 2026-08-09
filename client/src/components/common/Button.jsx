import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary:
      'bg-coral-500 hover:bg-coral-600 active:bg-coral-700 text-white shadow-xs focus-visible:ring-coral-500 dark:focus-visible:ring-offset-ink-950',
    secondary:
      'bg-paper-200 dark:bg-ink-700 hover:bg-paper-300 dark:hover:bg-ink-600 text-ink-900 dark:text-ink-100 border border-paper-300 dark:border-ink-600 focus-visible:ring-ink-400',
    sage:
      'bg-sage-600 hover:bg-sage-700 text-white shadow-xs focus-visible:ring-sage-500',
    outline:
      'border border-paper-300 dark:border-ink-600 hover:border-ink-500 dark:hover:border-ink-400 text-ink-800 dark:text-ink-200 bg-transparent hover:bg-paper-100 dark:hover:bg-ink-800/40 focus-visible:ring-ink-400',
    ghost:
      'bg-transparent hover:bg-paper-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-100 focus-visible:ring-ink-400',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus-visible:ring-red-500',
    dangerOutline:
      'border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 focus-visible:ring-red-500',
  };

  const sizes = {
    sm: 'text-xs h-8 px-3.5 gap-1.5',
    md: 'text-sm h-10 px-4.5 gap-2',
    lg: 'text-sm sm:text-base h-11 sm:h-12 px-6 gap-2.5',
    icon: 'w-9 h-9 p-0 rounded-full',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0 stroke-[1.8]" />}
        </>
      )}
    </button>
  );
}
