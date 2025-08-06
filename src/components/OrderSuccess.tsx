import React from 'react';
import { CheckCircle, Package, MessageCircle, X } from 'lucide-react';

interface OrderSuccessProps {
  orderId: string;
  onClose: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderId, onClose }) => {
  const handleWhatsAppContact = () => {
    const phoneNumber = "5492214363284";
    const message = `¡Hola! Acabo de realizar el pedido #${orderId}. ¿Podrían confirmarme los detalles?`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¡Pedido Confirmado!
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Success Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Tu pedido fue creado exitosamente!
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Número de pedido: <span className="font-semibold">#{orderId.slice(-8).toUpperCase()}</span>
        </p>

        {/* Next Steps */}
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                  Próximos pasos
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  Te contactaremos para confirmar los detalles de tu pedido y coordinar la entrega.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 text-sm">
                  ¿Tienes dudas?
                </h4>
                <p className="text-orange-700 dark:text-orange-300 text-xs mt-1">
                  Contáctanos por WhatsApp para cualquier consulta sobre tu pedido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <button
          onClick={handleWhatsAppContact}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Contactar por WhatsApp</span>
        </button>
        
        <button
          onClick={onClose}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;