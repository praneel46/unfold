import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`py-14 px-6 text-center flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-paper-200/80 dark:bg-ink-800 flex items-center justify-center text-ink-500 dark:text-ink-400 mb-4 border border-paper-300/60 dark:border-ink-700">
          <Icon className="w-6 h-6 stroke-[1.5]" />
        </div>
      )}
      <h3 className="font-serif text-lg font-semibold text-ink-900 dark:text-ink-100 mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-500 dark:text-ink-400 max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
