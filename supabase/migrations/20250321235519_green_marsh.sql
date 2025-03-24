/*
  # Add notes table for question annotations

  1. New Table
    - `notes`
      - `id` (serial, primary key)
      - `user_id` (uuid, references public.users)
      - `content` (text): The note content
      - `question_id` (integer, references questions)
      - `test_id` (text): Test identifier
      - `topic` (text): Topic name for categorization
      - `sub_topic` (text): Sub-topic name for categorization
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for user access
    - Add appropriate indexes

  3. Features
    - Links notes to specific questions and tests
    - Tracks topic categorization
    - Allows for easy filtering and organization
*/

-- Create notes table
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  question_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  sub_topic TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_question_id ON notes(question_id);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add table and column comments
COMMENT ON TABLE notes IS 'Stores user notes for questions during test sessions';
COMMENT ON COLUMN notes.id IS 'Unique identifier for the note';
COMMENT ON COLUMN notes.user_id IS 'Reference to the user who created the note';
COMMENT ON COLUMN notes.content IS 'The note content';
COMMENT ON COLUMN notes.question_id IS 'Reference to the question';
COMMENT ON COLUMN notes.test_id IS 'Reference to the test session';
COMMENT ON COLUMN notes.topic IS 'Topic name for categorization';
COMMENT ON COLUMN notes.sub_topic IS 'Sub-topic name for categorization';
COMMENT ON COLUMN notes.created_at IS 'Timestamp when the note was created';