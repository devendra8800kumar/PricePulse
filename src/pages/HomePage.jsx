import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  ChevronRight,
  Flame,
  Clock,
  Layers
} from 'lucide-react';
import Hero from '../components/Hero';
import ProductFlipCard from '../components/ProductFlipCard';
import AmazonFlipkartCompare from '../components/AmazonFlipkartCompare';
import HowItWorks from '../components/HowItWorks';
import AiSection from '../components/AiSection';
import { CATEGORIES, TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const { openSearch, currency, formatPrice } = useApp();
  const navigate = useNavigate();

  // Top price drop deals (high discounts)
  const topDeals = TRENDING_PRODUCTS.filter(p => p.discountPercent >= 15).slice(0, 3);

  // Buy Now recommended products
  const buyNowProducts = TRENDING_PRODUCTS.filter(p => p.recommendation === 'BUY NOW').slice(0, 3);

  return (
    <div className="space-y-0">
      
      {/* 1. Compact Hero Section with search & live preview */}
      <Hero 
        onExploreClick={(e) => {
          if (e?.preventDefault) e.preventDefault();
          navigate('/products');
        }}
        onCompareClick={(e) => {
          if (e?.preventDefault) e.preventDefault();
          navigate('/compare');
        }}
        onOpenSearch={(query) => {
          navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
        }}
        currency={currency}
      />

      {/* 2. Popular Categories Quick Strip */}
      <section className="py-8 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Browse by Electronics Category
            </h3>
            <Link 
              to="/products"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All 10 Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {CATEGORIES.filter(c => c.id !== 'all').slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-colors text-center group"
              >
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 block truncate">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-600 block mt-0.5">
                  Track Drops
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Electronics with 3D Flip Card Animation */}
      <section className="py-14 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Interactive 3D Cards • Click "Flip Stats"</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Trending <span className="text-blue-600">Electronics</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
                Compare prices in real time. Click "Flip Stats" on any card to reveal deep Amazon vs Flipkart analysis and AI buy signals.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:text-blue-600 shadow-2xs transition-colors self-start sm:self-auto"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Product Cards Grid with 3D Flip Card Component */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRENDING_PRODUCTS.slice(0, 6).map((product) => (
              <ProductFlipCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
            >
              <span>Browse All {TRENDING_PRODUCTS.length} Electronics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* 4. Best Current Deals & Largest Price Drops Callout */}
      <section className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Flame className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900">
              Steepest Verified Price Drops This Week
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topDeals.map((deal) => {
              const az = deal.retailers.find(r => r.name.toLowerCase().includes('amazon')) || deal.retailers[0];
              const fk = deal.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || deal.retailers[1] || deal.retailers[0];
              const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
              const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
              const lowest = Math.min(azPrice, fkPrice);

              return (
                <div 
                  key={deal.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-colors flex items-center gap-4 group"
                >
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-16 h-16 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {deal.discountPercent}% OFF
                    </span>
                    <Link
                      to={`/products/${deal.slug || deal.id}`}
                      className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors block truncate mt-1"
                    >
                      {deal.name}
                    </Link>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Lowest: <strong className="text-slate-900">{formatPrice(lowest)}</strong> on {deal.bestStore}
                    </p>
                  </div>
                  <Link
                    to={`/products/${deal.slug || deal.id}`}
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Head-to-Head Amazon vs Flipkart Battle Arena */}
      <AmazonFlipkartCompare 
        onSelectProduct={(product) => {
          navigate(`/products/${product.slug || product.id}`);
        }}
        currency={currency}
      />

      {/* 6. How PricePulse Works (3-Step Workflow) */}
      <HowItWorks />

      {/* 7. AI Intelligence Preview */}
      <AiSection currency={currency} />

    </div>
  );
}
