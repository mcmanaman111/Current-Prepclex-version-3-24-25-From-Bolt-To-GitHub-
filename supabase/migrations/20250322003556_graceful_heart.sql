/*
  # Add skipped questions and test results tables

  1. New Tables
    - `skipped_questions`: Tracks questions explicitly skipped during tests
      - Enables reuse of skipped questions in future tests
      - Tracks status of skipped questions (pending, attempted, archived)
      
    - `test_results`: Comprehensive test results for efficient querying
      - Pre-aggregates commonly needed data
      - Reduces join complexity
      - Improves performance for results display
      
  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Maintain data integrity through constraints

  3. Performance
    - Add appropriate indexes
    - Optimize for common query patterns
*/

-- Create skipped_questions table
CREATE TABLE skipped_questions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  skipped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(50) CHECK (status IN ('pending', 'attempted', 'archived')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create test_results table
CREATE TABLE test_results (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  question_order INTEGER NOT NULL,
  is_correct BOOLEAN,
  is_partially_correct BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT FALSE,
  is_marked BOOLEAN DEFAULT FALSE,
  has_notes BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER,
  score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for efficient querying
CREATE INDEX idx_skipped_questions_user_id ON skipped_questions(user_id);
CREATE INDEX idx_skipped_questions_question_id ON skipped_questions(question_id);
CREATE INDEX idx_skipped_questions_test_id ON skipped_questions(test_id);

CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_question_id ON test_results(question_id);

-- Enable RLS
ALTER TABLE skipped_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own skipped questions"
  ON skipped_questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own test results"
  ON test_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add table and column comments
COMMENT ON TABLE skipped_questions IS 'Tracks questions explicitly skipped during test sessions for potential reuse';
COMMENT ON COLUMN skipped_questions.id IS 'Unique identifier for the skipped question record';
COMMENT ON COLUMN skipped_questions.user_id IS 'Reference to the user who skipped the question';
COMMENT ON COLUMN skipped_questions.question_id IS 'Reference to the skipped question';
COMMENT ON COLUMN skipped_questions.test_id IS 'Reference to the test where the question was skipped';
COMMENT ON COLUMN skipped_questions.skipped_at IS 'Timestamp when the question was skipped';
COMMENT ON COLUMN skipped_questions.status IS 'Current status of the skipped question (pending, attempted, archived)';
COMMENT ON COLUMN skipped_questions.created_at IS 'Timestamp when the record was created';

COMMENT ON TABLE test_results IS 'Stores comprehensive test results for efficient querying and display';
COMMENT ON COLUMN test_results.id IS 'Unique identifier for the test result record';
COMMENT ON COLUMN test_results.test_id IS 'Reference to the test session';
COMMENT ON COLUMN test_results.user_id IS 'Reference to the user who took the test';
COMMENT ON COLUMN test_results.question_id IS 'Reference to the question';
COMMENT ON COLUMN test_results.question_order IS 'Order of the question in the test';
COMMENT ON COLUMN test_results.is_correct IS 'Indicates if the answer was fully correct';
COMMENT ON COLUMN test_results.is_partially_correct IS 'Indicates if the answer was partially correct';
COMMENT ON COLUMN test_results.is_skipped IS 'Indicates if the question was explicitly skipped';
COMMENT ON COLUMN test_results.is_marked IS 'Indicates if the question was marked for review';
COMMENT ON COLUMN test_results.has_notes IS 'Indicates if there are notes associated with this question';
COMMENT ON COLUMN test_results.time_spent_seconds IS 'Time spent on this question in seconds';
COMMENT ON COLUMN test_results.score IS 'Score achieved for this question (0-100)';
COMMENT ON COLUMN test_results.created_at IS 'Timestamp when the result was recorded';