import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import RootLayout from './layouts/RootLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Application Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ComparePage from './pages/ComparePage';
import PriceHistoryPage from './pages/PriceHistoryPage';
import AiInsightsPage from './pages/AiInsightsPage';
import WatchlistPage from './pages/WatchlistPage';
import PriceAlertsPage from './pages/PriceAlertsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Shared Master Shell with Navigation, Footer, QuickView Modal, Search Dialog & Toasts */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/price-history" element={<PriceHistoryPage />} />
            <Route path="/ai-insights" element={<AiInsightsPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/wishlist" element={<WatchlistPage />} />
            <Route path="/price-alerts" element={<PriceAlertsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Protected Routes for Authenticated Shoppers */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Catch-all 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
