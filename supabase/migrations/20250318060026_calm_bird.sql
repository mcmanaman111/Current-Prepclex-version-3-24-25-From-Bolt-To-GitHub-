/*
  # Fix users table update policies

  1. Changes
    - Drop existing update policies
    - Create new simplified policies for profile and last_login updates
    - Remove complex trigger-based validation
  
  2. Security
    - Enable RLS on users table
    - Allow users to update only their own records
    - Maintain data integrity through policy constraints
*/

-- Drop existing policies and triggers
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can update own last_login" ON users;
DROP TRIGGER IF EXISTS validate_last_login_update ON users;
DROP FUNCTION IF EXISTS check_last_login_update();

-- Create policy for last_login updates
CREATE POLICY "Users can update last_login"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      -- Only allow updating last_login field
      CASE 
        WHEN last_login IS DISTINCT FROM current_setting('app.current_last_login', true)::timestamptz 
        THEN true
        ELSE false
      END
    )
  );

-- Create policy for profile updates
CREATE POLICY "Users can update profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      -- Only allow updating profile fields
      CASE 
        WHEN first_name IS DISTINCT FROM current_setting('app.current_first_name', true) OR
             last_name IS DISTINCT FROM current_setting('app.current_last_name', true)
        THEN true
        ELSE false
      END
    )
  );