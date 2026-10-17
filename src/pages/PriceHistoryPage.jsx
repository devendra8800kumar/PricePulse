import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  Calendar, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Info, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { normalizeApiProduct, productService } from '../services/productService';
import { useApp } from '../context/AppContext';

export default function PriceHistoryPage() {
  const { currency, formatPrice, apiProducts } = useApp();
  const [selectedProductId, setSelectedProductId] = useState(() => {
    return apiProducts?.[0]?.id || TRENDING_PRODUCTS[0].id;
  });
  const [timeRange, setTimeRange] = useState('6m'); // '7d', '1m', '3m', '6m'
  const [searchFilter, setSearchFilter] = useState('');
  const [apiChartData, setApiChartData] = useState(null);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Merge live API products with demo catalog
  const allAvailableProducts = React.useMemo(() => {
    const normalizedApi = (apiProducts || []).map(normalizeApiProduct).filter(Boolean);
    const apiIds = new Set(normalizedApi.map(p => p.id));
    const dedupedDemo = TRENDING_PRODUCTS.filter(p => !apiIds.has(p.id));
    return [...normalizedApi, ...dedupedDemo];
  }, [apiProducts]);

  const activeProduct = allAvailableProducts.find(p => p.id === selectedProductId) || allAvailableProducts[0] || TRENDING_PRODUCTS[0];

  // Fetch live price history for live backend products
  React.useEffect(() => {
    let isMounted = true;
    if (activeProduct?.isLiveApi) {
      setIsChartLoading(true);
      const rangeMap = { '7d': '7d', '1m': '30d', '3m': '90d', '6m': '90d' };
      productService.getProductPrices(activeProduct.id, { range: rangeMap[timeRange] || '30d', granularity: 'daily' })
        .then(res => {
          if (isMounted && res?.data) {
            setApiChartData(res.data);
          }
        })
        .catch(() => {
          if (isMounted) setApiChartData(null);
        })
        .finally(() => {
          if (isMounted) setIsChartLoading(false);
        });
    } else {
      setApiChartData(null);
    }
    return () => { isMounted = false; };
  }, [activeProduct?.id, activeProduct?.isLiveApi, timeRange]);

  const filteredProducts = allAvailableProducts.filter(p => 
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.categoryName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const az = activeProduct.retailers?.find(r => r.name.toLowerCase().includes('amazon')) || activeProduct.retailers?.[0] || { priceINR: activeProduct.currentPriceINR, priceUSD: activeProduct.currentPriceUSD };
  const fk = activeProduct.retailers?.find(r => r.name.toLowerCase().includes('flipkart')) || activeProduct.retailers?.[1] || az;

  const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
  const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
  const lowestPrice = Math.min(azPrice, fkPrice);
  const floorPrice = currency === 'USD' ? activeProduct.lowestHistoricalPriceUSD : activeProduct.lowestHistoricalPriceINR;
  const avgPrice = currency === 'USD' ? activeProduct.averageHistoricalPriceUSD : activeProduct.averageHistoricalPriceINR;
  const highPrice = currency === 'USD' ? activeProduct.highestHistoricalPriceUSD : activeProduct.highestHistoricalPriceINR;

  let chartData = [];
  if (activeProduct.isLiveApi && apiChartData && apiChartData.length > 0) {
    const rawData = apiChartData.map(pt => {
      const d = new Date(pt.timestamp);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      const p = currency === 'USD' ? Math.round(pt.price / 85) : Math.round(pt.price);
      return {
        label,
        amazon: p,
        flipkart: Math.round(p * 1.02),
      };
    });

    if (rawData.length === 1) {
      const single = rawData[0];
      const base = single.amazon;
      chartData = [
        { label: '30d Floor', amazon: Math.round(base * 1.04), flipkart: Math.round(base * 1.03) },
        { label: '7d Avg', amazon: Math.round(base * 1.01), flipkart: Math.round(base * 1.02) },
        { label: single.label, amazon: base, flipkart: single.flipkart }
      ];
    } else {
      chartData = rawData;
    }
  } else {
    const rawChartData = activeProduct.historyPeriods?.[timeRange] || activeProduct.historyPeriods?.['6m'] || [];
    if (rawChartData && rawChartData.length > 0) {
      chartData = rawChartData.map(pt => ({
        label: pt.label,
        amazon: currency === 'USD' ? Math.round(pt.amazon / 100) : pt.amazon,
        flipkart: currency === 'USD' ? Math.round(pt.flipkart / 100) : pt.flipkart,
      }));
    } else {
      chartData = [
        { label: '30d ago', amazon: highPrice, flipkart: highPrice },
        { label: '14d ago', amazon: avgPrice, flipkart: avgPrice },
        { label: 'Today', amazon: lowestPrice, flipkart: lowestPrice }
      ];
    }
  }


  return (
    <div className="py-8 bg-slate-50 dark:bg-[#0b0f19] min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5 text-blue-600" />
            <span>Longitudinal Price Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Historical <span className="text-blue-600">Price Analysis</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Detect artificial discount spikes before sales. View genuine 7-day to 6-month price trends across Amazon India and Flipkart.
          </p>
        </div>

        {/* Demo Data Disclaimer Badge */}
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 mb-6 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Transparency Disclosure:</strong> Historical price points shown represent simulated baseline data modeled from historical Indian e-commerce sale records (Diwali sales, Prime Day, Big Billion Days) for demonstration purposes.
          </div>
        </div>

        {/* 2-Column: Product Selector Sidebar + Interactive Chart Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Product Selector List */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Select Device to Analyze
            </h3>

            {/* Quick Filter */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter gadgets..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-between ${
                    selectedProductId === p.id
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate max-w-[170px]">{p.name}</p>
                      <p className="text-[10px] text-slate-500">{p.categoryName}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                    p.recommendation === 'BUY NOW' ? 'badge-buy' : p.recommendation === 'WAIT' ? 'badge-wait' : 'badge-deal'
                  }`}>
                    {p.recommendation}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Deep Chart Analysis */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Active Device Overview Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {activeProduct.categoryName}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                      {activeProduct.name}
                    </h2>
                  </div>
                </div>

                <Link
                  to={`/products/${activeProduct.slug || activeProduct.id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
                >
                  <span>Full Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Range Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Time Range:</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
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

              {/* 4 Stat Tiles: Minimum, Maximum, Average, Volatility */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Historical Minimum</span>
                  <span className="text-sm sm:text-base font-black text-emerald-700">{formatPrice(floorPrice)}</span>
                  <span className="text-[10px] text-slate-400 block">Record Floor</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Historical Maximum</span>
                  <span className="text-sm sm:text-base font-black text-slate-800">{formatPrice(highPrice)}</span>
                  <span className="text-[10px] text-slate-400 block">Peak Launch MRP</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Average Price</span>
                  <span className="text-sm sm:text-base font-black text-slate-800">{formatPrice(avgPrice)}</span>
                  <span className="text-[10px] text-slate-400 block">Moving Median</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[10px] text-blue-900 font-semibold block">Price Volatility</span>
                  <span className="text-sm sm:text-base font-black text-blue-700">Moderate (11%)</span>
                  <span className="text-[10px] text-blue-800 font-medium block">Fluctuates during sales</span>
                </div>
              </div>

              {/* Recharts Area Chart */}
              <div className="h-64 sm:h-72 w-full pt-2 relative">
                {isChartLoading && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-10 rounded-xl">
                    <span className="text-xs font-semibold text-blue-600 animate-pulse">Loading telemetry points...</span>
                  </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="histAzGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="histFkGrad" x1="0" y1="0" x2="0" y2="1">
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
                              <p className="text-amber-700 font-bold">Amazon: {formatPrice(payload[0]?.value)}</p>
                              {payload[1] && (
                                <p className="text-blue-700 font-bold">Flipkart: {formatPrice(payload[1]?.value)}</p>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="amazon" stroke="#d97706" strokeWidth={2} fill="url(#histAzGrad)" name="Amazon" />
                    <Area type="monotone" dataKey="flipkart" stroke="#2563eb" strokeWidth={2} fill="url(#histFkGrad)" name="Flipkart" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    Amazon India Price
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Flipkart Price
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Current Floor: {formatPrice(floorPrice)}
                </span>
              </div>

            </div>

            {/* Price-Change Summary & AI Verdict Box */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">
                Price-Change Summary & Cycle Evaluation
              </span>
              <p className="leading-relaxed">
                {activeProduct.aiVerdictReason} Current lowest offer is {formatPrice(lowestPrice)} on {activeProduct.bestStore}.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
