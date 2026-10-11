import React from 'react';
import { X, ExternalLink, ArrowRight, Sparkles, Check, Trash2, Award } from 'lucide-react';
import { TRENDING_PRODUCTS, formatCurrency } from '../data/electronicsData';

export default function CompareModal({
  isOpen,
  onClose,
  selectedForCompare = {},
  onToggleCompare,
  onSelectProduct,
  currency = 'INR'
}) {
  if (!isOpen) return null;

  const compareList = TRENDING_PRODUCTS.filter(p => selectedForCompare[p.id]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-7 text-slate-900 my-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                Side-by-Side Product Comparison
              </span>
              <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                {compareList.length} of 3 Products Selected
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Electronics Comparison Matrix
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {compareList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500 mb-4">
              You haven't selected any products to compare yet.
            </p>
            <p className="text-xs text-slate-400">
              Click the "+ Compare" button on any product card in the Trending Electronics section to compare up to 3 devices side-by-side.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className={`grid gap-4 ${
              compareList.length === 1 
                ? 'grid-cols-1 max-w-md mx-auto' 
                : compareList.length === 2 
                ? 'grid-cols-1 sm:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-3'
            }`}>
              {compareList.map((product) => {
                const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
                const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
                const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
                const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
                const lowest = Math.min(azPrice, fkPrice);
                const floor = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;
                const avg = currency === 'USD' ? product.averageHistoricalPriceUSD : product.averageHistoricalPriceINR;

                return (
                  <div 
                    key={product.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Action & Remove */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {product.categoryName}
                        </span>
                        <button
                          onClick={() => onToggleCompare(product.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image */}
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-36 rounded-xl object-cover bg-white border border-slate-200 mb-3"
                      />

                      {/* Name & Specs */}
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {product.specs}
                      </p>

                      {/* Price Section */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 mb-3">
                        <span className="text-[10px] text-slate-500 block">Lowest Current Price</span>
                        <span className="text-xl font-black text-slate-900 block">
                          {formatCurrency(lowest, currency)}
                        </span>
                        <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-amber-800 font-medium">Amazon: {formatCurrency(azPrice, currency)}</span>
                          <span className="text-blue-800 font-medium">Flipkart: {formatCurrency(fkPrice, currency)}</span>
                        </div>
                      </div>

                      {/* AI Signal */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 mb-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Recommendation:</span>
                          <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                            product.recommendation === 'BUY NOW'
                              ? 'badge-buy'
                              : product.recommendation === 'WAIT'
                              ? 'badge-wait'
                              : 'badge-deal'
                          }`}>
                            {product.recommendation}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Buy Score:</span>
                          <span className="font-bold text-blue-700">{product.aiScore}/100</span>
                        </div>
                      </div>

                      {/* Historical Benchmarks */}
                      <div className="space-y-1 text-xs text-slate-600 mb-4 px-1">
                        <div className="flex justify-between">
                          <span>Historical Floor:</span>
                          <strong className="text-emerald-700">{formatCurrency(floor, currency)}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Recent Average:</span>
                          <strong className="text-slate-800">{formatCurrency(avg, currency)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Detailed Analysis
                      </button>
                    </div>

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
