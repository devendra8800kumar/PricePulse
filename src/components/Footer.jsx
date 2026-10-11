import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Send, 
  Check, 
  Sparkles,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from './ui/Button';

const CURRENT_YEAR = 2026;

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useApp();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      showToast('Price drop alert subscription confirmed!', 'success');
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 4000);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter / Price Alert Bar */}
        <div className="p-6 sm:p-7 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Drop Dispatcher</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Get notified when electronics drop to all-time lows
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Verified price crash alerts across Amazon India and Flipkart.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email for price alerts..."
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-blue-400 focus:outline-none text-xs text-white placeholder-slate-500 min-w-[260px]"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="h-10 px-4 text-xs font-semibold shrink-0"
              leftIcon={subscribed ? <Check className="w-3.5 h-3.5 text-white" /> : <Send className="w-3.5 h-3.5 text-white" />}
            >
              {subscribed ? 'Subscribed!' : 'Set Drop Alerts'}
            </Button>
          </form>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-xs">
          
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Price<span className="text-blue-400">Pulse</span>
              </span>
            </Link>

            <p className="text-xs text-slate-300 font-semibold mb-2">
              "Track the Price. Predict the Moment. Buy Smarter."
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
              PricePulse runs longitudinal price monitoring across Amazon India and Flipkart, audits promotional discounts, and generates machine-learning timing recommendations.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Amazon & Flipkart Price Feeds Active</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Explore Products
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/products?category=smartphones" className="hover:text-blue-400 transition-colors">Smartphones</Link></li>
              <li><Link to="/products?category=laptops" className="hover:text-blue-400 transition-colors">Laptops</Link></li>
              <li><Link to="/products?category=headphones" className="hover:text-blue-400 transition-colors">Headphones</Link></li>
              <li><Link to="/products?category=earbuds" className="hover:text-blue-400 transition-colors">Earbuds</Link></li>
              <li><Link to="/products?category=smartwatches" className="hover:text-blue-400 transition-colors">Smartwatches</Link></li>
              <li><Link to="/products?category=monitors" className="hover:text-blue-400 transition-colors">Gaming Monitors</Link></li>
              <li><Link to="/products?category=tvs" className="hover:text-blue-400 transition-colors">Smart TVs</Link></li>
            </ul>
          </div>

          {/* Platform Pages */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Platform Pages
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/compare" className="hover:text-blue-400 transition-colors">Compare Products</Link></li>
              <li><Link to="/price-history" className="hover:text-blue-400 transition-colors">Price History Charts</Link></li>
              <li><Link to="/ai-insights" className="hover:text-blue-400 transition-colors">AI Buy / Wait Signals</Link></li>
              <li><Link to="/watchlist" className="hover:text-blue-400 transition-colors">Saved Watchlist</Link></li>
              <li><Link to="/price-alerts" className="hover:text-blue-400 transition-colors">Price Drop Alerts</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          {/* Company & Coverage */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              PricePulse
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><span className="text-amber-400 font-semibold">Amazon India Verified</span></li>
              <li><span className="text-blue-400 font-semibold">Flipkart Verified</span></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">User Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-blue-400 transition-colors">Create Account</Link></li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {CURRENT_YEAR} PricePulse AI. All product trademarks belong to their respective owners.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition-colors">About & FAQ</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-slate-400 transition-colors">Disclaimer</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
