import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, Truck, MapPin, CreditCard, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Order } from '../lib/supabase';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'paid':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <span className="w-5 h-5 text-red-500">✕</span>;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pendiente de pago',
      paid: 'Pagado - Confirmado',
      processing: 'Preparando tu pedido',
      ready: 'Listo para entregar',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'paid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'processing':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'delivered':
        return 'bg-green-200 text-green-900 dark:bg-green-800/40 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Mis Pedidos
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No tienes pedidos aún
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cuando realices tu primera compra, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Pedido #{order.order_number}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{getStatusText(order.status)}</span>
                    </span>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    {order.delivery_type === 'pickup' ? (
                      <MapPin className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Truck className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-gray-600 dark:text-gray-400">
                      {order.delivery_type === 'pickup' ? 'Retiro en local' : 'Envío a domicilio'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {order.payment_method === 'mercadopago' && 'MercadoPago'}
                      {order.payment_method === 'cash' && 'Efectivo'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details - Expandable */}
              {selectedOrder?.id === order.id && (
                <div className="p-6 bg-gray-50 dark:bg-gray-700">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      Productos ({order.order_items?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.product_name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            ${item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.delivery_type === 'delivery' && order.shipping_address && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        Dirección de Envío
                      </h4>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-900 dark:text-white">
                          {order.shipping_address.street}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {order.shipping_address.city}, {order.shipping_address.postal_code}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Tel: {order.shipping_address.phone}
                        </p>
                        {order.shipping_address.notes && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Notas: {order.shipping_address.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                        Notas del Pedido
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg">
                        {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Total Breakdown */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span>${(order.total - order.shipping_cost).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Envío</span>
                        <span>{order.shipping_cost === 0 ? 'Gratis' : `$${order.shipping_cost.toLocaleString()}`}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                          <span>Total</span>
                          <span>${order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;