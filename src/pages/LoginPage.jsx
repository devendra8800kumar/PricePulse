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
  ShieldCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e) => {
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
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication processing
    setTimeout(() => {
      setIsLoading(false);
      login(email, password, rememberMe);
      navigate(redirectPath, { replace: true });
    }, 600);
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 mb-4 animate-in fade-in">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide control */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a 
                    href="#forgot" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset link will be sent to your email.');
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
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

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                  Keep me signed in on this browser
                </label>
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
              Track longitudinal price floors, audit fake festive markups, and receive automated drop alerts across Amazon and Flipkart.
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
            <span>PricePulse AI v2.4 • Client Authentication Active</span>
          </div>
        </div>

      </div>
    </div>
  );
}
