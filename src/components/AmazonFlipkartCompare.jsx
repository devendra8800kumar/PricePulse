import React, { useState } from 'react';
import { 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  TrendingDown, 
  Award,
  ShieldCheck,
  Zap,
  Truck,
  CreditCard
} from 'lucide-react';
import { TRENDING_PRODUCTS, formatCurrency } from '../data/electronicsData';

export default function AmazonFlipkartCompare({ onSelectProduct, currency = 'INR' }) {
  const [selectedProductId, setSelectedProductId] = useState(TRENDING_PRODUCTS[0].id);

  const activeProduct = TRENDING_PRODUCTS.find(p => p.id === selectedProductId) || TRENDING_PRODUCTS[0];

  const amazonRetailer = activeProduct.retailers.find(r => r.name.toLowerCase().includes('amazon')) || activeProduct.retailers[0];
  const flipkartRetailer = activeProduct.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || activeProduct.retailers[1] || activeProduct.retailers[0];

  const amazonPrice = currency === 'USD' ? amazonRetailer.priceUSD : amazonRetailer.priceINR;
  const flipkartPrice = currency === 'USD' ? flipkartRetailer.priceUSD : flipkartRetailer.priceINR;

  const priceDiff = Math.abs(amazonPrice - flipkartPrice);
  const isFlipkartCheaper = flipkartPrice < amazonPrice;
  const isAmazonCheaper = amazonPrice < flipkartPrice;
  const isTied = amazonPrice === flipkartPrice;

  return (
    <section id="compare" className="py-16 sm:py-20 bg-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-amber-800 font-bold">Amazon</span>
            <span className="text-slate-400 font-mono text-[10px]">VS</span>
            <span className="text-blue-800 font-bold">Flipkart</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Live Dual Comparison</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Amazon vs Flipkart <br className="hidden sm:inline" />
            <span className="text-blue-600">Price Comparison Matrix</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base">
            Know exactly which platform has the lowest verified price, genuine card discounts, and fastest delivery right now.
          </p>
        </div>

        {/* Product Selector Quick Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 no-scrollbar justify-start md:justify-center">
          {TRENDING_PRODUCTS.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedProductId(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                selectedProductId === item.id
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{item.name.split('(')[0]}</span>
              {item.bestStore && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                  selectedProductId === item.id 
                    ? 'bg-blue-800 text-white' 
                    : item.bestStore.includes('Flipkart') 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.bestStore.includes('Flipkart') ? 'Flipkart Win' : 'Amazon Win'}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Head-to-Head Arena Container */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-slate-50/70 border border-slate-200 p-5 sm:p-7 shadow-xs">
          
          {/* Active Product Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover bg-white border border-slate-200 shadow-2xs shrink-0"
              />
              <div>
                <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {activeProduct.categoryName}
                </span>
                <h3 className="text-base sm:text-xl font-bold text-slate-900 mt-1">
                  {activeProduct.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{activeProduct.specs}</p>
              </div>
            </div>

            <button
              onClick={() => onSelectProduct(activeProduct)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-blue-600 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <span>Deep Price History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3-Column Arena: Amazon Card | Battle Outcome & Savings | Flipkart Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-6 items-stretch">
            
            {/* 1. Amazon Card */}
            <div className={`md:col-span-5 rounded-2xl p-5 flex flex-col justify-between transition-colors relative border ${
              isAmazonCheaper 
                ? 'bg-amber-50/70 border-amber-300 shadow-xs ring-1 ring-amber-300' 
                : 'bg-white border-slate-200'
            }`}>
              {isAmazonCheaper && (
                <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] uppercase shadow-xs">
                  <Award className="w-3 h-3 text-white" />
                  Lowest Price Winner
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                      A
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Amazon India</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    In Stock
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-slate-500 block">Current Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(amazonPrice, currency)}
                    </span>
                    <span className="text-xs line-through text-slate-400">
                      {formatCurrency(currency === 'USD' ? amazonRetailer.originalPriceUSD : amazonRetailer.originalPriceINR, currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{amazonRetailer.delivery}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-amber-800 font-medium">{amazonRetailer.bankOffer}</span>
                  </div>
                </div>
              </div>

              <a
                href={amazonRetailer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl text-center text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View on Amazon India</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* 2. Middle Battle Summary Pill */}
            <div className="md:col-span-2 flex flex-col items-center justify-center py-4 px-2 text-center bg-white rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Battle Result
              </span>

              {isTied ? (
                <span className="text-xs font-bold text-slate-700">Both Stores Match</span>
              ) : (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isFlipkartCheaper ? 'Flipkart' : 'Amazon'} Wins
                  </span>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded block">
                    Saves {formatCurrency(priceDiff, currency)}
                  </span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-100 w-full text-center">
                <span className="text-[10px] text-slate-400 block">Recommendation</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 inline-block ${
                  activeProduct.recommendation === 'BUY NOW'
                    ? 'badge-buy'
                    : activeProduct.recommendation === 'WAIT'
                    ? 'badge-wait'
                    : 'badge-deal'
                }`}>
                  {activeProduct.recommendation}
                </span>
              </div>
            </div>

            {/* 3. Flipkart Card */}
            <div className={`md:col-span-5 rounded-2xl p-5 flex flex-col justify-between transition-colors relative border ${
              isFlipkartCheaper 
                ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-1 ring-blue-300' 
                : 'bg-white border-slate-200'
            }`}>
              {isFlipkartCheaper && (
                <div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] uppercase shadow-xs">
                  <Award className="w-3 h-3 text-white" />
                  Lowest Price Winner
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                      F
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Flipkart</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    In Stock
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-xs text-slate-500 block">Current Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(flipkartPrice, currency)}
                    </span>
                    <span className="text-xs line-through text-slate-400">
                      {formatCurrency(currency === 'USD' ? flipkartRetailer.originalPriceUSD : flipkartRetailer.originalPriceINR, currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{flipkartRetailer.delivery}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-blue-800 font-medium">{flipkartRetailer.bankOffer}</span>
                  </div>
                </div>
              </div>

              <a
                href={flipkartRetailer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl text-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View on Flipkart</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
