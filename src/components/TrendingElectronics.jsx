import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  TrendingUp,
  Minus,
  Star, 
  Bookmark, 
  Check, 
  ArrowRight,
  SlidersHorizontal,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, TRENDING_PRODUCTS, formatCurrency } from '../data/electronicsData';

export default function TrendingElectronics({ 
  onSelectProduct, 
  watchlist = {}, 
  onToggleWatchlist,
  currency = 'INR',
  selectedForCompare = {},
  onToggleCompare,
  onOpenCompareModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'discount', 'aiScore'

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = TRENDING_PRODUCTS;

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      const aPrice = currency === 'USD' ? a.currentPriceUSD : a.currentPriceINR;
      const bPrice = currency === 'USD' ? b.currentPriceUSD : b.currentPriceINR;

      switch (sortBy) {
        case 'price-asc':
          return aPrice - bPrice;
        case 'price-desc':
          return bPrice - aPrice;
        case 'discount':
          return b.discountPercent - a.discountPercent;
        case 'aiScore':
          return b.aiScore - a.aiScore;
        default:
          return 0; // featured order in data
      }
    });

    return result;
  }, [selectedCategory, searchQuery, sortBy, currency]);

  const compareCount = Object.values(selectedForCompare).filter(Boolean).length;

  return (
    <section id="products" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Market Tracking</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Trending <span className="text-blue-600">Electronics</span>
            </h2>
            <p className="text-slate-600 mt-1 text-sm sm:text-base max-w-xl">
              Live price drops, algorithmically scored across Amazon & Flipkart. Track current deals, historical floor prices, and AI timing.
            </p>
          </div>

          {/* Quick Counter / Compare Tray Alert */}
          <div className="flex items-center gap-3">
            {compareCount > 0 && (
              <button
                onClick={onOpenCompareModal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Compare {compareCount} Products Now</span>
              </button>
            )}

            <div className="flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-slate-700">
                <strong className="text-slate-900">{TRENDING_PRODUCTS.length}</strong> Gadgets Monitored
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar: Category Pills + Search + Sort */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search within Section & Sort Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Biggest Discount %</option>
              <option value="aiScore">Highest AI Buy Score</option>
            </select>
          </div>

        </div>

        {/* Product Cards Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {processedProducts.map((product) => {
              const isWatchlisted = !!watchlist[product.id];
              const isCompared = !!selectedForCompare[product.id];
              
              const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
              const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
              
              const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
              const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
              const lowestPrice = Math.min(azPrice, fkPrice);
              const origPrice = currency === 'USD' ? product.originalPriceUSD : product.originalPriceINR;
              const floorPrice = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
              const savings = currency === 'USD' ? product.savingsAmountUSD : product.savingsAmountINR;

              const isFkCheaper = fkPrice < azPrice;
              const isAzCheaper = azPrice < fkPrice;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-card-hover p-5 flex flex-col justify-between transition-all duration-200"
                >
                  <div>
                    {/* Card Top: Category, Recommendation Badge & Watchlist */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {product.categoryName}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* BUY NOW / WAIT / GOOD DEAL Badge */}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
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
                          onClick={() => onToggleWatchlist(product.id)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            isWatchlisted
                              ? 'bg-blue-50 text-blue-600 border-blue-200'
                              : 'bg-white text-slate-400 hover:text-slate-700 border-slate-200'
                          }`}
                          title={isWatchlisted ? "Saved in Watchlist" : "Add to Watchlist"}
                        >
                          {isWatchlisted ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3.5 bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Floating AI Buy Score & Rating */}
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/95 text-slate-900 border border-slate-200/90 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          Buy Score: {product.aiScore}/100
                        </span>

                        <span className="text-[11px] font-semibold text-slate-700 bg-white/95 px-2 py-0.5 rounded-md border border-slate-200/90 shadow-2xs backdrop-blur-xs flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    {/* Product Name & Specs */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-0.5">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3.5 line-clamp-1">
                      {product.specs}
                    </p>

                    {/* Primary Price & Savings Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 mb-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[11px] text-slate-500 block">Lowest Current Price</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900">
                              {formatCurrency(lowestPrice, currency)}
                            </span>
                            <span className="text-xs line-through text-slate-400 font-medium">
                              {formatCurrency(origPrice, currency)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Save {formatCurrency(savings, currency)}
                          </span>
                          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                            Floor: {formatCurrency(floorPrice, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Price Trend Indicator */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Price Trend:</span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          {product.priceTrend === 'falling' ? (
                            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                          ) : product.priceTrend === 'rising' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Minus className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{product.priceTrendLabel}</span>
                        </span>
                      </div>
                    </div>

                    {/* Amazon vs Flipkart Live Breakdown */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 mb-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-amber-800 flex items-center gap-1.5 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Amazon:
                        </span>
                        <span className={`font-bold ${isAzCheaper ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {formatCurrency(azPrice, currency)}
                          {isAzCheaper && <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">Cheapest</span>}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-blue-800 flex items-center gap-1.5 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          Flipkart:
                        </span>
                        <span className={`font-bold ${isFkCheaper ? 'text-emerald-700' : 'text-slate-800'}`}>
                          {formatCurrency(fkPrice, currency)}
                          {isFkCheaper && <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">Cheapest</span>}
                        </span>
                      </div>
                      
                      {/* Highlight the Cheapest Platform */}
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Platform Advantage:</span>
                        <span className={`font-bold ${
                          isFkCheaper 
                            ? 'text-blue-700' 
                            : isAzCheaper 
                            ? 'text-amber-700' 
                            : 'text-slate-600'
                        }`}>
                          {isFkCheaper 
                            ? `Flipkart by ${formatCurrency(azPrice - fkPrice, currency)}` 
                            : isAzCheaper 
                            ? `Amazon by ${formatCurrency(fkPrice - azPrice, currency)}` 
                            : 'Both Matched'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    
                    {/* View Details Button */}
                    <button
                      onClick={() => onSelectProduct(product)}
                      className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Compare Selector Checkbox Button */}
                    <button
                      onClick={() => onToggleCompare && onToggleCompare(product.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer border ${
                        isCompared
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                          : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                      title={isCompared ? "Remove from comparison" : "Add to comparison (up to 3)"}
                    >
                      <SlidersHorizontal className="w-3 h-3 text-indigo-600" />
                      <span>{isCompared ? 'Compared' : '+ Compare'}</span>
                    </button>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom Banner to Compare Arena */}
        <div className="mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-500 mb-2">
            Want to see live head-to-head Amazon vs Flipkart store comparison cards?
          </p>
          <a
            href="#compare"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 shadow-2xs transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Launch Amazon vs Flipkart Live Battle Arena</span>
          </a>
        </div>

      </div>
    </section>
  );
}
