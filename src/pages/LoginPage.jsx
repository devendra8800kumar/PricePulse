import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  RotateCcw,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Reset password state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setForgotMessage(res.message || 'Instructions have been dispatched.');
    } catch (err) {
      setForgotError(err.message || 'Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetMessage('');
    if (!resetToken.trim()) {
      setResetError('Please enter your reset token.');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 8) {
      setResetError('New password must be at least 8 characters long.');
      return;
    }
    setResetLoading(true);
    try {
      const res = await authService.resetPassword({
        token: resetToken,
        new_password: resetNewPassword,
      });
      setResetMessage(res.message || 'Password reset successfully! You can now log in.');
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. Token may be invalid or expired.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold text-slate-900">
                Price<span className="text-blue-600">Pulse</span>
              </span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Sign in to monitor real-time electronics price drops and automated watchlist alerts.
            </p>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 mb-4 animate-in fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide control */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button 
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox & Reset Token Option */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                    Keep me signed in
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="text-[11px] text-slate-500 hover:text-blue-600 font-medium"
                >
                  Have a reset token?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full h-11 text-sm font-semibold shadow-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to PricePulse
              </Button>

              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or Fast Demo Access
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setEmail('demo@pricepulse.com');
                  setPassword('Password123!');
                  setIsLoading(true);
                  try {
                    await login('demo@pricepulse.com', 'Password123!', true);
                    navigate(redirectPath, { replace: true });
                  } catch (err) {
                    setError(err.message || 'Demo login failed');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-full h-10 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>1-Click Demo Sign In (demo@pricepulse.com)</span>
              </button>
            </form>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-600 text-center sm:text-left">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-blue-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        {/* Right Side: Split-Screen Visual Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between hidden lg:flex relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 blur-3xl pointer-events-none rounded-full" />
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Real-Time Intelligence</span>
            </div>

            <h3 className="text-2xl font-black leading-snug mb-3">
              Never overpay for electronics again.
            </h3>
            
            <p className="text-xs text-blue-100 leading-relaxed mb-6">
              Track longitudinal price floors, audit festive markups, and receive automated drop alerts across Amazon and Flipkart.
            </p>

            {/* Feature Checkpoints */}
            <div className="space-y-3 text-xs text-blue-50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Side-by-side Amazon vs Flipkart price wars</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>AI buy signals (BUY NOW / WAIT / GOOD DEAL)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Personalized watchlist & threshold alarms</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-[11px] text-blue-200">
            <span>PricePulse API Connected • JWT Session Enabled</span>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <span>Reset Your Password</span>
              </div>
              <button 
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address and we'll dispatch password recovery instructions.
            </p>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold mb-3">
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold mb-3">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={forgotLoading}
                  className="flex-1 text-xs font-semibold"
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <span>Complete Password Reset</span>
              </div>
              <button 
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Enter the reset token provided to you and choose a strong new password (minimum 8 characters).
            </p>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold mb-3">
                {resetError}
              </div>
            )}
            {resetMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-semibold mb-3">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Reset Token</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste token here..."
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter 8+ characters..."
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={resetLoading}
                  className="flex-1 text-xs font-semibold"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
