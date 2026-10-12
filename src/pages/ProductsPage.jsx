import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  X, 
  Filter, 
  PlusCircle, 
  Layers, 
  ShieldCheck, 
  RefreshCw,
  LogIn
} from 'lucide-react';
import ProductFlipCard from '../components/ProductFlipCard';
import { CATEGORIES, TRENDING_PRODUCTS } from '../data/electronicsData';
import { normalizeApiProduct } from '../services/productService';
import { useApp } from '../context/AppContext';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    currency, 
    formatPrice, 
    user, 
    apiProducts, 
    fetchApiProducts, 
    isProductsLoading, 
    openTrackModal 
  } = useApp();

  // URL search query & category syncing
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';
  const initialPlatform = searchParams.get('platform') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'discount', 'aiScore', 'rating'
  const [recommendationFilter, setRecommendationFilter] = useState('all'); // 'all', 'BUY NOW', 'WAIT', 'GOOD DEAL'
  
  // Price Range Filter
  const maxProductPrice = currency === 'USD' ? 4000 : 350000;
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState(9);

  // Fetch API products when platform or category changes
  useEffect(() => {
    if (user && user.isLoggedIn) {
      fetchApiProducts({
        platform: selectedPlatform !== 'all' ? selectedPlatform : null,
        category: selectedCategory !== 'all' ? selectedCategory : null,
      });
    }
  }, [selectedPlatform, selectedCategory, user, fetchApiProducts]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
    const plat = searchParams.get('platform');
    if (plat) setSelectedPlatform(plat);
  }, [searchParams]);

  // Merge Live API Products with Curated Demo Catalog
  const combinedCatalog = useMemo(() => {
    const normalizedApi = (apiProducts || []).map(normalizeApiProduct).filter(Boolean);
    // Put live API items at the front so users immediately see their tracked items
    const existingIds = new Set(normalizedApi.map(p => p.id));
    const dedupedDemo = TRENDING_PRODUCTS.filter(p => !existingIds.has(p.id));
    return [...normalizedApi, ...dedupedDemo];
  }, [apiProducts]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = combinedCatalog;

    // 1. Filter Platform
    if (selectedPlatform !== 'all') {
      result = result.filter(p => {
        if (p.platform) return p.platform.toLowerCase() === selectedPlatform.toLowerCase();
        return p.retailers?.some(r => r.name.toLowerCase().includes(selectedPlatform.toLowerCase()));
      });
    }

    // 2. Filter Category
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Filter Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.specs && p.specs.toLowerCase().includes(q))
      );
    }

    // 4. Filter Recommendation
    if (recommendationFilter !== 'all') {
      result = result.filter(p => p.recommendation === recommendationFilter);
    }

    // 5. Filter Max Price
    result = result.filter(p => {
      const price = currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR;
      return price <= maxPrice;
    });

    // 6. Sort
    result = [...result].sort((a, b) => {
      const aPrice = currency === 'USD' ? a.currentPriceUSD : a.currentPriceINR;
      const bPrice = currency === 'USD' ? b.currentPriceUSD : b.currentPriceINR;

      switch (sortBy) {
        case 'price-asc':
          return aPrice - bPrice;
        case 'price-desc':
          return bPrice - aPrice;
        case 'discount':
          return (b.discountPercent || 0) - (a.discountPercent || 0);
        case 'aiScore':
          return (b.aiScore || 0) - (a.aiScore || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [combinedCatalog, selectedPlatform, selectedCategory, searchQuery, recommendationFilter, maxPrice, sortBy, currency]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedPlatform('all');
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Catalog & Live Ingestion</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore <span className="text-blue-600">Tracked Products</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              Audit prices across Amazon India and Flipkart. Submit live URLs to monitor prices prospectively and evaluate buy-timing recommendations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user && user.isLoggedIn ? (
              <button
                onClick={openTrackModal}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Track Any URL
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4 text-cyan-300" />
                Sign In to Track URLs
              </Link>
            )}
          </div>
        </div>

        {/* Live Ingestion Banner for Logged-In Shoppers */}
        {user && user.isLoggedIn && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-slate-900 block text-sm">
                  Live FastAPI Ingestion Active ({apiProducts?.length || 0} Products in System)
                </span>
                <span className="text-slate-600">
                  Prospective scraping deduplicates canonical ASIN & PID keys with GBDT inference.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => fetchApiProducts({ platform: selectedPlatform !== 'all' ? selectedPlatform : null })}
                disabled={isProductsLoading}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProductsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        )}

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
                placeholder="Search by device name, canonical key, or specs..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">Store:</span>
              <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                {['all', 'amazon', 'flipkart'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPlatform(p)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                      selectedPlatform === p
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p === 'all' ? 'All Stores' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">Sort:</span>
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
            {isProductsLoading && <span className="ml-2 text-blue-600 animate-pulse font-medium">Syncing API...</span>}
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
              Try adjusting your store, price range, search query, or category selection.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
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
