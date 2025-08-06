import React from 'react';
import { ShoppingCart, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

const Header = () => {
  const { isDark, toggleTheme } = useTheme();
  const { openCart, getTotalItems } = useCart();
  const { isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm border-b border-orange-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Roxana Aromaterapia Logo" 
              className="w-8 h-8 object-contain hidden sm:block"
            />
            <div>
              <span className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Roxana</span>
              <span className="text-lg sm:text-xl font-light text-orange-500 ml-1">Aromaterapia</span>
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Admin Panel Button - Only visible for admins */}
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => window.dispatchEvent(new Event('showAdminOrders'))}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  title="Gestión de Pedidos"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Pedidos</span>
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new Event('toggleAdminPanel'))}
                  className="flex items-center space-x-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                  title="Panel de Administración"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              </div>
            )}
            <UserMenu />
            <button 
              onClick={toggleTheme}
              className="p-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
              aria-label="Cambiar tema"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={openCart}
              className="p-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;