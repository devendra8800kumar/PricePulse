import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { normalizeApiProduct } from '../services/productService';
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

  // Merge live API products with demo catalog
  const allAvailableProducts = useMemo(() => {
    const normalizedApi = (apiProducts || []).map(normalizeApiProduct).filter(Boolean);
    const apiIds = new Set(normalizedApi.map(p => p.id));
    const dedupedDemo = TRENDING_PRODUCTS.filter(p => !apiIds.has(p.id));
    return [...normalizedApi, ...dedupedDemo];
  }, [apiProducts]);

  // Robust product resolver helper for subscriptions and fired alerts
  const resolveProductInfo = (subOrAlert, productId) => {
    // 1. Check if backend populated sub.product or alert.product directly
    const directProd = subOrAlert?.product ? normalizeApiProduct(subOrAlert.product) : null;
    // 2. Lookup in context apiProducts
    const targetId = productId || subOrAlert?.product_id || subOrAlert?.product?.id;
    const rawApi = targetId ? (apiProducts || []).find(p => p.id === targetId) : null;
    const normalizedRaw = rawApi ? normalizeApiProduct(rawApi) : null;
    // 3. Lookup in demo products
    const demo = targetId ? TRENDING_PRODUCTS.find(p => p.id === targetId) : null;

    const resolved = directProd || normalizedRaw || demo;
    return {
      id: targetId || resolved?.id || 'product',
      slug: resolved?.slug || resolved?.id || targetId,
      name: resolved?.name || subOrAlert?.product?.title || rawApi?.title || (targetId ? `Product #${targetId.slice(0, 8)}` : 'Tracked Product'),
      image: resolved?.image || subOrAlert?.product?.image_url || rawApi?.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
      platform: resolved?.platform || subOrAlert?.product?.platform || rawApi?.platform || 'Amazon',
      currentPriceUSD: resolved?.currentPriceUSD || (resolved?.currentPriceINR ? Math.round(resolved.currentPriceINR / 83) : 100),
      currentPriceINR: resolved?.currentPriceINR || subOrAlert?.product?.last_price || rawApi?.last_price || 8000,
    };
  };

  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'alerts'
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(() => {
    return apiProducts?.[0]?.id || TRENDING_PRODUCTS[0].id;
  });
  const [targetInputPrice, setTargetInputPrice] = useState(() => {
    const initProd = (apiProducts?.[0] ? normalizeApiProduct(apiProducts[0]) : null) || TRENDING_PRODUCTS[0];
    const cur = currency === 'USD' ? initProd.currentPriceUSD : initProd.currentPriceINR;
    return Math.round(cur * 0.95);
  });
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
    const prod = allAvailableProducts.find(p => p.id === prodId);
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

    const prod = allAvailableProducts.find(p => p.id === selectedProductId);
    const retailerUrl = prod?.url || prod?.retailers?.[0]?.url || `https://www.amazon.in/dp/mock-${selectedProductId}`;

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
    <div className="py-8 bg-slate-50 dark:bg-[#0b0f19] min-h-screen transition-colors duration-200">
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
            <div className="lg:col-span-5 bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Configure Price Drop Target</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Choose a catalog item or track an external URL with an automated buy threshold.
              </p>

              <form onSubmit={handleCreateSubscription} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Product:
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={handleProductSelectChange}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {allAvailableProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatPrice(currency === 'USD' ? p.currentPriceUSD : p.currentPriceINR)})
                      </option>
                    ))}
                  </select>

                  {/* Selected Product Miniature Preview Card */}
                  {(() => {
                    const selProd = allAvailableProducts.find(p => p.id === selectedProductId);
                    if (!selProd) return null;
                    return (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3">
                        <img
                          src={selProd.image}
                          alt={selProd.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
                          }}
                          className="w-12 h-12 rounded-lg object-contain bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 block">
                            {selProd.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="capitalize font-semibold">{selProd.platform || 'Store'}</span>
                            <span>•</span>
                            <span>Current: <strong className="text-blue-600 dark:text-blue-400 font-mono">{formatPrice(currency === 'USD' ? selProd.currentPriceUSD : selProd.currentPriceINR)}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
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
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="Enter target threshold..."
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Backend Monitored Subscriptions ({subscriptions.length})
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  GET /api/v1/subscriptions
                </span>
              </div>

              {isSubscriptionsLoading ? (
                <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                  <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading your live subscriptions...</p>
                </div>
              ) : subscriptions.length > 0 ? (
                <div className="space-y-3">
                  {subscriptions.map((sub) => {
                    const prodInfo = resolveProductInfo(sub, sub.product_id);
                    const currentPrice = currency === 'USD' ? prodInfo.currentPriceUSD : prodInfo.currentPriceINR;
                    const targetVal = sub.target_price ?? 0;
                    const isReached = currentPrice > 0 && currentPrice <= targetVal;

                    return (
                      <div
                        key={sub.id}
                        className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          !sub.is_active
                            ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                            : isReached
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <Link 
                            to={`/products/${prodInfo.slug}`}
                            className="shrink-0 group"
                            title={prodInfo.name}
                          >
                            <img
                              src={prodInfo.image}
                              alt={prodInfo.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
                              }}
                              className="w-14 h-14 rounded-xl object-contain bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-colors"
                            />
                          </Link>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/products/${prodInfo.slug}`}
                                className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 block transition-colors"
                                title={prodInfo.name}
                              >
                                {prodInfo.name}
                              </Link>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                                sub.is_active 
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' 
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                                {sub.is_active ? 'Active' : 'Paused'}
                              </span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-[10px]">
                                {prodInfo.platform}
                              </span>
                              <span>•</span>
                              <span>Current: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatPrice(currentPrice)}</strong></span>
                              <span>•</span>
                              <span>Target: </span>
                              {editingSubId === sub.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editPriceVal}
                                    onChange={(e) => setEditPriceVal(e.target.value)}
                                    className="w-20 px-1 py-0.5 border border-blue-400 rounded text-xs font-bold font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
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
                                    className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px]"
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
                                  className="font-bold text-blue-600 dark:text-blue-400 underline decoration-dotted cursor-pointer font-mono"
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

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title={sub.is_active ? 'Pause subscription' : 'Activate subscription'}
                          >
                            {sub.is_active ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-slate-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSub(sub.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
                <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">No subscriptions found on backend</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Set a price drop threshold using the form to start automated monitoring.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Alert Notification History Tab (/api/v1/alerts) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Triggered Alert Records ({apiAlerts.length})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                GET /api/v1/alerts
              </span>
            </div>

            {isAlertsLoading ? (
              <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Fetching triggered alerts...</p>
              </div>
            ) : apiAlerts.length > 0 ? (
              <div className="space-y-3">
                {apiAlerts.map((alert) => {
                  const relatedSub = subscriptions.find(s => s.id === alert.subscription_id);
                  const prodInfo = resolveProductInfo(alert, relatedSub?.product_id);

                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        !alert.is_read
                          ? 'bg-blue-50/70 dark:bg-blue-950/25 border-blue-200 dark:border-blue-800 shadow-2xs'
                          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 opacity-90'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Link 
                          to={`/products/${prodInfo.slug}`}
                          className="shrink-0 group"
                          title={prodInfo.name}
                        >
                          <img
                            src={prodInfo.image}
                            alt={prodInfo.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300';
                            }}
                            className="w-14 h-14 rounded-xl object-contain bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-colors"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/products/${prodInfo.slug}`}
                              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 block transition-colors"
                              title={prodInfo.name}
                            >
                              {prodInfo.name}
                            </Link>
                            {!alert.is_read && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white px-1.5 py-0.2 rounded-full shrink-0">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            Triggered Price: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formatPrice(alert.trigger_price ?? alert.triggered_price)}</strong> • 
                            Your Target: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatPrice(relatedSub?.target_price ?? alert.target_price)}</strong>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span className="capitalize font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                              {prodInfo.platform}
                            </span>
                            <span>•</span>
                            <span>Fired: {new Date(alert.fired_at || alert.created_at).toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!alert.is_read && (
                          <button
                            onClick={() => markAlertAsRead(alert.id)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Mark Read</span>
                          </button>
                        )}
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
                          Threshold Hit
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No alerts triggered yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
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
