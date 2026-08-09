import React, { useState } from 'react';

export default function Avatar({
  src,
  alt = 'User Avatar',
  size = 'md',
  className = '',
}) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (!src || hasError) {
    return (
      <div
        className={`${selectedSize} rounded-full bg-paper-200 dark:bg-ink-700 border border-paper-300 dark:border-ink-600 text-ink-700 dark:text-ink-200 font-medium flex items-center justify-center select-none shrink-0 ${className}`}
      >
        {getInitials(alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`${selectedSize} rounded-full object-cover border border-paper-300/60 dark:border-ink-700 shrink-0 select-none ${className}`}
      loading="lazy"
    />
  );
}
