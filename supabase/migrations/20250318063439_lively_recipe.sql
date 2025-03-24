/*
  # Recreate users table with proper structure

  1. Changes
    - Drop existing table and related objects if they exist
    - Create users table with proper foreign key relationship
    - Enable RLS
    - Add temporary full access policy
    - Create necessary triggers and functions

  2. Security
    - Enable RLS
    - Add temporary full access policy for authenticated users
    - Add validation triggers for data integrity
*/

-- Drop function dependencies first if they exist
DROP FUNCTION IF EXISTS public.validate_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Drop table if it exists (this will cascade to dependent objects)
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with proper foreign key relationship
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  is_active boolean DEFAULT true,
  CONSTRAINT email_length CHECK (char_length(email) >= 3),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create temporary full access policy
CREATE POLICY "Temporary full access for authenticated users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to validate updates
CREATE OR REPLACE FUNCTION public.validate_user_update()
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
CREATE TRIGGER validate_user_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_update();

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();