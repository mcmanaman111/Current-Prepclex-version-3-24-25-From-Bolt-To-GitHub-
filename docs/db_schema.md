# NCLEX Prep App Database Schema

## Overview
This document provides a comprehensive reference for the NCLEX Prep application database schema. It includes detailed information about tables, columns, functions, triggers, and security features.

## Functions

### calculate_question_type_distribution
**Return Type:** trigger

**Implementation:**
```sql

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

```

### calculate_user_readiness
**Return Type:** TABLE(readiness_score numeric, readiness_level text, weak_areas jsonb, strong_areas jsonb, recommended_topics jsonb)

**Implementation:**
```sql

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

```

### delete_user
**Return Type:** boolean

**Implementation:**
```sql

DECLARE
  calling_user_email text;
BEGIN
  -- Get the email of the calling user
  SELECT email INTO calling_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if calling user is an admin
  IF NOT (calling_user_email LIKE '%@prepclex.com' OR calling_user_email = 'mcmanaman111@gmail.com') THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Delete from auth.users (will cascade to public.users)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN true;
END;

```

### get_available_questions
**Return Type:** TABLE(question_id integer, status character varying, topic_id integer, subtopic_id integer, is_ngn boolean, attempts integer, success_rate numeric)

**Implementation:**
```sql

BEGIN
  RETURN QUERY
  SELECT 
    q.id as question_id,
    COALESCE(qs.status, 'unused') as status,
    q.topic_id,
    q.sub_topic_id as subtopic_id,
    q.ngn as is_ngn,
    COALESCE(qs.attempts_count, 0) as attempts,
    CASE 
      WHEN COALESCE(qs.attempts_count, 0) = 0 THEN 0
      ELSE ROUND((qs.correct_count::numeric / qs.attempts_count) * 100, 2)
    END as success_rate
  FROM questions q
  LEFT JOIN question_status qs ON 
    qs.question_id = q.id AND 
    qs.user_id = p_user_id
  WHERE 
    (p_statuses IS NULL OR COALESCE(qs.status, 'unused') = ANY(p_statuses)) AND
    (p_topics IS NULL OR q.topic_id = ANY(p_topics)) AND
    (p_subtopics IS NULL OR q.sub_topic_id = ANY(p_subtopics)) AND
    (NOT p_ngn_only OR q.ngn = true);
END;

```

### get_learning_progress
**Return Type:** TABLE(time_period date, questions_completed integer, average_score numeric, study_time_minutes integer, topics_improved integer, mastery_gained integer, ngn_performance jsonb, weak_areas jsonb, strong_areas jsonb)

**Implementation:**
```sql

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

```

### get_or_create_topic_ids
**Return Type:** TABLE(topic_id integer, subtopic_id integer)

**Implementation:**
```sql

DECLARE
  v_topic_id INTEGER;
  v_subtopic_id INTEGER;
BEGIN
  -- Get or create topic
  SELECT id INTO v_topic_id
  FROM topics
  WHERE name = p_topic_name;
  
  IF v_topic_id IS NULL THEN
    INSERT INTO topics (name)
    VALUES (p_topic_name)
    RETURNING id INTO v_topic_id;
  END IF;

  -- Get or create subtopic
  SELECT id INTO v_subtopic_id
  FROM subtopics
  WHERE topic_id = v_topic_id AND name = p_subtopic_name;
  
  IF v_subtopic_id IS NULL THEN
    INSERT INTO subtopics (topic_id, name)
    VALUES (v_topic_id, p_subtopic_name)
    RETURNING id INTO v_subtopic_id;
  END IF;

  RETURN QUERY SELECT v_topic_id, v_subtopic_id;
END;

```

### get_question_performance
**Return Type:** TABLE(total_attempts integer, correct_attempts integer, average_time_seconds numeric, peer_success_rate numeric, topic_mastery_level character varying, common_mistakes jsonb, time_trend jsonb, related_topics_performance jsonb)

**Implementation:**
```sql

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

```

### get_test_performance
**Return Type:** TABLE(topic_id integer, topic_name character varying, subtopic_id integer, subtopic_name character varying, total_questions integer, correct_answers integer, incorrect_answers integer, score_percentage numeric, ngn_questions integer, question_type_stats jsonb, average_time_seconds numeric, mastery_impact text)

**Implementation:**
```sql

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

```

### get_test_results
**Return Type:** TABLE(question_id integer, question_order integer, question_text text, question_type character varying, topic character varying, sub_topic character varying, is_ngn boolean, difficulty character varying, is_correct boolean, is_partially_correct boolean, score numeric, time_spent_seconds integer, is_marked boolean, has_notes boolean, notes text[], explanation text)

**Implementation:**
```sql

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

```

### get_test_statistics
**Return Type:** TABLE(total_questions integer, correct_answers integer, partially_correct integer, incorrect_answers integer, overall_score numeric, average_time_per_question numeric, total_time_minutes integer, ngn_questions_count integer, ngn_success_rate numeric, question_type_distribution jsonb, topic_coverage_percentage numeric, mastery_impact_score numeric)

**Implementation:**
```sql

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

```

### get_user_performance
**Return Type:** TABLE(user_id uuid, total_tests_taken integer, total_questions_completed integer, total_study_time_minutes integer, current_streak_days integer, overall_average_score numeric, last_activity_date date, topics_attempted bigint, avg_topic_score numeric, mastered_topics bigint, overall_accuracy numeric, total_ngn_questions bigint, total_topics_with_mastery bigint, mastered_topics_count bigint, proficient_topics_count bigint, mastery_percentage numeric, recent_test_avg numeric, recent_tests_count bigint, readiness_level text, created_at timestamp with time zone, updated_at timestamp with time zone)

