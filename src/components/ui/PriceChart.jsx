import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../data/electronicsData';

/**
 * Reusable PriceChart Component using Recharts
 * Features:
 * - Smooth monotone curves
 * - Distinct Amazon (Orange #F97316) & Flipkart (Blue #2563EB) lines
 * - Auto-scaled Y-axis domain so price differences are distinct and visible
 * - 7D, 30D, 90D Time range selector
 * - Interactive hover tooltip with formatted currency & price gap
 */
export default function PriceChart({
  data,
  currency = 'INR',
  height = 220,
  showTimeRangeSelector = true,
  className = '',
}) {
  const [timeRange, setTimeRange] = useState('90D'); // '7D' | '30D' | '90D'

  // Filter or transform data based on time range
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];

    if (timeRange === '7D') {
      return data.slice(-3); // Last 3 points / recent week
    }
    if (timeRange === '30D') {
      return data.slice(-4); // Last 4 points / recent month
    }
    return data; // Full 90D / 6M series
  }, [data, timeRange]);

  // Compute calculated Y-axis domain so subtle price changes pop out
  const yDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return ['auto', 'auto'];

    const values = chartData.flatMap((d) => [d.amazon, d.flipkart]).filter(Boolean);
    if (values.length === 0) return ['auto', 'auto'];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const padding = spread > 0 ? spread * 0.15 : min * 0.05;

    return [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
  }, [chartData]);

  const formatYAxis = (val) => {
    if (currency === 'USD') return `$${val}`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Time Range Selector & Legend Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
            Amazon India
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-2xs" />
            Flipkart
          </span>
        </div>

        {/* Time Range Selector (7D, 30D, 90D) */}
        {showTimeRangeSelector && (
          <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            {['7D', '30D', '90D'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recharts Area Container */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartAmazonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="chartFlipkartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />

            <YAxis
              domain={yDomain}
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={formatYAxis}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  const azVal = payload.find((p) => p.dataKey === 'amazon')?.value;
                  const fkVal = payload.find((p) => p.dataKey === 'flipkart')?.value;
                  const diff = azVal && fkVal ? Math.abs(azVal - fkVal) : 0;
                  const cheaper = azVal < fkVal ? 'Amazon' : 'Flipkart';

                  return (
                    <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 p-3 rounded-xl shadow-lg text-xs space-y-1.5 min-w-44">
                      <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                        {dataPoint.month || dataPoint.label}
                      </p>
                      <div className="flex items-center justify-between gap-3 text-amber-700 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          Amazon:
                        </span>
                        <strong className="text-slate-900">{formatCurrency(azVal, currency)}</strong>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-blue-700 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          Flipkart:
                        </span>
                        <strong className="text-slate-900">{formatCurrency(fkVal, currency)}</strong>
                      </div>
                      {diff > 0 && (
                        <div className="pt-1 border-t border-slate-100 text-[11px] text-emerald-700 font-bold flex items-center justify-between">
                          <span>{cheaper} Cheaper by:</span>
                          <span>{formatCurrency(diff, currency)}</span>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="amazon"
              stroke="#f97316"
              strokeWidth={2.2}
              fill="url(#chartAmazonGrad)"
              name="Amazon India"
              activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
            />

            <Area
              type="monotone"
              dataKey="flipkart"
              stroke="#2563eb"
              strokeWidth={2.2}
              fill="url(#chartFlipkartGrad)"
              name="Flipkart"
              activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
