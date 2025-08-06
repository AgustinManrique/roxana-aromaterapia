/*
  # Sistema de Pedidos y Pagos

  1. Nuevas Tablas
    - `orders` - Pedidos principales con información de envío y pago
    - `order_items` - Items individuales de cada pedido
    
  2. Tipos de Entrega
    - `pickup` - Retiro en local
    - `delivery` - Envío privado
    
  3. Estados de Pedido
    - `pending` - Pendiente de pago
    - `paid` - Pagado, esperando preparación
    - `processing` - En preparación
    - `ready` - Listo para retiro/envío
    - `shipped` - Enviado (solo delivery)
    - `delivered` - Entregado
    - `cancelled` - Cancelado
    
  4. Métodos de Pago
    - `mercadopago` - MercadoPago
    - `transfer` - Transferencia bancaria
    - `cash` - Efectivo (solo retiro en local)
    
  5. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para usuarios y administradores
*/

-- Crear tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información del pedido
  order_number text UNIQUE NOT NULL DEFAULT 'ORD-' || EXTRACT(EPOCH FROM NOW())::text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'ready', 'shipped', 'delivered', 'cancelled')),
  total numeric NOT NULL CHECK (total >= 0),
  
  -- Información de entrega
  delivery_type text NOT NULL CHECK (delivery_type IN ('pickup', 'delivery')),
  
  -- Información de envío (solo para delivery)
  shipping_address jsonb,
  shipping_cost numeric DEFAULT 0 CHECK (shipping_cost >= 0),
  
  -- Información de pago
  payment_method text CHECK (payment_method IN ('mercadopago', 'transfer', 'cash')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  mercadopago_payment_id text,
  
  -- Notas adicionales
  notes text DEFAULT '',
  admin_notes text DEFAULT '',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de items del pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Información del producto al momento del pedido
  product_name text NOT NULL,
  product_price numeric NOT NULL CHECK (product_price >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric NOT NULL CHECK (subtotal >= 0),
  
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para order_items
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can manage all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON order_items(product_id);