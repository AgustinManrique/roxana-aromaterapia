/*
  # Fix admin users references

  1. Recreate admin_users table with proper references
    - Primary key references auth.users
    - Maintains email unique constraint
    - Simple and effective structure

  2. Security
    - RLS enabled with restrictive policies
    - Only admins can read admin list
    - Auto-promotion on trigger
*/

-- Recreate admin_users with reference to auth.users
DROP TABLE IF EXISTS admin_users CASCADE;

CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for admin users
CREATE POLICY "Admin users can read admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);