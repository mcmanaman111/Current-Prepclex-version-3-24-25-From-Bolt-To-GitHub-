/*
  # Update Admin Policy

  1. Changes
    - Modify the admin policy to allow access for mcmanaman111@gmail.com
    - Keep existing policy structure but update the email condition

  2. Security
    - Policy still requires authentication
    - Access is limited to specific email address
*/

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admin can read all users" ON users;

-- Create updated admin policy
CREATE POLICY "Admin can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.email = 'mcmanaman111@gmail.com'
        OR auth.users.email LIKE '%@prepclex.com'
      )
    )
  );