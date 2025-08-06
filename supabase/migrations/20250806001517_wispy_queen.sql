@@ .. @@
   CONSTRAINT orders_status_check CHECK (
-    status IN ('pending', 'paid', 'processing', 'ready', 'shipped', 'delivered', 'cancelled')
+    status IN ('pending', 'paid', 'processing', 'ready', 'delivered', 'cancelled')
   ),