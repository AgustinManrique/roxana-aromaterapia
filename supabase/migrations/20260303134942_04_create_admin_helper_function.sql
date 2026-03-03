/*
  # Create is_admin() helper function

  1. Function
    - `is_admin()` - Securely checks if current user is an admin
    - Can be used in RLS policies
    - Returns boolean

  2. Security
    - SECURITY DEFINER for performance
    - Safe to use in policies
*/

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;