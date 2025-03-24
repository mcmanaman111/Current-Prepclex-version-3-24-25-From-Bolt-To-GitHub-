/*
  # Add Home Dashboard Enhancements

  1. New Columns
    - Add exam_date to user_progress
    - Add streak tracking columns
    - Add test mode and template columns to tests

  2. Changes
    - Add new indexes for dashboard queries
    - Add streak maintenance trigger
    - Add readiness calculation function

  3. Security
    - Maintain RLS policies
    - Add appropriate function security
*/

-- Add exam date and streak tracking columns
ALTER TABLE user_progress
ADD COLUMN exam_date DATE,
ADD COLUMN longest_streak_days INTEGER DEFAULT 0,
ADD COLUMN streak_start_date DATE,
ADD COLUMN last_study_date DATE;

-- Add test mode columns
ALTER TABLE tests
ADD COLUMN test_mode VARCHAR(50) CHECK (test_mode IN ('practice', 'simulation', 'review', 'custom')),
ADD COLUMN test_template_id INTEGER,
ADD COLUMN completion_status VARCHAR(50) DEFAULT 'in_progress';

-- Create function to calculate user readiness
CREATE OR REPLACE FUNCTION calculate_user_readiness(user_uuid UUID)
RETURNS TABLE (
  readiness_score NUMERIC,
  readiness_level TEXT,
  weak_areas JSONB,
  strong_areas JSONB,
  recommended_topics JSONB
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  total_topics INTEGER;
  mastered_topics INTEGER;
  recent_test_avg NUMERIC;
  study_consistency NUMERIC;
BEGIN
  -- Get total number of topics
  SELECT COUNT(*) INTO total_topics FROM topics;
  
  -- Get number of mastered topics
  SELECT COUNT(*) INTO mastered_topics
  FROM user_topic_mastery
  WHERE user_id = user_uuid AND mastery_level = 'mastered';
  
  -- Get recent test average
  SELECT AVG(overall_score) INTO recent_test_avg
  FROM test_statistics
  WHERE user_id = user_uuid
  AND created_at >= NOW() - INTERVAL '30 days';
  
  -- Calculate study consistency (0-100)
  SELECT 
    CASE 
      WHEN current_streak_days >= 30 THEN 100
      ELSE (current_streak_days::numeric / 30) * 100
    END INTO study_consistency
  FROM user_progress
  WHERE user_id = user_uuid;

  RETURN QUERY
  WITH topic_stats AS (
    SELECT 
      t.id as topic_id,
      t.name as topic_name,
      COALESCE(AVG(tp.score_percentage), 0) as avg_score,
      COUNT(DISTINCT tp.test_id) as attempts,
      utm.mastery_level
    FROM topics t
    LEFT JOIN topic_performance tp ON tp.topic_id = t.id AND tp.user_id = user_uuid
    LEFT JOIN user_topic_mastery utm ON utm.topic_id = t.id AND utm.user_id = user_uuid
    GROUP BY t.id, t.name, utm.mastery_level
  )
  SELECT
    -- Calculate readiness score (0-100)
    ROUND(
      (COALESCE(recent_test_avg, 0) * 0.4) +
      ((mastered_topics::numeric / NULLIF(total_topics, 0)) * 100 * 0.3) +
      (COALESCE(study_consistency, 0) * 0.3)
    , 2),
    
    -- Determine readiness level
    CASE
      WHEN recent_test_avg >= 80 AND (mastered_topics::numeric / total_topics) >= 0.8 
        AND study_consistency >= 80 THEN 'High Readiness'
      WHEN recent_test_avg >= 70 AND (mastered_topics::numeric / total_topics) >= 0.6 
        AND study_consistency >= 60 THEN 'Moderate Readiness'
      ELSE 'Additional Preparation Needed'
    END,
    
    -- Identify weak areas
    (
      SELECT jsonb_agg(jsonb_build_object(
        'topic', topic_name,
        'score', avg_score,
        'attempts', attempts
      ))
      FROM topic_stats
      WHERE avg_score < 70
      ORDER BY avg_score
      LIMIT 5
    ),
    
    -- Identify strong areas
    (
      SELECT jsonb_agg(jsonb_build_object(
        'topic', topic_name,
        'score', avg_score,
        'mastery_level', mastery_level
      ))
      FROM topic_stats
      WHERE avg_score >= 80
      ORDER BY avg_score DESC
      LIMIT 5
    ),
    
    -- Generate topic recommendations
    (
      SELECT jsonb_agg(jsonb_build_object(
        'topic', topic_name,
        'current_score', avg_score,
        'priority', 
        CASE
          WHEN avg_score < 60 THEN 'High'
          WHEN avg_score < 75 THEN 'Medium'
          ELSE 'Low'
        END
      ))
      FROM topic_stats
      WHERE avg_score < 80
      ORDER BY avg_score
      LIMIT 5
    );
END;
$$;

-- Create function to maintain study streak
CREATE OR REPLACE FUNCTION update_study_streak()
RETURNS trigger AS $$
DECLARE
  last_activity DATE;
  current_streak INTEGER;
  streak_start DATE;
BEGIN
  -- Get current streak info
  SELECT 
    up.last_study_date,
    up.current_streak_days,
    up.streak_start_date
  INTO 
    last_activity,
    current_streak,
    streak_start
  FROM user_progress up
  WHERE up.user_id = NEW.user_id;

  -- Calculate new streak
  IF last_activity IS NULL OR last_activity < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken, start new streak
    UPDATE user_progress
    SET 
      current_streak_days = 1,
      streak_start_date = CURRENT_DATE,
      last_study_date = CURRENT_DATE,
      longest_streak_days = GREATEST(longest_streak_days, current_streak_days)
    WHERE user_id = NEW.user_id;
  ELSE
    -- Continue streak
    UPDATE user_progress
    SET 
      current_streak_days = current_streak_days + 1,
      last_study_date = CURRENT_DATE,
      longest_streak_days = GREATEST(longest_streak_days, current_streak_days + 1)
    WHERE user_id = NEW.user_id
    AND last_study_date < CURRENT_DATE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for streak maintenance
CREATE TRIGGER maintain_study_streak
  AFTER INSERT OR UPDATE ON test_statistics
  FOR EACH ROW
  EXECUTE FUNCTION update_study_streak();

-- Add indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_test_statistics_date_score 
  ON test_statistics (created_at, overall_score);

CREATE INDEX IF NOT EXISTS idx_user_progress_streak 
  ON user_progress (user_id, current_streak_days);

CREATE INDEX IF NOT EXISTS idx_topic_performance_recent 
  ON topic_performance (user_id, created_at DESC);

-- Add column comments
COMMENT ON COLUMN user_progress.exam_date IS 'Scheduled NCLEX exam date';
COMMENT ON COLUMN user_progress.longest_streak_days IS 'Longest study streak achieved in days';
COMMENT ON COLUMN user_progress.streak_start_date IS 'Date when the current streak started';
COMMENT ON COLUMN user_progress.last_study_date IS 'Date of last study activity';

COMMENT ON COLUMN tests.test_mode IS 'Mode of the test (practice, simulation, review, custom)';
COMMENT ON COLUMN tests.test_template_id IS 'Reference to a test template if using a pre-defined format';
COMMENT ON COLUMN tests.completion_status IS 'Current completion status of the test';

-- Add function comments
COMMENT ON FUNCTION calculate_user_readiness IS 'Calculates comprehensive NCLEX readiness metrics for a user';
COMMENT ON FUNCTION update_study_streak IS 'Maintains the user study streak based on activity';