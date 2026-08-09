import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePostModal } from '../../context/PostModalContext';

export default function MobileBottomNav() {
  const { user, isAuthenticated } = useAuth();
  const { openComposer } = usePostModal();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-paper-50/95 dark:bg-ink-900/95 backdrop-blur-md border-t border-paper-200 dark:border-ink-800 px-3 py-2 select-none safe-area-pb">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'text-coral-500 font-semibold'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'text-coral-500 font-semibold'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
            }`
          }
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </NavLink>

        {/* Center Create Button */}
        {isAuthenticated && (
          <button
            onClick={() => openComposer('Thought')}
            className="flex flex-col items-center justify-center p-2 rounded-full bg-coral-500 text-white shadow-md active:scale-95 transition-transform"
            aria-label="Create post"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        )}

        {isAuthenticated && (
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
                isActive
                  ? 'text-coral-500 font-semibold'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
              }`
            }
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
            {user?.unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-coral-500 ring-2 ring-paper-50 dark:ring-ink-900" />
            )}
          </NavLink>
        )}

        <NavLink
          to={isAuthenticated && user ? `/profile/${user.username}` : '/auth'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-colors ${
              isActive
                ? 'text-coral-500 font-semibold'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </div>
    </div>
  );
}
