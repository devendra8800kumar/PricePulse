import React from 'react';
import { TrendingDown, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * Reusable PriceCard Tile System
 * Renders neutral white tiles with colored top accents and consistent badges
 * Responsive: 4 cols on desktop, 2 on tablet, 1 on mobile
 */
export default function PriceCard({ dataset, currency = 'INR' }) {
  if (!dataset) return null;

  const amazonPrice = currency === 'USD' ? dataset.amazonPriceUSD : dataset.amazonPriceINR;
  const flipkartPrice = currency === 'USD' ? dataset.flipkartPriceUSD : dataset.flipkartPriceINR;
  const savings = currency === 'USD' ? dataset.savingsUSD : dataset.savingsINR;

  const isAmazonCheapest = dataset.winner === 'Amazon India' || dataset.winner?.toLowerCase().includes('amazon');
  const isFlipkartCheapest = dataset.winner === 'Flipkart' || dataset.winner?.toLowerCase().includes('flipkart');

  const recommendationType = dataset.recommendation || 'GOOD DEAL';
  const badgeColors = {
    'BUY NOW': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20',
    'WAIT': 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20',
    'GOOD DEAL': 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20',
    'HOLD': 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20',
  }[recommendationType] || 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
      
      {/* 1. Amazon Tile */}
      <div 
        className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
          isAmazonCheapest 
            ? 'border-emerald-400/80 ring-1 ring-emerald-500/30' 
            : 'border-slate-200/90'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
        <div>
          <div className="flex items-center justify-between mb-1.5 pt-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Amazon India
            </span>
            {isAmazonCheapest ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Best Price
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">In Stock</span>
            )}
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight block">
            {amazonPrice}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {isAmazonCheapest ? 'Cheapest verified price option' : 'Standard Prime 2-Day Delivery'}
        </p>
      </div>

      {/* 2. Flipkart Tile */}
      <div 
        className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
          isFlipkartCheapest 
            ? 'border-emerald-400/80 ring-1 ring-emerald-500/30' 
            : 'border-slate-200/90'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
        <div>
          <div className="flex items-center justify-between mb-1.5 pt-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Flipkart
            </span>
            {isFlipkartCheapest ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ring-1 ring-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Best Price
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">In Stock</span>
            )}
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight block">
            {flipkartPrice}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {isFlipkartCheapest ? 'Cheapest verified price option' : 'Plus SuperCoins Eligible'}
        </p>
      </div>

      {/* 3. Savings Tile */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
        <div>
          <div className="flex items-center justify-between mb-1.5 pt-1">
            <span className="text-xs font-bold text-slate-800">
              Cross-Store Savings
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Gap
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-600 tracking-tight flex items-center gap-1">
            <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />
            {savings}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Difference between Amazon and Flipkart
        </p>
      </div>

      {/* 4. AI Recommendation Tile */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
        <div>
          <div className="flex items-center justify-between mb-1.5 pt-1">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              AI Recommendation
            </span>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase border ${badgeColors}`}>
              {recommendationType}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 mt-2 line-clamp-1 font-medium">
          {dataset.verdict || 'AI model buy timing signal'}
        </p>
      </div>

    </div>
  );
}
