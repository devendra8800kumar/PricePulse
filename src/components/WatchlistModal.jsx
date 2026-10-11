import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  Bell, 
  Check
} from 'lucide-react';
import { TRENDING_PRODUCTS, formatCurrency } from '../data/electronicsData';

export default function WatchlistModal({ 
  isOpen, 
  onClose, 
  watchlist = {}, 
  onToggleWatchlist, 
  onSelectProduct, 
  currency = 'INR' 
}) {
  const [alertEmail, setAlertEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);

  if (!isOpen) return null;

  const watchlistedProducts = TRENDING_PRODUCTS.filter(p => watchlist[p.id]);

  const handleSaveEmail = (e) => {
    e.preventDefault();
    if (alertEmail) {
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 3500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-7 text-slate-900 my-6 max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>My Price Watchlist</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  {watchlistedProducts.length} items
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tracking price drops across Amazon & Flipkart
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {watchlistedProducts.length > 0 ? (
            watchlistedProducts.map((item) => {
              const az = item.retailers.find(r => r.name.toLowerCase().includes('amazon')) || item.retailers[0];
              const fk = item.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || item.retailers[1] || item.retailers[0];
              const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
              const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
              const bestPrice = Math.min(azPrice, fkPrice);
              const isFkCheaper = fkPrice < azPrice;

              return (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.name.split('(')[0]}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          item.recommendation === 'BUY NOW'
                            ? 'badge-buy'
                            : item.recommendation === 'WAIT'
                            ? 'badge-wait'
                            : 'badge-deal'
                        }`}>
                          {item.recommendation}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Amazon: <strong className="text-amber-800">{formatCurrency(azPrice, currency)}</strong> • 
                        Flipkart: <strong className="text-blue-800">{formatCurrency(fkPrice, currency)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-sm font-extrabold text-slate-900 block">
                        {formatCurrency(bestPrice, currency)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {isFkCheaper ? 'Flipkart Best' : 'Amazon Best'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectProduct(item);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Analyze price history"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onToggleWatchlist(item.id)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 px-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Bookmark className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">Your Watchlist is Empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                Click the bookmark icon on any gadget card to track its price drops in real time.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {TRENDING_PRODUCTS.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onToggleWatchlist(item.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                  >
                    + Add {item.name.split('(')[0]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Email Drop Notification Connect */}
        <div className="pt-3 border-t border-slate-100">
          <form onSubmit={handleSaveEmail} className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Email for instant drop notifications..."
              className="w-full sm:flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
            >
              {emailSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Email Connected!</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-white" />
                  <span>Enable Drop Alerts</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
