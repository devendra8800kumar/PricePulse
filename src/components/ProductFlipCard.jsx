import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Star, 
  Bookmark, 
  Check, 
  ArrowRight, 
  SlidersHorizontal, 
  RotateCw, 
  Eye, 
  Sparkles,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProductFlipCard({ product }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { 
    currency, 
    formatPrice, 
    isWatchlisted, 
    toggleWatchlist, 
    isInCompare, 
    toggleCompare, 
    setQuickViewProduct 
  } = useApp();

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
  const savings = currency === 'USD' ? product.savingsAmountUSD : product.savingsAmountINR;

  const isFkCheaper = fkPrice < azPrice;
  const isAzCheaper = azPrice < fkPrice;

  const productUrl = `/products/${product.slug || product.id}`;

  const handleFlipToggle = (e) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
        setIsFlipped(!isFlipped);
      }
    }
  };

  return (
    <div 
      className="perspective-1000 w-full min-h-[460px] h-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`${product.name} card. Press space or enter to flip.`}
    >
      <div 
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        
        {/* ========================================================= */}
        {/* FRONT SIDE */}
        {/* ========================================================= */}
        <div 
          className="backface-hidden absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-card-hover p-4 sm:p-5 flex flex-col justify-between transition-shadow duration-200"
        >
          <div>
            {/* Top Bar: Category, Recommendation Badge & Actions */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                {product.categoryName}
              </span>

              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  product.recommendation === 'BUY NOW'
                    ? 'badge-buy'
                    : product.recommendation === 'WAIT'
                    ? 'badge-wait'
                    : 'badge-deal'
                }`}>
                  {product.recommendation}
                </span>

                {/* Watchlist Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWatchlist(product.id);
                  }}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    watchlisted
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50'
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                  title={watchlisted ? "Saved in Watchlist" : "Add to Watchlist"}
                  aria-label="Toggle Watchlist"
                >
                  {watchlisted ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>

                {/* Flip Trigger Button */}
                <button
                  type="button"
                  onClick={handleFlipToggle}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  title="Flip card for AI stats & historical analysis"
                  aria-label="Flip card"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Product Image Container with Quick View */}
            <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-3 bg-slate-50 border border-slate-100 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
                loading="lazy"
              />

              {/* Floating Quick View button on hover/touch */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickViewProduct(product);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-slate-700 hover:text-blue-600 shadow-xs border border-slate-200/90 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                title="Quick View Preview"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Quick View</span>
              </button>

              {/* Cheapest Platform Badge */}
              <div className="absolute bottom-2 left-2 pointer-events-none">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-slate-800 border border-slate-200/90 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isFkCheaper ? 'bg-blue-600' : 'bg-amber-500'}`}></span>
                  Lowest on {product.bestStore}
                </span>
              </div>
            </div>

            {/* Title & Specs */}
            <Link 
              to={productUrl}
              className="text-sm sm:text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 mb-0.5 block"
            >
              {product.name}
            </Link>
            <p className="text-xs text-slate-500 mb-3 line-clamp-1">
              {product.specs}
            </p>

            {/* Price & Savings Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 mb-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Lowest Current Offer</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {formatPrice(lowestPrice)}
                    </span>
                    <span className="text-xs line-through text-slate-400 dark:text-slate-500 font-medium">
                      {formatPrice(origPrice)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                    Save {formatPrice(savings)}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-semibold">
                    {product.discountPercent}% Off MRP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Front Bottom Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              to={productUrl}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleFlipToggle}
              className="py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              title="Flip to view detailed store battle & AI analysis"
            >
              <RotateCw className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Flip Stats</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(product.id);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border ${
                compared
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/50 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700'
              }`}
              title={compared ? "Remove from comparison" : "Add to comparison (up to 3)"}
            >
              <SlidersHorizontal className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>{compared ? 'Added' : '+ Compare'}</span>
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* BACK SIDE (Revealed via 3D Flip) */}
        {/* ========================================================= */}
        <div 
          className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-md dark:shadow-lg p-4 sm:p-5 flex flex-col justify-between"
        >
          <div>
            {/* Back Header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  AI &amp; Store Analysis
                </span>
              </div>

              {/* Flip Back Button */}
              <button
                type="button"
                onClick={handleFlipToggle}
                className="py-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/60 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Flip back to front"
              >
                <RotateCw className="w-3 h-3" />
                <span>Flip Back</span>
              </button>
            </div>

            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mb-2">
              {product.name}
            </h4>

            {/* Amazon vs Flipkart Breakdown */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 mb-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-800 dark:text-amber-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Amazon:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(azPrice)}
                  {isAzCheaper && <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 uppercase font-bold">Cheapest</span>}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-blue-800 dark:text-blue-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  Flipkart:
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {formatPrice(fkPrice)}
                  {isFkCheaper && <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 uppercase font-bold">Cheapest</span>}
                </span>
              </div>

              <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Store Gap:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {isFkCheaper 
                    ? `Flipkart saves ${formatPrice(azPrice - fkPrice)}`
                    : isAzCheaper
                    ? `Amazon saves ${formatPrice(fkPrice - azPrice)}`
                    : 'Matched Price'}
                </span>
              </div>
            </div>

            {/* Historical Benchmarks */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Lowest Recorded</span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">{formatPrice(floorPrice)}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block">90-Day Average</span>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{formatPrice(avgPrice)}</span>
              </div>
            </div>

            {/* AI Recommendation & Buy Score */}
            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Buy Score:</span>
                <span className="text-xs font-black text-blue-700 dark:text-blue-400">{product.aiScore}/100</span>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Verdict:</span>
                <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                  product.recommendation === 'BUY NOW'
                    ? 'badge-buy'
                    : product.recommendation === 'WAIT'
                    ? 'badge-wait'
                    : 'badge-deal'
                }`}>
                  {product.recommendation}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight">
                {product.aiVerdictReason}
              </p>
            </div>
          </div>

          {/* Back Bottom Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Link
              to={productUrl}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleFlipToggle}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Back
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
