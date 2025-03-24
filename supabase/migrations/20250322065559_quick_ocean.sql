/*
  # Add Answer Statistics Tracking

  1. New Table
    - `answer_statistics`: Tracks per-answer metrics including selection counts and percentages
      - Links to questions and answers tables
      - Maintains selection history
      - Calculates peer selection percentages

  2. Changes
    - Add trigger to update statistics on test results
    - Add indexes for efficient querying
    - Enable RLS with appropriate policies

  3. Security
    - Read-only access for authenticated users
    - Automatic updates through triggers
*/

-- Create answer_statistics table
CREATE TABLE answer_statistics (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_id INTEGER REFERENCES answers(id) ON DELETE CASCADE,
  option_number INTEGER NOT NULL,
  times_selected INTEGER DEFAULT 0,
  selection_percentage NUMERIC(5,2) DEFAULT 0,
  last_selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, option_number)
);

-- Add indexes
CREATE INDEX idx_answer_statistics_question ON answer_statistics(question_id);
CREATE INDEX idx_answer_statistics_answer ON answer_statistics(answer_id);
CREATE INDEX idx_answer_statistics_selection ON answer_statistics(selection_percentage DESC);

-- Enable RLS
ALTER TABLE answer_statistics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Answer statistics are viewable by all authenticated users"
  ON answer_statistics
  FOR SELECT
  TO authenticated
  USING (true);

-- Create function to update answer statistics
CREATE OR REPLACE FUNCTION update_answer_statistics()
RETURNS trigger AS $$
DECLARE
  total_attempts INTEGER;
  answer_option INTEGER;
BEGIN
  -- Get total attempts for this question
  SELECT total_attempts INTO total_attempts
  FROM question_statistics
  WHERE question_id = NEW.question_id;

  -- If no attempts recorded yet, set to 1
  IF total_attempts IS NULL THEN
    total_attempts := 1;
  END IF;

  -- Initialize statistics for all options if they don't exist
  INSERT INTO answer_statistics (
    question_id,
    answer_id,
    option_number,
    times_selected,
    selection_percentage,
    last_selected_at
  )
  SELECT
    NEW.question_id,
    a.id,
    a.option_number,
    0,
    0,
    NULL
  FROM answers a
  WHERE a.question_id = NEW.question_id
  ON CONFLICT (question_id, option_number) DO NOTHING;

  -- Update selected answers
  IF NEW.selected_answers IS NOT NULL THEN
    FOR answer_option IN (
      SELECT unnest(NEW.selected_answers)
    )
    LOOP
      UPDATE answer_statistics
      SET
        times_selected = times_selected + 1,
        selection_percentage = ((times_selected + 1)::numeric / total_attempts * 100),
        last_selected_at = NOW(),
        updated_at = NOW()
      WHERE question_id = NEW.question_id
      AND option_number = answer_option;
    END LOOP;
  END IF;

  -- Recalculate percentages for all options
  UPDATE answer_statistics
  SET selection_percentage = (times_selected::numeric / total_attempts * 100)
  WHERE question_id = NEW.question_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update answer statistics
CREATE TRIGGER update_answer_stats
  AFTER INSERT OR UPDATE ON test_results
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_statistics();

-- Add column comments
COMMENT ON TABLE answer_statistics IS 'Tracks statistics for individual answer options including peer selection patterns';
COMMENT ON COLUMN answer_statistics.id IS 'Unique identifier for the answer statistics record';
COMMENT ON COLUMN answer_statistics.question_id IS 'Reference to the question';
COMMENT ON COLUMN answer_statistics.answer_id IS 'Reference to the specific answer option';
COMMENT ON COLUMN answer_statistics.option_number IS 'Order number of the answer option';
COMMENT ON COLUMN answer_statistics.times_selected IS 'Number of times this option was selected';
COMMENT ON COLUMN answer_statistics.selection_percentage IS 'Percentage of users who selected this option';
COMMENT ON COLUMN answer_statistics.last_selected_at IS 'Timestamp of most recent selection';
COMMENT ON COLUMN answer_statistics.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN answer_statistics.updated_at IS 'Timestamp when the record was last updated';