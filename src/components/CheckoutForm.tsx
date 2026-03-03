import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Store, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onBack, onSuccess }) => {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    setLoading(true);
    setError('');

    try {
      // Validar datos de envío si es delivery
      if (deliveryType === 'delivery') {
        if (!shippingData.street || !shippingData.phone || !shippingData.postal_code) {
          setError('Por favor completa todos los campos de envío');
          setLoading(false);
          return;
        }
      }

      // Construir mensaje de WhatsApp
      let message = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
      // Emojis como secuencias Unicode para evitar problemas de codificación
      message += '\uD83D\uDCE6 *PRODUCTOS:*\n'; // 📦

      items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   Cantidad: ${item.quantity}\n`;
        message += `   Precio unitario: $${item.price.toLocaleString()}\n`;
        message += `   Subtotal: $${(item.price * item.quantity).toLocaleString()}\n\n`;
      });

      message += `\uD83D\uDCB0 *Subtotal:* $${getTotalPrice().toLocaleString()}\n`; // 💰

      // Información de entrega
      if (deliveryType === 'delivery') {
        message += `\n\uD83D\uDE9A *ENTREGA:* Envío a domicilio ($${shippingCost.toLocaleString()})\n`; // 🚚
        message += `📍 *Dirección:*\n`;
        message += `${shippingData.street}\n`;
        message += `${shippingData.city}, CP: ${shippingData.postal_code}\n`;
        message += `📞 Teléfono: ${shippingData.phone}\n`;
        if (shippingData.notes) {
          message += `\uD83D\uDCDD Notas de envío: ${shippingData.notes}\n`; // 📝
        }
      } else {
        message += `\n\uD83C\uDFEA *ENTREGA:* Retiro en local (Gratis)\n`; // 🏪
        message += `📍 Calle 136, entre 530 y 531. Número 124, La Plata\n`;
      }

      // Notas adicionales
      if (orderNotes) {
        message += `\n\uD83D\uDCDD *NOTAS ADICIONALES:*\n${orderNotes}\n`; // 📝
      }

      message += `\n\uD83D\uDCB5 *TOTAL A PAGAR:* $${totalWithShipping.toLocaleString()}\n`; // 💵

      // Abrir WhatsApp
      const phoneNumber = "5492214363284";
      const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');

      // Limpiar carrito y mostrar éxito
      clearCart();
      onSuccess('whatsapp');

    } catch (error) {
      console.error('Error generating WhatsApp message:', error);
      setError('Error al generar el mensaje. Intenta nuevamente.');
    } finally {
      setLoading(false);
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
          disabled={loading}
          className="w-full bg-green-500 text-white py-4 px-6 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg flex items-center justify-center space-x-2"
        >
          {loading ? (
            <span>Preparando mensaje...</span>
          ) : (
            <>
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <span>Enviar Pedido por WhatsApp - ${totalWithShipping.toLocaleString()}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;