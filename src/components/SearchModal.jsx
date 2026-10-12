import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Loader2, Database } from 'lucide-react';
import { TRENDING_PRODUCTS, formatCurrency } from '../data/electronicsData';
import { useApp } from '../context/AppContext';
import { searchService } from '../services/searchService';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  onSelectProduct, 
  currency = 'INR',
  initialQuery = '' 
}) {
  const { searchApi } = useApp();
  const [query, setQuery] = useState(initialQuery);
  const [platformFilter, setPlatformFilter] = useState(''); // '' (all), 'amazon', 'flipkart'
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchTimeoutRef = useRef(null);

  // Sync initial query when opened from Hero or Navbar
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || '');
      setLiveResults([]);
      setSearchError(null);
    }
  }, [isOpen, initialQuery]);

  // Debounced search against /api/v1/search
  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchService.search({
          q: query.trim(),
          platform: platformFilter || undefined,
          limit: 10,
        });
        if (res && Array.isArray(res.results)) {
          setLiveResults(res.results);
        } else {
          setLiveResults([]);
        }
      } catch (err) {
        // Backend search might be empty or fallback
        setLiveResults([]);
        setSearchError(err.message);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, platformFilter, isOpen]);

  // Handle ESC and Cmd+K key bindings
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter local trending products as well
  const filteredCatalog = TRENDING_PRODUCTS.filter((item) => {
    const matchesQuery = 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(query.toLowerCase()) ||
      item.specs.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
  });

  const popularSuggestions = ['iPhone 15', 'MacBook Air', 'Sony WH-1000XM5', 'iPad Pro', 'LG OLED'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-slate-50">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-blue-600 shrink-0" />
          )}
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search electronics with live indexing across Amazon & Flipkart..."
            className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold px-1"
            >
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills Bar */}
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Platform:</span>
            {[
              { id: '', label: 'All Stores' },
              { id: 'amazon', label: 'Amazon.in' },
              { id: 'flipkart', label: 'Flipkart' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatformFilter(p.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  platformFilter === p.id 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono shrink-0 hidden sm:block">
            {liveResults.length > 0 ? (
              <span className="text-blue-600 font-bold">{liveResults.length} live matches</span>
            ) : (
              <span>Meilisearch + Catalog</span>
            )}
          </div>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-3 flex-1">
          {/* Quick suggestions if query is empty */}
          {!query.trim() && (
            <div className="p-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Trending Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSuggestions.map(sug => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Live Meilisearch Results (if any) */}
          {liveResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-blue-600" />
                  Live Meilisearch Index ({liveResults.length})
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Indexed in DB</span>
              </div>
              <div className="space-y-1.5">
                {liveResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectProduct({
                        id: item.id,
                        name: item.title,
                        categoryName: item.platform ? item.platform.toUpperCase() : 'Electronics',
                        image: item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
                        currentPriceINR: item.last_price || 0,
                        currentPriceUSD: Math.round((item.last_price || 0) / 83),
                        slug: item.id,
                      });
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-blue-50/40 hover:bg-blue-50 border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}
                        alt={item.title}
                        className="w-11 h-11 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase shrink-0">
                            {item.platform || 'Store'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Canonical Key: <span className="text-slate-700 font-semibold">{item.canonical_key || item.id}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block font-mono">
                          {formatCurrency(item.last_price || 0, 'INR')}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">
                          Live Indexed
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Catalog matches */}
          {query.trim() && filteredCatalog.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-1 mb-2 mt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Verified Product Catalog ({filteredCatalog.length})
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Dual Retailer History</span>
              </div>
              <div className="space-y-1">
                {filteredCatalog.map((item) => {
                  const az = item.retailers.find(r => r.name.toLowerCase().includes('amazon')) || item.retailers[0];
                  const fk = item.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || item.retailers[1] || item.retailers[0];
                  const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
                  const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
                  const bestPrice = Math.min(azPrice, fkPrice);
                  const isFkCheaper = fkPrice < azPrice;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                              {item.name.split('(')[0]}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                              {item.categoryName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                            Amazon: <strong className="text-amber-800">{formatCurrency(azPrice, currency)}</strong> • 
                            Flipkart: <strong className="text-blue-800">{formatCurrency(fkPrice, currency)}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-900 block font-mono">
                            {formatCurrency(bestPrice, currency)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            {isFkCheaper ? 'Flipkart Best' : 'Amazon Best'}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {query.trim() && !isSearching && liveResults.length === 0 && filteredCatalog.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No matching electronics found for "{query}"</p>
              <p className="text-[11px] text-slate-400 mt-1">Try keywords like "iPhone", "MacBook", "Sony", or track a direct product URL using the Track button.</p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-mono shadow-2xs">ESC</kbd>
            <span>to close</span>
          </div>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Backend Route /api/v1/search Active
          </span>
        </div>
      </div>
    </div>
  );
}
