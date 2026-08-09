import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
  showClose = true,
}) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} bg-paper-50 dark:bg-ink-900 rounded-2xl shadow-unfold-modal border border-paper-300/80 dark:border-ink-700 overflow-hidden transform animate-unfold z-10 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || showClose) && (
          <div className="flex items-start justify-between px-6 py-5 border-b border-paper-200 dark:border-ink-800">
            <div>
              {title && (
                <h3
                  id={titleId}
                  className="font-serif text-xl font-semibold text-ink-900 dark:text-ink-50 leading-snug tracking-tight"
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                  {subtitle}
                </p>
              )}
            </div>
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 p-1.5 rounded-full hover:bg-paper-200/60 dark:hover:bg-ink-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
