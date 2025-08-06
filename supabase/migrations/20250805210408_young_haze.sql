/*
  # Agregar usuario administrador

  1. Cambios
    - Insertar usuario agustinmanriquee@gmail.com como administrador
    - Buscar el ID del usuario en la tabla profiles
    - Agregarlo a admin_users si no existe

  2. Seguridad
    - Solo se ejecuta si el usuario existe en profiles
    - Evita duplicados con ON CONFLICT
*/

-- Insertar en admin_users basado en el email del perfil
INSERT INTO admin_users (id, email)
SELECT p.id, p.email
FROM profiles p
WHERE p.email = 'agustinmanriquee@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM admin_users a WHERE a.id = p.id
);