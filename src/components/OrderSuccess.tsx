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
          ¡Pedido Enviado!
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
          <MessageCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          ¡WhatsApp se abrió con tu pedido!
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Revisa el mensaje con los detalles de tu pedido y envíalo para que podamos procesarlo.
        </p>

        {/* Next Steps */}
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 fill-green-600 dark:fill-green-400 mt-0.5" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <div className="text-left">
                <h4 className="font-medium text-green-900 dark:text-green-100 text-sm">
                  Enviá el mensaje
                </h4>
                <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                  Si no se abrió automáticamente, haz clic en el botón de abajo para abrir WhatsApp nuevamente.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-left">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                  Próximos pasos
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                  Una vez que recibamos tu mensaje, te confirmaremos los detalles y coordinaremos la entrega.
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
          <span>Abrir WhatsApp Nuevamente</span>
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