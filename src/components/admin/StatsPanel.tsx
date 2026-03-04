import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Package, Users, Truck, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrderItem {
  product_name: string;
  quantity: number;
  subtotal: number;
}

interface OrderData {
  id: string;
  total: number;
  status: string;
  delivery_type: string;
  shipping_cost: number;
  created_at: string;
  order_items: OrderItem[];
  profiles: { full_name: string; email: string } | null;
}

interface TopProduct {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface StatusCount {
  status: string;
  count: number;
  label: string;
  color: string;
}

const StatsPanel = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total, status, delivery_type, shipping_cost, created_at,
          order_items (product_name, quantity, subtotal),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by period
  const getFilteredOrders = () => {
    if (period === 'all') return orders;

    const now = new Date();
    const cutoff = new Date();
    if (period === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }

    return orders.filter(o => new Date(o.created_at) >= cutoff);
  };

  const filteredOrders = getFilteredOrders();

  // Exclude cancelled orders for revenue calculations
  const activeOrders = filteredOrders.filter(o => o.status !== 'cancelled');

  // KPI calculations
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;
  const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;

  // Top products
  const getTopProducts = (): TopProduct[] => {
    const productMap = new Map<string, TopProduct>();

    activeOrders.forEach(order => {
      order.order_items?.forEach(item => {
        const existing = productMap.get(item.product_name);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalRevenue += item.subtotal;
        } else {
          productMap.set(item.product_name, {
            name: item.product_name,
            totalQuantity: item.quantity,
            totalRevenue: item.subtotal,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);
  };

  // Status distribution
  const getStatusDistribution = (): StatusCount[] => {
    const statusMap: Record<string, { count: number; label: string; color: string }> = {
      pending: { count: 0, label: 'Pendientes', color: 'bg-yellow-500' },
      paid: { count: 0, label: 'Confirmados', color: 'bg-blue-500' },
      processing: { count: 0, label: 'Preparando', color: 'bg-orange-500' },
      ready: { count: 0, label: 'Listos', color: 'bg-green-500' },
      delivered: { count: 0, label: 'Entregados', color: 'bg-green-700' },
      cancelled: { count: 0, label: 'Cancelados', color: 'bg-red-500' },
    };

    filteredOrders.forEach(o => {
      if (statusMap[o.status]) {
        statusMap[o.status].count++;
      }
    });

    return Object.entries(statusMap)
      .map(([status, data]) => ({ status, ...data }))
      .filter(s => s.count > 0);
  };

  // Delivery type distribution
  const pickupCount = activeOrders.filter(o => o.delivery_type === 'pickup').length;
  const deliveryCount = activeOrders.filter(o => o.delivery_type === 'delivery').length;

  // Top customers
  const getTopCustomers = () => {
    const customerMap = new Map<string, { name: string; email: string; orders: number; total: number }>();

    activeOrders.forEach(order => {
      const email = order.profiles?.email || 'desconocido';
      const existing = customerMap.get(email);
      if (existing) {
        existing.orders++;
        existing.total += order.total;
      } else {
        customerMap.set(email, {
          name: order.profiles?.full_name || 'Sin nombre',
          email,
          orders: 1,
          total: order.total,
        });
      }
    });

    return Array.from(customerMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const topProducts = getTopProducts();
  const statusDistribution = getStatusDistribution();
  const topCustomers = getTopCustomers();
  const maxProductQty = topProducts.length > 0 ? topProducts[0].totalQuantity : 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period filter */}
      <div className="flex items-center space-x-2">
        {([
          ['week', 'Ultima semana'],
          ['month', 'Ultimo mes'],
          ['all', 'Todo'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pedidos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ticket promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${Math.round(avgOrderValue).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Entregados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{deliveredOrders}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
            Productos mas vendidos
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay datos de ventas aun.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center space-x-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-200 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${(product.totalQuantity / maxProductQty) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.totalQuantity} uds
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${product.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-orange-500" />
            Estado de pedidos
          </h3>
          {statusDistribution.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay pedidos en este periodo.</p>
          ) : (
            <div className="space-y-3">
              {statusDistribution.map(status => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{status.count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({totalOrders > 0 ? Math.round((status.count / totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}

              {/* Visual bar */}
              <div className="flex rounded-full overflow-hidden h-4 mt-2">
                {statusDistribution.map(status => (
                  <div
                    key={status.status}
                    className={`${status.color}`}
                    style={{ width: `${(status.count / totalOrders) * 100}%` }}
                    title={`${status.label}: ${status.count}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Delivery type */}
          {activeOrders.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipo de entrega
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{pickupCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Retiro en local</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{deliveryCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Envio a domicilio</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-500" />
            Mejores clientes
          </h3>
          {topCustomers.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay datos de clientes aun.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-3">Cliente</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-3">Email</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-3">Pedidos</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-3">Total gastado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {topCustomers.map((customer, index) => (
                    <tr key={customer.email}>
                      <td className="py-3 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                          <span>{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                      <td className="py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{customer.orders}</td>
                      <td className="py-3 text-sm text-right font-semibold text-orange-500">${customer.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
