/*
  # Create admin user trigger

  1. Function
    - On new user creation, check if email matches admin email
    - Auto-promote agustinmanriquee@gmail.com to admin

  2. Security
    - SECURITY DEFINER for safe execution
    - Only runs on user creation
*/

-- Create or replace function to auto-promote admin user
CREATE OR REPLACE FUNCTION promote_admin_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the admin email, add to admin_users
  IF NEW.email = 'agustinmanriquee@gmail.com' THEN
    INSERT INTO admin_users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to promote admin user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for admin promotion
DROP TRIGGER IF EXISTS promote_admin_on_signup_trigger ON auth.users;
CREATE TRIGGER promote_admin_on_signup_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION promote_admin_on_signup();