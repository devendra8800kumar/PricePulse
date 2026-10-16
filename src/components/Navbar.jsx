import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Search, 
  Bookmark, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  LogIn,
  ChevronRight,
  PlusCircle,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from './ui/Button';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { 
    theme,
    toggleTheme,
    currency, 
    toggleCurrency, 
    watchlist, 
    user, 
    logout, 
    openSearch,
    openTrackModal,
    unreadAlertsCount,
    systemHealth
  } = useApp();

  const navigate = useNavigate();

  // Close mobile drawer on route change or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main navigation links with clean shortened labels
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/products' },
    { 
      name: 'Compare', 
      path: '/compare', 
      dot: 'amber',
      dotTitle: 'Live Battle Matrix'
    },
    { name: 'Price History', path: '/price-history' },
    { 
      name: 'AI Insights', 
      path: '/ai-insights', 
      dot: 'cyan',
      dotTitle: 'AI Buy Intelligence' 
    },
    { name: 'Alerts', path: '/price-alerts' },
  ];

  const watchlistCount = watchlist.length;

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-all duration-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ========================================================= */}
          {/* ZONE 1: LEFT - Logo & Brand (Clean, no long tagline)       */}
          {/* ========================================================= */}
          <div className="flex items-center shrink-0">
            <Link 
              to="/" 
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 rounded-xl"
              aria-label="PricePulse Home"
            >
              <div className="flex items-center justify-center w-8.5 h-8.5 rounded-xl bg-blue-600 text-white shadow-xs shadow-blue-600/20 group-hover:bg-blue-700 transition-colors">
                <Activity className="w-4.5 h-4.5 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Price<span className="text-blue-600 dark:text-blue-400">Pulse</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 leading-none">
                  AI
                </span>
              </div>
            </Link>
          </div>

          {/* ========================================================= */}
          {/* ZONE 2: CENTER - Main Links (Desktop lg+ only)            */}
          {/* ========================================================= */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 font-semibold shadow-2xs border border-transparent dark:border-blue-800/50'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  }`
                }
              >
                <span>{item.name}</span>
                {item.path === '/price-alerts' && unreadAlertsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold leading-none animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
                {item.dot && (
                  <span 
                    title={item.dotTitle}
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.dot === 'amber' 
                        ? 'bg-amber-500 ring-2 ring-amber-100 dark:ring-amber-900/60' 
                        : 'bg-cyan-500 ring-2 ring-cyan-100 dark:ring-cyan-900/60'
                    }`} 
                  />
                )}
              </NavLink>
            ))}
          </nav>

          {/* ========================================================= */}
          {/* ZONE 3: RIGHT - Always pinned, never wraps or shifts       */}
          {/* ========================================================= */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Quick Search Button (Desktop: Command-K / Mobile: Icon) */}
            <button
              type="button"
              onClick={() => openSearch('')}
              className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-150 text-xs flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              title="Search electronics (⌘K)"
              aria-label="Search electronics"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="hidden xl:inline text-slate-500 dark:text-slate-400 font-normal">Search...</span>
              <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 transition-all duration-150 cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>

            {/* Currency Toggle (Desktop lg+ only) */}
            <button
              type="button"
              onClick={toggleCurrency}
              className="hidden lg:inline-flex items-center gap-1 h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all duration-150 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              title="Toggle Currency between INR (₹) and USD ($)"
            >
              <span className={currency === 'INR' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'}>₹ INR</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className={currency === 'USD' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-slate-500'}>$ USD</span>
            </button>

            {/* Watchlist Link (Desktop lg+ only) */}
            <Link
              to="/watchlist"
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all duration-150 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 relative"
              title="View Watchlist"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden xl:inline">Watchlist</span>
              {watchlistCount > 0 && (
                <span className="flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold rounded-full bg-blue-600 text-white">
                  {watchlistCount}
                </span>
              )}
            </Link>

            {/* User Session / Auth Controls */}
            {user && user.isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openTrackModal}
                  className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800/60 transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Track URL</span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="h-9 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 flex items-center gap-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    aria-label="User account menu"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline max-w-24 truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in duration-150 text-slate-700 dark:text-slate-200">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          openTrackModal();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-left"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Track Product URL</span>
                      </button>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>User Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile & Settings</span>
                      </Link>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
                {/* Log In (Ghost Button, visible on desktop lg+) */}
                <Button
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className="hidden lg:inline-flex h-9 px-3 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Log in
                </Button>

                {/* Sign Up (Primary Button, always visible in top bar) */}
                <Button
                  to="/signup"
                  variant="primary"
                  size="sm"
                  className="h-9 px-3.5 text-xs font-semibold"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile / Tablet Hamburger Toggle (<1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE & TABLET SLIDE-DOWN DRAWER (<1024px)               */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                  }`
                }
              >
                <div className="flex items-center gap-2">
                  <span>{item.name}</span>
                  {item.dot && (
                    <span 
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.dot === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'
                      }`} 
                    />
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>
            ))}

            {/* Watchlist Inside Drawer */}
            <NavLink
              to="/watchlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Watchlist</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {watchlistCount}
              </span>
            </NavLink>
          </div>

          {/* Theme, Currency & Auth inside Drawer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {/* Theme Mode Toggle in Drawer */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Theme Mode:</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* Currency Switcher */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Active Currency:</span>
              <button
                type="button"
                onClick={toggleCurrency}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 shadow-2xs cursor-pointer"
              >
                {currency === 'INR' ? '₹ INR (Indian Rupee)' : '$ USD (US Dollar)'}
              </button>
            </div>

            {/* User Session Actions */}
            {user && user.isLoggedIn ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Go to Dashboard ({user.name.split(' ')[0]})</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center justify-center gap-2 w-full h-9 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  to="/login"
                  variant="secondary"
                  size="md"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-xs font-semibold"
                  leftIcon={<LogIn className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Log in to your account
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
