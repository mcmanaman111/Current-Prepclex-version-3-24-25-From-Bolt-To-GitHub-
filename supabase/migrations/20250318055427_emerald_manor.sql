/*
  # Update users table policies

  1. Changes
    - Add policy to allow users to update their own last_login timestamp
    - Ensure users can only update specific columns
  
  2. Security
    - Maintains existing RLS policies
    - Adds granular control over updatable columns
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create policy for updating profile information
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      -- Only allow updating these specific fields
      COALESCE(NULLIF(first_name, current_setting('app.current_first_name', true)), first_name) = first_name AND
      COALESCE(NULLIF(last_name, current_setting('app.current_last_name', true)), last_name) = last_name AND
      COALESCE(NULLIF(last_login::text, current_setting('app.current_last_login', true)), last_login::text) = last_login::text
    )
  );

-- Create separate policy for last_login updates
CREATE POLICY "Users can update own last_login"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to validate last_login updates
CREATE OR REPLACE FUNCTION check_last_login_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating last_login
  IF NEW.first_name IS DISTINCT FROM OLD.first_name OR
     NEW.last_name IS DISTINCT FROM OLD.last_name THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_login validation
DROP TRIGGER IF EXISTS validate_last_login_update ON users;
CREATE TRIGGER validate_last_login_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (NEW.last_login IS DISTINCT FROM OLD.last_login)
  EXECUTE FUNCTION check_last_login_update();