**Implementation:**
```sql

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

```

### handle_feedback_response
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  -- Only proceed if admin_response was updated
  IF NEW.admin_response IS NOT NULL AND 
     (OLD.admin_response IS NULL OR NEW.admin_response != OLD.admin_response) THEN
    
    -- Create notification for user
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      link
    ) VALUES (
      NEW.user_id::text,
      'feedback_response',
      'Response to Your Feedback',
      'An administrator has responded to your feedback on question ' || NEW.question_id,
      '/exam?question=' || NEW.question_id
    );
    
    -- Update feedback status
    NEW.status := 'responded';
  END IF;
  
  RETURN NEW;
END;

```

### handle_new_feedback
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  -- Create notification for admin
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link
  ) VALUES (
    'admin',
    'question_feedback',
    'New Question Feedback',
    'New feedback received for question ' || NEW.question_id,
    '/admin/feedback/' || NEW.id
  );
  
  RETURN NEW;
END;

```

### handle_new_user
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  -- First insert into users
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  
  -- Then create profile
  INSERT INTO public.profiles (id, email, role_id, subscription_type)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email LIKE '%@prepclex.com' THEN 1  -- Administrator
      WHEN new.email = 'mcmanaman111@gmail.com' THEN 1  -- Administrator
      ELSE 6  -- Student (default)
    END,
    1  -- Free subscription
  );
  
  RETURN new;
END;

```

### refresh_test_history_mv
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY test_history_mv;
  RETURN NULL;
END;

```

### refresh_user_progress
**Return Type:** trigger

**Implementation:**
```sql

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

```

### sync_test_results_status
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  -- Update question status based on test results
  PERFORM update_question_status(
    NEW.user_id,
    NEW.question_id,
    CASE
      WHEN NEW.is_marked THEN 'marked'
      WHEN NEW.is_skipped THEN 'skipped'
      WHEN NEW.is_correct THEN 'correct'
      ELSE 'incorrect'
    END,
    NEW.is_correct
  );
  
  RETURN NEW;
END;

```

### update_answer_statistics
**Return Type:** trigger

**Implementation:**
```sql

DECLARE
  total_attempts INTEGER;
  answer_option INTEGER;
BEGIN
  -- Get total attempts for this question
  SELECT total_attempts INTO total_attempts
  FROM question_statistics
  WHERE question_id = NEW.question_id;

  -- If no attempts recorded yet, set to 1
  IF total_attempts IS NULL THEN
    total_attempts := 1;
  END IF;

  -- Initialize statistics for all options if they don't exist
  INSERT INTO answer_statistics (
    question_id,
    answer_id,
    option_number,
    times_selected,
    selection_percentage,
    last_selected_at
  )
  SELECT
    NEW.question_id,
    a.id,
    a.option_number,
    0,
    0,
    NULL
  FROM answers a
  WHERE a.question_id = NEW.question_id
  ON CONFLICT (question_id, option_number) DO NOTHING;

  -- Update selected answers
  IF NEW.selected_answers IS NOT NULL THEN
    FOR answer_option IN (
      SELECT unnest(NEW.selected_answers)
    )
    LOOP
      UPDATE answer_statistics
      SET
        times_selected = times_selected + 1,
        selection_percentage = ((times_selected + 1)::numeric / total_attempts * 100),
        last_selected_at = NOW(),
        updated_at = NOW()
      WHERE question_id = NEW.question_id
      AND option_number = answer_option;
    END LOOP;
  END IF;

  -- Recalculate percentages for all options
  UPDATE answer_statistics
  SET selection_percentage = (times_selected::numeric / total_attempts * 100)
  WHERE question_id = NEW.question_id;

  RETURN NEW;
END;

```

### update_performance_trend
**Return Type:** trigger

**Implementation:**
```sql

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

```

### update_question_statistics
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  -- Insert or update statistics
  INSERT INTO question_statistics (
    question_id,
    total_attempts,
    correct_attempts,
    partial_attempts,
    incorrect_attempts,
    avg_time_seconds,
    avg_score,
    last_attempt_at
  )
  VALUES (
    NEW.question_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_partially_correct THEN 1 ELSE 0 END,
    CASE WHEN NOT NEW.is_correct AND NOT NEW.is_partially_correct THEN 1 ELSE 0 END,
    NEW.time_spent_seconds,
    NEW.score,
    NOW()
  )
  ON CONFLICT (question_id) DO UPDATE
  SET
    total_attempts = question_statistics.total_attempts + 1,
    correct_attempts = question_statistics.correct_attempts + 
      CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    partial_attempts = question_statistics.partial_attempts +
      CASE WHEN NEW.is_partially_correct THEN 1 ELSE 0 END,
    incorrect_attempts = question_statistics.incorrect_attempts +
      CASE WHEN NOT NEW.is_correct AND NOT NEW.is_partially_correct THEN 1 ELSE 0 END,
    avg_time_seconds = (
      (question_statistics.avg_time_seconds * question_statistics.total_attempts + NEW.time_spent_seconds) / 
      (question_statistics.total_attempts + 1)
    ),
    avg_score = (
      (question_statistics.avg_score * question_statistics.total_attempts + NEW.score) /
      (question_statistics.total_attempts + 1)
    ),
    last_attempt_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;

```

### update_question_status
**Return Type:** question_status

