import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import InfoSection from './components/InfoSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CartSidebar from './components/CartSidebar';
import OrderHistory from './components/OrderHistory';
import AuthCallback from './components/AuthCallback';
import ResetPassword from './components/ResetPassword';
import SetupNotice from './components/SetupNotice';
import FeaturedCarousel from './components/FeaturedCarousel';
import AdminLayout from './components/admin/AdminLayout';
import ProductManager from './components/admin/ProductManager';
import CategoryManager from './components/admin/CategoryManager';
import StatsPanel from './components/admin/StatsPanel';
import OrderManager from './components/admin/OrderManager';

const StoreLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryId, setCategoryId] = useState('all');

  const handleSearch = (term: string, category: string) => {
    setSearchTerm(term);
    setCategoryId(category);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SetupNotice />
      </div>
      <Hero />
      <FeaturedCarousel />
      <SearchBar onSearch={handleSearch} />
      <ProductGrid searchTerm={searchTerm} categoryId={categoryId} />
      <InfoSection />
      <Footer />
      <WhatsAppButton />
      <CartSidebar />
    </div>
  );
};

const OrdersPage = () => (
  <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
    <Header />
    <div className="pt-8">
      <OrderHistory />
    </div>
    <Footer />
    <WhatsAppButton />
    <CartSidebar />
  </div>
);

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoreLayout />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="stats" element={<StatsPanel />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
