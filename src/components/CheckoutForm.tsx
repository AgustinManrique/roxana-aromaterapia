import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Store, CreditCard, DollarSign, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Declare MercadoPago global
declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack, onSuccess }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transfer' | 'cash'>('mercadopago');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Shipping form data
  const [shippingData, setShippingData] = useState({
    street: '',
    city: 'La Plata',
    postal_code: '',
    phone: '',
    notes: ''
  });

  // Pre-fill phone from user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('phone')
          .eq('id', user.id)
          .single();
        
        if (data?.phone) {
          setShippingData(prev => ({ ...prev, phone: data.phone }));
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const [orderNotes, setOrderNotes] = useState('');

  const shippingCost = deliveryType === 'delivery' ? 2500 : 0; // $2500 envío
  const totalWithShipping = getTotalPrice() + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Validar datos de envío si es delivery
      if (deliveryType === 'delivery') {
        if (!shippingData.street || !shippingData.phone || !shippingData.postal_code) {
          setError('Por favor completa todos los campos de envío');
          return;
        }
      }

      // Crear el pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total: totalWithShipping,
          delivery_type: deliveryType,
          shipping_address: deliveryType === 'delivery' ? shippingData : null,
          shipping_cost: shippingCost,
          payment_method: paymentMethod,
          notes: orderNotes
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Crear los items del pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Si es MercadoPago, procesar pago
      if (paymentMethod === 'mercadopago') {
        await handleMercadoPagoPayment(order);
        return; // Don't clear cart yet, wait for payment confirmation
      }

      // Para otros métodos de pago, enviar email de confirmación
      await sendOrderConfirmation(order.id);

      // Limpiar carrito y mostrar éxito (solo para métodos que no sean MercadoPago)
      clearCart();
      onSuccess(order.id);

    } catch (error) {
      console.error('Error creating order:', error);
      setError('Error al crear el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoPayment = async (order: any) => {
    try {
      setProcessingPayment(true);
      
      // Create payment preference
      const { data } = await supabase.functions.invoke('create-payment', {
        body: {
          orderId: order.id,
          amount: totalWithShipping,
          description: `Pedido #${order.order_number} - Roxana Aromaterapia`
        }
      });

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to MercadoPago
      window.open(data.initPoint, '_blank');
      
      // Show success message but don't clear cart yet
      setError('');
      alert('Te hemos redirigido a MercadoPago para completar el pago. Una vez confirmado el pago, recibirás un email de confirmación.');
      
      // Clear cart and show success (user will get email confirmation when payment is processed)
      clearCart();
      onSuccess(order.id);
      
    } catch (error) {
      console.error('Error processing MercadoPago payment:', error);
      setError('Error al procesar el pago con MercadoPago. Intenta nuevamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const sendOrderConfirmation = async (orderId: string) => {
    try {
      await supabase.functions.invoke('send-order-confirmation', {
        body: { orderId }
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't throw error, just log it - order was created successfully
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-4 p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Finalizar Compra
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tipo de Entrega */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tipo de Entrega
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                deliveryType === 'pickup' 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={deliveryType === 'pickup'}
                  onChange={(e) => setDeliveryType(e.target.value as 'pickup')}
                  className="sr-only"
                />
                <Store className="w-6 h-6 text-orange-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Retiro en Local
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Calle 136, entre 530 y 531. Número 124
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Gratis
                  </div>
                </div>
              </label>

              <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                deliveryType === 'delivery' 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={deliveryType === 'delivery'}
                  onChange={(e) => setDeliveryType(e.target.value as 'delivery')}
                  className="sr-only"
                />
                <Truck className="w-6 h-6 text-orange-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Envío Privado
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Entrega en tu domicilio
                  </div>
                  <div className="text-sm font-medium text-orange-600">
                    $2.500
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Datos de Envío - Solo si es delivery */}
          {deliveryType === 'delivery' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                Dirección de Envío
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.street}
                    onChange={(e) => setShippingData({...shippingData, street: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Calle y número"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.city}
                      onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.postal_code}
                      onChange={(e) => setShippingData({...shippingData, postal_code: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="1900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+54 9 221 436 3284"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas para el envío
                  </label>
                  <textarea
                    rows={3}
                    value={shippingData.notes}
                    onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Ej: Portero eléctrico, piso, departamento..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Método de Pago */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Método de Pago
            </h3>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                paymentMethod === 'mercadopago' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mercadopago"
                  checked={paymentMethod === 'mercadopago'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'mercadopago')}
                  className="sr-only"
                />
                <CreditCard className="w-6 h-6 text-blue-500 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    MercadoPago
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Tarjeta de crédito, débito o efectivo
                  </div>
                </div>
              </label>

              {deliveryType === 'pickup' && (
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'cash' 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="sr-only"
                  />
                  <DollarSign className="w-6 h-6 text-orange-500 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Efectivo
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Pago al retirar en el local
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Notas del Pedido */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notas del Pedido
            </h3>
            <textarea
              rows={4}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Comentarios adicionales sobre tu pedido..."
            />
          </div>

          {/* Resumen del Pedido */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumen del Pedido
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} productos)</span>
                <span>${getTotalPrice().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>${totalWithShipping.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Footer with Confirm Button */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex-shrink-0">
        <button
          onClick={(e) => {
            e.preventDefault();
            const form = document.querySelector('form');
            if (form) {
              const event = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(event);
            }
          }}
          disabled={loading || processingPayment}
          className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
        >
          {loading || processingPayment ? 'Procesando...' : `Confirmar Pedido - $${totalWithShipping.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;