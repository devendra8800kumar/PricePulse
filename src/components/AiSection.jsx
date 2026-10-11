import React, { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Gauge, 
  Zap, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { AI_INSIGHTS_HIGHLIGHTS, formatCurrency } from '../data/electronicsData';

export default function AiSection({ currency = 'INR' }) {
  const [selectedDemoProduct, setSelectedDemoProduct] = useState('phone');

  const demoScenarios = {
    phone: {
      item: 'Apple iPhone 16 Pro (256GB)',
      category: 'Smartphones',
      currentPrice: currency === 'USD' ? '$1,179' : '₹1,17,990',
      predictedFloor: currency === 'USD' ? '$1,149' : '₹1,14,900',
      recentAverage: currency === 'USD' ? '$1,245' : '₹1,24,500',
      percentBelowAverage: '5%',
      potentialSaving: currency === 'USD' ? '$30 additional' : '₹3,090 additional',
      recommendation: 'WAIT',
      recommendationType: 'wait',
      aiScore: 78,
      insightHeadline: 'Flipkart Big Savings Days upcoming in 9 days.',
      insightText: 'Current price is 5% below recent average. However, historical sale trends suggest waiting 9 days for the upcoming end-of-quarter sale, which typically yields an additional ₹3,000 to ₹4,500 in card cashback.',
      supportingEvidence: [
        'Quarterly sales cycle has triggered drops in 4 of the last 4 quarters.',
        'Amazon India and Flipkart are currently matching within 1.5% margin.',
        'Inventory levels remain stable with no imminent supply shortage.'
      ]
    },
    laptop: {
      item: 'Apple MacBook Pro 16" (M3 Max, 36GB)',
      category: 'Laptops',
      currentPrice: currency === 'USD' ? '$3,199' : '₹2,89,900',
      predictedFloor: currency === 'USD' ? '$3,149' : '₹2,84,900',
      recentAverage: currency === 'USD' ? '$3,340' : '₹3,04,500',
      percentBelowAverage: '9%',
      potentialSaving: currency === 'USD' ? '$300 saved against MRP' : '₹30,000 saved against MRP',
      recommendation: 'BUY NOW',
      recommendationType: 'buy',
      aiScore: 95,
      insightHeadline: 'Price within 1.7% of all-time historical floor.',
      insightText: 'Current price is 9% below the recent 90-day average. Amazon India currently has fewer than 15 units in stock. High probability of price rebound once current promotional lot clears.',
      supportingEvidence: [
        'Amazon India price is at a 90-day verified low of ₹2,89,900.',
        'Cheaper than Flipkart by ₹4,000.',
        'Stock indicator shows low regional warehouse units in metro hubs.'
      ]
    },
    audio: {
      item: 'Sony WH-1000XM5 Wireless ANC',
      category: 'Headphones',
      currentPrice: currency === 'USD' ? '$318' : '₹25,999',
      predictedFloor: currency === 'USD' ? '$314' : '₹25,490',
      recentAverage: currency === 'USD' ? '$355' : '₹29,900',
      percentBelowAverage: '13%',
      potentialSaving: currency === 'USD' ? '$81 off MRP' : '₹8,991 off MRP',
      recommendation: 'GOOD DEAL',
      recommendationType: 'deal',
      aiScore: 94,
      insightHeadline: 'Current price is 13% below the recent 90-day average.',
      insightText: 'Current price is 13% below the recent average. Consider comparing the current offer with the historical low before purchasing. Current Flipkart flash discount provides substantial immediate value.',
      supportingEvidence: [
        'Only ₹509 away from all-time Diwali record low.',
        'Includes 10% instant card discount on SBI and Axis.',
        'Flipkart is ₹991 cheaper than Amazon today.'
      ]
    }
  };

  const currentScenario = demoScenarios[selectedDemoProduct];

  return (
    <section id="ai-insights" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Price Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            "Don't just find the price. <br className="hidden sm:inline" />
            <span className="text-blue-600">Find the right time to buy."</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base">
            PricePulse evaluates historical discount patterns, sale schedules, and platform price wars to generate actionable buying advice.
          </p>
        </div>

        {/* AI Capabilities Cards & Simulator Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* Left Column: 3 Pillars */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Seasonal Cadence Models</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tracks historical Prime Day, Big Billion Days, and monthly clearance sales to forecast when platforms are likely to cut prices next.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Gauge className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Buy Score Index (0-100)</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scores every gadget based on proximity to historical floor prices, stock liquidity, and current retailer competition.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Fake Discount Auditing</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flags artificial MRP markups before festive sales so you only act on verified, genuine savings.
              </p>
            </div>
          </div>

          {/* Right Column: Premium AI Insights Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs">
              
              {/* Header with Switcher Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                      PricePulse AI Insight
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Demo Data Preview
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{currentScenario.item}</h4>
                </div>

                {/* Scenario switcher buttons */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
                  <button
                    onClick={() => setSelectedDemoProduct('phone')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDemoProduct === 'phone'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    iPhone 16 Pro
                  </button>
                  <button
                    onClick={() => setSelectedDemoProduct('laptop')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDemoProduct === 'laptop'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    MacBook Pro
                  </button>
                  <button
                    onClick={() => setSelectedDemoProduct('audio')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedDemoProduct === 'audio'
                        ? 'bg-white text-blue-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sony XM5
                  </button>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Algorithmic Signal</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    currentScenario.recommendation === 'BUY NOW'
                      ? 'badge-buy'
                      : currentScenario.recommendation === 'WAIT'
                      ? 'badge-wait'
                      : 'badge-deal'
                  }`}>
                    {currentScenario.recommendation}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-900 mb-1">
                  {currentScenario.insightHeadline}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {currentScenario.insightText}
                </p>
              </div>

              {/* Key Supporting Evidence List */}
              <div className="mb-5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Supporting Evidence & Market Data
                </h5>
                <ul className="space-y-2">
                  {currentScenario.supportingEvidence.map((evidence, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metric Breakdown Tiles */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 text-center">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Current Price</span>
                  <span className="text-sm font-bold text-slate-900">{currentScenario.currentPrice}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Recent Average</span>
                  <span className="text-sm font-bold text-slate-900">{currentScenario.recentAverage}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">AI Buy Score</span>
                  <span className="text-sm font-bold text-blue-600">{currentScenario.aiScore}/100</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
