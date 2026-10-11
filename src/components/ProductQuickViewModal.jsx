import React from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  ArrowRight, 
  Star, 
  Bookmark, 
  Check, 
  TrendingDown, 
  ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function ProductQuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, formatPrice, isWatchlisted, toggleWatchlist, currency } = useApp();

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const watchlisted = isWatchlisted(product.id);

  const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
  const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];

  const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
  const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
  const lowest = Math.min(azPrice, fkPrice);
  const orig = currency === 'USD' ? product.originalPriceUSD : product.originalPriceINR;
  const floor = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
  const avg = currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR;

  const isFkCheaper = fkPrice < azPrice;
  const isAzCheaper = azPrice < fkPrice;

  const chartData = (product.historyPeriods?.['1m'] || product.historyPeriods?.['7d'] || []).map(pt => ({
    label: pt.label,
    price: currency === 'USD' ? Math.round(pt.amazon / 100) : pt.amazon,
  }));

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={() => setQuickViewProduct(null)}
    >
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-7 text-slate-900 my-6 max-h-[90vh] overflow-y-auto scale-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-3 pr-10">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
            {product.categoryName}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            product.recommendation === 'BUY NOW'
              ? 'badge-buy'
              : product.recommendation === 'WAIT'
              ? 'badge-wait'
              : 'badge-deal'
          }`}>
            {product.recommendation}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            Buy Score: {product.aiScore}/100
          </span>
        </div>

        {/* 2-Column: Image and Primary Info */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mb-5 items-start">
          <div className="sm:col-span-5">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 sm:h-52 rounded-xl object-cover bg-slate-50 border border-slate-200 shadow-2xs"
            />
          </div>

          <div className="sm:col-span-7">
            <h3 className="text-lg font-bold text-slate-900 mb-1 leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 mb-3">{product.specs}</p>

            {/* Price Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3">
              <span className="text-[10px] text-slate-500 block">Lowest Available Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {formatPrice(lowest)}
                </span>
                <span className="text-xs line-through text-slate-400">
                  {formatPrice(orig)}
                </span>
                <span className="text-xs font-bold text-emerald-700 ml-auto">
                  Save {formatPrice(product.savingsAmountINR)}
                </span>
              </div>
            </div>

            {/* Store Comparison Matrix */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                <span className="text-amber-900 font-bold">Amazon India:</span>
                <span className="font-extrabold text-slate-900">{formatPrice(azPrice)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/60 border border-blue-200">
                <span className="text-blue-900 font-bold">Flipkart:</span>
                <span className="font-extrabold text-slate-900">{formatPrice(fkPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price History Preview Graph */}
        <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700">30-Day Historical Trend</span>
            <span className="text-slate-500">Floor: <strong className="text-emerald-700">{formatPrice(floor)}</strong></span>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="quickViewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 p-1.5 rounded-lg text-xs shadow-xs">
                          <p className="font-bold text-blue-700">{formatPrice(payload[0]?.value)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} fill="url(#quickViewGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 mb-5 text-xs text-slate-700">
          <span className="font-bold text-blue-900 block mb-0.5">PricePulse AI Signal</span>
          <p>{product.aiVerdictReason}</p>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => toggleWatchlist(product.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              watchlisted
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {watchlisted ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{watchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
          </button>

          <Link
            to={productUrl}
            onClick={() => setQuickViewProduct(null)}
            className="flex-1 py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>View Full Details & Historical Analytics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
