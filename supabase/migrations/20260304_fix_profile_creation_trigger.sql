/*
  # Fix profile creation trigger - Database error saving new user

  Problem: The trigger that creates a profile on user signup can fail if:
  - A profile with the same email already exists (UNIQUE constraint)
  - The trigger doesn't handle conflicts gracefully
  - Multiple triggers compete on auth.users INSERT

  Fix:
  - Use ON CONFLICT DO NOTHING to prevent duplicate errors
  - Add proper exception handling that won't abort the transaction
  - Consolidate into a single reliable trigger
*/

-- Recreate the trigger function with conflict handling
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure only one trigger exists for profile creation
DROP TRIGGER IF EXISTS create_profile_trigger ON auth.users;
CREATE TRIGGER create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- Also ensure the profiles insert policy allows the trigger (SECURITY DEFINER) to work
-- The service_role bypasses RLS, but just in case:
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Also allow authenticated users to insert their own profile (for AuthCallback fallback)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
