/*
  # Add Overall Performance View

  1. New View
    - `overall_performance_view`: Combines data from multiple tables for efficient querying
    - Uses security definer function to enforce row-level security
    
  2. Changes
    - Create secure view through a function
    - Add performance indexes
    - Add user progress refresh trigger
*/

-- Create indexes to improve view performance
CREATE INDEX IF NOT EXISTS idx_topic_performance_created_at ON topic_performance(created_at);
CREATE INDEX IF NOT EXISTS idx_test_statistics_created_at ON test_statistics(created_at);

-- Create function to get user performance
CREATE OR REPLACE FUNCTION get_user_performance(user_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  total_tests_taken INTEGER,
  total_questions_completed INTEGER,
  total_study_time_minutes INTEGER,
  current_streak_days INTEGER,
  overall_average_score NUMERIC,
  last_activity_date DATE,
  topics_attempted BIGINT,
  avg_topic_score NUMERIC,
  mastered_topics BIGINT,
  overall_accuracy NUMERIC,
  total_ngn_questions BIGINT,
  total_topics_with_mastery BIGINT,
  mastered_topics_count BIGINT,
  proficient_topics_count BIGINT,
  mastery_percentage NUMERIC,
  recent_test_avg NUMERIC,
  recent_tests_count BIGINT,
  readiness_level TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user has permission to view this data
  IF user_uuid != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role_id = 1
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH topic_stats AS (
    SELECT 
      tp.user_id,
      COUNT(DISTINCT tp.topic_id) as topics_attempted,
      AVG(tp.score_percentage) as avg_topic_score,
      COUNT(DISTINCT CASE WHEN tp.score_percentage >= 80 THEN tp.topic_id END) as mastered_topics,
      SUM(tp.total_questions) as total_topic_questions,
      SUM(tp.correct_answers) as total_topic_correct,
      SUM(tp.incorrect_answers) as total_topic_incorrect,
      SUM(tp.ngn_questions) as total_ngn_questions
    FROM topic_performance tp
    WHERE tp.user_id = user_uuid
    GROUP BY tp.user_id
  ),
  mastery_stats AS (
    SELECT 
      utm.user_id,
      COUNT(DISTINCT utm.topic_id) as total_topics_with_mastery,
      COUNT(DISTINCT CASE 
        WHEN utm.mastery_level = 'mastered' THEN utm.topic_id 
      END) as mastered_topics_count,
      COUNT(DISTINCT CASE 
        WHEN utm.mastery_level = 'proficient' THEN utm.topic_id 
      END) as proficient_topics_count
    FROM user_topic_mastery utm
    WHERE utm.user_id = user_uuid
    GROUP BY utm.user_id
  ),
  test_trends AS (
    SELECT 
      ts.user_id,
      AVG(ts.overall_score) as recent_test_avg,
      COUNT(*) as recent_tests_count
    FROM test_statistics ts
    WHERE ts.user_id = user_uuid
    AND ts.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY ts.user_id
  )
  SELECT 
    up.user_id,
    up.total_tests_taken,
    up.total_questions_completed,
    up.total_study_time_minutes,
    up.current_streak_days,
    up.average_score as overall_average_score,
    up.last_activity_date,
    
    -- Topic performance metrics
    ts.topics_attempted,
    ts.avg_topic_score,
    ts.mastered_topics,
    ROUND((ts.total_topic_correct::numeric / NULLIF(ts.total_topic_questions, 0) * 100), 2) as overall_accuracy,
    ts.total_ngn_questions,
    
    -- Mastery metrics
    ms.total_topics_with_mastery,
    ms.mastered_topics_count,
    ms.proficient_topics_count,
    ROUND((ms.mastered_topics_count::numeric / NULLIF(ms.total_topics_with_mastery, 0) * 100), 2) as mastery_percentage,
    
    -- Recent performance trends
    tt.recent_test_avg,
    tt.recent_tests_count,
    
    -- Calculated fields
    CASE 
      WHEN ts.avg_topic_score >= 80 AND ms.mastered_topics_count >= 5 THEN 'High'
      WHEN ts.avg_topic_score >= 70 AND ms.mastered_topics_count >= 3 THEN 'Moderate'
      ELSE 'Needs Improvement'
    END as readiness_level,
    
    -- Timestamps
    up.created_at,
    up.updated_at
  FROM user_progress up
  LEFT JOIN topic_stats ts ON up.user_id = ts.user_id
  LEFT JOIN mastery_stats ms ON up.user_id = ms.user_id
  LEFT JOIN test_trends tt ON up.user_id = tt.user_id
  WHERE up.user_id = user_uuid;
END;
$$;

-- Create function to refresh user progress
CREATE OR REPLACE FUNCTION refresh_user_progress()
RETURNS trigger AS $$
BEGIN
  -- Update user_progress when test_statistics are updated
  WITH new_stats AS (
    SELECT 
      user_id,
      COUNT(*) as total_tests,
      SUM(total_questions) as total_questions,
      AVG(overall_score) as avg_score
    FROM test_statistics
    WHERE user_id = NEW.user_id
    GROUP BY user_id
  )
  UPDATE user_progress up
  SET 
    total_tests_taken = ns.total_tests,
    total_questions_completed = ns.total_questions,
    average_score = ns.avg_score,
    updated_at = NOW()
  FROM new_stats ns
  WHERE up.user_id = ns.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep user_progress updated
DROP TRIGGER IF EXISTS update_user_progress_stats ON test_statistics;
CREATE TRIGGER update_user_progress_stats
  AFTER INSERT OR UPDATE ON test_statistics
  FOR EACH ROW
  EXECUTE FUNCTION refresh_user_progress();

-- Add comments
COMMENT ON FUNCTION get_user_performance IS 'Secure function to retrieve comprehensive performance metrics for a user';
COMMENT ON FUNCTION refresh_user_progress IS 'Automatically updates user progress when test statistics change';