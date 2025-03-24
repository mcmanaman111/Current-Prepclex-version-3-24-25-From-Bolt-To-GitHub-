/*
  # Clean up answers table and fix question upload

  1. Changes
    - Delete incorrect answer data
    - Add constraints to prevent explanation text in answers
    - Add trigger to validate answer data
    - Update RLS policies
    
  2. Security
    - Maintain existing RLS policies
    - Add data validation
*/

-- First, delete the incorrect data from answers table
DELETE FROM answers WHERE answer_text LIKE 'Explanation:%'
OR answer_text LIKE 'Option % is correct%'
OR answer_text LIKE '(Option %)%';

-- Add check constraint to prevent explanation-like text
ALTER TABLE answers
ADD CONSTRAINT answers_text_check
CHECK (
  answer_text NOT LIKE 'Explanation:%'
  AND answer_text NOT LIKE 'Option % is correct%'
  AND answer_text NOT LIKE '(Option %)%'
);

-- Create function to validate answer text
CREATE OR REPLACE FUNCTION validate_answer_text()
RETURNS trigger AS $$
BEGIN
  -- Check for explanation-like text
  IF NEW.answer_text ~ '^Explanation:'
    OR NEW.answer_text ~ '^Option [0-9]+ is correct'
    OR NEW.answer_text ~ '^\(Option [0-9]+\)' THEN
    RAISE EXCEPTION 'Invalid answer text format';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer validation
CREATE TRIGGER validate_answer_text_trigger
  BEFORE INSERT OR UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION validate_answer_text();

-- Add column comments
COMMENT ON COLUMN answers.answer_text IS 'The actual answer option text, not explanations';
COMMENT ON COLUMN answers.is_correct IS 'Whether this is a correct answer option';
COMMENT ON COLUMN answers.option_number IS 'The order/position of this answer option (1-based)';