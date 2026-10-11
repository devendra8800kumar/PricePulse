import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  Award, 
  ShieldCheck, 
  Info,
  ArrowRight,
  Flame,
  Gauge
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function AiInsightsPage() {
  const { formatPrice, currency } = useApp();
  const [filterType, setFilterType] = useState('all'); // 'all', 'buy', 'wait', 'deal'

  // Partition products
  const buyNowList = TRENDING_PRODUCTS.filter(p => p.recommendation === 'BUY NOW');
  const waitList = TRENDING_PRODUCTS.filter(p => p.recommendation === 'WAIT');
  const goodDealList = TRENDING_PRODUCTS.filter(p => p.recommendation === 'GOOD DEAL');

  const displayedList = filterType === 'buy' 
    ? buyNowList 
    : filterType === 'wait' 
    ? waitList 
    : filterType === 'deal' 
    ? goodDealList 
    : TRENDING_PRODUCTS;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Predictive Buy Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Price <span className="text-blue-600">Intelligence</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            "Don't just find the price. Find the right time to buy." We audit historical sale cycles, stock liquidity, and festival markdown patterns to advise when to buy or wait.
          </p>
        </div>

        {/* Demo Disclaimer */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 mb-8 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Transparent Rule Engine Notice:</strong> PricePulse recommendations are derived from deterministic algorithmic rules evaluating proximity to the 90-day moving price floor, seasonal festive discount cadence, and verified Amazon vs Flipkart price wars.
          </div>
        </div>

        {/* 3 Overview Metric Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Strong Buy Signals</span>
              <span className="badge-buy text-xs font-bold px-2 py-0.5 rounded">
                BUY NOW
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900">{buyNowList.length}</span>
            <p className="text-xs text-slate-500 mt-1">
              Gadgets currently within 2% of all-time historical lows.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Drop Watch Signals</span>
              <span className="badge-wait text-xs font-bold px-2 py-0.5 rounded">
                WAIT
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900">{waitList.length}</span>
            <p className="text-xs text-slate-500 mt-1">
              Devices expected to drop during upcoming monthly/quarterly sales.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Flash Deals</span>
              <span className="badge-deal text-xs font-bold px-2 py-0.5 rounded">
                GOOD DEAL
              </span>
            </div>
            <span className="text-3xl font-black text-slate-900">{goodDealList.length}</span>
            <p className="text-xs text-slate-500 mt-1">
              Prices currently 10%+ below their 90-day moving average.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-slate-500">Filter Insights:</span>
          {[
            { id: 'all', label: 'All Recommendations' },
            { id: 'buy', label: 'BUY NOW Only' },
            { id: 'wait', label: 'WAIT Signals Only' },
            { id: 'deal', label: 'GOOD DEAL Only' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Intelligence Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedList.map((product) => {
            const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
            const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
            const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
            const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
            const lowest = Math.min(azPrice, fkPrice);
            const floor = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
            const avg = currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR;

            return (
              <div 
                key={product.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Name, Category, Signal Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                          {product.categoryName}
                        </span>
                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block mt-0.5"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                      product.recommendation === 'BUY NOW'
                        ? 'badge-buy'
                        : product.recommendation === 'WAIT'
                        ? 'badge-wait'
                        : 'badge-deal'
                    }`}>
                      {product.recommendation}
                    </span>
                  </div>

                  {/* AI Explanation Callout */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                    <span className="text-[11px] font-bold text-slate-900 block mb-1">
                      Reasoning & Timing Recommendation:
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {product.aiVerdictReason}
                    </p>
                  </div>

                  {/* Pricing Comparison Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Lowest Price</span>
                      <span className="text-xs font-black text-slate-900">{formatPrice(lowest)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Historical Floor</span>
                      <span className="text-xs font-black text-emerald-700">{formatPrice(floor)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 block">Buy Score</span>
                      <span className="text-xs font-black text-blue-700">{product.aiScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Cheapest on <strong className="text-slate-800">{product.bestStore}</strong>
                  </span>

                  <Link
                    to={`/products/${product.slug || product.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <span>View Product Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
