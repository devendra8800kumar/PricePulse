import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Key, 
  Save, 
  LogOut, 
  CheckCircle2, 
  Globe, 
  Trash2,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';

export default function ProfilePage() {
  const { 
    user, 
    userStats, 
    currency, 
    toggleCurrency, 
    formatPrice,
    logout, 
    updateUserProfile, 
    deleteAccount,
    showToast,
    refreshUserStats
  } = useApp();

  const navigate = useNavigate();

  // Form states initialized from user profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [locale, setLocale] = useState(user?.locale || 'en-US');

  // Notification preferences mapped to backend schema: { email, push, webhook }
  const [notifyEmail, setNotifyEmail] = useState(user?.notification_prefs?.email ?? true);
  const [notifyPush, setNotifyPush] = useState(user?.notification_prefs?.push ?? false);
  const [notifyWebhook, setNotifyWebhook] = useState(user?.notification_prefs?.webhook ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync form state when user object is updated after a save
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setLocale(user.locale || 'en-US');
      setNotifyEmail(user.notification_prefs?.email ?? true);
      setNotifyPush(user.notification_prefs?.push ?? false);
      setNotifyWebhook(user.notification_prefs?.webhook ?? false);
    }
  }, [user]);

  // Fetch live stats once on mount
  useEffect(() => {
    refreshUserStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim(),
        locale: locale,
        notification_prefs: {
          email: notifyEmail,
          push: notifyPush,
          webhook: notifyWebhook,
        },
      });
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Could not delete account.', 'error');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-[#0b0f19] min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Account Profile & Settings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal price monitoring preferences and FastAPI account credentials.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/40 transition-colors self-start sm:self-center cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Safely
          </button>
        </div>

        {/* Live User Stats Strip from /api/v1/users/me/stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Tracked Products</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {userStats?.tracked_count ?? 0}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Active Subscriptions</span>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {userStats?.active_subscriptions ?? 0}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Alerts Fired</span>
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {userStats?.alerts_fired ?? 0}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Savings Estimate</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatPrice(userStats?.savings_estimate ?? 0)}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* 2. Personal Information Card (GET & PATCH /api/v1/users/me) */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {name ? name[0].toUpperCase() : 'P'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{name || 'PricePulse User'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
                    <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {user?.isActive ? 'Active Verified Account' : 'Inactive'}
                  </span>
                  {user?.id && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      UID: {user.id.slice(0, 8)}...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    User Locale
                  </label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
                  >
                    <option value="en-US">en-US (United States)</option>
                    <option value="en-IN">en-IN (India / English)</option>
                    <option value="en-GB">en-GB (United Kingdom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Account Created
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Currency Preference */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">Default Price Display Currency</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Currently set to {currency} ({currency === 'INR' ? '₹ Indian Rupee' : '$ US Dollar'})</span>
                </div>
                <button
                  type="button"
                  onClick={toggleCurrency}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 self-start cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Switch to {currency === 'INR' ? 'USD ($)' : 'INR (₹)'}
                </button>
              </div>

              {/* 3. Notification & Alert Preferences (PATCH /api/v1/users/me) */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Notification Channels</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Configured via your PricePulse backend notification settings.
                </p>

                <div className="space-y-3">
                  <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Email Alerts (email: true)</span>
                      <span className="text-slate-500 dark:text-slate-400">Receive dispatch emails when items hit your target price.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyPush}
                      onChange={(e) => setNotifyPush(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Push Notifications (push: true)</span>
                      <span className="text-slate-500 dark:text-slate-400">Real-time mobile & browser notifications.</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={notifyWebhook}
                      onChange={(e) => setNotifyWebhook(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">Webhook Integration (webhook: true)</span>
                      <span className="text-slate-500 dark:text-slate-400">Deliver drop payload events to custom API listeners.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  className="shadow-sm font-semibold"
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Profile Changes
                </Button>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              </div>
            </form>
          </div>

          {/* Delete Confirmation Modal (DELETE /api/v1/users/me) */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700/60 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold">
                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>Delete Account Permanently</span>
                  </div>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  This action is irreversible. It will delete your PricePulse user account, remove all active price drop subscriptions, and revoke your authentication token.
                </p>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="button"
                    onClick={handleDeleteAccount}
                    isLoading={isDeleting}
                    className="flex-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                  >
                    Confirm Delete
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
