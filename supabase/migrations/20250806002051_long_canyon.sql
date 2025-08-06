@@ .. @@
   shipping_address jsonb,
   shipping_cost numeric DEFAULT 0 CHECK (shipping_cost >= 0),
-  payment_method text CHECK (payment_method IN ('mercadopago', 'transfer', 'cash')),
+  payment_method text CHECK (payment_method IN ('mercadopago', 'cash')),
   payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
   mercadopago_payment_id text,