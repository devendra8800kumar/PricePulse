import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bookmark, 
  Check, 
  SlidersHorizontal, 
  Bell, 
  Sparkles, 
  ExternalLink, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Star, 
  Truck, 
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { getProductById, TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';
import ProductFlipCard from '../components/ProductFlipCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currency, 
    formatPrice, 
    isWatchlisted, 
    toggleWatchlist, 
    isInCompare, 
    toggleCompare, 
    addPriceAlert,
    addToRecentlyViewed,
    showToast
  } = useApp();

  const product = getProductById(id) || TRENDING_PRODUCTS[0];

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product.id);
    }
  }, [product?.id]);

  const [timeRange, setTimeRange] = useState('6m'); // '7d', '1m', '3m', '6m'
  const [alertTargetPrice, setAlertTargetPrice] = useState(
    product ? Math.round((currency === 'USD' ? product.currentPriceUSD : product.currentPriceINR) * 0.95) : 0
  );
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <Link to="/products" className="text-sm font-semibold text-blue-600 hover:underline">
          Return to Product Catalog
        </Link>
      </div>
    );
  }

  const watchlisted = isWatchlisted(product.id);
  const compared = isInCompare(product.id);

  const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
  const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];

  const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
  const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
  const lowestPrice = Math.min(azPrice, fkPrice);
  const origPrice = currency === 'USD' ? product.originalPriceUSD : product.originalPriceINR;
  const floorPrice = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
  const avgPrice = currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR;
  const highPrice = currency === 'USD' ? product.highestHistoricalPriceUSD : product.highestHistoricalPriceINR;

  const isFkCheaper = fkPrice < azPrice;
  const isAzCheaper = azPrice < fkPrice;
  const priceDifference = Math.abs(azPrice - fkPrice);

  // Time-range chart dataset
  const rawChartData = product.historyPeriods?.[timeRange] || product.historyPeriods?.['6m'] || [];
  const chartData = rawChartData.map(pt => ({
    label: pt.label,
    amazon: currency === 'USD' ? Math.round(pt.amazon / 100) : pt.amazon,
    flipkart: currency === 'USD' ? Math.round(pt.flipkart / 100) : pt.flipkart,
  }));

  // Related products in the same category or overall catalog
  const relatedProducts = TRENDING_PRODUCTS.filter(p => p.id !== product.id).slice(0, 3);

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (alertTargetPrice) {
      addPriceAlert(product.id, alertTargetPrice);
      setAlertSubmitted(true);
      setTimeout(() => setAlertSubmitted(false), 4000);
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/products" className="hover:text-blue-600 transition-colors">Products</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous page</span>
        </button>

        {/* SECTION A: PRODUCT OVERVIEW & KEY HERO DETAILS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-8 shadow-2xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Large Product Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-2 shadow-2xs">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 sm:h-96 object-cover object-center rounded-xl"
                />

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/95 text-slate-800 border border-slate-200 shadow-xs">
                    {product.categoryName}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-xs ${
                    product.recommendation === 'BUY NOW'
                      ? 'badge-buy'
                      : product.recommendation === 'WAIT'
                      ? 'badge-wait'
                      : 'badge-deal'
                  }`}>
                    {product.recommendation}
                  </span>
                </div>
              </div>
            </div>

            {/* Product Meta, Specs, Price, and Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-800">{product.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{product.reviewsCount?.toLocaleString()} verified shopper reviews</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {product.name}
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {product.specs}
                </p>

                {/* Main Price Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500 block">Lowest Current Price:</span>
                      <div className="flex items-baseline gap-3 mt-0.5">
                        <span className="text-3xl sm:text-4xl font-black text-slate-900">
                          {formatPrice(lowestPrice)}
                        </span>
                        <span className="text-base line-through text-slate-400">
                          {formatPrice(origPrice)}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Save {formatPrice(product.savingsAmountINR)} ({product.discountPercent}% OFF)
                      </span>
                      <span className="text-xs text-slate-500 block mt-1">
                        Cheapest on <strong className="text-slate-900">{product.bestStore}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Cheapest Platform Highlight Indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Platform Price Gap:</span>
                    <span className="font-bold text-blue-700">
                      {isFkCheaper 
                        ? `Flipkart is ${formatPrice(priceDifference)} cheaper today`
                        : isAzCheaper
                        ? `Amazon India is ${formatPrice(priceDifference)} cheaper today`
                        : 'Both Amazon and Flipkart match prices today'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Watchlist, Compare, Set Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                
                {/* Watchlist Action */}
                <button
                  type="button"
                  onClick={() => toggleWatchlist(product.id)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border cursor-pointer ${
                    watchlisted
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {watchlisted ? <Check className="w-4 h-4 text-blue-600" /> : <Bookmark className="w-4 h-4" />}
                  <span>{watchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
                </button>

                {/* Compare Action */}
                <button
                  type="button"
                  onClick={() => toggleCompare(product.id)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border cursor-pointer ${
                    compared
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>{compared ? 'In Comparison' : 'Add to Compare'}</span>
                </button>

                {/* Direct Store CTA */}
                <a
                  href={isFkCheaper ? fk.url : az.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Buy on {product.bestStore}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

              </div>

            </div>

          </div>
        </div>

        {/* SECTION B: AMAZON VS FLIPKART REAL-TIME STORE MATRIX */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>Amazon India vs Flipkart Head-to-Head Comparison</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amazon Card */}
            <div className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between ${
              isAzCheaper 
                ? 'bg-amber-50/60 border-amber-300 shadow-xs ring-1 ring-amber-300'
                : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                      A
                    </span>
                    <span className="font-bold text-slate-900 text-sm">Amazon India</span>
                  </div>

                  {isAzCheaper && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
                      Lowest Price Winner
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-xs text-slate-500 block">Store Price</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatPrice(azPrice)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{az.delivery}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-amber-800 font-medium">{az.bankOffer}</span>
                  </div>
                </div>
              </div>

              <a
                href={az.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View Offer on Amazon India</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Flipkart Card */}
            <div className={`p-5 rounded-2xl border transition-colors flex flex-col justify-between ${
              isFkCheaper 
                ? 'bg-blue-50/60 border-blue-300 shadow-xs ring-1 ring-blue-300'
                : 'bg-white border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                      F
                    </span>
                    <span className="font-bold text-slate-900 text-sm">Flipkart</span>
                  </div>

                  {isFkCheaper && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                      Lowest Price Winner
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <span className="text-xs text-slate-500 block">Store Price</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatPrice(fkPrice)}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{fk.delivery}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-blue-800 font-medium">{fk.bankOffer}</span>
                  </div>
                </div>
              </div>

              <a
                href={fk.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View Offer on Flipkart</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* SECTION C & D: HISTORICAL PRICE CHART & AI PRICE INTELLIGENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-start">
          
          {/* C. Interactive Historical Price Chart */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Historical Price Trends & Volatility</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dual-store price tracking with time-range filtering
                </p>
              </div>

              {/* Range Filters: 7d, 1m, 3m, 6m */}
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
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      timeRange === tf.id
                        ? 'bg-white text-blue-600 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Historical Statistics Strip */}
            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Lowest Floor</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700">{formatPrice(floorPrice)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Recent Average</span>
                <span className="text-xs sm:text-sm font-black text-slate-800">{formatPrice(avgPrice)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Peak / Launch</span>
                <span className="text-xs sm:text-sm font-black text-slate-800">{formatPrice(highPrice)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Current Price</span>
                <span className="text-xs sm:text-sm font-black text-blue-700">{formatPrice(lowestPrice)}</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailAzGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="detailFkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
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
                              Amazon: {formatPrice(payload[0]?.value)}
                            </p>
                            {payload[1] && (
                              <p className="text-blue-700 font-bold">
                                Flipkart: {formatPrice(payload[1]?.value)}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="amazon" stroke="#d97706" strokeWidth={2} fill="url(#detailAzGrad)" name="Amazon" />
                  <Area type="monotone" dataKey="flipkart" stroke="#2563eb" strokeWidth={2} fill="url(#detailFkGrad)" name="Flipkart" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  Amazon Price
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Flipkart Price
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Continuous Market Observations (Simulated Historical Baseline)
              </span>
            </div>
          </div>

          {/* D. Price Intelligence & Target Alert Widget */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* AI Intelligence Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">PricePulse AI Insight</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                  Demo Rule Engine
                </span>
              </div>

              {/* Buy Score Meter */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">Buy Confidence Score</span>
                  <span className="text-base font-black text-blue-700">{product.aiScore}/100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${product.aiScore}%` }}
                  />
                </div>
              </div>

              {/* Recommendation Badge & Reason */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">System Recommendation:</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    product.recommendation === 'BUY NOW'
                      ? 'badge-buy'
                      : product.recommendation === 'WAIT'
                      ? 'badge-wait'
                      : 'badge-deal'
                  }`}>
                    {product.recommendation}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {product.aiVerdictReason}
                </p>
              </div>

              <ul className="space-y-1.5 text-xs text-slate-600 mb-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>{formatPrice(lowestPrice - floorPrice)} above all-time historical low</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  <span>{product.discountPercent}% below original launch price</span>
                </li>
              </ul>
            </div>

            {/* Target Price Alert Form */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Set Target-Price Alert</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Receive an instant alert when this gadget drops to your threshold.
              </p>

              <form onSubmit={handleCreateAlert} className="space-y-2.5">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currency === 'USD' ? '$' : '₹'}
                  </span>
                  <input
                    type="number"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    placeholder="Enter target price..."
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {alertSubmitted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Alert Activated!</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5" />
                      <span>Activate Drop Alert</span>
                    </>
                  )}
                </button>
              </form>

              {alertSubmitted && (
                <p className="text-[11px] text-emerald-700 font-semibold mt-2 text-center">
                  Target alert saved. We will notify you when price hits {formatPrice(alertTargetPrice)}.
                </p>
              )}
            </div>

          </div>

        </div>

        {/* SECTION E: RELATED & ALTERNATIVE PRODUCTS */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              Related Electronics & Alternatives
            </h2>
            <Link to="/products" className="text-xs font-bold text-blue-600 hover:underline">
              View All Products →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <ProductFlipCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
