import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Feather, Sparkles, Shield, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import Logo from '../components/common/Logo';

export default function AuthPage() {
  const { login, register, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      addToast('Please enter your email/username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
      addToast('Welcome back to UNFOLD', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Login failed. Check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerUsername.trim() ||
      !registerPassword
    ) {
      addToast('All fields are required', 'error');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (registerPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        username: registerUsername.trim(),
        password: registerPassword,
      });
      addToast('Account created! Welcome to UNFOLD', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Demo accounts helper
  const handleQuickDemoLogin = (email, password) => {
    setLoginIdentifier(email);
    setLoginPassword(password);
    setMode('login');
  };

  return (
    <div className="min-h-screen bg-paper-50 dark:bg-ink-950 flex flex-col lg:flex-row transition-colors selection:bg-coral-100 dark:selection:bg-coral-900/40 selection:text-coral-900 dark:selection:text-coral-100">
      {/* LEFT COLUMN: Editorial Brand Statement & Manifesto */}
      <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-paper-200 dark:border-ink-800 bg-paper-100/60 dark:bg-ink-900/40">
        <div>
          <Logo size="large" />
          <p className="mt-3 font-serif text-sm italic text-coral-600 dark:text-coral-400">
            "Let your world unfold."
          </p>
        </div>

        <div className="my-10 lg:my-0 space-y-6 max-w-lg">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-ink-50 leading-[1.15] tracking-tight">
            Share what you’re thinking.{' '}
            <span className="text-coral-500 font-normal italic">
              Discover what others are becoming.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed font-sans">
            Every person has stories, ideas, interests, and experiences that gradually unfold. A social space designed for stillness, human conversation, and thoughtful craftsmanship.
          </p>

          {/* Value Props */}
          <div className="space-y-3 pt-4 border-t border-paper-300/80 dark:border-ink-800 text-xs sm:text-sm text-ink-700 dark:text-ink-300">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-coral-100 dark:bg-coral-950/60 text-coral-600 dark:text-coral-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>Share your perspective</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-sage-100 dark:bg-sage-950/60 text-sage-600 dark:text-sage-400 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>Discover new ones</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-paper-300 dark:bg-ink-700 text-ink-700 dark:text-ink-200 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span>Connect with people who inspire you</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-ink-400 dark:text-ink-500 pt-6">
          <p>© 2026 UNFOLD Social</p>
        </div>
      </div>

      {/* RIGHT COLUMN: Minimal Auth Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-paper-200/80 dark:bg-ink-800 p-1 border border-paper-300 dark:border-ink-700">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 ${
                mode === 'login'
                  ? 'bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-ink-50 shadow-xs'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 ${
                mode === 'register'
                  ? 'bg-paper-50 dark:bg-ink-900 text-ink-900 dark:text-ink-50 shadow-xs'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
              }`}
            >
              Join UNFOLD
            </button>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink-900 dark:text-ink-50">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
              {mode === 'login'
                ? 'Enter your credentials to continue your journey'
                : 'Join our community of thoughtful essayists, designers, and thinkers'}
            </p>
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
              <Input
                label="Email or Username"
                type="text"
                placeholder="praneel@example.com or praneel_k"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-md"
              >
                Sign In to UNFOLD
              </Button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
              <Input
                label="Full Name"
                type="text"
                placeholder="Praneel Kulkarni"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="praneel@example.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />

              <Input
                label="Username"
                type="text"
                placeholder="praneel_k (letters, numbers, underscore)"
                value={registerUsername}
                onChange={(e) => setRegisterUsername(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                value={registerConfirmPassword}
                onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full shadow-md mt-2"
              >
                Create Account
              </Button>
            </form>
          )}

          {/* Quick Demo Accounts Pill Bar */}
          <div className="pt-4 border-t border-paper-200 dark:border-ink-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2.5">
              Quick Test Personas (Click to auto-fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('elena.rostova@unfold.io', 'password123')
                }
                className="text-left p-2.5 rounded-xl bg-paper-100 dark:bg-ink-900 hover:bg-paper-200 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 active:scale-98"
              >
                <span className="font-semibold text-ink-900 dark:text-ink-100 block truncate">
                  Elena Rostova
                </span>
                <span className="text-[10px] text-ink-500 dark:text-ink-400 block truncate">
                  Architecture Theorist
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('demo@unfold.io', 'password123')
                }
                className="text-left p-2.5 rounded-xl bg-paper-100 dark:bg-ink-900 hover:bg-paper-200 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 active:scale-98"
              >
                <span className="font-semibold text-ink-900 dark:text-ink-100 block truncate">
                  Praneel Kulkarni
                </span>
                <span className="text-[10px] text-ink-500 dark:text-ink-400 block truncate">
                  UNFOLD Founder
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('marcus.vance@unfold.io', 'password123')
                }
                className="text-left p-2.5 rounded-xl bg-paper-100 dark:bg-ink-900 hover:bg-paper-200 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 active:scale-98"
              >
                <span className="font-semibold text-ink-900 dark:text-ink-100 block truncate">
                  Marcus Vance
                </span>
                <span className="text-[10px] text-ink-500 dark:text-ink-400 block truncate">
                  Type Designer
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoLogin('clara.dupont@unfold.io', 'password123')
                }
                className="text-left p-2.5 rounded-xl bg-paper-100 dark:bg-ink-900 hover:bg-paper-200 dark:hover:bg-ink-800 border border-paper-200 dark:border-ink-800 transition-all text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 active:scale-98"
              >
                <span className="font-semibold text-ink-900 dark:text-ink-100 block truncate">
                  Clara Dupont
                </span>
                <span className="text-[10px] text-ink-500 dark:text-ink-400 block truncate">
                  Photographer
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