**Implementation:**
```sql

DECLARE
  result question_status;
BEGIN
  -- Check authorization
  IF p_user_id != auth.uid() AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role_id = 1
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Insert or update status
  INSERT INTO question_status (
    user_id,
    question_id,
    status,
    last_attempt_at,
    attempts_count,
    correct_count,
    notes
  )
  VALUES (
    p_user_id,
    p_question_id,
    p_status,
    CASE WHEN p_is_correct IS NOT NULL THEN NOW() ELSE NULL END,
    CASE WHEN p_is_correct IS NOT NULL THEN 1 ELSE 0 END,
    CASE WHEN p_is_correct THEN 1 ELSE 0 END,
    p_notes
  )
  ON CONFLICT (user_id, question_id) DO UPDATE
  SET
    status = p_status,
    last_attempt_at = CASE 
      WHEN p_is_correct IS NOT NULL THEN NOW() 
      ELSE question_status.last_attempt_at 
    END,
    attempts_count = CASE 
      WHEN p_is_correct IS NOT NULL 
      THEN question_status.attempts_count + 1 
      ELSE question_status.attempts_count 
    END,
    correct_count = CASE 
      WHEN p_is_correct 
      THEN question_status.correct_count + 1 
      ELSE question_status.correct_count 
    END,
    notes = COALESCE(p_notes, question_status.notes),
    updated_at = NOW()
  RETURNING *
  INTO result;

  RETURN result;
END;

```

### update_question_type_breakdown
**Return Type:** trigger

**Implementation:**
```sql

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

```

### update_study_streak
**Return Type:** trigger

**Implementation:**
```sql

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

```

### update_updated_at_column
**Return Type:** trigger

**Implementation:**
```sql

BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;

```

## Tables

### answer_statistics
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| answer_id | integer | Reference to the specific answer option |
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the answer statistics record |
| last_selected_at | timestamp with time zone | Timestamp of most recent selection |
| option_number | integer | Order number of the answer option |
| question_id | integer | Reference to the question |
| selection_percentage | numeric | Percentage of users who selected this option |
| times_selected | integer | Number of times this option was selected |
| updated_at | timestamp with time zone | Timestamp when the record was last updated |

### answers
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| answer_text | text | Text of the answer option |
| created_at | timestamp with time zone | Timestamp when the answer was created |
| id | integer | Unique identifier for the answer |
| is_correct | boolean | Indicates if this is a correct answer |
| option_number | integer | Order number of the answer option |
| partial_credit | numeric | Amount of partial credit (0.00-1.00) if applicable |
| penalty_value | numeric | Penalty value (0.00-1.00) for incorrect selection if applicable |
| question_id | integer | Reference to the parent question |
| updated_at | timestamp with time zone | Timestamp when the answer was last updated |

### bowtie_questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| actions | jsonb | JSON array of possible interventions/actions |
| causes | jsonb | JSON array of possible causes |
| correct_actions | jsonb | JSON array of correct interventions |
| correct_causes | jsonb | JSON array of correct causes |
| correct_effects | jsonb | JSON array of correct outcomes |
| created_at | timestamp with time zone | Timestamp when the bow-tie question was created |
| effects | jsonb | JSON array of possible outcomes/effects |
| id | integer | Unique identifier for the bow-tie question |
| question_id | integer | Reference to the parent question |

### case_studies
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the case study was created |
| description | text | Full case study scenario text |
| id | integer | Unique identifier for the case study |
| image_file | text | Optional reference to an image file for the case study |
| title | character varying | Title of the case study |
| updated_at | timestamp with time zone | Timestamp when the case study was last updated |

### enhanced_hot_spot_questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| correct_phrases | jsonb | JSON array of phrases that should be selected |
| created_at | timestamp with time zone | Timestamp when the enhanced hot spot question was created |
| id | integer | Unique identifier for the enhanced hot spot question |
| passage | text | Text passage for highlighting |
| question_id | integer | Reference to the parent question |
| selectable_phrases | jsonb | JSON array of phrases that can be selected |

### marked_questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the marked question record |
| marked_at | timestamp with time zone | Timestamp when the question was marked |
| notes | text | Optional notes about why the question was marked |
| question_id | integer | Reference to the marked question |
| status | character varying | Current status of the marked question (pending, reviewed, archived) |
| test_id | integer | Reference to the test where the question was marked |
| user_id | uuid | Reference to the user who marked the question |

### matrix_questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| column_labels | jsonb | JSON array of column labels |
| correct_answers | jsonb | JSON object mapping correct row/column combinations |
| created_at | timestamp with time zone | Timestamp when the matrix question was created |
| id | integer | Unique identifier for the matrix question |
| question_id | integer | Reference to the parent question |
| row_labels | jsonb | JSON array of row labels |

### notes
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| content | text | The note content |
| created_at | timestamp with time zone | Timestamp when the note was created |
| id | integer | Unique identifier for the note |
| question_id | text | Reference to the question |
| sub_topic | text | Sub-topic name for categorization |
| test_id | text | Reference to the test session |
| topic | text | Topic name for categorization |
| user_id | uuid | Reference to the user who created the note |

### notifications
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when notification was created |
| id | integer | Unique identifier for the notification |
| link | text | Optional link to relevant content |
| message | text | Notification message |
| read | boolean | Whether the notification has been read |
| title | text | Notification title |
| type | character varying | Type of notification |
| user_id | text | Target user for the notification |

### profiles
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| avatar_url | text | No description available |
| created_at | timestamp with time zone | No description available |
| email | text | No description available |
| full_name | text | No description available |
| id | uuid | No description available |
| role_id | integer | No description available |
| subscription_active | boolean | No description available |
| subscription_ends_at | timestamp with time zone | No description available |
| subscription_type | integer | No description available |
| updated_at | timestamp with time zone | No description available |

