import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, X } from 'lucide-react';
import { ALL_PRODUCTS, formatCurrency } from '../../data/electronicsData';
import { useApp } from '../../context/AppContext';
import Button from './Button';

/**
 * Reusable SearchBar Component with Autocomplete Dropdown and Keyboard Navigation
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
  const { currency } = useApp();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync initial query
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // Compute autocomplete suggestions
  const suggestions = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 1) return [];

    return ALL_PRODUCTS.filter((product) => {
      const matchName = product.name.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchSpecs = product.specs ? product.specs.toLowerCase().includes(q) : false;
      return matchName || matchCategory || matchSpecs;
    }).slice(0, 5);
  }, [query]);

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

    // If an item is actively highlighted with keyboard, pick it
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      handleSelect(suggestions[highlightedIndex]);
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

  // Keyboard Navigation: ArrowDown, ArrowUp, Enter, Escape
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    }
  };

  const getProductPrice = (p) => {
    const price = currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR;
    return formatCurrency(price, currency);
  };

  // Highlight matching query text
  const highlightMatch = (text, match) => {
    if (!match.trim()) return text;
    const regex = new RegExp(`(${match.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <strong key={i} className="text-blue-600 font-bold">
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white rounded-2xl border border-slate-300/80 shadow-md shadow-slate-200/50 focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/15 transition-all p-1.5"
      >
        <div className="pl-3.5 pointer-events-none text-slate-400 shrink-0">
          <Search className="w-4.5 h-4.5 text-blue-600" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-autocomplete="list"
          className="w-full pl-3 pr-8 py-2.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors mr-1 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="h-10 px-4 text-xs font-semibold shadow-xs shrink-0"
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Search
        </Button>
      </form>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 text-xs overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100">
            <span>Suggested Electronics</span>
            <span>Use ↑↓ to navigate</span>
          </div>

          <div className="divide-y divide-slate-100">
            {suggestions.map((product, idx) => {
              const isSelected = idx === highlightedIndex;
              return (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-9 h-9 object-contain bg-slate-50 rounded-lg p-0.5 border border-slate-200/70 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-xs text-slate-900 truncate">
                        {highlightMatch(product.name, query)}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="capitalize">{product.category}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">
                          Cheapest at {product.bestStore}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-bold text-xs text-slate-900 block">
                      {getProductPrice(product)}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                      Best Deal
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50/70 text-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <span>See all matching results for "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
