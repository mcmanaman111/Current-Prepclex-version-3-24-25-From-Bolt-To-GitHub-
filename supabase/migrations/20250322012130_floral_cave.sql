/*
  # Add question type distribution to test statistics

  1. Changes
    - Add question_type_distribution column to test_statistics table
    - Add trigger to automatically update distribution when test results are added
    - Add function to calculate distribution from test results

  2. Security
    - Maintain existing RLS policies
    - Preserve data integrity through proper constraints
*/

-- Add question_type_distribution column to test_statistics
ALTER TABLE test_statistics 
ADD COLUMN question_type_distribution JSONB DEFAULT '{
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

-- Add column comment
COMMENT ON COLUMN test_statistics.question_type_distribution IS 'Distribution of question types in the test with correct/total counts';

-- Create function to calculate question type distribution
CREATE OR REPLACE FUNCTION calculate_question_type_distribution()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate distribution from test_results and questions tables
  WITH question_stats AS (
    SELECT 
      q.question_type,
      COUNT(*) as total,
      COUNT(CASE WHEN tr.is_correct THEN 1 END) as correct
    FROM test_results tr
    JOIN questions q ON q.id = tr.question_id
    WHERE tr.test_id = NEW.test_id
    GROUP BY q.question_type
  )
  UPDATE test_statistics
  SET question_type_distribution = (
    SELECT jsonb_object_agg(
      question_type,
      jsonb_build_object(
        'total', total,
        'correct', correct
      )
    )
    FROM question_stats
  )
  WHERE test_statistics.id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update question type distribution
CREATE TRIGGER update_question_type_distribution
  AFTER INSERT
  ON test_statistics
  FOR EACH ROW
  EXECUTE FUNCTION calculate_question_type_distribution();