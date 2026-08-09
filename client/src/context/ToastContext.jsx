import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-editorial-hover border transition-all duration-300 transform translate-y-0 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-ink-50 border-sage-500/30'
                : toast.type === 'error'
                ? 'bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-ink-50 border-coral-500/40'
                : 'bg-paper-50 dark:bg-ink-800 text-ink-900 dark:text-ink-50 border-paper-300 dark:border-ink-600'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && (
                <CheckCircle2 className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              )}
              {toast.type === 'error' && (
                <AlertCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              )}
              {toast.type === 'info' && (
                <Info className="w-5 h-5 text-ink-500 dark:text-ink-400" />
              )}
            </div>
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
