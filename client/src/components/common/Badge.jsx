import React from 'react';

const categoryStyles = {
  Thought: 'bg-paper-200/80 text-ink-800 dark:bg-ink-700/60 dark:text-ink-200 border-paper-300 dark:border-ink-600',
  Essay: 'bg-sage-100 text-sage-800 dark:bg-sage-900/40 dark:text-sage-300 border-sage-200 dark:border-sage-800/60',
  Moment: 'bg-coral-50 text-coral-700 dark:bg-coral-950/40 dark:text-coral-300 border-coral-200 dark:border-coral-900/60',
  Discovery: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
  Story: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
  default: 'bg-paper-200 text-ink-700 dark:bg-ink-800 dark:text-ink-300 border-paper-300 dark:border-ink-700',
};

export default function Badge({
  children,
  category = 'default',
  size = 'sm',
  className = '',
  onClick,
}) {
  const isClickable = !!onClick;
  const style = categoryStyles[category] || categoryStyles.default;
  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-md border tracking-wide uppercase font-mono select-none transition-all ${style} ${sizeClass} ${
        isClickable ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''
      } ${className}`}
    >
      {children || category}
    </span>
  );
}