### question_feedback
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| admin_response | text | Administrator response to the feedback |
| created_at | timestamp with time zone | Timestamp when feedback was created |
| difficulty | character varying | User-assessed difficulty level |
| id | integer | Unique identifier for the feedback |
| message | text | Feedback message from the user |
| question_id | text | Reference to the question |
| rating | integer | Rating from 1-5 stars |
| status | character varying | Current status of the feedback |
| test_id | text | Reference to the test session |
| user_id | uuid | Reference to the user who provided feedback |

### question_statistics
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| avg_score | numeric | Average score achieved on this question |
| avg_time_seconds | numeric | Average time spent on this question |
| correct_attempts | integer | Number of fully correct attempts |
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the statistics record |
| incorrect_attempts | integer | Number of incorrect attempts |
| last_attempt_at | timestamp with time zone | Timestamp of the most recent attempt |
| partial_attempts | integer | Number of partially correct attempts |
| question_id | integer | Reference to the question |
| total_attempts | integer | Total number of attempts across all users |
| updated_at | timestamp with time zone | Timestamp when the record was last updated |

### question_status
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| attempts_count | integer | Number of times the question has been attempted |
| correct_count | integer | Number of correct attempts |
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the status record |
| last_attempt_at | timestamp with time zone | Timestamp of the last attempt |
| notes | text | Optional notes about the question |
| question_id | integer | Reference to the question |
| status | character varying | Current status of the question (unused, correct, incorrect, marked, skipped) |
| updated_at | timestamp with time zone | Timestamp when the record was last updated |
| user_id | uuid | Reference to the user |

### questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| audio_file | text | Reference to audio file for audio questions |
| case_study_id | integer | Optional reference to a case study if the question is part of one |
| created_at | timestamp with time zone | Timestamp when the question was created |
| difficulty | character varying | Difficulty level (easy, medium, hard) |
| explanation | text | Explanation of the correct answer and rationale |
| id | integer | Unique identifier for the question |
| image_file | text | Reference to image file for visual questions |
| ngn | boolean | Indicates if this is a Next Generation NCLEX question |
| question_format | character varying | Format of the question presentation |
| question_text | text | The actual question text |
| question_type | character varying | Type of question (multiple choice, SATA, etc.) |
| ref_sources | jsonb | JSON array of reference sources |
| sub_topic | character varying | Specific subcategory name for the question |
| sub_topic_id | integer | Reference to the subtopic table |
| topic | character varying | General category name for the question |
| topic_id | integer | Reference to the topic table |
| updated_at | timestamp with time zone | Timestamp when the question was last updated |
| use_partial_scoring | boolean | Indicates if partial credit is allowed |

### roles
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | No description available |
| description | text | No description available |
| id | integer | No description available |
| name | text | No description available |
| updated_at | timestamp with time zone | No description available |

### skipped_questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the skipped question record |
| question_id | integer | Reference to the skipped question |
| skipped_at | timestamp with time zone | Timestamp when the question was skipped |
| status | character varying | Current status of the skipped question (pending, attempted, archived) |
| test_id | integer | Reference to the test where the question was skipped |
| user_id | uuid | Reference to the user who skipped the question |

### subscriptions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | No description available |
| description | text | No description available |
| duration_days | integer | No description available |
| id | integer | No description available |
| name | text | No description available |
| stripe_price_id | text | No description available |
| updated_at | timestamp with time zone | No description available |

### subtopics
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the subtopic was created |
| description | text | Detailed description of the subtopic |
| id | integer | Unique identifier for the subtopic |
| name | character varying | Name of the subtopic |
| topic_id | integer | Reference to the parent topic |
| updated_at | timestamp with time zone | Timestamp when the subtopic was last updated |

### test_answers
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the answer was recorded |
| id | integer | Unique identifier for the test answer |
| is_correct | boolean | Indicates if the answer was fully correct |
| nclex_score | integer | NCLEX scoring (0 or 1) |
| partial_score | numeric | Partial credit score if applicable |
| question_id | integer | Reference to the question |
| selected_answers | ARRAY | Array of selected answer indices |
| test_id | integer | Reference to the test session |
| user_id | uuid | Reference to the user |

### test_questions
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the test question |
| is_marked | boolean | Indicates if the question is marked for review |
| is_skipped | boolean | Indicates if the question was skipped |
| question_id | integer | Reference to the question |
| question_order | integer | Order of the question in the test |
| test_id | integer | Reference to the test session |
| time_spent_seconds | integer | Time spent on this question |
| user_id | uuid | Reference to the user |

### test_results
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the result was recorded |
| has_notes | boolean | Indicates if there are notes associated with this question |
| id | integer | Unique identifier for the test result record |
| is_correct | boolean | Indicates if the answer was fully correct |
| is_marked | boolean | Indicates if the question was marked for review |
| is_partially_correct | boolean | Indicates if the answer was partially correct |
| is_skipped | boolean | Indicates if the question was explicitly skipped |
| question_id | integer | Reference to the question |
| question_order | integer | Order of the question in the test |
| score | numeric | Score achieved for this question (0-100) |
| test_id | integer | Reference to the test session |
| time_spent_seconds | integer | Time spent on this question in seconds |
| user_id | uuid | Reference to the user who took the test |

