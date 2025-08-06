import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CartSidebar from './components/CartSidebar';
import AdminPanel from './components/AdminPanel';
import OrderHistory from './components/OrderHistory';
import OrderManager from './components/admin/OrderManager';

function App() {
  const { loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showAdminOrders, setShowAdminOrders] = useState(false);

  useEffect(() => {
    const handleShowOrderHistory = () => {
      setShowOrderHistory(true);
    };

    const handleShowAdminOrders = () => {
      setShowAdminOrders(true);
    };

    window.addEventListener('showOrderHistory', handleShowOrderHistory);
    window.addEventListener('showAdminOrders', handleShowAdminOrders);
    return () => window.removeEventListener('showOrderHistory', handleShowOrderHistory);
    return () => {
      window.removeEventListener('showOrderHistory', handleShowOrderHistory);
      window.removeEventListener('showAdminOrders', handleShowAdminOrders);
    };
  }, []);

  const handleSearch = (term: string, category: string) => {
    setSearchTerm(term);
    setCategoryId(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show Order History
  if (showOrderHistory) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <Header />
        <div className="pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <button
              onClick={() => setShowOrderHistory(false)}
              className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a la tienda</span>
            </button>
          </div>
          <OrderHistory />
        </div>
        <Footer />
        <WhatsAppButton />
        <CartSidebar />
        <AdminPanel />
      </div>
    );
  }

  // Show Admin Orders
  if (showAdminOrders) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors">
        <Header />
        <div className="pt-8 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <button
              onClick={() => setShowAdminOrders(false)}
              className="flex items-center space-x-2 text-orange-500 hover:text-orange-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a la tienda</span>
            </button>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
            <OrderManager />
          </div>
        </div>
        <WhatsAppButton />
        <CartSidebar />
      </div>
    );
  }

  // Always show main store layout
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <Hero />
      <SearchBar onSearch={handleSearch} />
      <ProductGrid searchTerm={searchTerm} categoryId={categoryId} />
      <Footer />
      <WhatsAppButton />
      <CartSidebar />
      <AdminPanel />
    </div>
  );
}

export default App;