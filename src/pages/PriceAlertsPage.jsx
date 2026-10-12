import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Check, 
  CheckCheck, 
  RefreshCw, 
  ToggleLeft, 
  ToggleRight, 
  TrendingDown 
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function PriceAlertsPage() {
  const { 
    user,
    subscriptions, 
    isSubscriptionsLoading,
    fetchSubscriptions,
    updateSubscription, 
    deleteSubscription,
    apiAlerts,
    unreadAlertsCount,
    isAlertsLoading,
    fetchAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    apiProducts,
    trackProduct,
    formatPrice, 
    currency, 
    showToast,
    openTrackModal
  } = useApp();

  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'alerts'
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(TRENDING_PRODUCTS[0].id);
  const [targetInputPrice, setTargetInputPrice] = useState(
    Math.round((currency === 'USD' ? TRENDING_PRODUCTS[0].currentPriceUSD : TRENDING_PRODUCTS[0].currentPriceINR) * 0.95)
  );
  const [editingSubId, setEditingSubId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync alerts when unread filter toggles
  useEffect(() => {
    if (user?.isLoggedIn) {
      fetchAlerts(filterUnreadOnly);
    }
  }, [filterUnreadOnly, user?.isLoggedIn, fetchAlerts]);

  const handleProductSelectChange = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = TRENDING_PRODUCTS.find(p => p.id === prodId);
    if (prod) {
      setTargetInputPrice(Math.round((currency === 'USD' ? prod.currentPriceUSD : prod.currentPriceINR) * 0.95));
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!user?.isLoggedIn) {
      showToast('Please sign in to save price alerts', 'warning');
      return;
    }
    if (!targetInputPrice || targetInputPrice <= 0) {
      showToast('Please enter a valid target price', 'warning');
      return;
    }

    const prod = TRENDING_PRODUCTS.find(p => p.id === selectedProductId);
    const retailerUrl = prod?.retailers?.[0]?.url || `https://www.amazon.in/dp/mock-${selectedProductId}`;

    setIsSubmitting(true);
    try {
      await trackProduct({
        url: retailerUrl,
        target_price: Number(targetInputPrice),
      });
      showToast(`Target alert of ${formatPrice(targetInputPrice)} set for ${prod?.name || 'product'}!`, 'success');
      await fetchSubscriptions();
    } catch (err) {
      showToast(err.message || 'Failed to create alert trigger', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (sub) => {
    try {
      await updateSubscription(sub.id, { is_active: !sub.is_active });
      showToast(
        sub.is_active ? 'Subscription paused' : 'Subscription activated',
        'info'
      );
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleSaveEditPrice = async (subId) => {
    const num = Number(editPriceVal);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid price', 'warning');
      return;
    }
    try {
      await updateSubscription(subId, { target_price: num });
      setEditingSubId(null);
      setEditPriceVal('');
      showToast('Target threshold updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update target price', 'error');
    }
  };

  const handleDeleteSub = async (subId) => {
    if (window.confirm('Are you sure you want to remove this price subscription?')) {
      try {
        await deleteSubscription(subId);
      } catch (err) {
        showToast(err.message || 'Failed to delete subscription', 'error');
      }
    }
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Bell className="w-3.5 h-3.5 text-blue-600" />
              <span>Live Price Trigger Engine (/api/v1/alerts & /subscriptions)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Target Price <span className="text-blue-600">Alerts</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Configure real-time price monitoring and review triggered price-drop notifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchSubscriptions();
                fetchAlerts(filterUnreadOnly);
              }}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Refresh alerts & subscriptions"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={openTrackModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Track Custom URL</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher & Unread Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Active Triggers ({subscriptions.length})
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>Fired Alerts ({apiAlerts.length})</span>
              {unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                  {unreadAlertsCount} unread
                </span>
              )}
            </button>
          </div>

          {activeTab === 'alerts' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                  filterUnreadOnly
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filterUnreadOnly ? 'Showing Unread Only' : 'Show All Alerts'}
              </button>

              {unreadAlertsCount > 0 && (
                <button
                  onClick={markAllAlertsAsRead}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {activeTab === 'subscriptions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Create Alert Form (Left Column) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Configure Price Drop Target</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Choose a catalog item or track an external URL with an automated buy threshold.
              </p>

              <form onSubmit={handleCreateSubscription} className="space-y-4">
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
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="Enter target threshold..."
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tip: Target prices 5–10% lower than current trigger automatically when sales drop.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Set Active Subscription'}</span>
                </button>
              </form>
            </div>

            {/* Active Subscriptions List (Right Column) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Backend Monitored Subscriptions ({subscriptions.length})
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  GET /api/v1/subscriptions
                </span>
              </div>

              {isSubscriptionsLoading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                  <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading your live subscriptions...</p>
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => {
                    const matchedProd = apiProducts.find(p => p.id === sub.product_id) || 
                      TRENDING_PRODUCTS.find(p => p.id === sub.product_id) || 
                      TRENDING_PRODUCTS[0];
                    const currentPrice = currency === 'USD' ? (matchedProd.currentPriceUSD || 100) : (matchedProd.currentPriceINR || 8000);
                    const targetVal = sub.target_price ?? 0;
                    const isReached = currentPrice <= targetVal;

                    return (
                      <div
                        key={sub.id}
                        className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          !sub.is_active
                            ? 'bg-slate-100/60 border-slate-200 opacity-75'
                            : isReached
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={matchedProd.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}
                            alt={matchedProd.name || 'Product'}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {matchedProd.name || `Product #${sub.product_id.slice(0, 8)}`}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                                sub.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {sub.is_active ? 'Active' : 'Paused'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span>Target: </span>
                              {editingSubId === sub.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editPriceVal}
                                    onChange={(e) => setEditPriceVal(e.target.value)}
                                    className="w-20 px-1 py-0.5 border border-blue-400 rounded text-xs font-bold font-mono"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveEditPrice(sub.id)}
                                    className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingSubId(null)}
                                    className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <span 
                                  onClick={() => {
                                    setEditingSubId(sub.id);
                                    setEditPriceVal(targetVal.toString());
                                  }}
                                  className="font-bold text-blue-700 underline decoration-dotted cursor-pointer"
                                  title="Click to adjust target price"
                                >
                                  {formatPrice(targetVal)}
                                </span>
                              )}
                              <span>•</span>
                              <span>Created: {new Date(sub.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                            title={sub.is_active ? 'Pause subscription' : 'Activate subscription'}
                          >
                            {sub.is_active ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSub(sub.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete subscription"
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
                  <p className="text-xs text-slate-600 font-semibold">No subscriptions found on backend</p>
                  <p className="text-[11px] text-slate-400 mt-1">Set a price drop threshold using the form to start automated monitoring.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Alert Notification History Tab (/api/v1/alerts) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Triggered Alert Records ({apiAlerts.length})
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                GET /api/v1/alerts
              </span>
            </div>

            {isAlertsLoading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Fetching triggered alerts...</p>
              </div>
            ) : apiAlerts.length > 0 ? (
              <div className="space-y-3">
                {apiAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      !alert.is_read
                        ? 'bg-blue-50/70 border-blue-200 shadow-2xs'
                        : 'bg-white border-slate-200 opacity-90'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        !alert.is_read ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <TrendingDown className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">
                            Price Drop Hit Target!
                          </span>
                          {!alert.is_read && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Triggered Price: <strong className="text-emerald-700 font-mono">{formatPrice(alert.triggered_price)}</strong> • 
                          Your Target: <strong className="text-slate-800 font-mono">{formatPrice(alert.target_price)}</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Subscription ID: {alert.subscription_id} • {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!alert.is_read && (
                        <button
                          onClick={() => markAlertAsRead(alert.id)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        Threshold Hit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No alerts triggered yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  When tracked listings drop below your target thresholds during price scans, alerts will arrive here in real time.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