### test_statistics
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| average_time_per_question | numeric | Average time spent per question |
| correct_answers | integer | Number of fully correct answers |
| created_at | timestamp with time zone | Timestamp when the statistics were created |
| id | integer | Unique identifier for the test statistics |
| incorrect_answers | integer | Number of incorrect answers |
| marked_questions | integer | Number of marked questions |
| overall_score | numeric | Overall test score percentage |
| partially_correct | integer | Number of partially correct answers |
| question_type_distribution | jsonb | Distribution of question types in the test with correct/total counts |
| skipped_questions | integer | Number of skipped questions |
| test_id | integer | Reference to the test session |
| total_marked_questions | integer | Total number of questions marked for review |
| total_notes | integer | Total number of questions with notes |
| total_questions | integer | Total number of questions |
| user_id | uuid | Reference to the user |

### test_summary_stats_view
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| average_score | numeric | No description available |
| average_time | numeric | No description available |
| last_test_date | timestamp with time zone | No description available |
| monthly_stats | jsonb | No description available |
| recent_average | numeric | No description available |
| recent_tests | jsonb | No description available |
| total_ngn_completed | numeric | No description available |
| total_questions_completed | bigint | No description available |
| total_tests | bigint | No description available |
| user_id | uuid | No description available |

### tests
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| completion_status | character varying | Current completion status of the test |
| created_at | timestamp with time zone | Timestamp when the test was created |
| end_time | timestamp with time zone | When the test was completed |
| id | integer | Unique identifier for the test session |
| settings | jsonb | JSON object containing test settings (timer, tutor mode, etc.) |
| start_time | timestamp with time zone | When the test was started |
| status | character varying | Current status of the test |
| test_duration_minutes | integer | Test duration in minutes, automatically calculated |
| test_mode | character varying | Mode of the test (practice, simulation, review, custom) |
| test_template_id | integer | Reference to a test template if using a pre-defined format |
| test_type | character varying | Type of test (practice, quick start, or custom) |
| total_questions | integer | Total number of questions in the test |
| total_time_seconds | integer | Total time spent on the test in seconds |
| updated_at | timestamp with time zone | Timestamp when the test was last updated |
| user_id | uuid | Reference to the user taking the test |

### topic_performance
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| correct_answers | integer | Number of correct answers |
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the topic performance record |
| incorrect_answers | integer | Number of incorrect answers |
| ngn_questions | integer | Number of NGN questions in this topic |
| question_type_breakdown | jsonb | JSON object containing performance metrics for each question type |
| score_percentage | numeric | Score percentage for this topic |
| subtopic_id | integer | Reference to the subtopic |
| test_id | integer | Reference to the test session |
| topic_id | integer | Reference to the topic |
| total_questions | integer | Total questions in this topic |
| user_id | uuid | Reference to the user |

### topics
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the topic was created |
| description | text | Detailed description of the topic |
| id | integer | Unique identifier for the topic |
| name | character varying | Name of the topic |
| updated_at | timestamp with time zone | Timestamp when the topic was last updated |

### user_progress
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| average_score | numeric | Overall average score |
| created_at | timestamp with time zone | Timestamp when the record was created |
| current_streak_days | integer | Current study streak in days |
| exam_date | date | Scheduled NCLEX exam date |
| id | integer | Unique identifier for the progress record |
| last_activity_date | date | Date of last activity |
| last_study_date | date | Date of last study activity |
| longest_streak_days | integer | Longest study streak achieved in days |
| performance_trend | jsonb | JSON object containing recent performance trends and metrics |
| streak_start_date | date | Date when the current streak started |
| total_questions_completed | integer | Total questions answered |
| total_study_time_minutes | integer | Total study time in minutes |
| total_tests_taken | integer | Total number of tests completed |
| updated_at | timestamp with time zone | Timestamp when the record was last updated |
| user_id | uuid | Reference to the user |

### user_topic_mastery
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | Timestamp when the record was created |
| id | integer | Unique identifier for the mastery record |
| last_attempt_date | timestamp with time zone | Date of last attempt |
| mastery_level | character varying | Current mastery level for the topic |
| questions_attempted | integer | Number of questions attempted |
| questions_correct | integer | Number of questions answered correctly |
| topic_id | integer | Reference to the topic |
| updated_at | timestamp with time zone | Timestamp when the record was last updated |
| user_id | uuid | Reference to the user |

### users
| Column Name | Data Type | Description |
|------------|-----------|-------------|
| created_at | timestamp with time zone | No description available |
| email | text | No description available |
| id | uuid | No description available |
| is_active | boolean | No description available |
| last_login | timestamp with time zone | No description available |
| updated_at | timestamp with time zone | No description available |

## Triggers

