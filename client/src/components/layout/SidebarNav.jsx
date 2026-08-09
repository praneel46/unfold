import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Bell,
  Bookmark,
  User,
  Settings,
  Feather,
  Sun,
  Moon,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { usePostModal } from '../../context/PostModalContext';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export default function SidebarNav() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openComposer } = usePostModal();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showUserMenu) {
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUserMenu]);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/explore', icon: Compass },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: user?.unreadNotificationsCount || 0,
      authRequired: true,
    },
    { label: 'Bookmarks', path: '/bookmarks', icon: Bookmark, authRequired: true },
    {
      label: 'Profile',
      path: user ? `/profile/${user.username}` : '/auth',
      icon: User,
      authRequired: true,
    },
    { label: 'Settings', path: '/settings', icon: Settings, authRequired: true },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/auth');
  };

  return (
    <aside
      aria-label="Main Navigation"
      className="sticky top-0 h-screen w-64 xl:w-72 flex flex-col justify-between py-6 px-4 border-r border-paper-200 dark:border-ink-800 shrink-0 select-none bg-paper-50 dark:bg-ink-950 transition-colors"
    >
      {/* Top Section: Logo & Nav items */}
      <div className="space-y-6">
        {/* Brand Wordmark & Icon */}
        <div className="px-3 pt-1">
          <Logo size="default" />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.authRequired && !isAuthenticated) return null;
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 ${
                  isActive
                    ? 'bg-paper-200 dark:bg-ink-800 text-ink-900 dark:text-ink-50 font-semibold shadow-xs'
                    : 'text-ink-600 dark:text-ink-300 hover:bg-paper-100 dark:hover:bg-ink-800/60 hover:text-ink-900 dark:hover:text-ink-100'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? 'text-coral-500 stroke-[2.2]'
                        : 'text-ink-500 dark:text-ink-400 stroke-[1.8] group-hover:scale-105'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold font-mono bg-coral-500 text-white rounded-full leading-none">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Unfold Composer Primary Action Button */}
        {isAuthenticated && (
          <div className="pt-2 px-1">
            <Button
              onClick={() => openComposer('Thought')}
              variant="primary"
              size="lg"
              className="w-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <Feather className="w-4 h-4 transition-transform group-hover:rotate-12 stroke-[2]" />
              <span>Unfold a Thought</span>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Section: Theme Switcher & User Profile Pill */}
      <div className="space-y-3 pt-4 border-t border-paper-200 dark:border-ink-800">
        {/* Dark/Light mode button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-medium text-ink-600 dark:text-ink-400 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label={`Switch atmosphere to ${theme === 'dark' ? 'Light' : 'Dark'}`}
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-ink-500" />
            )}
            <span>{theme === 'dark' ? 'Light Atmosphere' : 'Dark Atmosphere'}</span>
          </div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-paper-200 dark:bg-ink-700 text-ink-600 dark:text-ink-300">
            {theme}
          </span>
        </button>

        {/* User Account Popover */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-paper-100 dark:hover:bg-ink-800/80 cursor-pointer transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-ink-500 dark:text-ink-400 font-mono truncate leading-tight">
                    @{user.username}
                  </p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-ink-400 shrink-0" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowUserMenu(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  className="absolute bottom-full left-0 mb-2 w-full bg-paper-50 dark:bg-ink-900 rounded-2xl shadow-unfold-modal border border-paper-300 dark:border-ink-700 py-1.5 z-30 animate-fade-in overflow-hidden"
                >
                  <NavLink
                    to={`/profile/${user.username}`}
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-ink-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-ink-500" />
                    <span>View Profile</span>
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-ink-700 dark:text-ink-200 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-ink-500" />
                    <span>Account Settings</span>
                  </NavLink>
                  <div className="my-1 border-t border-paper-200 dark:border-ink-800" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-coral-600 dark:text-coral-400 hover:bg-coral-50 dark:hover:bg-coral-950/30 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-1">
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Sign In / Join
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
