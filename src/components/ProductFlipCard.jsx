import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Check, 
  ArrowRight, 
  SlidersHorizontal, 
  RotateCw, 
  Eye, 
  Sparkles,
  X,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

function getShortTitle(name, maxChars = 40) {
  if (!name) return '';
  if (name.length <= maxChars) return name;
  
  // Cut at natural delimiter
  const pipeIdx = name.indexOf(' | ');
  if (pipeIdx > 12 && pipeIdx <= 48) {
    return name.slice(0, pipeIdx).trim();
  }
  const dashIdx = name.indexOf(' - ');
  if (dashIdx > 12 && dashIdx <= 48) {
    return name.slice(0, dashIdx).trim();
  }
  
  // Cut at word boundary
  const truncated = name.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 15 ? truncated.slice(0, lastSpace) : truncated).trim();
}

export default function ProductFlipCard({ product }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);
  const btnRef = useRef(null);

  const { 
    currency, 
    formatPrice, 
    isWatchlisted, 
    toggleWatchlist, 
    isInCompare, 
    toggleCompare, 
    setQuickViewProduct,
    deleteProduct 
  } = useApp();

  const watchlisted = isWatchlisted(product.id);
  const compared = isInCompare(product.id);

  const retailers = product.retailers || [];
  const az = product.amazon || retailers.find(r => r.name?.toLowerCase().includes('amazon')) || retailers[0] || { 
    priceUSD: product.currentPriceUSD || 100, 
    priceINR: product.currentPriceINR || 8000,
    inStock: true
  };
  const fk = product.flipkart || retailers.find(r => r.name?.toLowerCase().includes('flipkart')) || retailers[1] || retailers[0] || az;

  const azPrice = currency === 'USD' ? (az.priceUSD || 100) : (az.priceINR || 8000);
  const fkPrice = currency === 'USD' ? (fk.priceUSD || 100) : (fk.priceINR || 8000);
  const lowestPrice = Math.min(azPrice, fkPrice);
  const origPrice = (currency === 'USD' ? product.originalPriceUSD : product.originalPriceINR) || Math.round(lowestPrice * 1.15);
  const floorPrice = (currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR) || lowestPrice;
  const avgPrice = (currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR) || lowestPrice;
  const savings = (currency === 'USD' ? product.savingsAmountUSD : product.savingsAmountINR) || Math.max(0, origPrice - lowestPrice);
  const discountPercent = product.discountPercent || (origPrice > lowestPrice ? Math.round(((origPrice - lowestPrice) / origPrice) * 100) : 10);

  const isFkCheaper = fkPrice < azPrice;
  const isAzCheaper = azPrice < fkPrice;

  const productUrl = `/products/${product.slug || product.id}`;

  const isLongTitle = product.name && product.name.length > 40;
  const shortTitle = getShortTitle(product.name, 40);

  // Close tooltip on outside click
  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e) => {
      if (
        tooltipRef.current && !tooltipRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTooltip]);

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
    if (e.key === 'Escape') setShowTooltip(false);
  };

  return (
    <div 
      className="perspective-1000 w-full h-[455px] sm:h-[465px]"
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
          className="backface-hidden absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-card-hover p-4 sm:p-5 flex flex-col transition-shadow duration-200 overflow-hidden"
        >
          {/* Top Bar: Category, Recommendation Badge & Actions */}
          <div className="flex items-center justify-between mb-2.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[120px]">
              {product.categoryName || product.category || 'Electronics'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {(!product.isAvailable || (az.inStock === false && fk.inStock === false)) ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Out of Stock
                </span>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  product.recommendation === 'BUY NOW'
                    ? 'badge-buy'
                    : product.recommendation === 'WAIT'
                    ? 'badge-wait'
                    : 'badge-deal'
                }`}>
                  {product.recommendation || 'BUY NOW'}
                </span>
              )}

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
                {watchlisted ? <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>

              {/* Destroy / Delete Product from Explore */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Permanently destroy "${product.name}"? This removes it from Explore and stops all tracking.`)) {
                    deleteProduct(product.id);
                  }
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors cursor-pointer"
                title="Destroy / Delete from Explore"
                aria-label="Destroy Product"
              >
                <Trash2 className="w-3.5 h-3.5" />
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

          {/* Product Image Container */}
          <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden mb-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 group flex items-center justify-center p-2 shrink-0">
            <img
              src={product.image || product.image_url || 'https://m.media-amazon.com/images/I/61vJtKbAssL._AC_SL1500_.jpg'}
              alt={product.name}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = (product.category === 'headphones' || product.category === 'earbuds')
                  ? 'https://m.media-amazon.com/images/I/51aXvjzcukL._AC_SL1200_.jpg'
                  : 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80';
              }}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />

            {/* Quick View */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewProduct(product);
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 shadow-xs border border-slate-200/90 dark:border-slate-700 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
              title="Quick View Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Quick View</span>
            </button>

            {/* Cheapest Platform Badge */}
            <div className="absolute bottom-2 left-2 pointer-events-none">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isFkCheaper ? 'bg-blue-600' : 'bg-amber-500'}`}></span>
                Lowest on {product.bestStore || (isFkCheaper ? 'Flipkart' : 'Amazon')}
              </span>
            </div>
          </div>

          {/* Title row — always fixed height, floating popover for full name */}
          <div className="shrink-0 mb-2 relative">
            <div className="flex items-center gap-1.5">
              <Link 
                to={productUrl}
                className="flex-1 min-w-0 text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate leading-snug"
                title={product.name}
              >
                {shortTitle}
              </Link>

              {isLongTitle && (
                <div className="relative shrink-0">
                  <button
                    ref={btnRef}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip(v => !v);
                    }}
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded border transition-colors cursor-pointer select-none ${
                      showTooltip
                        ? 'text-white bg-blue-600 border-blue-600'
                        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border-blue-200 dark:border-blue-800'
                    }`}
                    title="Show full product name"
                    aria-label="Show full product name"
                  >
                    ···
                  </button>

                  {/* Floating popover — does NOT affect card layout */}
                  {showTooltip && (
                    <div
                      ref={tooltipRef}
                      className="absolute bottom-full right-0 mb-2 z-50 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 animate-in fade-in slide-in-from-bottom-1 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Arrow */}
                      <div className="absolute bottom-[-6px] right-3 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45" />
                      
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Product Name</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                          className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                        {product.name}
                      </p>
                      <Link
                        to={productUrl}
                        className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => setShowTooltip(false)}
                      >
                        View Product <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {product.specs || `${product.platform || 'Store'} verified item`}
            </p>
          </div>

          {/* Price & Savings Box — anchored to bottom via mt-auto */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 mt-auto shrink-0">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Lowest Current Offer</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                    {formatPrice(lowestPrice)}
                  </span>
                  {origPrice > lowestPrice && (
                    <span className="text-xs line-through text-slate-400 dark:text-slate-500 font-mono">
                      {formatPrice(origPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                  Save {formatPrice(savings)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-semibold">
                  {discountPercent}% Off MRP
                </span>
              </div>
            </div>
          </div>

          {/* Front Bottom Actions */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <Link
              to={productUrl}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <button
              type="button"
              onClick={handleFlipToggle}
              className="py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              title="Flip card for AI stats & price breakdown"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Stats</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(product.id);
              }}
              className={`p-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer border shrink-0 ${
                compared
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/50 font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700'
              }`}
              title={compared ? "Remove from comparison" : "Add to comparison"}
              aria-label={compared ? "Remove from comparison" : "Add to comparison"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* BACK SIDE (Revealed via 3D Flip) */}
        {/* ========================================================= */}
        <div 
          className="backface-hidden rotate-y-180 absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-[#111827] border border-blue-200 dark:border-blue-900/60 shadow-md dark:shadow-lg p-4 sm:p-5 flex flex-col overflow-hidden"
        >
          {/* Back Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                AI &amp; Store Analysis
              </span>
            </div>

            <button
              type="button"
              onClick={handleFlipToggle}
              className="py-1 px-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/60 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Flip back to front"
            >
              <RotateCw className="w-3 h-3" />
              <span>Flip Back</span>
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mb-2 shrink-0" title={product.name}>
            {product.name}
          </h4>

          {/* Amazon vs Flipkart Breakdown with Direct Links */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 mb-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span className="text-amber-800 dark:text-amber-400 font-bold">Amazon:</span>
                {az.inStock === false && (
                  <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">OOS</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {azPrice > 0 ? formatPrice(azPrice) : '—'}
                  {isAzCheaper && <span className="ml-1 text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 uppercase font-bold">Cheapest</span>}
                </span>
                {(az.url || az.fallbackUrl) && (
                  <a
                    href={az.url || az.fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-0.5 rounded text-slate-400 hover:text-amber-600 transition-colors"
                    title="Open Amazon Listing"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                <span className="text-blue-800 dark:text-blue-400 font-bold">Flipkart:</span>
                {fk.inStock === false && (
                  <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">OOS</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {fkPrice > 0 ? formatPrice(fkPrice) : '—'}
                  {isFkCheaper && <span className="ml-1 text-[9px] px-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 uppercase font-bold">Cheapest</span>}
                </span>
                {(fk.url || fk.fallbackUrl) && (
                  <a
                    href={fk.url || fk.fallbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-0.5 rounded text-slate-400 hover:text-blue-600 transition-colors"
                    title="Open Flipkart Listing"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-1 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[11px]">
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
          <div className="grid grid-cols-2 gap-2 mb-2 shrink-0">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Lowest Recorded</span>
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatPrice(floorPrice)}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">90-Day Average</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 font-mono">{formatPrice(avgPrice)}</span>
            </div>
          </div>

          {/* AI Recommendation & Buy Score */}
          <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 mb-2 mt-auto shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Buy Score:</span>
              <span className="text-xs font-black text-blue-700 dark:text-blue-400">{product.aiScore || 85}/100</span>
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Verdict:</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                product.recommendation === 'BUY NOW'
                  ? 'badge-buy'
                  : product.recommendation === 'WAIT'
                  ? 'badge-wait'
                  : 'badge-deal'
              }`}>
                {product.recommendation || 'BUY NOW'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-tight">
              {product.aiVerdictReason || product.aiReasoning || 'Algorithmic scan indicates favorable pricing against historical baselines.'}
            </p>
          </div>

          {/* Back Bottom Actions */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <Link
              to={productUrl}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <button
              type="button"
              onClick={handleFlipToggle}
              className="py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            >
              Back
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Permanently destroy "${product.name}"? This removes it from Explore and stops all tracking.`)) {
                  deleteProduct(product.id);
                }
              }}
              className="py-2 px-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Destroy / Delete from Explore"
              aria-label="Destroy Product"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Destroy</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
