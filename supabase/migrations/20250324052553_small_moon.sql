/*
  # Fix topic/subtopic lookup functions

  1. Changes
    - Drop and recreate get_or_create_topic_ids function
    - Fix ambiguous column references
    - Add better error handling
    - Add proper transaction handling
    
  2. Security
    - Maintain SECURITY DEFINER
    - Set safe search path
    - Add proper error messages
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_or_create_topic_ids(VARCHAR, VARCHAR);

-- Create new function with fixed column references
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

  -- Start transaction
  BEGIN
    -- Get or create topic
    SELECT t.id INTO v_topic_id
    FROM topics t
    WHERE t.name = p_topic_name;
    
    IF v_topic_id IS NULL THEN
      INSERT INTO topics (name)
      VALUES (p_topic_name)
      RETURNING id INTO v_topic_id;
    END IF;

    -- Get or create subtopic using explicit table references
    SELECT s.id INTO v_subtopic_id
    FROM subtopics s
    WHERE s.topic_id = v_topic_id 
    AND s.name = p_subtopic_name;
    
    IF v_subtopic_id IS NULL THEN
      INSERT INTO subtopics (topic_id, name)
      VALUES (v_topic_id, p_subtopic_name)
      RETURNING id INTO v_subtopic_id;
    END IF;

    -- Return both IDs
    RETURN QUERY
    SELECT v_topic_id, v_subtopic_id;
    
  EXCEPTION WHEN OTHERS THEN
    -- Roll back transaction on error
    RAISE EXCEPTION 'Error managing topics: %', SQLERRM;
  END;
END;
$$;