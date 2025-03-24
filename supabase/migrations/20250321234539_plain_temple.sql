/*
  # Add marked questions tracking

  1. New Table
    - `marked_questions`
      - `id` (serial, primary key)
      - `user_id` (uuid, references public.users)
      - `question_id` (integer, references questions)
      - `test_id` (integer, references tests)
      - `marked_at` (timestamptz)
      - `notes` (text): Optional notes about why the question was marked
      - `status` (varchar): Current status of the marked question
      - `created_at` (timestamptz)

  2. Changes
    - Add index for efficient querying
    - Enable RLS
    - Add appropriate policies

  3. Security
    - Users can only access their own marked questions
    - Proper foreign key constraints
*/

-- Create marked_questions table
CREATE TABLE marked_questions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'reviewed', 'archived')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX idx_marked_questions_user_id ON marked_questions(user_id);
CREATE INDEX idx_marked_questions_question_id ON marked_questions(question_id);
CREATE INDEX idx_marked_questions_test_id ON marked_questions(test_id);

-- Enable RLS
ALTER TABLE marked_questions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own marked questions"
  ON marked_questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add table and column comments
COMMENT ON TABLE marked_questions IS 'Tracks questions marked for review during test sessions';
COMMENT ON COLUMN marked_questions.id IS 'Unique identifier for the marked question record';
COMMENT ON COLUMN marked_questions.user_id IS 'Reference to the user who marked the question';
COMMENT ON COLUMN marked_questions.question_id IS 'Reference to the marked question';
COMMENT ON COLUMN marked_questions.test_id IS 'Reference to the test where the question was marked';
COMMENT ON COLUMN marked_questions.marked_at IS 'Timestamp when the question was marked';
COMMENT ON COLUMN marked_questions.notes IS 'Optional notes about why the question was marked';
COMMENT ON COLUMN marked_questions.status IS 'Current status of the marked question (pending, reviewed, archived)';
COMMENT ON COLUMN marked_questions.created_at IS 'Timestamp when the record was created';