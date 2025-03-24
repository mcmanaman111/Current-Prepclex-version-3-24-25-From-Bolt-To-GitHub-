/*
  # Add Performance Analysis Functions

  1. New Functions
    - get_test_results: Retrieves comprehensive test result data
    - get_test_performance: Analyzes performance across topics and question types
    - get_test_statistics: Provides detailed test statistics
    - get_question_performance: Analyzes question-level performance
    - get_learning_progress: Tracks learning progress over time

  2. Security
    - All functions are SECURITY DEFINER
    - Proper permission checks
    - Safe search path settings

  3. Features
    - Comprehensive data aggregation
    - Performance optimization through efficient joins
    - Detailed statistics and analysis
*/

-- Function to get comprehensive test results
CREATE OR REPLACE FUNCTION get_test_results(test_uuid INTEGER, user_uuid UUID)
RETURNS TABLE (
  question_id INTEGER,
  question_order INTEGER,
  question_text TEXT,
  question_type VARCHAR(255),
  topic VARCHAR(255),
  sub_topic VARCHAR(255),
  is_ngn BOOLEAN,
  difficulty VARCHAR(50),
  is_correct BOOLEAN,
  is_partially_correct BOOLEAN,
  score NUMERIC(5,2),
  time_spent_seconds INTEGER,
  is_marked BOOLEAN,
  has_notes BOOLEAN,
  notes TEXT[],
  explanation TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user has permission to view this test
  IF NOT EXISTS (
    SELECT 1 FROM tests 
    WHERE id = test_uuid 
    AND (user_id = user_uuid OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = 1
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    q.id as question_id,
    tr.question_order,
    q.question_text,
    q.question_type,
    q.topic,
    q.sub_topic,
    q.ngn as is_ngn,
    q.difficulty,
    tr.is_correct,
    tr.is_partially_correct,
    tr.score,
    tr.time_spent_seconds,
    tr.is_marked,
    tr.has_notes,
    ARRAY(
      SELECT n.content 
      FROM notes n 
      WHERE n.question_id = q.id::text 
      AND n.test_id = test_uuid::text
    ) as notes,
    q.explanation
  FROM test_results tr
  JOIN questions q ON q.id = tr.question_id
  WHERE tr.test_id = test_uuid
  ORDER BY tr.question_order;
END;
$$;

-- Function to get detailed test performance analysis
CREATE OR REPLACE FUNCTION get_test_performance(test_uuid INTEGER, user_uuid UUID)
RETURNS TABLE (
  topic_id INTEGER,
  topic_name VARCHAR(255),
  subtopic_id INTEGER,
  subtopic_name VARCHAR(255),
  total_questions INTEGER,
  correct_answers INTEGER,
  incorrect_answers INTEGER,
  score_percentage NUMERIC(5,2),
  ngn_questions INTEGER,
  question_type_stats JSONB,
  average_time_seconds NUMERIC(6,2),
  mastery_impact TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM tests 
    WHERE id = test_uuid 
    AND (user_id = user_uuid OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = 1
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    tp.topic_id,
    t.name as topic_name,
    tp.subtopic_id,
    st.name as subtopic_name,
    tp.total_questions,
    tp.correct_answers,
    tp.incorrect_answers,
    tp.score_percentage,
    tp.ngn_questions,
    tp.question_type_breakdown as question_type_stats,
    AVG(tr.time_spent_seconds) as average_time_seconds,
    CASE 
      WHEN tp.score_percentage >= 80 THEN 'Mastery Achieved'
      WHEN tp.score_percentage >= 70 THEN 'Approaching Mastery'
      ELSE 'Needs Review'
    END as mastery_impact
  FROM topic_performance tp
  JOIN topics t ON t.id = tp.topic_id
  LEFT JOIN subtopics st ON st.id = tp.subtopic_id
  LEFT JOIN test_results tr ON tr.test_id = tp.test_id
  WHERE tp.test_id = test_uuid
  GROUP BY 
    tp.topic_id, 
    t.name,
    tp.subtopic_id,
    st.name,
    tp.total_questions,
    tp.correct_answers,
    tp.incorrect_answers,
    tp.score_percentage,
    tp.ngn_questions,
    tp.question_type_breakdown;
END;
$$;

-- Function to get comprehensive test statistics
CREATE OR REPLACE FUNCTION get_test_statistics(test_uuid INTEGER, user_uuid UUID)
RETURNS TABLE (
  total_questions INTEGER,
  correct_answers INTEGER,
  partially_correct INTEGER,
  incorrect_answers INTEGER,
  overall_score NUMERIC(5,2),
  average_time_per_question NUMERIC(6,2),
  total_time_minutes INTEGER,
  ngn_questions_count INTEGER,
  ngn_success_rate NUMERIC(5,2),
  question_type_distribution JSONB,
  topic_coverage_percentage NUMERIC(5,2),
  mastery_impact_score NUMERIC(5,2)
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM tests 
    WHERE id = test_uuid 
    AND (user_id = user_uuid OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = 1
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    ts.total_questions,
    ts.correct_answers,
    ts.partially_correct,
    ts.incorrect_answers,
    ts.overall_score,
    ts.average_time_per_question,
    t.total_time_seconds / 60 as total_time_minutes,
    COUNT(CASE WHEN q.ngn THEN 1 END) as ngn_questions_count,
    ROUND(
      (COUNT(CASE WHEN q.ngn AND tr.is_correct THEN 1 END)::numeric / 
      NULLIF(COUNT(CASE WHEN q.ngn THEN 1 END), 0) * 100), 
      2
    ) as ngn_success_rate,
    ts.question_type_distribution,
    ROUND(
      (COUNT(DISTINCT tp.topic_id)::numeric / 
      (SELECT COUNT(*) FROM topics) * 100),
      2
    ) as topic_coverage_percentage,
    ROUND(
      (ts.overall_score * 0.7 + 
      (COUNT(CASE WHEN tp.score_percentage >= 80 THEN 1 END)::numeric / 
      NULLIF(COUNT(DISTINCT tp.topic_id), 0) * 100) * 0.3),
      2
    ) as mastery_impact_score
  FROM test_statistics ts
  JOIN tests t ON t.id = ts.test_id
  JOIN test_results tr ON tr.test_id = ts.test_id
  JOIN questions q ON q.id = tr.question_id
  LEFT JOIN topic_performance tp ON tp.test_id = ts.test_id
  WHERE ts.test_id = test_uuid
  GROUP BY 
    ts.total_questions,
    ts.correct_answers,
    ts.partially_correct,
    ts.incorrect_answers,
    ts.overall_score,
    ts.average_time_per_question,
    t.total_time_seconds,
    ts.question_type_distribution;
END;
$$;

-- Function to get detailed question performance analysis
CREATE OR REPLACE FUNCTION get_question_performance(question_uuid INTEGER, user_uuid UUID)
RETURNS TABLE (
  total_attempts INTEGER,
  correct_attempts INTEGER,
  average_time_seconds NUMERIC(6,2),
  peer_success_rate NUMERIC(5,2),
  topic_mastery_level VARCHAR(20),
  common_mistakes JSONB,
  time_trend JSONB,
  related_topics_performance JSONB
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid 
    AND (id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = 1
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH question_attempts AS (
    SELECT 
      tr.is_correct,
      tr.time_spent_seconds,
      tr.created_at,
      q.topic_id,
      q.sub_topic_id
    FROM test_results tr
    JOIN questions q ON q.id = tr.question_id
    WHERE tr.question_id = question_uuid
    AND tr.user_id = user_uuid
  )
  SELECT 
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN is_correct THEN 1 END) as correct_attempts,
    AVG(time_spent_seconds) as average_time_seconds,
    (
      SELECT ROUND(AVG(CASE WHEN tr.is_correct THEN 100.0 ELSE 0.0 END), 2)
      FROM test_results tr
      WHERE tr.question_id = question_uuid
    ) as peer_success_rate,
    (
      SELECT mastery_level
      FROM user_topic_mastery utm
      WHERE utm.user_id = user_uuid
      AND utm.topic_id = (SELECT topic_id FROM questions WHERE id = question_uuid)
      LIMIT 1
    ) as topic_mastery_level,
    (
      SELECT jsonb_build_object(
        'incorrect_answers', COUNT(CASE WHEN NOT is_correct THEN 1 END),
        'partial_correct', COUNT(CASE WHEN is_partially_correct THEN 1 END),
        'time_exceeded', COUNT(CASE WHEN time_spent_seconds > 120 THEN 1 END)
      )
    ) as common_mistakes,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'attempt_number', ROW_NUMBER() OVER (ORDER BY created_at),
          'time_spent', time_spent_seconds,
          'is_correct', is_correct
        )
      )
      FROM question_attempts
    ) as time_trend,
    (
      SELECT jsonb_object_agg(
        t.name,
        jsonb_build_object(
          'score', tp.score_percentage,
          'mastery', utm.mastery_level
        )
      )
      FROM topics t
      JOIN topic_performance tp ON tp.topic_id = t.id
      LEFT JOIN user_topic_mastery utm ON utm.topic_id = t.id AND utm.user_id = user_uuid
      WHERE t.id IN (
        SELECT DISTINCT topic_id 
        FROM questions 
        WHERE id = question_uuid 
        OR sub_topic_id IN (
          SELECT sub_topic_id 
          FROM questions 
          WHERE id = question_uuid
        )
      )
    ) as related_topics_performance
  FROM question_attempts;
END;
$$;

-- Function to get learning progress over time
CREATE OR REPLACE FUNCTION get_learning_progress(user_uuid UUID)
RETURNS TABLE (
  time_period DATE,
  questions_completed INTEGER,
  average_score NUMERIC(5,2),
  study_time_minutes INTEGER,
  topics_improved INTEGER,
  mastery_gained INTEGER,
  ngn_performance JSONB,
  weak_areas JSONB,
  strong_areas JSONB
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check permissions
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_uuid 
    AND (id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = 1
    ))
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH daily_stats AS (
    SELECT 
      DATE_TRUNC('day', ts.created_at)::date as study_date,
      COUNT(tr.id) as questions_completed,
      AVG(tr.score) as daily_score,
      SUM(tr.time_spent_seconds) / 60 as study_minutes,
      COUNT(DISTINCT tp.topic_id) as topics_studied,
      COUNT(DISTINCT CASE 
        WHEN tp.score_percentage >= 80 THEN tp.topic_id 
      END) as topics_mastered,
      jsonb_build_object(
        'total', COUNT(CASE WHEN q.ngn THEN 1 END),
        'correct', COUNT(CASE WHEN q.ngn AND tr.is_correct THEN 1 END)
      ) as ngn_stats,
      (
        SELECT jsonb_agg(jsonb_build_object(
          'topic', t.name,
          'score', AVG(tp2.score_percentage)
        ))
        FROM topic_performance tp2
        JOIN topics t ON t.id = tp2.topic_id
        WHERE tp2.user_id = user_uuid
        AND tp2.created_at::date = DATE_TRUNC('day', ts.created_at)::date
        AND tp2.score_percentage < 70
        GROUP BY t.id, t.name
        ORDER BY AVG(tp2.score_percentage)
        LIMIT 3
      ) as weak_topics,
      (
        SELECT jsonb_agg(jsonb_build_object(
          'topic', t.name,
          'score', AVG(tp2.score_percentage)
        ))
        FROM topic_performance tp2
        JOIN topics t ON t.id = tp2.topic_id
        WHERE tp2.user_id = user_uuid
        AND tp2.created_at::date = DATE_TRUNC('day', ts.created_at)::date
        AND tp2.score_percentage >= 80
        GROUP BY t.id, t.name
        ORDER BY AVG(tp2.score_percentage) DESC
        LIMIT 3
      ) as strong_topics
    FROM test_statistics ts
    JOIN test_results tr ON tr.test_id = ts.test_id
    JOIN questions q ON q.id = tr.question_id
    LEFT JOIN topic_performance tp ON tp.test_id = ts.test_id
    WHERE ts.user_id = user_uuid
    AND ts.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', ts.created_at)::date
  )
  SELECT 
    ds.study_date as time_period,
    ds.questions_completed,
    ROUND(ds.daily_score, 2) as average_score,
    ds.study_minutes as study_time_minutes,
    ds.topics_studied as topics_improved,
    ds.topics_mastered as mastery_gained,
    ds.ngn_stats as ngn_performance,
    ds.weak_topics as weak_areas,
    ds.strong_topics as strong_areas
  FROM daily_stats ds
  ORDER BY ds.study_date DESC;
END;
$$;

-- Add comments
COMMENT ON FUNCTION get_test_results IS 'Retrieves comprehensive test results including questions, answers, and notes';
COMMENT ON FUNCTION get_test_performance IS 'Analyzes test performance across topics and question types';
COMMENT ON FUNCTION get_test_statistics IS 'Provides detailed statistics for a specific test';
COMMENT ON FUNCTION get_question_performance IS 'Analyzes performance for a specific question';
COMMENT ON FUNCTION get_learning_progress IS 'Tracks learning progress over time with detailed metrics';