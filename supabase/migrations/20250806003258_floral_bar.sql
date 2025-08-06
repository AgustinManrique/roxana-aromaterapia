/*
  # Crear relación entre orders y profiles

  1. Cambios en la base de datos
    - Agregar foreign key constraint entre orders.user_id y profiles.id
    - Esto permitirá hacer JOIN entre orders y profiles
    - Los usuarios podrán ver sus pedidos y los admins verán a quién pertenece cada pedido

  2. Seguridad
    - La relación respeta las políticas RLS existentes
    - Los usuarios solo ven sus propios pedidos
    - Los admins pueden ver todos los pedidos con información del usuario
*/

-- Agregar foreign key constraint entre orders.user_id y profiles.id
DO $$
BEGIN
  -- Verificar si la constraint ya existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_user_id_profiles_fkey'
    AND table_name = 'orders'
  ) THEN
    -- Agregar la foreign key constraint
    ALTER TABLE orders 
    ADD CONSTRAINT orders_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;