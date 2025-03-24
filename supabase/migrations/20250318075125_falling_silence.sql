/*
  # Fix Database Schema

  1. Changes
    - Create users table first
    - Update profiles table foreign key
    - Add RLS policies and triggers
    - Preserve existing data

  2. Security
    - Maintain RLS on all tables
    - Update policies for proper access control
    - Preserve existing security model

  3. Data Integrity
    - Ensure no data loss during migration
    - Maintain referential integrity
*/

-- First create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true,
  CONSTRAINT email_length CHECK (char_length(email) >= 3)
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Migrate existing profile data to users table
INSERT INTO users (id, email, created_at)
SELECT id, email, created_at
FROM profiles
ON CONFLICT (id) DO NOTHING;

-- Now update profiles table to reference users
DO $$ 
BEGIN
  -- Drop the existing foreign key if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
  
  -- Add the new foreign key
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;
END $$;

-- Recreate handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- First insert into users
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  
  -- Then create profile
  INSERT INTO public.profiles (id, email, role_id, subscription_type)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email LIKE '%@prepclex.com' THEN 1  -- Administrator
      WHEN new.email = 'mcmanaman111@gmail.com' THEN 1  -- Administrator
      ELSE 6  -- Student (default)
    END,
    1  -- Free subscription
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create users policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Administrators can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 1
    )
  );

-- Create updated_at trigger for users
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();