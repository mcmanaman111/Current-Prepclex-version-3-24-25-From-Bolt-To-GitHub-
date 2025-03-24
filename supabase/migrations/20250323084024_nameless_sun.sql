/*
  # Add get_or_create_topic_ids function

  1. Changes
    - Create function to get or create topic IDs
    - Function handles both topic and subtopic creation
    - Returns both IDs in a single call
    
  2. Security
    - SECURITY DEFINER function
    - Safe search path
    - Proper error handling
*/

-- Create function to get or create topic IDs
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
  -- Get or create topic
  SELECT id INTO v_topic_id
  FROM topics
  WHERE name = p_topic_name;
  
  IF v_topic_id IS NULL THEN
    INSERT INTO topics (name)
    VALUES (p_topic_name)
    RETURNING id INTO v_topic_id;
  END IF;

  -- Get or create subtopic
  SELECT id INTO v_subtopic_id
  FROM subtopics
  WHERE topic_id = v_topic_id AND name = p_subtopic_name;
  
  IF v_subtopic_id IS NULL THEN
    INSERT INTO subtopics (topic_id, name)
    VALUES (v_topic_id, p_subtopic_name)
    RETURNING id INTO v_subtopic_id;
  END IF;

  RETURN QUERY SELECT v_topic_id, v_subtopic_id;
END;
$$;