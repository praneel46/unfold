import React, { forwardRef, useState, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    type = 'text',
    className = '',
    containerClassName = '',
    icon: Icon,
    id,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1.5 select-none"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-ink-400 dark:text-ink-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full px-3.5 py-2.5 bg-paper-50 dark:bg-ink-900 border rounded-xl text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 disabled:opacity-50 disabled:bg-paper-100 dark:disabled:bg-ink-800 ${
            Icon ? 'pl-10' : ''
          } ${isPassword ? 'pr-10' : ''} ${
            error
              ? 'border-coral-500 focus:border-coral-500 focus:ring-coral-500/20'
              : 'border-paper-300 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 transition-colors p-1 rounded-md"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-coral-600 dark:text-coral-400 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="mt-1 text-xs text-ink-400 dark:text-ink-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, className = '', containerClassName = '', rows = 4, id, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1.5 select-none"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        className={`w-full px-3.5 py-2.5 bg-paper-50 dark:bg-ink-900 border rounded-xl text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-coral-500/20 focus:border-coral-500 disabled:opacity-50 ${
          error
            ? 'border-coral-500 focus:border-coral-500'
            : 'border-paper-300 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-coral-600 dark:text-coral-400 font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${textareaId}-helper`} className="mt-1 text-xs text-ink-400 dark:text-ink-500">
          {helperText}
        </p>
      )}
    </div>
  );
});
