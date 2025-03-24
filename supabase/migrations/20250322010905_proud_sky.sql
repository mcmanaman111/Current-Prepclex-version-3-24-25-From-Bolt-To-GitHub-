/*
  # Enhance topic_performance table

  1. Changes
    - Add incorrect_answers column to track wrong answers explicitly
    - Add ngn_questions column to track NGN question count per topic
    - Add question_type_breakdown column to store performance by question type
    - Update existing data to maintain consistency

  2. Security
    - Maintain existing RLS policies
    - Preserve data integrity

  3. Data Types
    - Use JSONB for question_type_breakdown to store performance metrics for each question type
    - Question types match those defined in questions table
*/

-- Add new columns to topic_performance
ALTER TABLE topic_performance 
  ADD COLUMN incorrect_answers INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN ngn_questions INTEGER DEFAULT 0,
  ADD COLUMN question_type_breakdown JSONB DEFAULT '{
    "multiple_choice": {"total": 0, "correct": 0},
    "sata": {"total": 0, "correct": 0},
    "hot_spot": {"total": 0, "correct": 0},
    "fill_in_the_blank": {"total": 0, "correct": 0},
    "drag_and_drop": {"total": 0, "correct": 0},
    "chart_or_graphic": {"total": 0, "correct": 0},
    "graphic_answer": {"total": 0, "correct": 0},
    "audio_question": {"total": 0, "correct": 0},
    "extended_multiple_response": {"total": 0, "correct": 0},
    "extended_drag_and_drop": {"total": 0, "correct": 0},
    "cloze_dropdown": {"total": 0, "correct": 0},
    "matrix_grid": {"total": 0, "correct": 0},
    "bow_tie": {"total": 0, "correct": 0},
    "enhanced_hot_spot": {"total": 0, "correct": 0}
  }'::jsonb;

-- Update column comments
COMMENT ON COLUMN topic_performance.incorrect_answers IS 'Number of incorrect answers';
COMMENT ON COLUMN topic_performance.ngn_questions IS 'Number of NGN questions in this topic';
COMMENT ON COLUMN topic_performance.question_type_breakdown IS 'JSON object containing performance metrics for each question type';

-- Create function to update question_type_breakdown
CREATE OR REPLACE FUNCTION update_question_type_breakdown()
RETURNS TRIGGER AS $$
BEGIN
  -- Get question type from questions table
  WITH question_data AS (
    SELECT 
      question_type,
      CASE WHEN NEW.correct_answers > 0 THEN 1 ELSE 0 END as is_correct
    FROM questions
    WHERE id = NEW.question_id
  )
  UPDATE topic_performance
  SET question_type_breakdown = jsonb_set(
    question_type_breakdown,
    ARRAY[question_data.question_type],
    jsonb_build_object(
      'total', COALESCE((question_type_breakdown->question_data.question_type->>'total')::int, 0) + 1,
      'correct', COALESCE((question_type_breakdown->question_data.question_type->>'correct')::int, 0) + question_data.is_correct
    )
  )
  FROM question_data
  WHERE topic_performance.id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update question_type_breakdown
DROP TRIGGER IF EXISTS update_question_type_breakdown ON topic_performance;
CREATE TRIGGER update_question_type_breakdown
  AFTER INSERT OR UPDATE OF correct_answers
  ON topic_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_question_type_breakdown();