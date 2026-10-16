import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  SlidersHorizontal, 
  Trash2, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Star, 
  ExternalLink, 
  TrendingDown,
  CheckCircle2,
  X
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { normalizeApiProduct } from '../services/productService';
import { useApp } from '../context/AppContext';

export default function ComparePage() {
  const { compareList, removeFromCompare, toggleCompare, clearCompare, formatPrice, currency, apiProducts } = useApp();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Merge live API products with demo catalog
  const allAvailableProducts = React.useMemo(() => {
    const normalizedApi = (apiProducts || []).map(normalizeApiProduct).filter(Boolean);
    const apiIds = new Set(normalizedApi.map(p => p.id));
    const dedupedDemo = TRENDING_PRODUCTS.filter(p => !apiIds.has(p.id));
    return [...normalizedApi, ...dedupedDemo];
  }, [apiProducts]);

  // Selected products list
  const selectedProducts = allAvailableProducts.filter(p => compareList.includes(p.id));

  // Available products not yet added
  const availableToAdd = allAvailableProducts.filter(p => !compareList.includes(p.id));

  return (
    <div className="py-8 bg-slate-50 dark:bg-[#0B0F19] min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Side-by-Side Matrix</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Compare <span className="text-blue-600 dark:text-blue-400">Electronics</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Compare up to 3 electronics devices head-to-head across Amazon India and Flipkart base pricing, historical lows, and AI buy signals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {selectedProducts.length < 3 && availableToAdd.length > 0 && (
              <button
                onClick={() => setIsSelectorOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product ({selectedProducts.length}/3)</span>
              </button>
            )}

            {selectedProducts.length > 0 && (
              <button
                onClick={clearCompare}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Modal / Tray to select a product to add to compare */}
        {isSelectorOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsSelectorOpen(false)}
          >
            <div 
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Select a Product to Compare
                </h3>
                <button
                  onClick={() => setIsSelectorOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {availableToAdd.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      toggleCompare(p.id);
                      setIsSelectorOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.categoryName} • {formatPrice(currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR)}</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-blue-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedProducts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-12">
            <SlidersHorizontal className="w-12 h-12 text-blue-600/60 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No products selected for comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Select 2 or 3 gadgets to view side-by-side specs, price trends, and platform differences.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  toggleCompare('prod-1');
                  toggleCompare('prod-5');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Compare iPhone 16 Pro vs S24 Ultra
              </button>
              <Link
                to="/products"
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs"
              >
                Browse All Electronics
              </Link>
            </div>
          </div>
        ) : (
          /* Side-by-Side Comparison Grid */
          <div className="overflow-x-auto pb-6">
            <div className={`grid gap-6 ${
              selectedProducts.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : selectedProducts.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1 md:grid-cols-3'
            }`}>
              {selectedProducts.map((product) => {
                const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
                const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
                const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
                const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
                const lowestPrice = Math.min(azPrice, fkPrice);
                const floorPrice = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
                const avgPrice = currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR;

                const isFkCheaper = fkPrice < azPrice;
                const isAzCheaper = azPrice < fkPrice;

                return (
                  <div
                    key={product.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs dark:shadow-md flex flex-col justify-between transition-colors"
                  >
                    <div>
                      {/* Card Header & Remove Button */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {product.categoryName}
                        </span>

                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image & Title */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-44 rounded-xl object-cover bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3"
                      />

                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1 mb-1 block"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-center gap-1 text-xs text-amber-500 mb-3">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{product.rating || 4.5}</span>
                        <span className="text-slate-400 dark:text-slate-500">({product.reviewsCount || product.reviewCount || 120})</span>
                      </div>

                      {/* Current Lowest Price */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 mb-4">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Lowest Current Price:</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatPrice(lowestPrice)}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5">
                          Cheapest on {product.bestStore || (isAzCheaper ? 'Amazon' : (isFkCheaper ? 'Flipkart' : (product.platform?.toUpperCase() || 'Verified Store')))}
                        </span>
                      </div>

                      {/* Store Breakdown */}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 mb-4 text-xs font-mono">
                        <div className="flex justify-between items-center">
                          <span className="text-amber-800 dark:text-amber-400 font-bold">Amazon:</span>
                          <span className={`font-bold ${isAzCheaper ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {formatPrice(azPrice)}
                            {isAzCheaper && ' (Lowest)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800 dark:text-blue-400 font-bold">Flipkart:</span>
                          <span className={`font-bold ${isFkCheaper ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {formatPrice(fkPrice)}
                            {isFkCheaper && ' (Lowest)'}
                          </span>
                        </div>
                      </div>

                      {/* Historical Benchmarks */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4">
                        <div className="flex justify-between">
                          <span>Historical Low:</span>
                          <strong className="text-emerald-700 dark:text-emerald-400">{formatPrice(floorPrice)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Historical Average:</span>
                          <strong className="text-slate-800 dark:text-slate-200">{formatPrice(avgPrice)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Price Trend:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{product.priceTrendLabel || (product.isLiveApi ? 'Live Telemetry Active' : 'Monitored Trend')}</span>
                        </div>
                      </div>

                      {/* AI Buy Score & Signal */}
                      <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-800/60 mb-4 shadow-2xs">
                        <div className="flex justify-between items-center mb-1.5 text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Buy Score:</span>
                          <span className="font-bold text-blue-700 dark:text-blue-400 bg-white/80 dark:bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800/50">
                            {product.aiScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">AI Signal:</span>
                          <span className={`font-bold px-2.5 py-0.5 rounded-md text-[10px] ${
                            product.recommendation === 'BUY NOW'
                              ? 'badge-buy'
                              : product.recommendation === 'WAIT'
                              ? 'badge-wait'
                              : 'badge-deal'
                          }`}>
                            {product.recommendation}
                          </span>
                        </div>
                      </div>

                      {/* Specifications Summary */}
                      <div className="mb-4">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                          Specifications
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          {product.specs}
                        </p>
                      </div>

                    </div>

                    {/* Bottom Link Action */}
                    <Link
                      to={`/products/${product.slug || product.id}`}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Full Product Analytics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
