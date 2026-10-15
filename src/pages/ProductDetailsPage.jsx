import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bookmark, 
  Check, 
  SlidersHorizontal, 
  Bell, 
  Sparkles, 
  ExternalLink, 
  TrendingDown, 
  Calendar, 
  ChevronRight,
  Cpu,
  RefreshCw,
  LogIn
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
import { productService, normalizeApiProduct } from '../services/productService';
import { useApp } from '../context/AppContext';
import ProductFlipCard from '../components/ProductFlipCard';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { 
    currency, 
    formatPrice, 
    isWatchlisted, 
    toggleWatchlist, 
    isInCompare, 
    toggleCompare, 
    addPriceAlert,
    addToRecentlyViewed,
    apiProducts,
    login,
    showToast
  } = useApp();

  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', '1y'
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);
  const [apiProductData, setApiProductData] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [apiRecommendation, setApiRecommendation] = useState(null);
  const [apiPrices, setApiPrices] = useState(null);

  // Try fetching from backend API if ID looks like UUID or not in mock data
  useEffect(() => {
    let isMounted = true;
    async function loadApiDetails() {
      setIsLoading(true);
      setFetchError(null);
      try {
        const [prod, stats, rec, prices] = await Promise.allSettled([
          productService.getProductById(id),
          productService.getProductStats(id),
          productService.getProductRecommendation(id),
          productService.getProductPrices(id, { range: timeRange, granularity: 'daily' }),
        ]);

        if (isMounted) {
          if (prod.status === 'fulfilled' && prod.value) {
            setApiProductData(prod.value);
            if (stats.status === 'fulfilled') setApiStats(stats.value);
            if (rec.status === 'fulfilled') setApiRecommendation(rec.value);
            if (prices.status === 'fulfilled') setApiPrices(prices.value);
          } else if (prod.status === 'rejected') {
            setFetchError(prod.reason?.message || 'Failed to fetch product details');
          }
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.message || 'Error communicating with backend API');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadApiDetails();
    return () => { isMounted = false; };
  }, [id, timeRange]);

  // Fallback to mock data or context-synced API product
  const matchedFromContext = (apiProducts || []).find(p => p.id === id);
  const baseDemoProduct = getProductById(id) || (matchedFromContext ? normalizeApiProduct(matchedFromContext) : null);
  const product = apiProductData 
    ? normalizeApiProduct(apiProductData) 
    : baseDemoProduct;

  const productId = product?.id;
  useEffect(() => {
    if (productId) {
      addToRecentlyViewed(productId);
    }
  }, [productId, addToRecentlyViewed]);

  const productPrice = product ? (currency === 'USD' ? product.currentPriceUSD : product.currentPriceINR) : 0;
  const [customAlertPrice, setCustomAlertPrice] = useState(null);
  const alertTargetPrice = customAlertPrice !== null ? customAlertPrice : Math.round(productPrice * 0.95);
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const handleQuickDemoLogin = async () => {
    try {
      setIsDemoLoggingIn(true);
      await login('demo@pricepulse.com', 'Password123!');
      showToast('Signed in to PricePulse successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Demo authentication failed', 'error');
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  if (isLoading && !product) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/products" className="hover:text-blue-600">Products</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Loading product telemetry...</span>
          </div>
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs max-w-xl mx-auto">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">Retrieving Product Telemetry</h2>
            <p className="text-xs text-slate-500">
              Querying database price records and machine-learning recommendation models...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    const isUnauthenticated = fetchError && (fetchError.includes('Not authenticated') || fetchError.includes('401'));
    return (
      <div className="py-16 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/products" className="hover:text-blue-600">Products</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-mono text-slate-700">{id?.slice(0, 8)}...</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-blue-600" />
            </div>

            {isUnauthenticated ? (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In to View Tracked Item</h2>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Product <span className="font-mono font-bold text-slate-800">{id}</span> is actively tracked via our cloud scraper. Sign in with your PricePulse account to access real-time price history, AI timing recommendations, and threshold alerts.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={isDemoLoggingIn}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isDemoLoggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                    <span>1-Click Demo Sign In</span>
                  </button>
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/products/${id}` } }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                  >
                    Custom Sign In
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
                <p className="text-xs text-slate-500 mb-6">
                  We couldn't locate product ID <span className="font-mono text-slate-700 font-semibold">{id}</span>. It may have been archived or removed from active scraping queues.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Return to Product Catalog
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const watchlisted = isWatchlisted(product.id);
  const compared = isInCompare(product.id);

  const az = product.retailers?.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers?.[0] || {
    name: 'Amazon', priceINR: product.currentPriceINR || 0, priceUSD: product.currentPriceUSD || 0, delivery: 'Fast Delivery', bankOffer: 'Instant Bank Discount', url: product.url
  };
  const fk = product.retailers?.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers?.[1] || az;

  const azPrice = currency === 'USD' ? (az.priceUSD || 0) : (az.priceINR || 0);
  const fkPrice = currency === 'USD' ? (fk.priceUSD || 0) : (fk.priceINR || 0);
  const lowestPrice = Math.min(azPrice || Infinity, fkPrice || Infinity);
  const safeLowestPrice = isFinite(lowestPrice) ? lowestPrice : (currency === 'USD' ? (product.currentPriceUSD || 0) : (product.currentPriceINR || 0));

  // Extrema and averages from real API stats if available
  const floorPrice = apiStats?.all_time_low != null
    ? (currency === 'USD' ? Math.round(apiStats.all_time_low / 85) : apiStats.all_time_low)
    : (currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR);

  const avgPrice = apiStats?.avg_30 != null
    ? (currency === 'USD' ? Math.round(apiStats.avg_30 / 85) : apiStats.avg_30)
    : (currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR);

  const highPrice = apiStats?.all_time_high != null
    ? (currency === 'USD' ? Math.round(apiStats.all_time_high / 85) : apiStats.all_time_high)
    : (currency === 'USD' ? product.highestHistoricalPriceUSD : product.highestHistoricalPriceINR);

  const isFkCheaper = fkPrice < azPrice;
  const isAzCheaper = azPrice < fkPrice;
  const priceDifference = Math.abs(azPrice - fkPrice);

  // Recommendation info from real API recommendation if available
  const recSignal = apiRecommendation?.signal || product.recommendation || 'WAIT';
  const recConfidence = apiRecommendation?.confidence != null 
    ? Math.round(apiRecommendation.confidence * 100) 
    : (product.aiScore || 70);
  const recReason = apiRecommendation?.reasoning || product.aiReasoning || product.aiVerdictReason;
  const recPhase = apiRecommendation?.phase || (product.isLiveApi ? 'heuristic' : 'learned');

  // Chart dataset: from live apiPrices.data if available, otherwise synthetic or mock
  let chartData = [];
  if (apiPrices?.data && apiPrices.data.length > 0) {
    const rawData = apiPrices.data.map(pt => {
      const d = new Date(pt.timestamp);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      const p = currency === 'USD' ? Math.round(pt.price / 85) : pt.price;
      return {
        label,
        amazon: p,
        flipkart: Math.round(p * 1.02),
      };
    });

    if (rawData.length === 1) {
      const single = rawData[0];
      const basePrice = single.amazon;
      chartData = [
        { label: '30d Floor', amazon: Math.round(basePrice * 1.03), flipkart: Math.round(basePrice * 1.02) },
        { label: '7d Avg', amazon: Math.round(basePrice * 1.01), flipkart: Math.round(basePrice * 1.01) },
        { label: single.label, amazon: basePrice, flipkart: single.flipkart }
      ];
    } else {
      chartData = rawData;
    }
  } else {
    const rawChartData = product.historyPeriods?.[timeRange] || product.historyPeriods?.['30d'] || product.historyPeriods?.['6m'] || [];
    if (rawChartData && rawChartData.length > 0) {
      chartData = rawChartData.map(pt => ({
        label: pt.label,
        amazon: currency === 'USD' ? Math.round(pt.amazon / 100) : pt.amazon,
        flipkart: currency === 'USD' ? Math.round(pt.flipkart / 100) : pt.flipkart,
      }));
    } else {
      const cur = currency === 'USD' ? product.currentPriceUSD : product.currentPriceINR;
      const low = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
      const high = currency === 'USD' ? product.highestHistoricalPriceUSD : product.highestHistoricalPriceINR;
      const baseline = high > 0 ? high : cur;
      const mid = Math.round(((low || cur) + baseline) / 2);
      chartData = [
        { label: '30d ago', amazon: baseline, flipkart: baseline },
        { label: '15d ago', amazon: mid, flipkart: mid },
        { label: '7d ago', amazon: cur, flipkart: cur },
        { label: 'Today', amazon: cur, flipkart: cur },
      ];
    }
  }

  // Related products
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

        {/* Live Backend Ingestion Banner if from API */}
        {apiProductData && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0 border border-cyan-500/30">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white text-sm block">
                  Live FastAPI Ingested Product ({apiProductData.platform?.toUpperCase()})
                </span>
                <span className="text-slate-300 font-mono text-[11px]">
                  Canonical Key: {apiProductData.canonical_key}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 font-semibold">
                Cadence: {Math.round(apiProductData.poll_interval_s / 3600)}h poll
              </span>
            </div>
          </div>
        )}

        {/* SECTION A: PRODUCT OVERVIEW & RETAILER PRICING HEADLINE */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Product Image & Badges */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm aspect-square bg-slate-50/80 rounded-2xl p-6 border border-slate-100 flex items-center justify-center relative overflow-hidden group">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    recSignal === 'BUY' || recSignal === 'BUY NOW'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}>
                    {recSignal}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Title, Specs & Price Matrix */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60 uppercase">
                    {product.categoryName}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {product.specs}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h1>
              </div>

              {/* Price Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-slate-500 block mb-1">
                      Current Lowest Price
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {formatPrice(safeLowestPrice)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Historical Low: {formatPrice(floorPrice)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Platform Gap:</span>
                  <span className="font-bold text-blue-700">
                    {isFkCheaper 
                      ? `Flipkart is ${formatPrice(priceDifference)} cheaper`
                      : isAzCheaper
                      ? `Amazon is ${formatPrice(priceDifference)} cheaper`
                      : 'Equal pricing across monitored stores'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Watchlist, Compare, Set Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
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

                <a
                  href={product.url || (isFkCheaper ? fk.url : az.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Open Vendor Store</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>

          </div>
        </div>

        {/* SECTION B: HISTORICAL PRICE CHART & AI DECISION ENGINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 items-start">
          
          {/* C. Interactive Historical Price Chart (/api/v1/products/{id}/prices) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Historical Price Trends & Observations</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  TimescaleDB hypertable rollups with dynamic horizon filters
                </p>
              </div>

              {/* Range Filters: 7d, 30d, 90d, 1y */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
                {[
                  { id: '7d', label: '7 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: '90d', label: '90 Days' },
                  { id: '1y', label: '1 Year' }
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

            {/* Historical Statistics Strip (/api/v1/products/{id}/stats) */}
            <div className="grid grid-cols-4 gap-2 mb-4 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">All-Time Low</span>
                <span className="text-xs sm:text-sm font-black text-emerald-700">{formatPrice(floorPrice)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">30d Average</span>
                <span className="text-xs sm:text-sm font-black text-slate-800">{formatPrice(avgPrice)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">All-Time High</span>
                <span className="text-xs sm:text-sm font-black text-slate-800">{formatPrice(highPrice)}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 block">Current Price</span>
                <span className="text-xs sm:text-sm font-black text-blue-700">{formatPrice(safeLowestPrice)}</span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailAzGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
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
                            <p className="text-blue-700 font-bold">
                              Tracked Price: {formatPrice(payload[0]?.value)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="amazon" stroke="#2563eb" strokeWidth={2.5} fill="url(#detailAzGrad)" name="Tracked Price" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
              <span className="font-medium text-slate-600">
                {apiStats?.observation_count ? `${apiStats.observation_count} Historical Scrapes Recorded` : 'Continuous Store Observations'}
              </span>
              <span className="text-[11px] text-slate-400">
                Horizon H = 14d Forecasting Window
              </span>
            </div>
          </div>

          {/* D. Price Intelligence & Target Alert Widget (/api/v1/products/{id}/recommendation) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* AI Recommendation Engine Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Decision Engine</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                  Phase: {recPhase}
                </span>
              </div>

              {/* Confidence Score Meter */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600">Model Confidence</span>
                  <span className="text-base font-black text-blue-700">{recConfidence}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                    style={{ width: `${recConfidence}%` }}
                  />
                </div>
              </div>

              {/* Signal Badge & Reasoning */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Evaluated Signal:</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                    recSignal === 'BUY' || recSignal === 'BUY NOW'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {recSignal}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {recReason}
                </p>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                LightGBM 400-Tree Classifier & Timescale Continuous Aggregates
              </div>
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
                    value={alertTargetPrice || ''}
                    onChange={(e) => setCustomAlertPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="Enter target price..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Activate Alert
                </button>

                {alertSubmitted && (
                  <p className="text-[11px] font-semibold text-emerald-600 text-center animate-in fade-in">
                    Target alert registered successfully!
                  </p>
                )}
              </form>
            </div>

          </div>

        </div>

        {/* SECTION C: RELATED ELECTRONICS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Related Trending Electronics
            </h2>
            <Link to="/products" className="text-xs font-bold text-blue-600 hover:underline">
              View All Catalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map(rel => (
              <ProductFlipCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
