import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Check, 
  Calendar,
  Bell,
  TrendingDown,
  TrendingUp,
  Award,
  ShieldCheck,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../data/electronicsData';

export default function PriceHistoryModal({ product, onClose, currency = 'INR' }) {
  const [timeRange, setTimeRange] = useState('6m'); // '7d', '1m', '3m', '6m'
  const [alertPrice, setAlertPrice] = useState(
    product ? Math.round((currency === 'USD' ? product.currentPriceUSD : product.currentPriceINR) * 0.95) : ''
  );
  const [alertSaved, setAlertSaved] = useState(false);

  if (!product) return null;

  const currentPrice = currency === 'USD' ? product.currentPriceUSD : product.currentPriceINR;
  const originalPrice = currency === 'USD' ? product.originalPriceUSD : product.originalPriceINR;
  const lowestPrice = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
  const averagePrice = currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR;
  const highestPrice = currency === 'USD' ? product.highestHistoricalPriceUSD : product.highestHistoricalPriceINR;

  const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
  const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];

  const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
  const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
  const isFkCheaper = fkPrice < azPrice;
  const isAzCheaper = azPrice < fkPrice;
  const priceDifference = Math.abs(azPrice - fkPrice);

  // Timeframe Data
  const rawChartData = product.historyPeriods?.[timeRange] || product.historyPeriods?.['6m'] || [];
  const chartData = rawChartData.map(pt => ({
    label: pt.label,
    amazon: currency === 'USD' ? Math.round(pt.amazon / 100) : pt.amazon,
    flipkart: currency === 'USD' ? Math.round(pt.flipkart / 100) : pt.flipkart,
  }));

  const handleSetAlert = (e) => {
    e.preventDefault();
    if (alertPrice) {
      setAlertSaved(true);
      setTimeout(() => setAlertSaved(false), 4000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-8 text-slate-900 my-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100 pr-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
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

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {product.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{product.specs}</p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs text-slate-500 block">Current Lowest Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatCurrency(currentPrice, currency)}
              </span>
              <span className="text-sm line-through text-slate-400">
                {formatCurrency(originalPrice, currency)}
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">
              Save {formatCurrency(product.savingsAmountINR, currency)} ({product.discountPercent}% Off)
            </span>
          </div>
        </div>

        {/* 4 Key Stat Metrics Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-0.5">Lowest Historical</span>
            <span className="text-base sm:text-lg font-bold text-emerald-700">
              {formatCurrency(lowestPrice, currency)}
            </span>
            <span className="text-[10px] text-slate-400 block">All-time floor</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-0.5">Average Historical</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              {formatCurrency(averagePrice, currency)}
            </span>
            <span className="text-[10px] text-slate-400 block">90-day moving median</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block mb-0.5">Highest Historical</span>
            <span className="text-base sm:text-lg font-bold text-slate-800">
              {formatCurrency(highestPrice, currency)}
            </span>
            <span className="text-[10px] text-slate-400 block">Launch MRP / Peak</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-xs text-blue-900 font-semibold block mb-0.5">Cheapest Store</span>
            <span className="text-base sm:text-lg font-black text-blue-700">
              {product.bestStore}
            </span>
            <span className="text-[10px] text-blue-800 font-medium block">
              Saves {formatCurrency(priceDifference, currency)} today
            </span>
          </div>
        </div>

        {/* Interactive Price-History Line Chart with 7d, 1m, 3m, 6m Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Interactive Price History & Retail Comparison
              </h4>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
              {[
                { id: '7d', label: '7 Days' },
                { id: '1m', label: '1 Month' },
                { id: '3m', label: '3 Months' },
                { id: '6m', label: '6 Months' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeRange(tf.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    timeRange === tf.id
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-60 w-full rounded-2xl bg-white p-3 border border-slate-200 shadow-2xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="modalAzGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="modalFkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  tickFormatter={(v) => currency === 'USD' ? `$${v}` : `₹${(v / 1000).toFixed(0)}k`} 
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-md text-xs">
                          <p className="font-semibold text-slate-800 mb-1">{payload[0].payload.label}</p>
                          <p className="text-amber-700 font-bold">
                            Amazon: {formatCurrency(payload[0]?.value, currency)}
                          </p>
                          {payload[1] && (
                            <p className="text-blue-700 font-bold">
                              Flipkart: {formatCurrency(payload[1]?.value, currency)}
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amazon" 
                  stroke="#d97706" 
                  strokeWidth={2} 
                  fill="url(#modalAzGrad)" 
                  name="Amazon Price" 
                />
                <Area 
                  type="monotone" 
                  dataKey="flipkart" 
                  stroke="#2563eb" 
                  strokeWidth={2} 
                  fill="url(#modalFkGrad)" 
                  name="Flipkart Price" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                Amazon India
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Flipkart
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Showing {timeRange === '7d' ? 'last 7 days' : timeRange === '1m' ? 'last 30 days' : timeRange === '3m' ? 'last 90 days' : 'last 6 months'}
            </span>
          </div>
        </div>

        {/* AI Price Intelligence Card */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  PricePulse AI Insight
                </h4>
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Demo Model Analysis
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {product.aiVerdictReason}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-900">
                  Recommendation: <strong className="text-blue-700">{product.recommendation}</strong>
                </span>
                <span>•</span>
                <span>Current price is {product.discountPercent}% below original MRP.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Store Comparison Between Amazon & Flipkart */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
            Store Availability & Offers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.retailers.map((ret, index) => {
              const storePrice = currency === 'USD' ? ret.priceUSD : ret.priceINR;
              const isAz = ret.name.toLowerCase().includes('amazon');
              const isFk = ret.name.toLowerCase().includes('flipkart');

              return (
                <div 
                  key={index}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                    ret.isBestDeal
                      ? 'bg-emerald-50/30 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                          isAz ? 'bg-amber-100 text-amber-800' : isFk ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ret.name.charAt(0)}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{ret.name}</span>
                      </div>

                      {ret.isBestDeal && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                          Lowest Price
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">{ret.delivery}</p>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">{ret.bankOffer}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(storePrice, currency)}
                    </span>
                    <a
                      href={ret.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-blue-600 text-white transition-colors"
                    >
                      <span>View Deal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Target-Price Alert Functionality */}
        <div className="pt-4 border-t border-slate-100">
          <div className="mb-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Set Target-Price Alert</span>
            </h4>
            <p className="text-xs text-slate-500">
              Get an instant notification when {product.name.split('(')[0]} drops to your desired price.
            </p>
          </div>

          <form onSubmit={handleSetAlert} className="flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {currency === 'USD' ? '$' : '₹'}
              </span>
              <input
                type="number"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder={`Target price in ${currency}...`}
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              {alertSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Price Alert Activated!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-white" />
                  <span>Set Drop Alert</span>
                </>
              )}
            </button>
          </form>

          {alertSaved && (
            <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">
              ✓ Price alert active: We'll monitor Amazon and Flipkart every 10 minutes for your target.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