### answer_statistics
#### RI_ConstraintTrigger_c_35657
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35657" AFTER INSERT ON public.answer_statistics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_35658
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35658" AFTER UPDATE ON public.answer_statistics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_35662
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35662" AFTER INSERT ON public.answer_statistics FROM answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_35663
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35663" AFTER UPDATE ON public.answer_statistics FROM answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### answers
#### RI_ConstraintTrigger_a_35660
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35660" AFTER DELETE ON public.answers FROM answer_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_35661
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35661" AFTER UPDATE ON public.answers FROM answer_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_c_32882
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32882" AFTER INSERT ON public.answers FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32883
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32883" AFTER UPDATE ON public.answers FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_answers_updated_at
```sql
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### bowtie_questions
#### RI_ConstraintTrigger_c_32912
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32912" AFTER INSERT ON public.bowtie_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32913
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32913" AFTER UPDATE ON public.bowtie_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### case_studies
#### RI_ConstraintTrigger_a_32861
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32861" AFTER DELETE ON public.case_studies FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_32862
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32862" AFTER UPDATE ON public.case_studies FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### update_case_studies_updated_at
```sql
CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON public.case_studies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### enhanced_hot_spot_questions
#### RI_ConstraintTrigger_c_32927
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32927" AFTER INSERT ON public.enhanced_hot_spot_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32928
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32928" AFTER UPDATE ON public.enhanced_hot_spot_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### marked_questions
#### RI_ConstraintTrigger_c_33558
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33558" AFTER INSERT ON public.marked_questions FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33559
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33559" AFTER UPDATE ON public.marked_questions FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33563
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33563" AFTER INSERT ON public.marked_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33564
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33564" AFTER UPDATE ON public.marked_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33568
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33568" AFTER INSERT ON public.marked_questions FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33569
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33569" AFTER UPDATE ON public.marked_questions FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### matrix_questions
#### RI_ConstraintTrigger_c_32897
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32897" AFTER INSERT ON public.matrix_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32898
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32898" AFTER UPDATE ON public.matrix_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### notes
#### RI_ConstraintTrigger_c_33587
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33587" AFTER INSERT ON public.notes FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33588
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33588" AFTER UPDATE ON public.notes FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### profiles
#### RI_ConstraintTrigger_c_29410
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29410" AFTER INSERT ON public.profiles FROM roles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_29411
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29411" AFTER UPDATE ON public.profiles FROM roles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_29415
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29415" AFTER INSERT ON public.profiles FROM subscriptions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_29416
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29416" AFTER UPDATE ON public.profiles FROM subscriptions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_29476
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29476" AFTER INSERT ON public.profiles FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_29477
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29477" AFTER UPDATE ON public.profiles FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_profiles_updated_at
```sql
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### question_feedback
#### RI_ConstraintTrigger_c_35435
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35435" AFTER INSERT ON public.question_feedback FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_35436
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35436" AFTER UPDATE ON public.question_feedback FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### on_feedback_response
```sql
CREATE TRIGGER on_feedback_response BEFORE UPDATE ON public.question_feedback FOR EACH ROW EXECUTE FUNCTION handle_feedback_response()
```

#### on_new_feedback
```sql
CREATE TRIGGER on_new_feedback AFTER INSERT ON public.question_feedback FOR EACH ROW EXECUTE FUNCTION handle_new_feedback()
```

### question_statistics
#### RI_ConstraintTrigger_c_35606
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35606" AFTER INSERT ON public.question_statistics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_35607
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35607" AFTER UPDATE ON public.question_statistics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### question_status
#### RI_ConstraintTrigger_c_35339
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35339" AFTER INSERT ON public.question_status FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_35340
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35340" AFTER UPDATE ON public.question_status FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_35344
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35344" AFTER INSERT ON public.question_status FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_35345
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_35345" AFTER UPDATE ON public.question_status FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### questions
#### RI_ConstraintTrigger_a_32880
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32880" AFTER DELETE ON public.questions FROM answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_32881
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32881" AFTER UPDATE ON public.questions FROM answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_32895
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32895" AFTER DELETE ON public.questions FROM matrix_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_32896
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32896" AFTER UPDATE ON public.questions FROM matrix_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_32910
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32910" AFTER DELETE ON public.questions FROM bowtie_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_32911
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32911" AFTER UPDATE ON public.questions FROM bowtie_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_32925
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32925" AFTER DELETE ON public.questions FROM enhanced_hot_spot_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_32926
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32926" AFTER UPDATE ON public.questions FROM enhanced_hot_spot_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33246
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33246" AFTER DELETE ON public.questions FROM test_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33247
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33247" AFTER UPDATE ON public.questions FROM test_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33273
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33273" AFTER DELETE ON public.questions FROM test_answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33274
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33274" AFTER UPDATE ON public.questions FROM test_answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33561
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33561" AFTER DELETE ON public.questions FROM marked_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33562
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33562" AFTER UPDATE ON public.questions FROM marked_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33629
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33629" AFTER DELETE ON public.questions FROM skipped_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33630
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33630" AFTER UPDATE ON public.questions FROM skipped_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33661
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33661" AFTER DELETE ON public.questions FROM test_results NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33662
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33662" AFTER UPDATE ON public.questions FROM test_results NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_35342
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35342" AFTER DELETE ON public.questions FROM question_status NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_35343
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35343" AFTER UPDATE ON public.questions FROM question_status NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_35604
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35604" AFTER DELETE ON public.questions FROM question_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_35605
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35605" AFTER UPDATE ON public.questions FROM question_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_35655
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35655" AFTER DELETE ON public.questions FROM answer_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_35656
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35656" AFTER UPDATE ON public.questions FROM answer_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_c_32853
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32853" AFTER INSERT ON public.questions FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32854
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32854" AFTER UPDATE ON public.questions FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_32858
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32858" AFTER INSERT ON public.questions FROM subtopics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32859
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32859" AFTER UPDATE ON public.questions FROM subtopics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_32863
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32863" AFTER INSERT ON public.questions FROM case_studies NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32864
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32864" AFTER UPDATE ON public.questions FROM case_studies NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_questions_updated_at
```sql
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### roles
#### RI_ConstraintTrigger_a_29408
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_29408" AFTER DELETE ON public.roles FROM profiles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_29409
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_29409" AFTER UPDATE ON public.roles FROM profiles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### update_roles_updated_at
```sql
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### skipped_questions
#### RI_ConstraintTrigger_c_33626
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33626" AFTER INSERT ON public.skipped_questions FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33627
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33627" AFTER UPDATE ON public.skipped_questions FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33631
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33631" AFTER INSERT ON public.skipped_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33632
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33632" AFTER UPDATE ON public.skipped_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33636
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33636" AFTER INSERT ON public.skipped_questions FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33637
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33637" AFTER UPDATE ON public.skipped_questions FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### subscriptions
#### RI_ConstraintTrigger_a_29413
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_29413" AFTER DELETE ON public.subscriptions FROM profiles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_29414
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_29414" AFTER UPDATE ON public.subscriptions FROM profiles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### update_subscriptions_updated_at
```sql
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### subtopics
#### RI_ConstraintTrigger_a_32856
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32856" AFTER DELETE ON public.subtopics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_32857
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32857" AFTER UPDATE ON public.subtopics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33322
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33322" AFTER DELETE ON public.subtopics FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33323
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33323" AFTER UPDATE ON public.subtopics FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_c_32822
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32822" AFTER INSERT ON public.subtopics FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_32823
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_32823" AFTER UPDATE ON public.subtopics FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_subtopics_updated_at
```sql
CREATE TRIGGER update_subtopics_updated_at BEFORE UPDATE ON public.subtopics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### test_answers
#### RI_ConstraintTrigger_c_33270
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33270" AFTER INSERT ON public.test_answers FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33271
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33271" AFTER UPDATE ON public.test_answers FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33275
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33275" AFTER INSERT ON public.test_answers FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33276
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33276" AFTER UPDATE ON public.test_answers FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33497
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33497" AFTER INSERT ON public.test_answers FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33498
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33498" AFTER UPDATE ON public.test_answers FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### test_questions
#### RI_ConstraintTrigger_c_33243
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33243" AFTER INSERT ON public.test_questions FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33244
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33244" AFTER UPDATE ON public.test_questions FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33248
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33248" AFTER INSERT ON public.test_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33249
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33249" AFTER UPDATE ON public.test_questions FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33492
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33492" AFTER INSERT ON public.test_questions FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33493
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33493" AFTER UPDATE ON public.test_questions FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

### test_results
#### RI_ConstraintTrigger_c_33653
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33653" AFTER INSERT ON public.test_results FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33654
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33654" AFTER UPDATE ON public.test_results FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33658
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33658" AFTER INSERT ON public.test_results FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33659
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33659" AFTER UPDATE ON public.test_results FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33663
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33663" AFTER INSERT ON public.test_results FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33664
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33664" AFTER UPDATE ON public.test_results FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### sync_question_status
```sql
CREATE TRIGGER sync_question_status AFTER INSERT OR UPDATE ON public.test_results FOR EACH ROW EXECUTE FUNCTION sync_test_results_status()
```

#### update_answer_stats
```sql
CREATE TRIGGER update_answer_stats AFTER INSERT OR UPDATE ON public.test_results FOR EACH ROW EXECUTE FUNCTION update_answer_statistics()
```

#### update_question_stats
```sql
CREATE TRIGGER update_question_stats AFTER INSERT OR UPDATE ON public.test_results FOR EACH ROW EXECUTE FUNCTION update_question_statistics()
```

### test_statistics
#### RI_ConstraintTrigger_c_33296
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33296" AFTER INSERT ON public.test_statistics FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33297
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33297" AFTER UPDATE ON public.test_statistics FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33502
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33502" AFTER INSERT ON public.test_statistics FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33503
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33503" AFTER UPDATE ON public.test_statistics FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### maintain_study_streak
```sql
CREATE TRIGGER maintain_study_streak AFTER INSERT OR UPDATE ON public.test_statistics FOR EACH ROW EXECUTE FUNCTION update_study_streak()
```

#### refresh_test_history_after_stats
```sql
CREATE TRIGGER refresh_test_history_after_stats AFTER INSERT OR DELETE OR UPDATE ON public.test_statistics FOR EACH STATEMENT EXECUTE FUNCTION refresh_test_history_mv()
```

#### update_performance_trend_trigger
```sql
CREATE TRIGGER update_performance_trend_trigger AFTER INSERT OR UPDATE ON public.test_statistics FOR EACH ROW EXECUTE FUNCTION update_performance_trend()
```

#### update_question_type_distribution
```sql
CREATE TRIGGER update_question_type_distribution AFTER INSERT ON public.test_statistics FOR EACH ROW EXECUTE FUNCTION calculate_question_type_distribution()
```

#### update_user_progress_stats
```sql
CREATE TRIGGER update_user_progress_stats AFTER INSERT OR UPDATE ON public.test_statistics FOR EACH ROW EXECUTE FUNCTION refresh_user_progress()
```

### tests
#### RI_ConstraintTrigger_a_33241
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33241" AFTER DELETE ON public.tests FROM test_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33242
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33242" AFTER UPDATE ON public.tests FROM test_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33268
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33268" AFTER DELETE ON public.tests FROM test_answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33269
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33269" AFTER UPDATE ON public.tests FROM test_answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33294
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33294" AFTER DELETE ON public.tests FROM test_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33295
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33295" AFTER UPDATE ON public.tests FROM test_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33312
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33312" AFTER DELETE ON public.tests FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33313
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33313" AFTER UPDATE ON public.tests FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33566
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33566" AFTER DELETE ON public.tests FROM marked_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33567
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33567" AFTER UPDATE ON public.tests FROM marked_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33634
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33634" AFTER DELETE ON public.tests FROM skipped_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33635
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33635" AFTER UPDATE ON public.tests FROM skipped_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33651
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33651" AFTER DELETE ON public.tests FROM test_results NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33652
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33652" AFTER UPDATE ON public.tests FROM test_results NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_c_33487
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33487" AFTER INSERT ON public.tests FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33488
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33488" AFTER UPDATE ON public.tests FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### refresh_test_history_after_test
```sql
CREATE TRIGGER refresh_test_history_after_test AFTER INSERT OR DELETE OR UPDATE ON public.tests FOR EACH STATEMENT EXECUTE FUNCTION refresh_test_history_mv()
```

#### update_tests_updated_at
```sql
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### topic_performance
#### RI_ConstraintTrigger_c_33314
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33314" AFTER INSERT ON public.topic_performance FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33315
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33315" AFTER UPDATE ON public.topic_performance FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33319
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33319" AFTER INSERT ON public.topic_performance FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33320
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33320" AFTER UPDATE ON public.topic_performance FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33324
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33324" AFTER INSERT ON public.topic_performance FROM subtopics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33325
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33325" AFTER UPDATE ON public.topic_performance FROM subtopics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33507
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33507" AFTER INSERT ON public.topic_performance FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33508
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33508" AFTER UPDATE ON public.topic_performance FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_question_type_breakdown
```sql
CREATE TRIGGER update_question_type_breakdown AFTER INSERT OR UPDATE OF correct_answers ON public.topic_performance FOR EACH ROW EXECUTE FUNCTION update_question_type_breakdown()
```

