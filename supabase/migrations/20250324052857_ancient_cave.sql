/*
  # Add RLS policies for questions table

  1. Changes
    - Add RLS policies for questions table
    - Allow admins full access to questions
    - Allow authenticated users to read questions
    
  2. Security
    - Maintain data integrity
    - Proper access control
    - Admin-only write access
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow admins full access" ON questions;
DROP POLICY IF EXISTS "Allow users to read questions" ON questions;

-- Create policy for admin access
CREATE POLICY "Allow admins full access"
  ON questions
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('mcmanaman111@gmail.com', 'admin@prepclex.com')
  );

-- Create policy for user read access
CREATE POLICY "Allow users to read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Add similar policies for answers table
DROP POLICY IF EXISTS "Allow admins full access" ON answers;
DROP POLICY IF EXISTS "Allow users to read answers" ON answers;

CREATE POLICY "Allow admins full access"
  ON answers
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('mcmanaman111@gmail.com', 'admin@prepclex.com')
  );

CREATE POLICY "Allow users to read answers"
  ON answers
  FOR SELECT
  TO authenticated
  USING (true);