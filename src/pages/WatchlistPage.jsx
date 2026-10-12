import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bookmark, 
  Trash2, 
  ArrowRight, 
  Bell, 
  Plus, 
  RefreshCw, 
  Activity,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function WatchlistPage() {
  const { 
    user,
    watchlist, 
    toggleWatchlist, 
    subscriptions, 
    isSubscriptionsLoading,
    fetchSubscriptions,
    updateSubscription,
    deleteSubscription,
    apiProducts,
    formatPrice, 
    currency, 
    addPriceAlert,
    openTrackModal,
    showToast
  } = useApp();

  const watchlistedProducts = TRENDING_PRODUCTS.filter(p => watchlist.includes(p.id));
  const [activeTab, setActiveTab] = useState(() => {
    return subscriptions.length > 0 ? 'cloud' : 'bookmarks';
  });

  const handleToggleSubActive = async (sub) => {
    try {
      await updateSubscription(sub.id, { is_active: !sub.is_active });
    } catch (err) {
      showToast(err.message || 'Failed to update subscription', 'error');
    }
  };

  const handleDeleteSub = async (subId) => {
    if (window.confirm('Stop monitoring this item?')) {
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Personal Tracking Tray & Cloud Subscriptions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My <span className="text-blue-600">Watchlist</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              Track live price movements across Amazon and Flipkart for your saved electronics and cloud subscriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openTrackModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Track Product URL</span>
            </button>
            <Link
              to="/products"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-2xs"
            >
              Browse Catalog
            </Link>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cloud'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Cloud Subscriptions ({subscriptions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarked ({watchlistedProducts.length})</span>
            </button>
          </div>

          {activeTab === 'cloud' && (
            <button
              onClick={() => fetchSubscriptions()}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
              title="Refresh cloud subscriptions"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section 1: Cloud Subscriptions from /api/v1/subscriptions */}
        {activeTab === 'cloud' && (
          <div>
            {isSubscriptionsLoading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Syncing active cloud subscriptions...</p>
              </div>
            ) : subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:shadow-card-hover transition-all"
                    >
                      <div>
                        {/* Status bar */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            sub.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {sub.is_active ? 'Active Monitoring' : 'Paused'}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleSubActive(sub)}
                              className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                              title={sub.is_active ? 'Pause' : 'Activate'}
                            >
                              {sub.is_active ? (
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteSub(sub.id)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete subscription"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Image & Title */}
                        <div className="relative mb-3">
                          <img
                            src={matchedProd.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'}
                            alt={matchedProd.name || 'Product'}
                            className="w-full h-40 rounded-xl object-cover bg-slate-50 border border-slate-200"
                          />
                          {isReached && (
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white shadow-xs">
                              Target Reached!
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/products/${matchedProd.slug || matchedProd.id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block mb-0.5"
                        >
                          {matchedProd.name || `Product #${sub.product_id.slice(0, 8)}`}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                          Product ID: <span className="font-mono">{sub.product_id.slice(0, 12)}...</span>
                        </p>

                        {/* Price Details */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3 space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Current Market:</span>
                            <span className="font-bold text-slate-900 font-mono">{formatPrice(currentPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-blue-700 font-semibold">Your Target:</span>
                            <span className="font-black text-blue-700 font-mono">{formatPrice(targetVal)}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                            <span>Last Notified:</span>
                            <span>{sub.last_notified_at ? new Date(sub.last_notified_at).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          to={`/products/${matchedProd.slug || matchedProd.id}`}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>Product Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <Link
                          to="/price-alerts"
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Manage target alert"
                        >
                          <Bell className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">No Cloud Subscriptions Yet</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Track external product URLs or catalog items to get background price monitoring via our scraping queue.
                </p>
                <button
                  onClick={openTrackModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Track First Product</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Bookmarked Products */}
        {activeTab === 'bookmarks' && (
          <div>
            {watchlistedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchlistedProducts.map((product) => {
                  const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
                  const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
                  const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
                  const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
                  const lowest = Math.min(azPrice, fkPrice);
                  const floor = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:shadow-card-hover transition-all"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                            {product.categoryName}
                          </span>

                          <button
                            onClick={() => toggleWatchlist(product.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove from watchlist"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Image & Title */}
                        <div className="relative mb-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-40 rounded-xl object-cover bg-slate-50 border border-slate-200"
                          />
                          <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs ${
                            product.recommendation === 'BUY NOW' ? 'badge-buy' : product.recommendation === 'WAIT' ? 'badge-wait' : 'badge-deal'
                          }`}>
                            {product.recommendation}
                          </span>
                        </div>

                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block mb-0.5"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                          {product.specs}
                        </p>

                        {/* Price Overview */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-3">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Lowest Price</span>
                              <span className="text-xl font-black text-slate-900 font-mono">{formatPrice(lowest)}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Save {formatPrice(product.savingsAmountINR)}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                Floor: {formatPrice(floor)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Store Breakdown */}
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs font-mono mb-4">
                          <div className="flex justify-between">
                            <span className="text-amber-800 font-bold">Amazon:</span>
                            <span className="font-semibold text-slate-800">{formatPrice(azPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800 font-bold">Flipkart:</span>
                            <span className="font-semibold text-slate-800">{formatPrice(fkPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          onClick={() => addPriceAlert(product.id, Math.round(lowest * 0.95))}
                          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Set target price alert"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">Your Bookmark Tray is empty</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Bookmark electronics on the product catalog to track price drops across Amazon and Flipkart.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <span>Explore Electronics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
