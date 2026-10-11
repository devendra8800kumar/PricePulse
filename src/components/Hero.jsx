import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HERO_CHART_SCENARIOS } from '../data/electronicsData';
import Button from './ui/Button';
import SearchBar from './ui/SearchBar';
import PriceCard from './ui/PriceCard';
import PriceChart from './ui/PriceChart';

export default function Hero({ onExploreClick, onCompareClick, onOpenSearch, currency = 'INR' }) {
  const [activeTab, setActiveTab] = useState('iphone');

  const currentDataset = HERO_CHART_SCENARIOS[activeTab];
  const chartData = currency === 'USD' ? currentDataset.dataUSD : currentDataset.dataINR;

  const tabs = [
    { id: 'iphone', label: 'iPhone 16 Pro' },
    { id: 'macbook', label: 'MacBook Pro M3' },
    { id: 'sony', label: 'Sony XM5' },
  ];

  return (
    <section 
      id="home" 
      className="relative pt-6 sm:pt-10 pb-10 overflow-hidden soft-mesh-bg border-b border-slate-200/80"
    >
      {/* Subtle light ambient radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[340px] bg-gradient-to-b from-blue-400/10 via-cyan-400/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-blue-300/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-300/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Top Feature Pill */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex justify-center mb-3 sm:mb-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200/90 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              Live Amazon vs Flipkart Price Intelligence
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              AI Buy Timing Engine
            </span>
          </div>
        </motion.div>

        {/* Main Headline & Description with Clamp Fluid Typography */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-[clamp(2.15rem,4.6vw,3.65rem)] font-black tracking-tight text-slate-900 mb-2.5 leading-[1.12]"
          >
            Buy Smarter.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent block sm:inline">
              Not Just Cheaper.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto mb-5"
          >
            Real-time cross-store price monitoring, historical price floors, and predictive AI timing so you never overpay for tech.
          </motion.p>

          {/* Large Functional Product Search Bar with Autocomplete Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="max-w-xl mx-auto mb-4"
          >
            <SearchBar 
              onSubmit={(q) => onOpenSearch(q)}
              onSelectProduct={(p) => onOpenSearch(p.name)}
            />

            {/* Quick search suggestions as consistent pill buttons */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-xs text-slate-500">
              <span className="text-slate-400 text-xs font-medium">Popular:</span>
              {['iPhone 16 Pro', 'MacBook Pro M3', 'Sony XM5', 'AirPods Pro', 'OLED TV'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onOpenSearch(tag)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/90 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-all duration-150 cursor-pointer text-xs font-medium shadow-2xs active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons: lg primary & secondary, same height, stacked on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto"
          >
            <Button
              onClick={onExploreClick}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto min-w-[190px] h-12"
              rightIcon={<ArrowRight className="w-4.5 h-4.5" />}
            >
              Explore Products
            </Button>

            <Button
              onClick={onCompareClick}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto min-w-[190px] h-12"
              leftIcon={<Zap className="w-4.5 h-4.5 text-amber-500" />}
            >
              Compare Prices
            </Button>
          </motion.div>

          {/* Slim Trust Row below CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-4 text-xs text-slate-500 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tracks 10,000+ electronics
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Updated every hour
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              100% Free & Unbiased
            </span>
          </motion.div>
        </div>

        {/* Live Price Comparison Card - Peeks above the fold on 1080p */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="max-w-4xl mx-auto rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-6 shadow-md shadow-slate-200/50 hover:shadow-lg transition-all"
        >
          {/* Card Header & Segmented Tab Switcher with Sliding Active Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Live Price Battle Preview
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Stores
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {currentDataset.name}
              </h3>
            </div>

            {/* Segmented Control Switcher with Framer Motion Sliding Pill */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl relative border border-slate-200/60 self-start sm:self-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                      isActive ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeHeroTab"
                        className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-200/60"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modular PriceCard Tile Deck (Amazon, Flipkart, Savings, AI Verdict) */}
          <div className="py-4">
            <PriceCard dataset={currentDataset} currency={currency} />
          </div>

          {/* Modular Recharts Price History Line/Area Chart */}
          <div className="pt-2">
            <PriceChart 
              data={chartData} 
              currency={currency} 
              height={200}
              showTimeRangeSelector={true}
            />
          </div>

          {/* Graph Footer Status */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400">
            <span>Price trends derived from high-frequency store scraping</span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={onCompareClick}>
              Launch Full Side-by-Side Comparison →
            </span>
          </div>

        </motion.div>

      </div>
    </section>
  );
}
