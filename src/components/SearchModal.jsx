import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { TRENDING_PRODUCTS, formatCurrency } from '../data/electronicsData';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  onSelectProduct, 
  currency = 'INR',
  initialQuery = '' 
}) {
  const [query, setQuery] = useState(initialQuery);

  // Sync initial query when opened from Hero or Navbar
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery || '');
    }
  }, [isOpen, initialQuery]);

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

  const filtered = TRENDING_PRODUCTS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    item.categoryName.toLowerCase().includes(query.toLowerCase()) ||
    item.specs.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search iPhone, MacBook, Sony headphones, OLED TVs..."
            className="w-full bg-transparent border-none text-slate-900 placeholder-slate-400 text-sm focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
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
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.name.split('(')[0]}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.categoryName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Amazon: <strong className="text-amber-800">{formatCurrency(azPrice, currency)}</strong> • 
                        Flipkart: <strong className="text-blue-800">{formatCurrency(fkPrice, currency)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">
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
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching electronics found for "{query}". Try "MacBook", "iPhone", or "Sony".
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Press</span>
            <kbd className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-600 font-mono">ESC</kbd>
            <span>to close</span>
          </div>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-600" />
            Live Amazon & Flipkart Comparison
          </span>
        </div>
      </div>
    </div>
  );
}
