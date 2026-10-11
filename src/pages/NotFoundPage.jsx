import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Home, 
  ArrowRight, 
  SlidersHorizontal, 
  Sparkles, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Watch, 
  Gamepad2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotFoundPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { openSearch } = useApp();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    } else {
      openSearch();
    }
  };

  const popularCategories = [
    { name: 'Smartphones', icon: <Smartphone className="w-4 h-4" />, slug: 'smartphones' },
    { name: 'Laptops', icon: <Laptop className="w-4 h-4" />, slug: 'laptops' },
    { name: 'Audio & Buds', icon: <Headphones className="w-4 h-4" />, slug: 'audio' },
    { name: 'Smartwatches', icon: <Watch className="w-4 h-4" />, slug: 'smartwatches' },
    { name: 'Gaming Consoles', icon: <Gamepad2 className="w-4 h-4" />, slug: 'gaming' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 bg-[#F8FAFC]">
      <div className="max-w-xl w-full text-center">
        {/* 1. Pulse Graphic */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-blue-100/70 border border-blue-200/80 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border border-blue-400/40 animate-ping opacity-30" />
            <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
          </div>
          <span className="absolute -bottom-2 px-3 py-1 bg-slate-900 text-cyan-400 text-xs font-black rounded-full uppercase tracking-widest shadow-md">
            404 Error
          </span>
        </div>

        {/* 2. Heading & Subtitle */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Price Signal Lost
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
          The page or product you're looking for doesn't exist, has moved, or the price drop was so lightning-fast it vanished.
        </p>

        {/* 3. Instant Product Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search iPhone, MacBook, Sony WH-1000XM5..."
            className="w-full pl-11 pr-24 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Find
          </button>
        </form>

        {/* 4. Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            to="/"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all inline-flex items-center gap-2"
          >
            Explore Electronics
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/compare"
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all inline-flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            Compare Prices
          </Link>
        </div>

        {/* 5. Popular Categories Shortcuts */}
        <div className="pt-8 border-t border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
            Or browse popular categories
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.name}`}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 transition-all flex items-center gap-1.5 shadow-2xs"
              >
                {cat.icon}
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
