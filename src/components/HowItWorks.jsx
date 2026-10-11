import React from 'react';
import { 
  BarChart3, 
  History, 
  ShoppingCart, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HOW_IT_WORKS_STEPS } from '../data/electronicsData';

export default function HowItWorks() {
  const getStepIcon = (index) => {
    switch (index) {
      case 0:
        return <BarChart3 className="w-6 h-6 text-blue-600" />;
      case 1:
        return <History className="w-6 h-6 text-indigo-600" />;
      case 2:
      default:
        return <ShoppingCart className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <section id="history" className="py-16 sm:py-20 bg-white border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Automated 3-Step Process</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            How <span className="text-blue-600">PricePulse Works</span>
          </h2>

          {/* Workflow Sequence Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 py-1.5 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 mb-4 shadow-2xs">
            <span className="text-blue-700 font-bold">1. Compare Prices</span>
            <span className="text-slate-400">→</span>
            <span className="text-indigo-700 font-bold">2. Analyze History</span>
            <span className="text-slate-400">→</span>
            <span className="text-emerald-700 font-bold">3. Buy at the Right Time</span>
          </div>

          <p className="text-slate-600 text-sm sm:text-base">
            Avoid fake festival markups and make confident purchasing decisions backed by real Amazon and Flipkart price trends.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              className="rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-300 p-6 flex flex-col justify-between hover:shadow-card-hover transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-mono text-base font-extrabold text-slate-900 shadow-2xs">
                    {item.step}
                  </span>

                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200">
                    {item.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    {getStepIcon(idx)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                </div>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5">
                  {item.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {item.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Phase {item.step} of 03</span>
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  Verified Engine
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Genuine Discount Verification Banner */}
        <div className="mt-10 p-5 rounded-2xl bg-blue-50/50 border border-blue-200 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Audit fake "Big Billion Days" and "Great Indian Festival" markups
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Our historical engine detects artificially inflated base prices to ensure your savings are authentic.
              </p>
            </div>
          </div>

          <a
            href="#ai-insights"
            className="shrink-0 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-blue-600 transition-colors shadow-2xs"
          >
            Explore AI Engine →
          </a>
        </div>

      </div>
    </section>
  );
}
