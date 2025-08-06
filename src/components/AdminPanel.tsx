import React, { useState, useEffect } from 'react';
import { Package, Tag, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProductManager from './admin/ProductManager';
import CategoryManager from './admin/CategoryManager';

const AdminPanel = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('products');

  // Set default tab to products since orders was removed
  useEffect(() => {
    setActiveTab('products');
  }, []);
  const [isOpen, setIsOpen] = useState(false);

  // Listen for admin panel toggle from header
  useEffect(() => {
    const handleToggleAdmin = () => {
      setIsOpen(prev => !prev);
    };

    window.addEventListener('toggleAdminPanel', handleToggleAdmin);
    return () => window.removeEventListener('toggleAdminPanel', handleToggleAdmin);
  }, []);

  // Don't render if not admin or not open
  if (!isAdmin || !isOpen) return null;

  const tabs = [
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'categories', label: 'Categorías', icon: Tag },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
  ];

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Admin Panel Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-6xl bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Panel de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Gestiona productos, categorías y configuraciones de la tienda
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="px-6">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'categories' && <CategoryManager />}
            {activeTab === 'stats' && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Estadísticas
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Próximamente: estadísticas de ventas y productos más populares
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;