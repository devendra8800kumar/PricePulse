import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatCurrency, TRENDING_PRODUCTS } from '../data/electronicsData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Currency ('INR' | 'USD')
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('pricepulse_currency') || 'INR';
  });

  const toggleCurrency = () => {
    setCurrency((prev) => {
      const next = prev === 'INR' ? 'USD' : 'INR';
      localStorage.setItem('pricepulse_currency', next);
      return next;
    });
  };

  const formatPrice = (amount) => formatCurrency(amount, currency);

  // 2. Watchlist
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

  const toggleWatchlist = (productId) => {
    setWatchlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Watchlist' : 'Saved to Watchlist', exists ? 'info' : 'success');
      return next;
    });
  };

  const isWatchlisted = (productId) => watchlist.includes(productId);

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

  const toggleCompare = (productId) => {
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
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter(id => id !== productId));
    showToast('Removed from comparison', 'info');
  };

  const clearCompare = () => {
    setCompareList([]);
    showToast('Comparison cleared', 'info');
  };

  const isInCompare = (productId) => compareList.includes(productId);

  // 4. Target Price Alerts
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

  const addPriceAlert = (productId, targetPrice) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      productId,
      targetPrice: Number(targetPrice),
      currency,
      createdAt: new Date().toLocaleDateString(),
      isReached: false,
    };
    setPriceAlerts(prev => [newAlert, ...prev]);
    showToast(`Target drop alert set at ${formatPrice(targetPrice)}!`, 'success');
    return newAlert;
  };

  const removePriceAlert = (alertId) => {
    setPriceAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Price alert removed', 'info');
  };

  // 5. User Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = (email, _password, rememberMe = true) => {
    // Generate authenticated user session
    const authenticatedUser = {
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    };
    setUser(authenticatedUser);
    if (rememberMe) {
      localStorage.setItem('pricepulse_auth_user', JSON.stringify(authenticatedUser));
    }
    showToast(`Welcome back, ${authenticatedUser.name}!`, 'success');
    return authenticatedUser;
  };

  const signup = (name, email, _password) => {
    const newUser = {
      name,
      email,
      isLoggedIn: true,
      loginAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('pricepulse_auth_user', JSON.stringify(newUser));
    showToast(`Account created successfully! Welcome, ${name}.`, 'success');
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pricepulse_auth_user');
    showToast('You have been logged out safely', 'info');
  };

  // 6. Recently Viewed Products
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const saved = localStorage.getItem('pricepulse_recent');
      return saved ? JSON.parse(saved) : ['prod-1', 'prod-2', 'prod-3'];
    } catch {
      return ['prod-1', 'prod-2', 'prod-3'];
    }
  });

  const addToRecentlyViewed = (productId) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      const next = [productId, ...filtered].slice(0, 8);
      localStorage.setItem('pricepulse_recent', JSON.stringify(next));
      return next;
    });
  };

  // 7. Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // 8. Global Quick Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const openSearch = (query = '') => {
    setSearchInitialQuery(query);
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchInitialQuery('');
  };

  // 9. Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
    user,
    login,
    signup,
    logout,
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
