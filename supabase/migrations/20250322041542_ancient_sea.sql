/*
  # Add Test History Views and Optimizations

  1. New Views
    - test_history_mv: Materialized view for test history
    - test_summary_stats_view: Pre-calculated test summary statistics
    
  2. Performance
    - Optimized indexes
    - Efficient aggregations
    - Proper data grouping
*/

-- Create materialized view for test history
CREATE MATERIALIZED VIEW test_history_mv AS
SELECT 
  t.id as test_id,
  t.user_id,
  t.created_at as date,
  t.test_type as type,
  t.total_questions as questions,
  t.total_time_seconds / 60 as time_minutes,
  ts.overall_score as score,
  ts.correct_answers,
  ts.partially_correct,
  ts.incorrect_answers,
  ts.question_type_distribution,
  COUNT(DISTINCT tp.topic_id) as topics_covered,
  jsonb_object_agg(
    tp.topic_id,
    jsonb_build_object(
      'score', tp.score_percentage,
      'correct', tp.correct_answers,
      'total', tp.total_questions
    )
  ) as topic_breakdown,
  COUNT(DISTINCT CASE WHEN q.ngn THEN tr.question_id END) as ngn_questions,
  COUNT(DISTINCT CASE WHEN tr.is_marked THEN tr.question_id END) as marked_questions,
  COUNT(DISTINCT CASE WHEN tr.has_notes THEN tr.question_id END) as questions_with_notes
FROM tests t
JOIN test_statistics ts ON ts.test_id = t.id
JOIN test_results tr ON tr.test_id = t.id
JOIN questions q ON q.id = tr.question_id
LEFT JOIN topic_performance tp ON tp.test_id = t.id
GROUP BY 
  t.id,
  t.user_id,
  t.created_at,
  t.test_type,
  t.total_questions,
  t.total_time_seconds,
  ts.overall_score,
  ts.correct_answers,
  ts.partially_correct,
  ts.incorrect_answers,
  ts.question_type_distribution;

-- Create indexes on materialized view
CREATE INDEX idx_test_history_mv_user_date ON test_history_mv (user_id, date DESC);
CREATE INDEX idx_test_history_mv_score ON test_history_mv (user_id, score DESC);
CREATE INDEX idx_test_history_mv_type ON test_history_mv (user_id, type);

-- Create view for test summary statistics
CREATE VIEW test_summary_stats_view AS
WITH monthly_aggregates AS (
  SELECT 
    user_id,
    EXTRACT(MONTH FROM date) as month,
    COUNT(*) as test_count,
    AVG(score) as month_avg_score
  FROM test_history_mv
  GROUP BY user_id, EXTRACT(MONTH FROM date)
),
user_stats AS (
  SELECT 
    user_id,
    COUNT(*) as total_tests,
    AVG(score) as average_score,
    AVG(time_minutes) as average_time,
    SUM(questions) as total_questions_completed,
    SUM(ngn_questions) as total_ngn_completed,
    MAX(date) as last_test_date,
    jsonb_object_agg(
      ma.month::text,
      jsonb_build_object(
        'tests', ma.test_count,
        'avg_score', ROUND(ma.month_avg_score::numeric, 2)
      )
    ) as monthly_stats
  FROM test_history_mv th
  LEFT JOIN monthly_aggregates ma USING (user_id)
  GROUP BY th.user_id
),
recent_tests AS (
  SELECT 
    user_id,
    jsonb_agg(
      jsonb_build_object(
        'date', date,
        'score', score,
        'type', type
      )
      ORDER BY date DESC
    ) FILTER (WHERE date >= NOW() - INTERVAL '30 days') as recent_test_data
  FROM test_history_mv
  GROUP BY user_id
)
SELECT 
  us.*,
  ROUND(
    (SELECT AVG(score) 
     FROM test_history_mv th 
     WHERE th.user_id = us.user_id 
     AND th.date >= NOW() - INTERVAL '30 days'
    ), 2
  ) as recent_average,
  COALESCE(rt.recent_test_data, '[]'::jsonb) as recent_tests
FROM user_stats us
LEFT JOIN recent_tests rt ON rt.user_id = us.user_id;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_test_history_mv()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY test_history_mv;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh materialized view
CREATE TRIGGER refresh_test_history_after_test
  AFTER INSERT OR UPDATE OR DELETE ON tests
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_test_history_mv();

CREATE TRIGGER refresh_test_history_after_stats
  AFTER INSERT OR UPDATE OR DELETE ON test_statistics
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_test_history_mv();

-- Add comments
COMMENT ON MATERIALIZED VIEW test_history_mv IS 'Optimized view of test history with pre-calculated metrics';
COMMENT ON VIEW test_summary_stats_view IS 'User test summary statistics with recent performance trends';
COMMENT ON FUNCTION refresh_test_history_mv IS 'Refreshes test history materialized view when test data changes';