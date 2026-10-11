import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Info,
  ArrowRight
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function PriceAlertsPage() {
  const { priceAlerts, addPriceAlert, removePriceAlert, formatPrice, currency, showToast } = useApp();
  const [selectedProductId, setSelectedProductId] = useState(TRENDING_PRODUCTS[0].id);
  const [targetInputPrice, setTargetInputPrice] = useState(
    Math.round((currency === 'USD' ? TRENDING_PRODUCTS[0].currentPriceUSD : TRENDING_PRODUCTS[0].currentPriceINR) * 0.95)
  );

  const handleProductSelectChange = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = TRENDING_PRODUCTS.find(p => p.id === prodId);
    if (prod) {
      setTargetInputPrice(Math.round((currency === 'USD' ? prod.currentPriceUSD : prod.currentPriceINR) * 0.95));
    }
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (targetInputPrice > 0) {
      addPriceAlert(selectedProductId, targetInputPrice);
    }
  };

  const handleSimulateAlertTrigger = (alertId) => {
    showToast('Simulated Price Drop Detected! Product has reached target threshold.', 'success');
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Automated Price Drop Triggers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Target Price <span className="text-blue-600">Alerts</span>
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
            Set custom price drop targets for smartphones, laptops, and audio gear across Amazon India and Flipkart.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 mb-8 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Local Implementation Notice:</strong> This price alert manager is stored locally in your browser session for demonstration. High-frequency scrapers poll listings, and you can test simulated trigger notifications below.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Create Alert Form (Left Column) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Create New Price Alert</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a product and configure your desired buy threshold.
            </p>

            <form onSubmit={handleCreateAlert} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Product:
                </label>
                <select
                  value={selectedProductId}
                  onChange={handleProductSelectChange}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {TRENDING_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatPrice(currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Price ({currency}):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currency === 'USD' ? '$' : '₹'}
                  </span>
                  <input
                    type="number"
                    value={targetInputPrice}
                    onChange={(e) => setTargetInputPrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                    placeholder="Enter target price..."
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tip: A price 5-10% below current price triggers alerts during sale events.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Save Price Alert</span>
              </button>
            </form>
          </div>

          {/* Active Alerts List (Right Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Active Price Alerts ({priceAlerts.length})
              </h3>
              <span className="text-xs text-slate-500">
                Monitored against Amazon & Flipkart
              </span>
            </div>

            {priceAlerts.length > 0 ? (
              <div className="space-y-3">
                {priceAlerts.map((alert) => {
                  const product = TRENDING_PRODUCTS.find(p => p.id === alert.productId) || TRENDING_PRODUCTS[0];
                  const currentPrice = currency === 'USD' ? product.currentPriceUSD : product.currentPriceINR;
                  const isReached = currentPrice <= alert.targetPrice;
                  const diff = currentPrice - alert.targetPrice;

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isReached
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                        />
                        <div>
                          <Link
                            to={`/products/${product.slug || product.id}`}
                            className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                            <span>Current: <strong className="text-slate-800">{formatPrice(currentPrice)}</strong></span>
                            <span>•</span>
                            <span>Target: <strong className="text-blue-700">{formatPrice(alert.targetPrice)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {isReached ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Target Hit!
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatPrice(diff)} to go
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSimulateAlertTrigger(alert.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer transition-colors"
                          title="Simulate push drop alert"
                        >
                          Test Drop
                        </button>

                        <button
                          type="button"
                          onClick={() => removePriceAlert(alert.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No active price alerts set yet.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