### topics
#### RI_ConstraintTrigger_a_32820
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32820" AFTER DELETE ON public.topics FROM subtopics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_32821
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32821" AFTER UPDATE ON public.topics FROM subtopics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_32851
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32851" AFTER DELETE ON public.topics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_32852
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_32852" AFTER UPDATE ON public.topics FROM questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33317
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33317" AFTER DELETE ON public.topics FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33318
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33318" AFTER UPDATE ON public.topics FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33364
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33364" AFTER DELETE ON public.topics FROM user_topic_mastery NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_del"()
```

#### RI_ConstraintTrigger_a_33365
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33365" AFTER UPDATE ON public.topics FROM user_topic_mastery NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### update_topics_updated_at
```sql
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### user_progress
#### RI_ConstraintTrigger_c_33512
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33512" AFTER INSERT ON public.user_progress FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33513
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33513" AFTER UPDATE ON public.user_progress FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_user_progress_updated_at
```sql
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### user_topic_mastery
#### RI_ConstraintTrigger_c_33366
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33366" AFTER INSERT ON public.user_topic_mastery FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33367
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33367" AFTER UPDATE ON public.user_topic_mastery FROM topics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### RI_ConstraintTrigger_c_33517
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33517" AFTER INSERT ON public.user_topic_mastery FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_33518
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_33518" AFTER UPDATE ON public.user_topic_mastery FROM users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_user_topic_mastery_updated_at
```sql
CREATE TRIGGER update_user_topic_mastery_updated_at BEFORE UPDATE ON public.user_topic_mastery FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### users
#### RI_ConstraintTrigger_a_29474
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_29474" AFTER DELETE ON public.users FROM profiles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_29475
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_29475" AFTER UPDATE ON public.users FROM profiles NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33485
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33485" AFTER DELETE ON public.users FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33486
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33486" AFTER UPDATE ON public.users FROM tests NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33490
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33490" AFTER DELETE ON public.users FROM test_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33491
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33491" AFTER UPDATE ON public.users FROM test_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33495
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33495" AFTER DELETE ON public.users FROM test_answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33496
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33496" AFTER UPDATE ON public.users FROM test_answers NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33500
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33500" AFTER DELETE ON public.users FROM test_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33501
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33501" AFTER UPDATE ON public.users FROM test_statistics NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33505
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33505" AFTER DELETE ON public.users FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33506
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33506" AFTER UPDATE ON public.users FROM topic_performance NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33510
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33510" AFTER DELETE ON public.users FROM user_progress NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33511
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33511" AFTER UPDATE ON public.users FROM user_progress NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33515
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33515" AFTER DELETE ON public.users FROM user_topic_mastery NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33516
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33516" AFTER UPDATE ON public.users FROM user_topic_mastery NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33556
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33556" AFTER DELETE ON public.users FROM marked_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33557
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33557" AFTER UPDATE ON public.users FROM marked_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33585
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33585" AFTER DELETE ON public.users FROM notes NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33586
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33586" AFTER UPDATE ON public.users FROM notes NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33624
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33624" AFTER DELETE ON public.users FROM skipped_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33625
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33625" AFTER UPDATE ON public.users FROM skipped_questions NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_33656
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33656" AFTER DELETE ON public.users FROM test_results NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_33657
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_33657" AFTER UPDATE ON public.users FROM test_results NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_35337
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35337" AFTER DELETE ON public.users FROM question_status NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_35338
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35338" AFTER UPDATE ON public.users FROM question_status NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_a_35433
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35433" AFTER DELETE ON public.users FROM question_feedback NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_cascade_del"()
```

#### RI_ConstraintTrigger_a_35434
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_a_35434" AFTER UPDATE ON public.users FROM question_feedback NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_noaction_upd"()
```

#### RI_ConstraintTrigger_c_29471
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29471" AFTER INSERT ON public.users FROM auth.users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_ins"()
```

#### RI_ConstraintTrigger_c_29472
```sql
CREATE CONSTRAINT TRIGGER "RI_ConstraintTrigger_c_29472" AFTER UPDATE ON public.users FROM auth.users NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION "RI_FKey_check_upd"()
```

#### update_users_updated_at
```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

