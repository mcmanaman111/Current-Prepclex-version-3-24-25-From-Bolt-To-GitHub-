/*
  # Add question_statistics table for peer metrics

  1. New Table
    - `question_statistics`: Tracks aggregate statistics per question
      - Stores peer performance metrics
      - Updates automatically via triggers
      - Maintains running averages
      
  2. Changes
    - Add table and indexes
    - Add update trigger
    - Add RLS policies
*/

-- Create question_statistics table
CREATE TABLE question_statistics (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  partial_attempts INTEGER DEFAULT 0,
  incorrect_attempts INTEGER DEFAULT 0,
  avg_time_seconds NUMERIC(6,2) DEFAULT 0,
  avg_score NUMERIC(5,2) DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id)
);

-- Add indexes
CREATE INDEX idx_question_statistics_question ON question_statistics(question_id);
CREATE INDEX idx_question_statistics_score ON question_statistics(avg_score);

-- Enable RLS
ALTER TABLE question_statistics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Question statistics are viewable by all authenticated users"
  ON question_statistics
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update statistics
CREATE OR REPLACE FUNCTION update_question_statistics()
RETURNS trigger AS $$
BEGIN
  -- Insert or update statistics
  INSERT INTO question_statistics (
    question_id,
    total_attempts,
    correct_attempts,
    partial_attempts,
    incorrect_attempts,
    avg_time_seconds,
    avg_score,
    last_attempt_at
  )
  VALUES (
    NEW.question_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_partially_correct THEN 1 ELSE 0 END,
    CASE WHEN NOT NEW.is_correct AND NOT NEW.is_partially_correct THEN 1 ELSE 0 END,
    NEW.time_spent_seconds,
    NEW.score,
    NOW()
  )
  ON CONFLICT (question_id) DO UPDATE
  SET
    total_attempts = question_statistics.total_attempts + 1,
    correct_attempts = question_statistics.correct_attempts + 
      CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    partial_attempts = question_statistics.partial_attempts +
      CASE WHEN NEW.is_partially_correct THEN 1 ELSE 0 END,
    incorrect_attempts = question_statistics.incorrect_attempts +
      CASE WHEN NOT NEW.is_correct AND NOT NEW.is_partially_correct THEN 1 ELSE 0 END,
    avg_time_seconds = (
      (question_statistics.avg_time_seconds * question_statistics.total_attempts + NEW.time_spent_seconds) / 
      (question_statistics.total_attempts + 1)
    ),
    avg_score = (
      (question_statistics.avg_score * question_statistics.total_attempts + NEW.score) /
      (question_statistics.total_attempts + 1)
    ),
    last_attempt_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update statistics
CREATE TRIGGER update_question_stats
  AFTER INSERT OR UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_question_statistics();

-- Add column comments
COMMENT ON TABLE question_statistics IS 'Stores aggregate statistics for each question including peer performance metrics';
COMMENT ON COLUMN question_statistics.id IS 'Unique identifier for the statistics record';
COMMENT ON COLUMN question_statistics.question_id IS 'Reference to the question';
COMMENT ON COLUMN question_statistics.total_attempts IS 'Total number of attempts across all users';
COMMENT ON COLUMN question_statistics.correct_attempts IS 'Number of fully correct attempts';
COMMENT ON COLUMN question_statistics.partial_attempts IS 'Number of partially correct attempts';
COMMENT ON COLUMN question_statistics.incorrect_attempts IS 'Number of incorrect attempts';
COMMENT ON COLUMN question_statistics.avg_time_seconds IS 'Average time spent on this question';
COMMENT ON COLUMN question_statistics.avg_score IS 'Average score achieved on this question';
COMMENT ON COLUMN question_statistics.last_attempt_at IS 'Timestamp of the most recent attempt';
COMMENT ON COLUMN question_statistics.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN question_statistics.updated_at IS 'Timestamp when the record was last updated';