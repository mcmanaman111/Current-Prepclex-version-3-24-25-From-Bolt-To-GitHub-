/*
  # Fix Question Duplicate Logic

  1. Changes
    - Improve normalization function to be more accurate
    - Add better similarity detection
    - Improve error messages
    - Add proper validation
*/

-- Drop existing function and trigger
DROP FUNCTION IF EXISTS normalize_question_text(text) CASCADE;
DROP FUNCTION IF EXISTS maintain_normalized_text() CASCADE;

-- Create improved normalization function
CREATE OR REPLACE FUNCTION normalize_question_text(text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  -- Convert to lowercase
  normalized := lower(text);
  
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
  question_text TEXT,
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
      normalize_question_text(question_text),
      normalize_question_text(q.question_text)
    ) as sim,
    q.question_text
  FROM questions q
  WHERE similarity(
    normalize_question_text(question_text),
    normalize_question_text(q.question_text)
  ) > threshold
  ORDER BY sim DESC;
END;
$$;

-- Create improved maintain_normalized_text function
CREATE OR REPLACE FUNCTION maintain_normalized_text()
RETURNS trigger AS $$
DECLARE
  similar_questions RECORD;
  error_message TEXT;
BEGIN
  -- Calculate normalized text
  NEW.normalized_text := normalize_question_text(NEW.question_text);
  
  -- Check for similar questions
  SELECT * INTO similar_questions
  FROM find_similar_questions(NEW.question_text)
  WHERE id != COALESCE(NEW.id, 0)
  LIMIT 1;
  
  IF FOUND THEN
    error_message := format(
      'A similar question already exists (ID: %s, Similarity: %s%%):
      
      Existing: %s
      
      New: %s
      
      Please modify the question text to make it more unique.',
      similar_questions.id,
      round(similar_questions.similarity * 100),
      similar_questions.original_text,
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