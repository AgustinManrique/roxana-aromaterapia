import React, { useState, useEffect } from 'react';
import { Package, Eye, Edit, Truck, MapPin, Phone, CreditCard, Clock, CheckCircle, MessageCircle, Mail } from 'lucide-react';
import { supabase, Order } from '../../lib/supabase';

const OrderManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactOrder, setContactOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      // Apply status filter on the client side to ensure it works correctly
      let filteredOrders = data || [];
      
      // Apply date filter first
      if (dateFilter === 'last-month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.created_at) >= oneMonthAgo
        );
      }
      
      // Then apply status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending-orders') {
          // Filter for non-finalized orders (not delivered or cancelled)
          filteredOrders = filteredOrders.filter(order => 
            order.status !== 'delivered' && order.status !== 'cancelled'
          );
        } else {
          filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
      }
      
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh orders
      fetchOrders();
      
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'paid':
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <span className="w-4 h-4 text-red-500">✕</span>;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pendiente pago',
      paid: 'Confirmado',
      processing: 'Preparando',
      ready: 'Listo',
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

  const handleContactCustomer = (order: Order) => {
    setContactOrder(order);
    setShowContactModal(true);
  };

  const handleWhatsAppContact = (order: Order) => {
    const phone = order.shipping_address?.phone || order.profiles?.phone;
    if (!phone) {
      alert('No hay número de teléfono registrado para este cliente');
      return;
    }
    
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `¡Hola! Te contacto desde Roxana Aromaterapia sobre tu pedido #${order.order_number}. ¿Cómo estás?`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setShowContactModal(false);
  };

  const handleEmailContact = (order: Order) => {
    const email = order.profiles?.email;
    if (!email) {
      alert('No hay email registrado para este cliente');
      return;
    }
    
    const subject = `Pedido #${order.order_number} - Roxana Aromaterapia`;
    const body = `Hola ${order.profiles?.full_name || 'Cliente'},\n\nTe contacto desde Roxana Aromaterapia sobre tu pedido #${order.order_number}.\n\n¡Saludos!\nRoxana Aromaterapia`;
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    setShowContactModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Pedidos ({orders.length})
          </h2>
          <button
            onClick={() => setStatusFilter(statusFilter === 'pending-orders' ? 'all' : 'pending-orders')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending-orders'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pedidos no finalizados
          </button>
          <button
            onClick={() => setDateFilter(dateFilter === 'last-month' ? 'all' : 'last-month')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateFilter === 'last-month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Todos los del último mes
          </button>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes de pago</option>
          <option value="paid">Confirmados</option>
          <option value="processing">En preparación</option>
          <option value="ready">Listos</option>
          <option value="delivered">Entregados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.order_number}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {order.profiles?.full_name || 'Usuario sin nombre'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {order.profiles?.email || 'Email no disponible'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusText(order.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      {order.delivery_type === 'pickup' ? (
                        <>
                          <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                          Retiro
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 mr-1 text-orange-500" />
                          Envío
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleContactCustomer(order)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Contactar cliente"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay pedidos
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Los pedidos aparecerán aquí cuando los clientes realicen compras.
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pedido #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Info */}
                <div className="space-y-6">
                  {/* Status Update */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Estado del Pedido
                    </h4>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="pending">Pendiente de pago</option>
                      <option value="paid">Pagado - Confirmado</option>
                      <option value="processing">Preparando pedido</option>
                      <option value="ready">Listo para entregar</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Información del Cliente
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Nombre:</span> {selectedOrder.profiles?.full_name || 'No especificado'}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Email:</span> {selectedOrder.profiles?.email || 'No disponible'}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      {selectedOrder.delivery_type === 'pickup' ? (
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                      ) : (
                        <Truck className="w-4 h-4 mr-2 text-orange-500" />
                      )}
                      {selectedOrder.delivery_type === 'pickup' ? 'Retiro en Local' : 'Envío a Domicilio'}
                    </h4>
                    
                    {selectedOrder.delivery_type === 'delivery' && selectedOrder.shipping_address && (
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Dirección:</span> {selectedOrder.shipping_address.street}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Ciudad:</span> {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {selectedOrder.shipping_address.phone}
                        </p>
                        {selectedOrder.shipping_address.notes && (
                          <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Notas:</span> {selectedOrder.shipping_address.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items & Payment */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Productos ({selectedOrder.order_items?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.order_items?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">
                              {item.product_name}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            ${item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-orange-500" />
                      Información de Pago
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Método:</span> {
                          selectedOrder.payment_method === 'mercadopago' ? 'MercadoPago' :
                          selectedOrder.payment_method === 'cash' ? 'Efectivo' : 'No especificado'
                        }
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Estado:</span> {
                          selectedOrder.payment_status === 'paid' ? 'Pagado' :
                          selectedOrder.payment_status === 'pending' ? 'Pendiente' :
                          selectedOrder.payment_status === 'failed' ? 'Fallido' : 'Pendiente'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Resumen de Pago
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Subtotal</span>
                        <span>${(selectedOrder.total - selectedOrder.shipping_cost).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Envío</span>
                        <span>{selectedOrder.shipping_cost === 0 ? 'Gratis' : `$${selectedOrder.shipping_cost.toLocaleString()}`}</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                          <span>Total</span>
                          <span>${selectedOrder.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Notas del Cliente
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && contactOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contactar Cliente
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Pedido #{contactOrder.order_number}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cliente: {contactOrder.profiles?.full_name || 'Usuario sin nombre'}
                </p>
              </div>

              <div className="space-y-3">
                {/* WhatsApp Option */}
                {(contactOrder.shipping_address?.phone || contactOrder.profiles?.phone) && (
                  <button
                    onClick={() => handleWhatsAppContact(contactOrder)}
                    className="w-full flex items-center justify-center space-x-3 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">WhatsApp</div>
                      <div className="text-sm opacity-90">
                        {contactOrder.shipping_address?.phone || contactOrder.profiles?.phone}
                      </div>
                    </div>
                  </button>
                )}

                {/* Email Option */}
                {contactOrder.profiles?.email && (
                  <button
                    onClick={() => handleEmailContact(contactOrder)}
                    className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Email</div>
                      <div className="text-sm opacity-90">
                        {contactOrder.profiles?.email}
                      </div>
                    </div>
                  </button>
                )}

                {/* No contact info available */}
                {!contactOrder.profiles?.email && !contactOrder.shipping_address?.phone && !contactOrder.profiles?.phone && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay información de contacto disponible para este cliente.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;