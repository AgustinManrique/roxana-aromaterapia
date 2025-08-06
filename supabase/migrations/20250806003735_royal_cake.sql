/*
  # Agregar campo teléfono a perfiles

  1. Cambios en tabla profiles
    - Agregar columna `phone` (text, opcional)
    - Permitir almacenar número de teléfono del usuario

  2. Notas
    - Campo opcional para no romper registros existentes
    - Se puede actualizar desde configuración de usuario
*/

-- Agregar columna phone a la tabla profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;