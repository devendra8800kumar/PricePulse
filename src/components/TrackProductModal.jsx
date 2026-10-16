import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  X, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  TrendingDown, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from './ui/Button';

export default function TrackProductModal() {
  const { isTrackModalOpen, closeTrackModal, trackProduct, formatPrice, currency, user, login, showToast } = useApp();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  if (!isTrackModalOpen) return null;

  const handleClose = () => {
    setUrl('');
    setTargetPrice('');
    setError('');
    setTrackResult(null);
    closeTrackModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTrackResult(null);

    if (!url.trim()) {
      setError('Please provide an Amazon or Flipkart product URL.');
      return;
    }

    // Basic URL check
    const isEcom = url.includes('amazon') || url.includes('flipkart') || url.includes('amzn');
    if (!isEcom) {
      setError('Only Amazon and Flipkart product links are currently supported for live ingestion.');
      return;
    }

    setIsLoading(true);

    try {
      if (!user?.isLoggedIn) {
        await login('demo@pricepulse.com', 'Password123!');
      }

      const res = await trackProduct({
        url: url.trim(),
        target_price: targetPrice ? Number(targetPrice) : null,
      });
      setTrackResult(res);
    } catch (err) {
      setError(err.message || 'Failed to track product. The URL may be invalid or the vendor blocked the request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">Track New Product</h3>
              <p className="text-[11px] text-slate-500">Live prospective scrape & buy recommendation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold mb-4 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {trackResult ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {trackResult.is_newly_tracked 
                  ? 'Product ingested and first price observation captured!' 
                  : 'Product was already in system; your target subscription is active!'}
              </span>
            </div>

            {/* Product Summary Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              {trackResult.product?.image_url ? (
                <img 
                  src={trackResult.product.image_url} 
                  alt={trackResult.product.title} 
                  className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">
                  IMG
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {trackResult.product?.platform || 'Store'}
                  </span>
                  {trackResult.recommendation?.signal && (
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      trackResult.recommendation.signal === 'BUY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {trackResult.recommendation.signal} ({(trackResult.recommendation.confidence * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                  {trackResult.product?.title}
                </h4>
                <div className="mt-1 text-xs font-extrabold text-blue-600">
                  Current: {formatPrice(trackResult.product?.last_price || 0)}
                </div>
              </div>
            </div>

            {trackResult.recommendation?.reasoning && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-blue-700">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Recommender Assessment:
                </span>
                {trackResult.recommendation.reasoning}
              </div>
            )}

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Track Another
              </button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  handleClose();
                  navigate(`/products/${trackResult.product.id}`);
                }}
                className="flex-1 text-xs font-semibold cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View Analytics
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!user?.isLoggedIn && (
              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3">
                <span className="text-[11px] leading-tight">
                  <strong className="block text-blue-800">Quick Guest Ingestion</strong>
                  Submissions are authenticated to save your watchlist and alerts.
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900 shrink-0">
                  Instant Access
                </span>
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                E-Commerce Product Link
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.amazon.in/dp/... or https://www.flipkart.com/..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Paste any live Amazon or Flipkart electronics URL. ASIN or PID will be parsed automatically.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Target Alert Price (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currency === 'USD' ? '$' : '₹'}
                </span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="e.g. 69999"
                  min="1"
                  step="any"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Receive instant dispatch notification when price reaches or drops below this target.
              </p>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1 text-xs font-semibold shadow-xs cursor-pointer"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Ingestion
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
