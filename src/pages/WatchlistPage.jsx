import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  TrendingDown, 
  ExternalLink, 
  SlidersHorizontal,
  Bell,
  Check
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function WatchlistPage() {
  const { watchlist, toggleWatchlist, formatPrice, currency, addPriceAlert } = useApp();

  const watchlistedProducts = TRENDING_PRODUCTS.filter(p => watchlist.includes(p.id));

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Personal Tracking Tray</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My <span className="text-blue-600">Watchlist</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Track live price movements across Amazon and Flipkart for your saved electronics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/products"
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
            >
              + Add More Devices
            </Link>
            <Link
              to="/price-alerts"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Manage Price Alerts
            </Link>
          </div>
        </div>

        {/* Watchlist Products Grid / Table */}
        {watchlistedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlistedProducts.map((product) => {
              const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
              const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
              const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
              const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
              const lowest = Math.min(azPrice, fkPrice);
              const orig = currency === 'USD' ? product.originalPriceUSD : product.originalPriceINR;
              const floor = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
              const isFkCheaper = fkPrice < azPrice;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:shadow-card-hover transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                        {product.categoryName}
                      </span>

                      <button
                        onClick={() => toggleWatchlist(product.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image & Title */}
                    <div className="relative mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 rounded-xl object-cover bg-slate-50 border border-slate-200"
                      />
                      <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                        product.recommendation === 'BUY NOW' ? 'badge-buy' : product.recommendation === 'WAIT' ? 'badge-wait' : 'badge-deal'
                      }`}>
                        {product.recommendation}
                      </span>
                    </div>

                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block mb-0.5"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                      {product.specs}
                    </p>

                    {/* Price Overview */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Lowest Price</span>
                          <span className="text-xl font-black text-slate-900">{formatPrice(lowest)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Save {formatPrice(product.savingsAmountINR)}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                            Floor: {formatPrice(floor)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Store Breakdown */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs font-mono mb-4">
                      <div className="flex justify-between">
                        <span className="text-amber-800 font-bold">Amazon:</span>
                        <span className="font-semibold text-slate-800">{formatPrice(azPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-800 font-bold">Flipkart:</span>
                        <span className="font-semibold text-slate-800">{formatPrice(fkPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => addPriceAlert(product.id, Math.round(lowest * 0.95))}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                      title="Set target price alert"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">Your Watchlist is empty</h3>
            <p className="text-xs text-slate-500 mb-6">
              Bookmark electronics on the product catalog to track price drops across Amazon and Flipkart.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              <span>Explore Electronics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
