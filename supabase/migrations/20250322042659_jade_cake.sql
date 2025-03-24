/*
  # Add Performance Columns and Unique Index

  1. New Columns
    - Add test_duration_minutes to tests table
    - Add total_marked_questions and total_notes to test_statistics
    - Add performance_trend to user_progress
    
  2. Indexes
    - Add unique index on test_history_mv for concurrent refresh
    - Add composite indexes for common query patterns
*/

-- Add new columns to tests table
ALTER TABLE tests
ADD COLUMN test_duration_minutes INTEGER GENERATED ALWAYS AS (total_time_seconds / 60) STORED;

-- Add new columns to test_statistics table
ALTER TABLE test_statistics
ADD COLUMN total_marked_questions INTEGER DEFAULT 0,
ADD COLUMN total_notes INTEGER DEFAULT 0;

-- Add performance trend column to user_progress
ALTER TABLE user_progress
ADD COLUMN performance_trend JSONB DEFAULT jsonb_build_object(
  'last_7_days', jsonb_build_object('avg_score', 0, 'tests_taken', 0),
  'last_30_days', jsonb_build_object('avg_score', 0, 'tests_taken', 0),
  'trend_direction', 'stable'
);

-- Create unique index on test_history_mv for concurrent refresh
CREATE UNIQUE INDEX idx_test_history_mv_unique ON test_history_mv (test_id);

-- Create composite indexes for common query patterns
CREATE INDEX idx_test_results_user_date ON test_results (user_id, created_at DESC);
CREATE INDEX idx_test_results_user_score ON test_results (user_id, score DESC);
CREATE INDEX idx_topic_performance_user_score ON topic_performance (user_id, score_percentage DESC);
CREATE INDEX idx_user_topic_mastery_level ON user_topic_mastery (user_id, mastery_level);

-- Create function to update performance trend
CREATE OR REPLACE FUNCTION update_performance_trend()
RETURNS trigger AS $$
DECLARE
  last_7_avg NUMERIC;
  last_30_avg NUMERIC;
  last_7_count INTEGER;
  last_30_count INTEGER;
  trend_direction TEXT;
BEGIN
  -- Calculate 7-day metrics
  SELECT 
    AVG(overall_score),
    COUNT(*)
  INTO last_7_avg, last_7_count
  FROM test_statistics
  WHERE user_id = NEW.user_id
  AND created_at >= NOW() - INTERVAL '7 days';

  -- Calculate 30-day metrics
  SELECT 
    AVG(overall_score),
    COUNT(*)
  INTO last_30_avg, last_30_count
  FROM test_statistics
  WHERE user_id = NEW.user_id
  AND created_at >= NOW() - INTERVAL '30 days';

  -- Determine trend direction
  trend_direction := CASE
    WHEN last_7_avg > last_30_avg THEN 'improving'
    WHEN last_7_avg < last_30_avg THEN 'declining'
    ELSE 'stable'
  END;

  -- Update user_progress performance_trend
  UPDATE user_progress
  SET performance_trend = jsonb_build_object(
    'last_7_days', jsonb_build_object(
      'avg_score', ROUND(COALESCE(last_7_avg, 0), 2),
      'tests_taken', COALESCE(last_7_count, 0)
    ),
    'last_30_days', jsonb_build_object(
      'avg_score', ROUND(COALESCE(last_30_avg, 0), 2),
      'tests_taken', COALESCE(last_30_count, 0)
    ),
    'trend_direction', trend_direction
  )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update performance trend
CREATE TRIGGER update_performance_trend_trigger
  AFTER INSERT OR UPDATE ON test_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_performance_trend();

-- Update existing test_statistics with marked questions and notes counts
UPDATE test_statistics ts
SET 
  total_marked_questions = (
    SELECT COUNT(*)
    FROM test_results tr
    WHERE tr.test_id = ts.test_id
    AND tr.is_marked = true
  ),
  total_notes = (
    SELECT COUNT(*)
    FROM test_results tr
    WHERE tr.test_id = ts.test_id
    AND tr.has_notes = true
  );

-- Add column comments
COMMENT ON COLUMN tests.test_duration_minutes IS 'Test duration in minutes, automatically calculated';
COMMENT ON COLUMN test_statistics.total_marked_questions IS 'Total number of questions marked for review';
COMMENT ON COLUMN test_statistics.total_notes IS 'Total number of questions with notes';
COMMENT ON COLUMN user_progress.performance_trend IS 'JSON object containing recent performance trends and metrics';