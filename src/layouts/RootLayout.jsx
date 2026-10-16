import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import SearchModal from '../components/SearchModal';
import ToastContainer from '../components/ToastContainer';
import TrackProductModal from '../components/TrackProductModal';
import { useApp } from '../context/AppContext';

export default function RootLayout() {
  const { isSearchOpen, closeSearch, searchInitialQuery, setQuickViewProduct } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleSelectProduct = (product) => {
    closeSearch();
    navigate(`/products/${product.slug || product.id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20 selection:text-blue-900 font-sans transition-colors duration-200">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Main Page Content (Route-driven via Outlet) */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Global Footer */}
      <Footer />

      {/* 4. Quick View Flip-Open Preview Modal */}
      <ProductQuickViewModal />

      {/* 4.5 Prospective Track Product Modal */}
      <TrackProductModal />

      {/* 5. Global Search Dialog (Cmd+K / Search button) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        onSelectProduct={handleSelectProduct}
        initialQuery={searchInitialQuery}
      />

      {/* 6. Actionable Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
