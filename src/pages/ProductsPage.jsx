import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  X, 
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';
import ProductFlipCard from '../components/ProductFlipCard';
import { CATEGORIES, TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currency, formatPrice } = useApp();

  // URL search query & category syncing
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'discount', 'aiScore', 'rating'
  const [recommendationFilter, setRecommendationFilter] = useState('all'); // 'all', 'BUY NOW', 'WAIT', 'GOOD DEAL'
  
  // Price Range Filter
  const maxProductPrice = currency === 'USD' ? 4000 : 350000;
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = TRENDING_PRODUCTS;

    // 1. Filter Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 2. Filter Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.specs.toLowerCase().includes(q)
      );
    }

    // 3. Filter Recommendation
    if (recommendationFilter !== 'all') {
      result = result.filter(p => p.recommendation === recommendationFilter);
    }

    // 4. Filter Max Price
    result = result.filter(p => {
      const price = currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR;
      return price <= maxPrice;
    });

    // 5. Sort
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
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [selectedCategory, searchQuery, recommendationFilter, maxPrice, sortBy, currency]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setRecommendationFilter('all');
    setMaxPrice(maxProductPrice);
    setSearchParams({});
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Real-Time Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore <span className="text-blue-600">Electronics</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
            Audit prices across Amazon India and Flipkart. Click "Flip Stats" on any product card to reveal historical price floors, price gap metrics, and AI buy signals.
          </p>
        </div>

        {/* Search, Filter & Sort Control Deck */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs mb-8 space-y-4">
          
          {/* Top Row: Search Input + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by device name, chipset, or specs..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="featured">Featured Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount %</option>
                <option value="aiScore">Highest AI Buy Score</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Middle Row: Category Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Bottom Row: Additional Filters (AI Recommendation & Price Slider) */}
          <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            
            {/* Recommendation Filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500">AI Signal:</span>
              {['all', 'BUY NOW', 'WAIT', 'GOOD DEAL'].map((signal) => (
                <button
                  key={signal}
                  onClick={() => setRecommendationFilter(signal)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer text-[11px] ${
                    recommendationFilter === signal
                      ? signal === 'BUY NOW' ? 'bg-emerald-600 text-white' : signal === 'WAIT' ? 'bg-amber-600 text-white' : signal === 'GOOD DEAL' ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {signal === 'all' ? 'All Signals' : signal}
                </button>
              ))}
            </div>

            {/* Price Cap Filter */}
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-semibold">
                Max Price: <strong className="text-slate-900">{formatPrice(maxPrice)}</strong>
              </span>
              <input
                type="range"
                min={currency === 'USD' ? 100 : 10000}
                max={maxProductPrice}
                step={currency === 'USD' ? 50 : 5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-32 sm:w-44 accent-blue-600 cursor-pointer"
              />
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-400 hover:text-rose-600 font-semibold underline cursor-pointer ml-1"
              >
                Reset
              </button>
            </div>

          </div>

        </div>

        {/* Results Counter and Active Filter Tags */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900">{displayedProducts.length}</strong> of{' '}
            <strong className="text-slate-900">{filteredProducts.length}</strong> electronics
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Interactive 3D Cards • Press Space or Click Flip
            </span>
          </div>
        </div>

        {/* Product Cards Grid with 3D Flip Card */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedProducts.map((product) => (
              <ProductFlipCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Filter className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No products match your filters</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your price range, search query, or category selection.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Load More Pagination Button */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
            >
              Load More Electronics ({filteredProducts.length - visibleCount} remaining)
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
