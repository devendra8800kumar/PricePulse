import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X, Database, Sparkles, Loader2, PlusCircle } from 'lucide-react';
import { ALL_PRODUCTS, formatCurrency } from '../../data/electronicsData';
import { useApp } from '../../context/AppContext';
import { searchService } from '../../services/searchService';
import Button from './Button';

/**
 * Reusable SearchBar Component with Live Database (Meilisearch / FastAPI) & Catalog Search
 */
export default function SearchBar({
  placeholder = 'Search iPhone 16, MacBook Pro, Sony XM5, OLED TVs...',
  initialQuery = '',
  onSelectProduct,
  onSubmit,
  className = '',
  autoFocus = false,
  showAutocomplete = true,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [liveApiResults, setLiveApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const { currency, formatPrice, apiProducts, openTrackModal } = useApp();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync initial query
  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Debounced search querying the backend API (/api/v1/search)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setLiveApiResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchService.search({
          q: trimmed,
          limit: 8,
        });

        if (res && Array.isArray(res.results)) {
          const mapped = res.results.map((item) => ({
            id: item.id,
            name: item.title,
            title: item.title,
            platform: item.platform,
            canonicalKey: item.canonical_key,
            image: item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
            currentPriceINR: item.last_price || 0,
            currentPriceUSD: Math.round((item.last_price || 0) / 83),
            slug: item.id,
            isLiveApi: true,
          }));
          setLiveApiResults(mapped);
        } else {
          setLiveApiResults([]);
        }
      } catch (err) {
        setLiveApiResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  // Match live products stored in context (newly tracked links in current session)
  const contextLiveMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (apiProducts || [])
      .filter((p) => {
        const title = (p.title || p.name || '').toLowerCase();
        const key = (p.canonical_key || '').toLowerCase();
        const plat = (p.platform || '').toLowerCase();
        const url = (p.url || '').toLowerCase();
        return title.includes(q) || key.includes(q) || plat.includes(q) || url.includes(q);
      })
      .map((p) => ({
        id: p.id,
        name: p.title || p.name,
        title: p.title || p.name,
        platform: p.platform,
        canonicalKey: p.canonical_key,
        image: p.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
        currentPriceINR: p.last_price || 0,
        currentPriceUSD: Math.round((p.last_price || 0) / 83),
        slug: p.id,
        isLiveApi: true,
      }));
  }, [query, apiProducts]);

  // Combine live API results and context live products without duplicates
  const allLiveResults = useMemo(() => {
    const map = new Map();
    // Add context items first
    contextLiveMatches.forEach((item) => {
      map.set(item.id, item);
    });
    // Add /api/v1/search results
    liveApiResults.forEach((item) => {
      map.set(item.id, item);
    });
    return Array.from(map.values()).slice(0, 5);
  }, [contextLiveMatches, liveApiResults]);

  // Compute catalog matches from verified static dataset
  const catalogMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const liveIds = new Set(allLiveResults.map((p) => p.id));
    return ALL_PRODUCTS.filter((product) => {
      if (liveIds.has(product.id)) return false;
      const matchName = product.name.toLowerCase().includes(q);
      const matchCategory = product.category ? product.category.toLowerCase().includes(q) : false;
      const matchSpecs = product.specs ? product.specs.toLowerCase().includes(q) : false;
      return matchName || matchCategory || matchSpecs;
    }).slice(0, 4);
  }, [query, allLiveResults]);

  // Combined suggestions for keyboard navigation
  const allSuggestions = useMemo(() => {
    return [...allLiveResults, ...catalogMatches];
  }, [allLiveResults, catalogMatches]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (product) => {
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      navigate(`/products/${product.slug || product.id}`);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
      handleSelect(allSuggestions[highlightedIndex]);
      return;
    }

    setIsOpen(false);
    if (onSubmit) {
      onSubmit(query.trim());
    } else if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/products');
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || allSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && allSuggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(allSuggestions[highlightedIndex]);
      }
    }
  };

  const getProductPrice = (p) => {
    if (p.isLiveApi) {
      const price = currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR;
      return formatPrice ? formatPrice(price) : formatCurrency(price, currency);
    }
    const price = currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR;
    return formatPrice ? formatPrice(price) : formatCurrency(price, currency);
  };

  // Highlight matching query text
  const highlightMatch = (text, match) => {
    if (!text) return '';
    if (!match.trim()) return text;
    try {
      const regex = new RegExp(`(${match.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <strong key={i} className="text-blue-600 dark:text-blue-400 font-bold">
            {part}
          </strong>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const hasSuggestions = allSuggestions.length > 0;
  const isNoResults = !isSearching && query.trim().length > 1 && !hasSuggestions;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-300/80 dark:border-slate-700/80 shadow-md shadow-slate-200/50 dark:shadow-none focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all p-1.5"
      >
        <div className="pl-3.5 pointer-events-none text-slate-400 dark:text-slate-400 shrink-0">
          {isSearching ? (
            <Loader2 className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : (
            <Search className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (hasSuggestions || query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen && hasSuggestions}
          aria-autocomplete="list"
          className="w-full pl-3 pr-8 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors mr-1 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="h-10 px-4 text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Search
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && isOpen && (hasSuggestions || isNoResults) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-2xl py-2 z-50 text-xs overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-[75vh] flex flex-col text-left">
          
          {/* Header Bar */}
          <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5">
              {allLiveResults.length > 0 ? (
                <>
                  <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Live Indexed & Catalog Results</span>
                </>
              ) : (
                <span>Suggested Electronics</span>
              )}
            </span>
            {isSearching ? (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-[10px] lowercase">
                <Loader2 className="w-3 h-3 animate-spin" /> checking live db
              </span>
            ) : (
              <span className="text-[10px] hidden sm:inline">Use ↑↓ to navigate • Enter to view</span>
            )}
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 flex-1">
            {/* 1. Live Indexed Results (Tracked Products from Backend / Meilisearch) */}
            {allLiveResults.length > 0 && (
              <div>
                <div className="px-3.5 py-1.5 bg-blue-50/50 dark:bg-blue-950/20 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    Live Database Tracked ({allLiveResults.length})
                  </span>
                  <span className="text-[9px] font-mono opacity-80">Meilisearch Active</span>
                </div>

                {allLiveResults.map((item, idx) => {
                  const globalIdx = idx;
                  const isSelected = globalIdx === highlightedIndex;
                  const isAmazon = (item.platform || '').toLowerCase().includes('amazon');
                  const isFlipkart = (item.platform || '').toLowerCase().includes('flipkart');

                  return (
                    <div
                      key={`live-${item.id}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightedIndex(globalIdx)}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.title || item.name}
                          className="w-10 h-10 object-cover rounded-xl bg-white dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                              {highlightMatch(item.title || item.name, query)}
                            </p>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                              isAmazon
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : isFlipkart
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {item.platform || 'Store'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-400">
                              Key: {item.canonicalKey || item.id.slice(0, 8)}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                              Live Indexed
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-xs text-blue-600 dark:text-blue-400 block font-mono">
                          {getProductPrice(item)}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded">
                          Live Price
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Verified Catalog Matches */}
            {catalogMatches.length > 0 && (
              <div>
                {allLiveResults.length > 0 && (
                  <div className="px-3.5 py-1.5 bg-slate-50/70 dark:bg-slate-800/30 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Verified Catalog Items ({catalogMatches.length})
                  </div>
                )}

                {catalogMatches.map((product, idx) => {
                  const globalIdx = allLiveResults.length + idx;
                  const isSelected = globalIdx === highlightedIndex;

                  return (
                    <div
                      key={`cat-${product.id}`}
                      onClick={() => handleSelect(product)}
                      onMouseEnter={() => setHighlightedIndex(globalIdx)}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-contain bg-slate-50 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200/70 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                            {highlightMatch(product.name, query)}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="capitalize">{product.category}</span>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                              Cheapest at {product.bestStore}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block font-mono">
                          {getProductPrice(product)}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded">
                          Best Deal
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Empty State if no live or catalog match */}
            {isNoResults && (
              <div className="p-6 text-center space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No live indexed or catalog products found matching <span className="font-semibold text-slate-800 dark:text-slate-200">"{query}"</span>
                </p>
                {openTrackModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      openTrackModal();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Track an Amazon / Flipkart link for this
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <span>See all search results in catalog for "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
