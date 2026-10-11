import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Bookmark, 
  Bell, 
  TrendingDown, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  SlidersHorizontal,
  Trash2,
  Percent
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_PRODUCTS, getProductById } from '../data/electronicsData';
import ProductFlipCard from '../components/ProductFlipCard';

export default function DashboardPage() {
  const { 
    user, 
    watchlist, 
    toggleWatchlist, 
    priceAlerts, 
    removePriceAlert, 
    recentlyViewed, 
    currency,
    formatPrice,
    logout 
  } = useApp();

  const navigate = useNavigate();

  // Helper for product prices
  const getProductBestPrice = (p) => {
    if (!p) return 0;
    return currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR;
  };

  const getProductOriginalPrice = (p) => {
    if (!p) return 0;
    return currency === 'USD' ? p.originalPriceUSD : p.originalPriceINR;
  };

  // Watchlisted products
  const watchlistedProducts = watchlist
    .map(id => getProductById(id))
    .filter(Boolean);

  // Recently viewed products
  const recentProducts = recentlyViewed
    .map(id => getProductById(id))
    .filter(Boolean);

  // Top AI recommendations (Buy Score >= 80)
  const topRecommendations = ALL_PRODUCTS
    .filter(p => (p.aiScore || 0) >= 80)
    .slice(0, 4);

  // Calculate estimated total potential savings
  const totalPotentialSavings = watchlistedProducts.reduce((acc, p) => {
    const diff = currency === 'USD' ? (p.priceDifferenceUSD || 15) : (p.priceDifferenceINR || 1200);
    return acc + diff;
  }, 0);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* 1. Header & Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-xs font-medium text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Member Intelligence Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, <span className="text-cyan-400">{user?.name || 'Pulse Explorer'}</span>!
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
              Track price shifts across Amazon and Flipkart, manage your active price drop alerts, and monitor your personal electronics watchlist.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl border border-white/20 transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4 text-cyan-300" />
              Profile Settings
            </Link>
            <Link
              to="/products"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              Explore Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saved in Watchlist</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{watchlist.length}</div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-semibold flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Live
            </span>
            products actively monitored
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Price Alerts</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mb-1">{priceAlerts.length}</div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-amber-600 font-semibold">Instant</span> notification triggers ready
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Potential Savings</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mb-1">
            {formatPrice(totalPotentialSavings || 12400)}
          </div>
          <p className="text-xs text-slate-500">Available across lowest store options</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Intelligence Status</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">Active AI Sync</div>
          <p className="text-xs text-slate-500 flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-frequency polling
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Cols: Active Alerts & Watchlist Quick Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Price Alerts Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  Active Target Price Alerts
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  We verify your target price whenever store algorithms update.
                </p>
              </div>
              <Link
                to="/price-alerts"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Manage all ({priceAlerts.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {priceAlerts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No active price alerts set</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Set target drop alerts on any gadget to get notified.</p>
                <Link
                  to="/price-alerts"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                >
                  Create Target Alert
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {priceAlerts.slice(0, 4).map((alert) => {
                  const product = getProductById(alert.productId);
                  if (!product) return null;
                  const currentPrice = getProductBestPrice(product);
                  const diff = currentPrice - alert.targetPrice;
                  const isReached = diff <= 0;

                  return (
                    <div key={alert.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 object-contain bg-slate-50 rounded-xl p-1 border border-slate-200/80 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <Link 
                            to={`/products/${product.slug || product.id}`}
                            className="text-sm font-semibold text-slate-900 hover:text-blue-600 truncate block transition-colors"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>Current: <strong className="text-slate-800">{formatPrice(currentPrice)}</strong></span>
                            <span>•</span>
                            <span>Target: <strong className="text-blue-600">{formatPrice(alert.targetPrice)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {isReached ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Goal Reached!
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            ₹{Math.abs(diff).toLocaleString('en-IN')} away
                          </span>
                        )}
                        <button
                          onClick={() => removePriceAlert(alert.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Watchlist Summary Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-blue-600" />
                  Your Watchlist Spotlight
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Personal shortlist of tracked electronics.
                </p>
              </div>
              <Link
                to="/watchlist"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View full watchlist ({watchlist.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {watchlistedProducts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No products saved yet</p>
                <p className="text-xs text-slate-500 mt-1 mb-4">Click the bookmark icon on any product card to track it.</p>
                <Link
                  to="/products"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5"
                >
                  Browse Electronics
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {watchlistedProducts.slice(0, 4).map((product) => (
                  <div 
                    key={product.id}
                    className="p-4 rounded-xl border border-slate-200/90 hover:border-blue-400 bg-white hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-14 h-14 object-contain rounded-lg p-1 bg-slate-50 border border-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {product.category}
                        </span>
                        <Link 
                          to={`/products/${product.slug || product.id}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-600 truncate block mt-1 transition-colors"
                        >
                          {product.name}
                        </Link>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Lowest at <span className="font-semibold text-slate-800 capitalize">{product.bestStore}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <div className="text-xs text-slate-400 line-through">
                          {formatPrice(getProductOriginalPrice(product))}
                        </div>
                        <div className="text-base font-extrabold text-blue-600">
                          {formatPrice(getProductBestPrice(product))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWatchlist(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Account Card & Quick Recommendations */}
        <div className="space-y-8">
          {/* User Account Quick Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center gap-3.5 mb-5 pb-5 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                {user?.name ? user.name[0].toUpperCase() : 'P'}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-base truncate">{user?.name || 'Pulse Shopper'}</h3>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'shopper@pricepulse.in'}</p>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> PricePulse Verified
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Account Status</span>
                <span className="font-bold text-slate-800">Pro Member</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Monitoring Interval</span>
                <span className="font-bold text-slate-800">Every 15 mins</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Default Currency</span>
                <span className="font-bold text-blue-600">INR (₹)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                to="/profile"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Edit Profile & Preferences
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors"
              >
                Sign Out Safely
              </button>
            </div>
          </div>

          {/* AI Deal Recommendations Box */}
          <div className="bg-gradient-to-br from-blue-50/60 to-cyan-50/40 rounded-2xl border border-blue-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Recommended For You
              </h3>
              <Link to="/ai-insights" className="text-[11px] font-semibold text-blue-600 hover:underline">
                All AI Deals
              </Link>
            </div>

            <div className="space-y-3">
              {topRecommendations.map((prod) => (
                <Link
                  key={prod.id}
                  to={`/products/${prod.slug || prod.id}`}
                  className="p-3 bg-white rounded-xl border border-blue-100/80 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-3 block"
                >
                  <img 
                    src={prod.image} 
                    alt={prod.name} 
                    className="w-10 h-10 object-contain p-0.5 rounded-lg bg-slate-50"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {prod.name}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-extrabold text-blue-600">
                        {formatPrice(getProductBestPrice(prod))}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        Score {prod.aiScore || 85}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recently Viewed Products Grid with 3D Flip Cards */}
      {recentProducts.length > 0 && (
        <section className="mt-12 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600" />
                Recently Browsed Products
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pick up where you left off. Click "Flip Card" for side-by-side store pricing and AI scores.
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Explore all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product) => (
              <ProductFlipCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
