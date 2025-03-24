/*
  # Fix RLS Policies and Topic References

  1. Changes
    - Drop all existing profile policies
    - Create new non-recursive policies
    - Add direct topic/subtopic lookup function
    - Add proper error handling
    
  2. Security
    - Maintain RLS protection
    - Improve policy clarity
    - Add proper validation
*/

-- Drop all existing profile policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Administrators can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Administrators can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Administrators can manage all profiles" ON profiles;

-- Create new simplified policies without recursion
CREATE POLICY "Allow users to read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Allow users to update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Allow admins full access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN ('mcmanaman111@gmail.com', 'admin@prepclex.com')
  );

-- Create new function for topic/subtopic lookup
CREATE OR REPLACE FUNCTION get_topic_ids(
  p_topic_name VARCHAR,
  p_subtopic_name VARCHAR
)
RETURNS TABLE (
  topic_id INTEGER,
  subtopic_id INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_topic_id INTEGER;
  v_subtopic_id INTEGER;
BEGIN
  -- Get topic ID
  SELECT id INTO v_topic_id
  FROM topics
  WHERE name = p_topic_name;

  IF v_topic_id IS NULL THEN
    RAISE EXCEPTION 'Topic "%" not found', p_topic_name;
  END IF;

  -- Get subtopic ID
  SELECT id INTO v_subtopic_id
  FROM subtopics
  WHERE topic_id = v_topic_id
  AND name = p_subtopic_name;

  IF v_subtopic_id IS NULL THEN
    RAISE EXCEPTION 'Subtopic "%" not found for topic "%"', p_subtopic_name, p_topic_name;
  END IF;

  RETURN QUERY
  SELECT v_topic_id, v_subtopic_id;
END;
$$;