/*
  # Add question_status table and update references

  1. New Table
    - `question_status`: Unified table to track question status per user
      - Replaces separate tables for marked and skipped questions
      - Tracks status history and attempts
      - Maintains question usage statistics

  2. Changes
    - Create question_status table
    - Add indexes and constraints
    - Create functions for status management
    - Migrate existing data
    - Update references from marked_questions and skipped_questions
    - Add RLS policies

  3. Security
    - Enable RLS
    - Add appropriate policies
    - Maintain data integrity
*/

-- Create question_status table
CREATE TABLE question_status (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  status VARCHAR(50) CHECK (status IN ('unused', 'correct', 'incorrect', 'marked', 'skipped')),
  last_attempt_at TIMESTAMPTZ,
  attempts_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Add indexes
CREATE INDEX idx_question_status_user ON question_status(user_id);
CREATE INDEX idx_question_status_question ON question_status(question_id);
CREATE INDEX idx_question_status_status ON question_status(status);
CREATE INDEX idx_question_status_last_attempt ON question_status(last_attempt_at);

-- Enable RLS
ALTER TABLE question_status ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own question status"
  ON question_status
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update question status
CREATE OR REPLACE FUNCTION update_question_status(
  p_user_id UUID,
  p_question_id INTEGER,
  p_status VARCHAR,
  p_is_correct BOOLEAN DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS question_status
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result question_status;
BEGIN
  -- Check authorization
  IF p_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 1
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Insert or update status
  INSERT INTO question_status (
    user_id,
    question_id,
    status,
    last_attempt_at,
    attempts_count,
    correct_count,
    notes
  )
  VALUES (
    p_user_id,
    p_question_id,
    p_status,
    CASE WHEN p_is_correct IS NOT NULL THEN NOW() ELSE NULL END,
    CASE WHEN p_is_correct IS NOT NULL THEN 1 ELSE 0 END,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    p_notes
  )
  ON CONFLICT (user_id, question_id) DO UPDATE
  SET
    status = p_status,
    last_attempt_at = CASE 
      WHEN p_is_correct IS NOT NULL THEN NOW() 
      ELSE question_status.last_attempt_at 
    END,
    attempts_count = CASE 
      WHEN p_is_correct IS NOT NULL 
      THEN question_status.attempts_count + 1 
      ELSE question_status.attempts_count 
    END,
    correct_count = CASE 
      WHEN p_is_correct 
      THEN question_status.correct_count + 1 
      ELSE question_status.correct_count 
    END,
    notes = COALESCE(p_notes, question_status.notes),
    updated_at = NOW()
  RETURNING *
  INTO result;

  RETURN result;
END;
$$;

-- Create function to get available questions
CREATE OR REPLACE FUNCTION get_available_questions(
  p_user_id UUID,
  p_statuses VARCHAR[] DEFAULT NULL,
  p_topics INTEGER[] DEFAULT NULL,
  p_subtopics INTEGER[] DEFAULT NULL,
  p_ngn_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  question_id INTEGER,
  status VARCHAR,
  topic_id INTEGER,
  subtopic_id INTEGER,
  is_ngn BOOLEAN,
  attempts INTEGER,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    COALESCE(qs.status, 'unused') as status,
    q.topic_id,
    q.sub_topic_id as subtopic_id,
    q.ngn as is_ngn,
    COALESCE(qs.attempts_count, 0) as attempts,
    CASE 
      WHEN COALESCE(qs.attempts_count, 0) = 0 THEN 0
      ELSE ROUND((qs.correct_count::numeric / qs.attempts_count) * 100, 2)
    END as success_rate
  FROM questions q
  LEFT JOIN question_status qs ON 
    qs.question_id = q.id AND 
    qs.user_id = p_user_id
  WHERE 
    (p_statuses IS NULL OR COALESCE(qs.status, 'unused') = ANY(p_statuses)) AND
    (p_topics IS NULL OR q.topic_id = ANY(p_topics)) AND
    (p_subtopics IS NULL OR q.sub_topic_id = ANY(p_subtopics)) AND
    (NOT p_ngn_only OR q.ngn = true);
END;
$$;

-- Migrate data from marked_questions
INSERT INTO question_status (
  user_id,
  question_id,
  status,
  last_attempt_at,
  notes,
  created_at,
  updated_at
)
SELECT 
  user_id,
  question_id,
  'marked' as status,
  marked_at as last_attempt_at,
  notes,
  created_at,
  created_at as updated_at
FROM marked_questions
ON CONFLICT (user_id, question_id) DO UPDATE
SET 
  status = 'marked',
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- Migrate data from skipped_questions
INSERT INTO question_status (
  user_id,
  question_id,
  status,
  last_attempt_at,
  created_at,
  updated_at
)
SELECT 
  user_id,
  question_id,
  'skipped' as status,
  skipped_at as last_attempt_at,
  created_at,
  created_at as updated_at
FROM skipped_questions
ON CONFLICT (user_id, question_id) DO UPDATE
SET 
  status = 'skipped',
  updated_at = NOW();

-- Update test_results to use question_status
CREATE OR REPLACE FUNCTION sync_test_results_status()
RETURNS trigger AS $$
BEGIN
  -- Update question status based on test results
  PERFORM update_question_status(
    NEW.user_id,
    NEW.question_id,
    CASE
      WHEN NEW.is_marked THEN 'marked'
      WHEN NEW.is_skipped THEN 'skipped'
      WHEN NEW.is_correct THEN 'correct'
      ELSE 'incorrect'
    END,
    NEW.is_correct
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for test results
CREATE TRIGGER sync_question_status
  AFTER INSERT OR UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION sync_test_results_status();

-- Add column comments
COMMENT ON TABLE question_status IS 'Tracks status and history of questions per user';
COMMENT ON COLUMN question_status.id IS 'Unique identifier for the status record';
COMMENT ON COLUMN question_status.user_id IS 'Reference to the user';
COMMENT ON COLUMN question_status.question_id IS 'Reference to the question';
COMMENT ON COLUMN question_status.status IS 'Current status of the question (unused, correct, incorrect, marked, skipped)';
COMMENT ON COLUMN question_status.last_attempt_at IS 'Timestamp of the last attempt';
COMMENT ON COLUMN question_status.attempts_count IS 'Number of times the question has been attempted';
COMMENT ON COLUMN question_status.correct_count IS 'Number of correct attempts';
COMMENT ON COLUMN question_status.notes IS 'Optional notes about the question';
COMMENT ON COLUMN question_status.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN question_status.updated_at IS 'Timestamp when the record was last updated';

-- Add function comments
COMMENT ON FUNCTION update_question_status IS 'Updates the status of a question for a user';
COMMENT ON FUNCTION get_available_questions IS 'Retrieves available questions based on specified criteria';
COMMENT ON FUNCTION sync_test_results_status IS 'Synchronizes question status with test results';