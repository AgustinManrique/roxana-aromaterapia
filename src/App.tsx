import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
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

const AdminFab = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/admin/products?new=1')}
      className="fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
      aria-label="Nuevo producto"
    >
      <Plus className="w-6 h-6" />
      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Nuevo producto
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
      </div>
    </button>
  );
};

const StoreLayout = () => {
  const { isAdmin } = useAuth();
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
      {isAdmin ? <AdminFab /> : <WhatsAppButton />}
      <CartSidebar />
    </div>
  );
};

const OrdersPage = () => {
  const { isAdmin } = useAuth();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <Header />
      <div className="pt-8">
        <OrderHistory />
      </div>
      <Footer />
      {isAdmin ? <AdminFab /> : <WhatsAppButton />}
      <CartSidebar />
    </div>
  );
};

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
