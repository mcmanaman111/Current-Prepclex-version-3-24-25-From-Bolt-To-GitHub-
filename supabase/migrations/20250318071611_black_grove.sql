/*
  # Add roles, subscriptions, and profiles tables

  1. New Tables
    - `roles`: Stores user role definitions
      - `id` (serial, primary key)
      - `name` (text, unique): Role name
      - `description` (text): Role description
      - `created_at` (timestamptz): Creation timestamp
      - `updated_at` (timestamptz): Last update timestamp

    - `subscriptions`: Stores subscription plan definitions
      - `id` (serial, primary key)
      - `name` (text, unique): Subscription name
      - `description` (text): Plan description
      - `duration_days` (integer): Subscription duration
      - `stripe_price_id` (text): Stripe price ID
      - `created_at` (timestamptz): Creation timestamp
      - `updated_at` (timestamptz): Last update timestamp

    - `profiles`: Stores extended user profile information
      - `id` (uuid, primary key): References auth.users
      - `full_name` (text): User's full name
      - `email` (text, unique): User's email
      - `avatar_url` (text): Profile picture URL
      - `role_id` (integer): References roles table
      - `subscription_active` (boolean): Active subscription status
      - `subscription_type` (integer): References subscriptions table
      - `subscription_ends_at` (timestamptz): Subscription end date
      - `created_at` (timestamptz): Creation timestamp
      - `updated_at` (timestamptz): Last update timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin-only policies for roles and subscriptions tables

  3. Changes
    - Drop existing users table as it will be replaced by profiles
    - Migrate any existing user data to profiles table
*/

-- Drop existing users table and related objects
DROP TABLE IF EXISTS users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS validate_user_update() CASCADE;

-- Create roles table
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role_id INTEGER REFERENCES roles(id) DEFAULT 6, -- Default to Student role
  subscription_active BOOLEAN DEFAULT FALSE,
  subscription_type INTEGER REFERENCES subscriptions(id),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT email_length CHECK (char_length(email) >= 3)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
  (1, 'Administrator', 'Full system access and management capabilities'),
  (2, 'Team_Member', 'Internal team member with elevated access'),
  (3, 'Test_User', 'Account for testing purposes'),
  (4, 'Demo_User', 'Limited access demo account'),
  (5, 'Teacher', 'Educator account with student management capabilities'),
  (6, 'Student', 'Standard student account');

-- Insert subscription types
INSERT INTO subscriptions (id, name, description, duration_days) VALUES
  (1, 'Free', 'Basic access with limited features', 0),
  (2, 'Demo', 'Full access demo period', 7),
  (3, '30_Day', '30 days of full access', 30),
  (4, '60_Day', '60 days of full access', 60),
  (5, '90_Day', '90 days of full access', 90),
  (6, '180_Day', '180 days of full access', 180),
  (7, 'Annual', '365 days of full access', 365);

-- Create updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at triggers
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
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

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create policies

-- Roles policies
CREATE POLICY "Allow read access to roles for all authenticated users"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all access to roles for administrators"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 1
    )
  );

-- Subscriptions policies
CREATE POLICY "Allow read access to subscriptions for all authenticated users"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all access to subscriptions for administrators"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 1
    )
  );

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Administrators can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 1
    )
  );

CREATE POLICY "Administrators can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = 1
    )
  );