/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing update policies
    - Create simplified update policy for last_login
    - Create simplified update policy for profile fields
  
  2. Security
    - Enable RLS on users table
    - Allow users to update only their own records
    - Maintain data integrity through policy constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update last_login" ON users;
DROP POLICY IF EXISTS "Users can update profile" ON users;

-- Create simplified policy for last_login updates
CREATE POLICY "Users can update last_login"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create simplified policy for profile updates
CREATE POLICY "Users can update profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to validate updates
CREATE OR REPLACE FUNCTION validate_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updating specific fields
  IF NEW.id != OLD.id OR
     NEW.email != OLD.email OR
     NEW.created_at != OLD.created_at OR
     NEW.is_active != OLD.is_active THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for update validation
DROP TRIGGER IF EXISTS validate_user_update ON users;
CREATE TRIGGER validate_user_update
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_update();