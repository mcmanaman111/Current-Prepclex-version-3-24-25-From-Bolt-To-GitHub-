/*
  # Add Duplicate Question Prevention

  1. Changes
    - Add normalized text column
    - Add trigger to maintain normalized text
    - Add unique index after cleaning data
    - Add trigger to prevent future duplicates

  2. Security
    - Maintain existing RLS policies
    - Add proper error handling
*/

-- Create function to normalize question text for comparison
CREATE OR REPLACE FUNCTION normalize_question_text(text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Remove punctuation, convert to lowercase, and normalize whitespace
  RETURN regexp_replace(
    lower(regexp_replace(text, '[[:punct:]]', '', 'g')),
    '\s+',
    ' ',
    'g'
  );
END;
$$;

-- Add normalized_text column without constraints first
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS normalized_text TEXT;

-- Update existing rows with normalized text
UPDATE questions
SET normalized_text = normalize_question_text(question_text);

-- Remove duplicates keeping the earliest version
WITH duplicates AS (
  SELECT id,
         normalized_text,
         ROW_NUMBER() OVER (
           PARTITION BY normalized_text
           ORDER BY created_at
         ) as row_num
  FROM questions
)
DELETE FROM questions
WHERE id IN (
  SELECT id 
  FROM duplicates 
  WHERE row_num > 1
);

-- Make the column NOT NULL now that it's populated
ALTER TABLE questions 
ALTER COLUMN normalized_text 
SET NOT NULL;

-- Create unique index now that duplicates are removed
CREATE UNIQUE INDEX idx_questions_normalized_text 
ON questions(normalized_text);

-- Create function to maintain normalized text and check for duplicates
CREATE OR REPLACE FUNCTION maintain_normalized_text()
RETURNS trigger AS $$
BEGIN
  -- Calculate normalized text
  NEW.normalized_text := normalize_question_text(NEW.question_text);
  
  -- Check for duplicates
  IF EXISTS (
    SELECT 1 FROM questions
    WHERE id != COALESCE(NEW.id, 0)
    AND normalized_text = NEW.normalized_text
  ) THEN
    RAISE EXCEPTION 'A similar question already exists in the database'
      USING HINT = 'Please check for duplicate questions before inserting';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain normalized text and prevent duplicates
DROP TRIGGER IF EXISTS maintain_normalized_text ON questions;
CREATE TRIGGER maintain_normalized_text
  BEFORE INSERT OR UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION maintain_normalized_text();

-- Add column comment
COMMENT ON COLUMN questions.normalized_text IS 'Normalized version of question text for duplicate detection';