/*
  # Corregir referencias de usuario

  1. Cambios
    - Cambiar foreign key de admin_users para referenciar auth.users
    - Mantener profiles para datos adicionales
    - Simplificar estructura

  2. Seguridad
    - RLS simplificado
    - Referencias correctas a auth.users
*/

-- Recrear admin_users con referencia correcta a auth.users
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política simple para admin_users
CREATE POLICY "Admin users can read admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Agregar usuario como admin si existe
DO $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  -- Buscar usuario por email en auth.users
  SELECT * INTO user_record 
  FROM auth.users 
  WHERE email = 'agustinmanriquee@gmail.com' 
  LIMIT 1;
  
  -- Si existe, agregarlo como admin
  IF user_record.id IS NOT NULL THEN
    INSERT INTO admin_users (id, email)
    VALUES (user_record.id, user_record.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;