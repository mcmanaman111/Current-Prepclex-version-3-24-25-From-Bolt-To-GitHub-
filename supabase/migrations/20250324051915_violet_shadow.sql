/*
  # Fix RLS Policies and Topic IDs Function

  1. Changes
    - Drop and recreate profiles policies to remove circular dependency
    - Update get_or_create_topic_ids function to handle errors properly
    - Add better error handling and validation
    
  2. Security
    - Maintain proper RLS enforcement
    - Add input validation
    - Improve error messages
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Administrators can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Administrators can update all profiles" ON profiles;

-- Create new simplified policies
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

CREATE POLICY "Administrators can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
      AND u.email IN ('mcmanaman111@gmail.com', 'admin@prepclex.com')
    )
  );

-- Drop and recreate get_or_create_topic_ids function with better error handling
DROP FUNCTION IF EXISTS get_or_create_topic_ids(VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION get_or_create_topic_ids(
  p_topic_name VARCHAR,
  p_subtopic_name VARCHAR
) 
RETURNS TABLE (topic_id INTEGER, subtopic_id INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic_id INTEGER;
  v_subtopic_id INTEGER;
BEGIN
  -- Input validation
  IF p_topic_name IS NULL OR p_subtopic_name IS NULL THEN
    RAISE EXCEPTION 'Topic and subtopic names cannot be null';
  END IF;

  -- Trim whitespace
  p_topic_name := TRIM(p_topic_name);
  p_subtopic_name := TRIM(p_subtopic_name);

  IF p_topic_name = '' OR p_subtopic_name = '' THEN
    RAISE EXCEPTION 'Topic and subtopic names cannot be empty';
  END IF;

  -- Get or create topic in a transaction
  BEGIN
    SELECT id INTO v_topic_id
    FROM topics
    WHERE name = p_topic_name;
    
    IF v_topic_id IS NULL THEN
      INSERT INTO topics (name)
      VALUES (p_topic_name)
      RETURNING id INTO v_topic_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating topic: %', SQLERRM;
  END;

  -- Get or create subtopic in a transaction
  BEGIN
    SELECT id INTO v_subtopic_id
    FROM subtopics
    WHERE topic_id = v_topic_id AND name = p_subtopic_name;
    
    IF v_subtopic_id IS NULL THEN
      INSERT INTO subtopics (topic_id, name)
      VALUES (v_topic_id, p_subtopic_name)
      RETURNING id INTO v_subtopic_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating subtopic: %', SQLERRM;
  END;

  -- Return both IDs
  RETURN QUERY
  SELECT v_topic_id AS topic_id, v_subtopic_id AS subtopic_id;
END;
$$;