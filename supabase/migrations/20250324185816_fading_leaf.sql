/*
  # Fix Question Duplication Prevention

  1. Changes
    - Rewrite functions to avoid CTE syntax error
    - Maintain same duplicate detection logic
    - Keep all existing functionality
    
  2. Security
    - Maintain SECURITY DEFINER
    - Keep safe search path
    - Preserve error handling
*/

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS normalize_question_text(text) CASCADE;
DROP FUNCTION IF EXISTS maintain_normalized_text() CASCADE;
DROP FUNCTION IF EXISTS find_similar_questions(text, float) CASCADE;

-- Create improved normalization function
CREATE OR REPLACE FUNCTION normalize_question_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  -- Convert to lowercase
  normalized := lower(input_text);
  
  -- Remove punctuation except decimal points in numbers
  normalized := regexp_replace(normalized, '[^\w\s\.]', '', 'g');
  
  -- Replace multiple spaces with single space
  normalized := regexp_replace(normalized, '\s+', ' ', 'g');
  
  -- Remove leading/trailing whitespace
  normalized := trim(normalized);
  
  -- Remove common filler words
  normalized := regexp_replace(normalized, '\y(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\y', '', 'g');
  
  -- Normalize numbers (keep decimals)
  normalized := regexp_replace(normalized, '(\d+)\.(\d+)', 'N.N', 'g');
  normalized := regexp_replace(normalized, '\d+', 'N', 'g');
  
  -- Remove resulting double spaces
  normalized := regexp_replace(normalized, '\s+', ' ', 'g');
  
  RETURN normalized;
END;
$$;

-- Create function to find similar questions
CREATE OR REPLACE FUNCTION find_similar_questions(
  input_text TEXT,
  threshold FLOAT DEFAULT 0.8
)
RETURNS TABLE (
  id INTEGER,
  similarity FLOAT,
  original_text TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    similarity(
      normalize_question_text(input_text),
      normalize_question_text(q.question_text)
    ) as sim,
    q.question_text as original_text
  FROM questions q
  WHERE similarity(
    normalize_question_text(input_text),
    normalize_question_text(q.question_text)
  ) > threshold
  ORDER BY sim DESC;
END;
$$;

-- Create improved maintain_normalized_text function
CREATE OR REPLACE FUNCTION maintain_normalized_text()
RETURNS trigger AS $$
DECLARE
  similar_id INTEGER;
  similar_text TEXT;
  similarity_score FLOAT;
  error_message TEXT;
BEGIN
  -- Calculate normalized text
  NEW.normalized_text := normalize_question_text(NEW.question_text);
  
  -- Check for similar questions
  SELECT 
    id, 
    question_text,
    similarity(
      normalize_question_text(NEW.question_text),
      normalize_question_text(question_text)
    ) as sim
  INTO similar_id, similar_text, similarity_score
  FROM questions
  WHERE id != COALESCE(NEW.id, 0)
  AND similarity(
    normalize_question_text(NEW.question_text),
    normalize_question_text(question_text)
  ) > 0.8
  ORDER BY sim DESC
  LIMIT 1;
  
  IF similar_id IS NOT NULL THEN
    error_message := format(
      'A similar question already exists (ID: %s, Similarity: %s%%):
      
      Existing: %s
      
      New: %s
      
      Please modify the question text to make it more unique.',
      similar_id,
      round(similarity_score * 100),
      similar_text,
      NEW.question_text
    );
    
    RAISE EXCEPTION USING 
      ERRCODE = 'P0001',
      MESSAGE = error_message,
      HINT = 'Try rephrasing the question while keeping the same meaning';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER maintain_normalized_text
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION maintain_normalized_text();

-- Add column comments
COMMENT ON COLUMN questions.normalized_text IS 'Normalized version of question text for duplicate detection';
COMMENT ON FUNCTION normalize_question_text IS 'Normalizes question text for similarity comparison';
COMMENT ON FUNCTION find_similar_questions IS 'Finds questions similar to the given text';
COMMENT ON FUNCTION maintain_normalized_text IS 'Maintains normalized text and prevents duplicate questions';