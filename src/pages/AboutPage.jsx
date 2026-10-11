import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  BarChart3, 
  Zap, 
  Eye, 
  Scale, 
  HelpCircle,
  ShoppingBag,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <Scale className="w-6 h-6 text-blue-600" />,
      title: 'Real-Time Cross-Store Comparison',
      desc: 'We simultaneously track Amazon and Flipkart to immediately highlight the cheaper platform, including delivery and seller ratings.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: 'Predictive AI Buy Score (0-100)',
      desc: 'Our proprietary algorithm analyzes 90-day moving averages, historical lows, and seasonal festival trends to advise: BUY NOW, WAIT, or GOOD DEAL.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: 'Multi-Period Historical Charts',
      desc: 'Switch between 7-day, 1-month, 3-month, and 6-month historical time horizons to distinguish genuine bargains from fake artificial price hikes.'
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: 'Target Price Drop Alerts',
      desc: 'Set your dream budget for any laptop, smartphone, or headphones. As soon as the price falls to or below your target, you receive an immediate alert.'
    },
    {
      icon: <Layers className="w-6 h-6 text-cyan-600" />,
      title: '3D Card Flip Intelligence',
      desc: 'A first-in-class tactile 3D flip card experience that lets shoppers inspect deep platform price breakdowns without ever losing their place in the catalog.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: 'Zero Seller Bias',
      desc: 'PricePulse is strictly consumer-first. We do not promote sponsored listings or manipulate ranks for retailers. You always see the genuine lowest price.'
    }
  ];

  const faqs = [
    {
      q: 'Is PricePulse completely free for shoppers?',
      a: 'Yes, 100% free. You can track prices, compare Amazon vs Flipkart, inspect historical charts, and set price drop alerts without paying a single rupee.'
    },
    {
      q: 'How frequently are electronics prices updated?',
      a: 'Popular smartphones, laptops, and consoles are refreshed multiple times daily. During festive sales (like Amazon Great Indian Festival and Flipkart Big Billion Days), tracking frequency increases to capture lightning deals.'
    },
    {
      q: 'How is the AI Buy Score calculated?',
      a: 'The score (0 to 100) evaluates: (1) Current price versus all-time historical low, (2) Deviation from the 30-day and 90-day moving average, (3) Price volatility score, and (4) Upcoming holiday sale cycles.'
    },
    {
      q: 'Do you track shipping costs and bank card discounts?',
      a: 'We track base listing prices and highlight regular platform discounts. Detailed bank card cashback offers (e.g. HDFC/ICICI 10% instant discount) are calculated where verified retail data feeds provide structured promotion tags.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 pt-16 pb-20 border-b border-slate-200/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-400/10 to-cyan-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm">
            <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
            The Intelligence Standard for Electronics Shopping
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Track the Price. <br className="hidden sm:block" />
            Predict the Moment. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              Buy Smarter.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
            PricePulse is built for Indian consumers who refuse to overpay for electronics. We continuously analyze Amazon and Flipkart price trends so you always pull the trigger at the absolute best moment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/products"
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              Explore Electronics Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/compare"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-200 shadow-sm transition-all"
            >
              Side-by-Side Comparison
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Platform Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-8 grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="text-center pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-1">₹4.8 Cr+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated User Savings</div>
          </div>
          <div className="text-center pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">12,500+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Electronics Tracked</div>
          </div>
          <div className="text-center pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-cyan-600 mb-1">99.4%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Accuracy</div>
          </div>
          <div className="text-center pt-4 lg:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1">15 Mins</div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Update Frequency</div>
          </div>
        </div>
      </section>

      {/* 3. The Problem & Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">The Problem</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              E-commerce price algorithms change faster than you think.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Have you ever purchased a smartphone or laptop only to watch it drop ₹4,000 two days later? Major e-commerce platforms run dynamic algorithmic repricing based on demand, inventory, and competitor matching.
            </p>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              PricePulse balances the playing field. We bring transparency back to online retail, empowering shoppers with historical data, predictive scores, and cross-store side-by-side breakdowns.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">Our Mission</div>
            <h3 className="text-xl font-bold mb-4">Consumer-First Intelligence</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              To build India's cleanest, most intuitive electronics price intelligence platform that protects consumers from artificially inflated discounts and hidden markup tricks.
            </p>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero fake coupon tricks or misleading timers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Honest disclosure of actual historical lows</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Transparent AI Buy Score methodology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section className="bg-white py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">How PricePulse Works</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered with precision for tech enthusiasts and smart shoppers.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div 
                key={i}
                className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/70 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{f.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <HelpCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 mt-2">Everything you need to know about PricePulse</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Legal & Retailer Disclosure */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 leading-relaxed space-y-2">
          <p className="font-bold text-slate-700">Legal Disclosures & Trademark Attribution:</p>
          <p>
            Amazon, Flipkart, Apple, Samsung, Sony, Dell, ASUS, OnePlus and other trademarks or brand names mentioned on PricePulse belong exclusively to their respective owners. PricePulse is an independent consumer price intelligence tool and does not claim affiliation or endorsement by these retailers.
          </p>
          <p>
            All price comparisons and historical records are gathered for comparative consumer research. Simulated demo records are indicated where direct partner API keys have not yet been provisioned in your hosting environment.
          </p>
        </div>
      </section>
    </div>
  );
}
