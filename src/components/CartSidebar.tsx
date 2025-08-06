import React from 'react';
import { useState } from 'react';
import { X, Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CheckoutForm from './CheckoutForm';
import OrderSuccess from './OrderSuccess';

const CartSidebar = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [successOrderId, setSuccessOrderId] = useState<string>('');

  const handleCheckout = () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar una compra');
      return;
    }
    setCurrentView('checkout');
  };

  const handleCheckoutSuccess = (orderId: string) => {
    setSuccessOrderId(orderId);
    setCurrentView('success');
  };

  const handleBackToCart = () => {
    setCurrentView('cart');
  };

  const handleCloseCart = () => {
    setCurrentView('cart');
    closeCart();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300">
        {currentView === 'cart' && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Carrito de Compras ({items.length} items)
              </h2>
              <button
                onClick={handleCloseCart}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-8">Tu carrito está vacío</p>
                  
                  {/* Large Cart Icon */}
                  <div className="mb-8">
                    <ShoppingCart className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                  </div>
                  
                  {/* Call to action text with arrow */}
                  <button 
                    onClick={handleCloseCart}
                    className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Vé a agregar productos</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {/* Product Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </h3>
                        <p className="text-orange-500 font-semibold">
                          ${item.price.toLocaleString()}
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <span className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm font-medium text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 flex-shrink-0">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-orange-500">
                    ${getTotalPrice().toLocaleString()}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    {user ? 'Finalizar Compra' : 'Iniciar Sesión para Comprar'}
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Vaciar Carrito
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'checkout' && (
          <CheckoutForm 
            onBack={handleBackToCart}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        {currentView === 'success' && (
          <OrderSuccess 
            orderId={successOrderId}
            onClose={handleCloseCart}
          />
        )}
      </div>
    </>
  );
};

export default CartSidebar;