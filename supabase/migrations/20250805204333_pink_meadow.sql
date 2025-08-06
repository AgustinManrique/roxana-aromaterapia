/*
  # Sistema completo de usuarios

  1. Tablas actualizadas
    - Mantener `admin_users` para permisos de admin
    - Usar auth.users de Supabase para todos los usuarios
    
  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para usuarios autenticados y admins
    - Acceso público solo para lectura de productos/categorías
*/

-- La tabla admin_users ya existe, solo actualizamos las políticas si es necesario

-- Política para que usuarios autenticados puedan leer productos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' AND policyname = 'Authenticated users can read products'
  ) THEN
    CREATE POLICY "Authenticated users can read products"
      ON products
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Política para que usuarios autenticados puedan leer categorías  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' AND policyname = 'Authenticated users can read categories'
  ) THEN
    CREATE POLICY "Authenticated users can read categories"
      ON categories
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;