/*
  # Fix user system errors

  1. Create missing users table (profiles)
  2. Fix infinite recursion in admin_users policies
  3. Add proper RLS policies
  4. Create trigger for automatic profile creation

  ## Changes Made
  - Create profiles table to store user data
  - Fix admin_users RLS policies to avoid recursion
  - Add trigger to auto-create profiles on auth signup
  - Update foreign key references
*/

-- Create profiles table (this is the missing 'users' table)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies on admin_users
DROP POLICY IF EXISTS "Admins can read admin users" ON admin_users;

-- Create simple, non-recursive policies for admin_users
CREATE POLICY "Admin users can read admin list"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Create policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Public can read basic profile info"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- Create trigger function to auto-create profile
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Check if this email should be an admin
  IF NEW.email = 'agustinmanriquee@gmail.com' THEN
    INSERT INTO admin_users (id, email) VALUES (NEW.id, NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Update admin_users to reference profiles instead of users
DO $$
BEGIN
  -- Check if the foreign key exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'admin_users_id_fkey' 
    AND table_name = 'admin_users'
  ) THEN
    ALTER TABLE admin_users DROP CONSTRAINT admin_users_id_fkey;
  END IF;
END $$;

-- Add new foreign key reference to profiles
ALTER TABLE admin_users 
ADD CONSTRAINT admin_users_id_fkey 
FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();