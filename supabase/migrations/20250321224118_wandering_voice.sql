/*
  # Add test-related tables

  1. New Tables
    - `tests`: Stores test session information
    - `test_questions`: Links questions to test sessions
    - `test_answers`: Records user answers for each question
    - `test_statistics`: Stores test performance metrics
    - `topic_performance`: Tracks performance by topic/subtopic
    - `user_progress`: Tracks overall user progress
    - `user_topic_mastery`: Tracks mastery level by topic

  2. Security
    - Enable RLS on all tables
    - Add updated_at triggers
    - Add appropriate indexes
*/

-- TABLE: TESTS
CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type VARCHAR(50) CHECK (test_type IN ('practice', 'quick_start', 'custom')) NOT NULL,
  total_questions INTEGER NOT NULL,
  settings JSONB NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  total_time_seconds INTEGER,
  status VARCHAR(50) CHECK (status IN ('in_progress', 'completed', 'abandoned')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: TEST_QUESTIONS
CREATE TABLE test_questions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  question_order INTEGER NOT NULL,
  is_marked BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: TEST_ANSWERS
CREATE TABLE test_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id),
  selected_answers INTEGER[],
  is_correct BOOLEAN NOT NULL,
  partial_score NUMERIC(3,2) DEFAULT 0.00,
  nclex_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: TEST_STATISTICS
CREATE TABLE test_statistics (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  partially_correct INTEGER DEFAULT 0,
  incorrect_answers INTEGER NOT NULL,
  skipped_questions INTEGER DEFAULT 0,
  marked_questions INTEGER DEFAULT 0,
  average_time_per_question NUMERIC(6,2),
  overall_score NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: TOPIC_PERFORMANCE
CREATE TABLE topic_performance (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id),
  subtopic_id INTEGER REFERENCES subtopics(id),
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: USER_PROGRESS
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_tests_taken INTEGER DEFAULT 0,
  total_questions_completed INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  average_score NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: USER_TOPIC_MASTERY
CREATE TABLE user_topic_mastery (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id),
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  mastery_level VARCHAR(20) CHECK (
    mastery_level IN ('not_started', 'learning', 'improving', 'proficient', 'mastered')
  ) DEFAULT 'not_started',
  last_attempt_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_tests_user_id ON tests(user_id);
CREATE INDEX idx_test_questions_test_id ON test_questions(test_id);
CREATE INDEX idx_test_questions_user_id ON test_questions(user_id);
CREATE INDEX idx_test_answers_test_id ON test_answers(test_id);
CREATE INDEX idx_test_answers_user_id ON test_answers(user_id);
CREATE INDEX idx_test_statistics_user_id ON test_statistics(user_id);
CREATE INDEX idx_topic_performance_user_id ON topic_performance(user_id);
CREATE INDEX idx_topic_performance_topic_id ON topic_performance(topic_id);
CREATE INDEX idx_user_topic_mastery_user_id ON user_topic_mastery(user_id);
CREATE INDEX idx_user_topic_mastery_topic_id ON user_topic_mastery(topic_id);

-- Enable RLS on all tables
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_mastery ENABLE ROW LEVEL SECURITY;

-- Add updated_at triggers
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_topic_mastery_updated_at
  BEFORE UPDATE ON user_topic_mastery
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();