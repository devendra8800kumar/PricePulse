import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '../data/electronicsData';
import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';
import { productService } from '../services/productService.js';
import { subscriptionService } from '../services/subscriptionService.js';
import { alertService } from '../services/alertService.js';
import { searchService } from '../services/searchService.js';
import { chatService } from '../services/chatService.js';
import { recommendationService } from '../services/recommendationService.js';
import { healthService } from '../services/healthService.js';
import { tokenStorage } from '../services/apiClient.js';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Toast Notifications (declared top-level for availability across all context handlers)
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 1. Currency ('INR' | 'USD')
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('pricepulse_currency') || 'INR';
  });

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => {
      const next = prev === 'INR' ? 'USD' : 'INR';
      localStorage.setItem('pricepulse_currency', next);
      return next;
    });
  }, []);

  const formatPrice = useCallback((amount) => formatCurrency(amount, currency), [currency]);

  // 2. Watchlist (Local fallback + client-side sync)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_watchlist');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-3'];
    }
  });

  useEffect(() => {
    localStorage.setItem('pricepulse_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = useCallback((productId) => {
    setWatchlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Watchlist' : 'Saved to Watchlist', exists ? 'info' : 'success');
      return next;
    });
  }, [showToast]);

  const isWatchlisted = useCallback((productId) => watchlist.includes(productId), [watchlist]);

  // 3. Comparison List (max 3 items)
  const [compareList, setCompareList] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_compare');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2'];
    } catch {
      return ['prod-1', 'prod-2'];
    }
  });

  useEffect(() => {
    localStorage.setItem('pricepulse_compare', JSON.stringify(compareList));
  }, [compareList]);

  const toggleCompare = useCallback((productId) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        showToast('Removed from comparison', 'info');
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 3) {
        showToast('Maximum 3 items can be compared side-by-side', 'warning');
        return prev;
      }
      showToast('Added to comparison', 'success');
      return [...prev, productId];
    });
  }, [showToast]);

  const removeFromCompare = useCallback((productId) => {
    setCompareList((prev) => prev.filter(id => id !== productId));
    showToast('Removed from comparison', 'info');
  }, [showToast]);

  const clearCompare = useCallback(() => {
    setCompareList([]);
    showToast('Comparison cleared', 'info');
  }, [showToast]);

  const isInCompare = useCallback((productId) => compareList.includes(productId), [compareList]);

  // 4. Target Price Alerts (Local fallback storage)
  const [priceAlerts, setPriceAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_alerts');
      return saved ? JSON.parse(saved) : [
        {
          id: 'alert-1',
          productId: 'prod-1',
          targetPrice: 115000,
          currency: 'INR',
          createdAt: new Date().toLocaleDateString(),
          isReached: false,
        },
        {
          id: 'alert-2',
          productId: 'prod-3',
          targetPrice: 25000,
          currency: 'INR',
          createdAt: new Date().toLocaleDateString(),
          isReached: false,
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pricepulse_alerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const addPriceAlert = useCallback((productId, targetPrice) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      productId,
      targetPrice: Number(targetPrice),
      currency,
      createdAt: new Date().toLocaleDateString(),
      isReached: false,
    };
    setPriceAlerts(prev => [newAlert, ...prev]);
    showToast(`Target drop alert set at ${formatCurrency(targetPrice, currency)}!`, 'success');
    return newAlert;
  }, [currency, showToast]);

  const removePriceAlert = useCallback((alertId) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Price alert removed', 'info');
  }, [showToast]);

  // 5. User Authentication & Profile State (/api/v1/auth, /api/v1/users)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userStats, setUserStats] = useState({
    tracked_count: 0,
    alerts_fired: 0,
    active_subscriptions: 0,
    savings_estimate: 0,
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 6. Live Tracked Products from Backend API (/api/v1/products)
  const [apiProducts, setApiProducts] = useState([]);
  const [apiProductsTotal, setApiProductsTotal] = useState(0);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // 7. Live Subscriptions from Backend API (/api/v1/subscriptions)
  const [subscriptions, setSubscriptions] = useState([]);
  const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(false);

  // 8. Live Alerts from Backend API (/api/v1/alerts)
  const [apiAlerts, setApiAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [isAlertsLoading, setIsAlertsLoading] = useState(false);

  // 9. Grounded RAG Chat State (/api/v1/chat, /api/v1/chat/history)
  const [chatMessages, setChatMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(() => {
    return localStorage.getItem('pricepulse_chat_convo_id') || null;
  });
  const [isChatSending, setIsChatSending] = useState(false);

  // 10. System Health Status (/health)
  const [systemHealth, setSystemHealth] = useState(null);

  // Helper to format User object nicely from backend UserResponse
  const mapBackendUser = (data, customName = null) => {
    if (!data) return null;
    const emailPrefix = data.email ? data.email.split('@')[0] : 'Shopper';
    const computedName = customName || emailPrefix.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
      id: data.id,
      email: data.email,
      name: computedName,
      locale: data.locale || 'en-US',
      notification_prefs: data.notification_prefs || { email: true, push: false, webhook: false },
      isActive: data.is_active ?? true,
      createdAt: data.created_at,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    };
  };

  // Fetch live products from /api/v1/products
  const fetchApiProducts = useCallback(async (params = {}) => {
    if (!tokenStorage.getAccessToken()) return null;
    setIsProductsLoading(true);
    try {
      const res = await productService.getProducts(params);
      if (res && res.items) {
        setApiProducts(res.items);
        setApiProductsTotal(res.total || res.items.length);
        return res;
      }
    } catch (err) {
      console.warn('Could not fetch live products:', err.message);
    } finally {
      setIsProductsLoading(false);
    }
    return null;
  }, []);

  // Fetch live user stats from /api/v1/users/me/stats
  const refreshUserStats = useCallback(async () => {
    if (!tokenStorage.getAccessToken()) return;
    try {
      const stats = await userService.getStats();
      if (stats) {
        setUserStats(stats);
      }
    } catch (err) {
      console.warn('Could not refresh user stats:', err.message);
    }
  }, []);

  // Fetch live subscriptions from /api/v1/subscriptions
  const fetchSubscriptions = useCallback(async (params = {}) => {
    if (!tokenStorage.getAccessToken()) return [];
    setIsSubscriptionsLoading(true);
    try {
      const res = await subscriptionService.getSubscriptions(params);
      if (res?.items) {
        setSubscriptions(res.items);
        return res.items;
      }
    } catch (err) {
      console.warn('Could not fetch subscriptions:', err.message);
    } finally {
      setIsSubscriptionsLoading(false);
    }
    return [];
  }, []);

  // Fetch live alerts from /api/v1/alerts
  const fetchAlerts = useCallback(async (unread = false) => {
    if (!tokenStorage.getAccessToken()) return [];
    setIsAlertsLoading(true);
    try {
      const res = await alertService.getAlerts({ unread });
      if (res?.items) {
        setApiAlerts(res.items);
        setUnreadAlertsCount(res.unread_count ?? 0);
        return res.items;
      }
    } catch (err) {
      console.warn('Could not fetch alerts:', err.message);
    } finally {
      setIsAlertsLoading(false);
    }
    return [];
  }, []);

  // Check system health via /health
  const checkSystemHealth = useCallback(async () => {
    try {
      const res = await healthService.checkHealth();
      setSystemHealth(res);
      return res;
    } catch (err) {
      console.warn('Health check failed:', err.message);
    }
    return null;
  }, []);

  // Initialize session and all API routes data on startup
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      checkSystemHealth();
      const token = tokenStorage.getAccessToken();
      if (token) {
        try {
          const profile = await userService.getMe();
          if (isMounted && profile) {
            const savedRaw = localStorage.getItem('pricepulse_auth_user');
            const savedName = savedRaw ? JSON.parse(savedRaw)?.name : null;
            const formatted = mapBackendUser(profile, savedName);
            setUser(formatted);
            localStorage.setItem('pricepulse_auth_user', JSON.stringify(formatted));
            // Fetch stats, products, subscriptions, alerts in parallel
            refreshUserStats();
            fetchApiProducts();
            fetchSubscriptions();
            fetchAlerts();
          }
        } catch (err) {
          console.warn('Token validation failed:', err.message);
          tokenStorage.clearTokens();
          if (isMounted) {
            setUser(null);
            localStorage.removeItem('pricepulse_auth_user');
          }
        }
      }
      if (isMounted) setIsAuthLoading(false);
    }

    initAuth();

    // Listen for session expiry event from apiClient
    const handleExpired = () => {
      setUser(null);
      setUserStats({ tracked_count: 0, alerts_fired: 0, active_subscriptions: 0, savings_estimate: 0 });
      setApiProducts([]);
      setSubscriptions([]);
      setApiAlerts([]);
      localStorage.removeItem('pricepulse_auth_user');
      showToast('Your session has expired. Please sign in again.', 'warning');
    };

    window.addEventListener('pricepulse:session_expired', handleExpired);

    return () => {
      isMounted = false;
      window.removeEventListener('pricepulse:session_expired', handleExpired);
    };
  }, [fetchApiProducts, refreshUserStats, fetchSubscriptions, fetchAlerts, checkSystemHealth, showToast]);

  // Load chat history if existing conversation id exists
  useEffect(() => {
    if (currentConversationId && tokenStorage.getAccessToken()) {
      chatService.getHistory(currentConversationId)
        .then(res => {
          if (res?.messages) {
            setChatMessages(res.messages);
          }
        })
        .catch(() => {});
    }
  }, [currentConversationId]);

  // Authenticate user via /api/v1/auth/login
  const login = async (email, password, rememberMe = true) => {
    const res = await authService.login({ email, password });
    if (res?.access_token) {
      const profile = await userService.getMe();
      const authenticatedUser = mapBackendUser(profile);
      setUser(authenticatedUser);
      if (rememberMe) {
        localStorage.setItem('pricepulse_auth_user', JSON.stringify(authenticatedUser));
      }
      await refreshUserStats();
      await fetchApiProducts();
      await fetchSubscriptions();
      await fetchAlerts();
      showToast(`Welcome back, ${authenticatedUser.name}!`, 'success');
      return authenticatedUser;
    }
    throw new Error('Login failed to return access token');
  };

  // Register user via /api/v1/auth/register
  const signup = async (name, email, password, locale = 'en-US') => {
    const res = await authService.register({ email, password, locale });
    if (res?.access_token) {
      const profile = await userService.getMe();
      const newUser = mapBackendUser(profile, name);
      setUser(newUser);
      localStorage.setItem('pricepulse_auth_user', JSON.stringify(newUser));
      await refreshUserStats();
      await fetchApiProducts();
      await fetchSubscriptions();
      await fetchAlerts();
      showToast(`Account created successfully! Welcome, ${name}.`, 'success');
      return newUser;
    }
    throw new Error('Registration failed to return access token');
  };

  // Logout via /api/v1/auth/logout
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setUserStats({ tracked_count: 0, alerts_fired: 0, active_subscriptions: 0, savings_estimate: 0 });
    setApiProducts([]);
    setSubscriptions([]);
    setApiAlerts([]);
    localStorage.removeItem('pricepulse_auth_user');
    showToast('You have been logged out safely', 'info');
  };

  // Update profile via /api/v1/users/me
  const updateUserProfile = async (updates) => {
    const updated = await userService.updateMe(updates);
    const updatedUser = mapBackendUser(updated, user?.name);
    setUser(updatedUser);
    localStorage.setItem('pricepulse_auth_user', JSON.stringify(updatedUser));
    showToast('Profile and preferences updated!', 'success');
    return updatedUser;
  };

  // Delete account via /api/v1/users/me
  const deleteAccount = async () => {
    await userService.deleteMe();
    tokenStorage.clearTokens();
    setUser(null);
    setUserStats({ tracked_count: 0, alerts_fired: 0, active_subscriptions: 0, savings_estimate: 0 });
    setApiProducts([]);
    setSubscriptions([]);
    setApiAlerts([]);
    localStorage.removeItem('pricepulse_auth_user');
    showToast('Your account has been deleted permanently', 'info');
  };

  // Track product via /api/v1/products/track
  const trackProduct = async ({ url, target_price }) => {
    const res = await productService.trackProduct({ url, target_price });
    showToast(
      res.is_newly_tracked ? 'New product tracked & live ingestion queued!' : 'Product target subscription updated!',
      'success'
    );
    await refreshUserStats();
    await fetchApiProducts();
    await fetchSubscriptions();
    return res;
  };

  // Subscription management (/api/v1/subscriptions)
  const updateSubscription = async (id, updates) => {
    const res = await subscriptionService.updateSubscription(id, updates);
    showToast('Subscription updated successfully', 'success');
    await fetchSubscriptions();
    await refreshUserStats();
    return res;
  };

  const deleteSubscription = async (id) => {
    await subscriptionService.deleteSubscription(id);
    showToast('Subscription removed', 'info');
    await fetchSubscriptions();
    await refreshUserStats();
  };

  // Alert management (/api/v1/alerts)
  const markAlertAsRead = async (id) => {
    const res = await alertService.markAsRead(id);
    await fetchAlerts();
    await refreshUserStats();
    return res;
  };

  const markAllAlertsAsRead = async () => {
    const res = await alertService.markAllAsRead();
    showToast('All alerts marked as read', 'success');
    await fetchAlerts();
    await refreshUserStats();
    return res;
  };

  // Meilisearch search (/api/v1/search)
  const searchApi = async (q, platform = null) => {
    return searchService.search({ q, platform });
  };

  // Grounded RAG Chat (/api/v1/chat)
  const sendChatMessage = async (messageText) => {
    if (!messageText.trim()) return null;
    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      created_at: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      const res = await chatService.sendMessage({
        message: messageText.trim(),
        conversation_id: currentConversationId,
      });

      if (res?.conversation_id) {
        setCurrentConversationId(res.conversation_id);
        localStorage.setItem('pricepulse_chat_convo_id', res.conversation_id);
      }

      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        sources: res.sources || [],
        created_at: res.created_at || new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
      return res;
    } catch (err) {
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to get recommendation.'}`,
        created_at: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMsg]);
      throw err;
    } finally {
      setIsChatSending(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem('pricepulse_chat_convo_id');
  };

  // Recommendation lookup (/api/v1/recommendations/{product_id})
  const getProductRecommendation = async (productId) => {
    return recommendationService.getRecommendation(productId);
  };

  // Recently Viewed Products
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_recent');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-2', 'prod-3'];
    }
  });

  const addToRecentlyViewed = useCallback((productId) => {
    if (!productId) return;
    setRecentlyViewed(prev => {
      if (prev[0] === productId) return prev;
      const filtered = prev.filter(id => id !== productId);
      const next = [productId, ...filtered].slice(0, 8);
      localStorage.setItem('pricepulse_recent', JSON.stringify(next));
      return next;
    });
  }, []);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Global Quick Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const openSearch = useCallback((query = '') => {
    setSearchInitialQuery(query);
    setIsSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchInitialQuery('');
  }, []);

  // Track Product URL Modal State
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const openTrackModal = useCallback(() => setIsTrackModalOpen(true), []);
  const closeTrackModal = useCallback(() => setIsTrackModalOpen(false), []);

  const value = {
    currency,
    toggleCurrency,
    formatPrice,
    watchlist,
    toggleWatchlist,
    isWatchlisted,
    compareList,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    // Auth & Users (/api/v1/auth, /api/v1/users)
    user,
    userStats,
    isAuthLoading,
    login,
    signup,
    logout,
    updateUserProfile,
    deleteAccount,
    refreshUserStats,
    // Products (/api/v1/products)
    apiProducts,
    apiProductsTotal,
    isProductsLoading,
    fetchApiProducts,
    trackProduct,
    isTrackModalOpen,
    openTrackModal,
    closeTrackModal,
    // Subscriptions (/api/v1/subscriptions)
    subscriptions,
    isSubscriptionsLoading,
    fetchSubscriptions,
    updateSubscription,
    deleteSubscription,
    // Alerts (/api/v1/alerts)
    apiAlerts,
    unreadAlertsCount,
    isAlertsLoading,
    fetchAlerts,
    markAlertAsRead,
    markAllAlertsAsRead,
    // Search (/api/v1/search)
    searchApi,
    // Recommendations (/api/v1/recommendations)
    getProductRecommendation,
    // Chat RAG (/api/v1/chat, /api/v1/chat/history)
    chatMessages,
    currentConversationId,
    isChatSending,
    sendChatMessage,
    clearChat,
    // Health (/health)
    systemHealth,
    checkSystemHealth,
    // Other
    recentlyViewed,
    addToRecentlyViewed,
    quickViewProduct,
    setQuickViewProduct,
    isSearchOpen,
    searchInitialQuery,
    openSearch,
    closeSearch,
    toasts,
    showToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
