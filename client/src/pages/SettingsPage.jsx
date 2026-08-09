import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Moon,
  KeyRound,
  Shield,
  User,
  LogOut,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.put('/api/auth/update-password', {
        currentPassword,
        newPassword,
      });

      if (res.success) {
        addToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSignOut = () => {
    logout();
    addToast('Signed out of UNFOLD', 'info');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen pb-12">
      <TopHeader title="Preferences & Account" />

      <div className="p-4 sm:p-8 max-w-2xl space-y-8">
        {/* Section 1: Visual Atmosphere */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-coral-500" />
            <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-50">
              Visual Atmosphere
            </h2>
          </div>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Choose the reading environment that best suits your natural rhythm.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Light Option */}
            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                theme === 'light'
                  ? 'border-coral-500 bg-coral-50/20 dark:bg-ink-800 ring-2 ring-coral-500/20'
                  : 'border-paper-300 dark:border-ink-800 bg-paper-100/50 dark:bg-ink-900/50 hover:border-paper-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-xs text-ink-900 dark:text-ink-100">
                    Warm Paper (Light)
                  </span>
                </div>
                {theme === 'light' && (
                  <CheckCircle className="w-4 h-4 text-coral-500" />
                )}
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 leading-relaxed">
                Warm off-white tones inspired by archival print, natural paper, and editorial magazines.
              </p>
            </div>

            {/* Dark Option */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'border-coral-500 bg-coral-50/20 dark:bg-ink-800 ring-2 ring-coral-500/20'
                  : 'border-paper-300 dark:border-ink-800 bg-paper-100/50 dark:bg-ink-900/50 hover:border-paper-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-xs text-ink-900 dark:text-ink-100">
                    Deep Ink (Dark)
                  </span>
                </div>
                {theme === 'dark' && (
                  <CheckCircle className="w-4 h-4 text-coral-500" />
                )}
              </div>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 leading-relaxed">
                Warm charcoal and deep ink surfaces for contemplative nighttime reading without glare.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Account Overview */}
        {user && (
          <section className="space-y-4 pt-6 border-t border-paper-200 dark:border-ink-800">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-sage-600 dark:text-sage-400" />
              <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-50">
                Account Identity
              </h2>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-paper-100/60 dark:bg-ink-900/60 border border-paper-200 dark:border-ink-800">
              <Avatar src={user.avatarUrl} alt={user.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900 dark:text-ink-100">
                  {user.name}
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-500">
                  @{user.username} • {user.email}
                </p>
              </div>
              <Button
                onClick={() => navigate(`/profile/${user.username}`)}
                variant="outline"
                size="sm"
              >
                View Profile
              </Button>
            </div>
          </section>
        )}

        {/* Section 3: Password Security */}
        {user && (
          <section className="space-y-4 pt-6 border-t border-paper-200 dark:border-ink-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-coral-500" />
              <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-50">
                Account Security
              </h2>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Update your account password with bcrypt verification.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={updatingPassword}
              >
                Update Password
              </Button>
            </form>
          </section>
        )}

        {/* Section 4: About UNFOLD */}
        <section className="space-y-3 pt-6 border-t border-paper-200 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-ink-500" />
            <h2 className="font-serif text-xl font-bold text-ink-900 dark:text-ink-50">
              About UNFOLD
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-paper-100/60 dark:bg-ink-900/60 border border-paper-200 dark:border-ink-800 text-xs text-ink-600 dark:text-ink-400 leading-relaxed space-y-2">
            <p className="font-serif font-bold text-ink-900 dark:text-ink-100 text-sm">
              UNFOLD Editorial Platform
            </p>
            <p>
              UNFOLD is an original editorial social platform featuring React, Vite, Tailwind CSS, Express, SQLite, and Prisma ORM. Built with real database-backed authentication, follows, posts, comments, likes, notifications, and responsive UI.
            </p>
            <p className="text-[11px] text-ink-400 dark:text-ink-500">
              Architected and crafted by Praneel C Kulkarni.
            </p>
          </div>
        </section>

        {/* Section 5: Sign Out */}
        {user && (
          <section className="pt-6 border-t border-paper-200 dark:border-ink-800">
            <Button
              onClick={handleSignOut}
              variant="dangerOutline"
              size="md"
              icon={LogOut}
            >
              Sign Out from Device
            </Button>
          </section>
        )}
      </div>
    </div>
  );
}
