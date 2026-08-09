import React from 'react';
import { useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function TopHeader({ title }) {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-paper-50/90 dark:bg-ink-950/90 backdrop-blur-md border-b border-paper-200 dark:border-ink-800 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="md:hidden">
          <Logo size="small" showWordmark={false} />
        </div>
        <div>
          <h1 className="font-serif text-lg sm:text-xl font-bold text-ink-900 dark:text-ink-50 tracking-tight">
            {title || 'Feed'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100 hover:bg-paper-200/60 dark:hover:bg-ink-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-ink-600" />
          )}
        </button>
      </div>
    </header>
  );
}
