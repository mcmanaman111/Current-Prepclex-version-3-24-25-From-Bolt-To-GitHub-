-- Add table comments for test-related tables
COMMENT ON TABLE tests IS 'Stores test session information including settings and status';
COMMENT ON TABLE test_questions IS 'Links questions to test sessions and tracks question-specific data';
COMMENT ON TABLE test_answers IS 'Records user answers and scoring for each question in a test';
COMMENT ON TABLE test_statistics IS 'Stores comprehensive test performance metrics';
COMMENT ON TABLE topic_performance IS 'Tracks performance by topic and subtopic for each test';
COMMENT ON TABLE user_progress IS 'Tracks overall user progress and study statistics';
COMMENT ON TABLE user_topic_mastery IS 'Tracks mastery level by topic for each user';

-- Add column comments for tests
COMMENT ON COLUMN tests.id IS 'Unique identifier for the test session';
COMMENT ON COLUMN tests.user_id IS 'Reference to the user taking the test';
COMMENT ON COLUMN tests.test_type IS 'Type of test (practice, quick start, or custom)';
COMMENT ON COLUMN tests.total_questions IS 'Total number of questions in the test';
COMMENT ON COLUMN tests.settings IS 'JSON object containing test settings (timer, tutor mode, etc.)';
COMMENT ON COLUMN tests.start_time IS 'When the test was started';
COMMENT ON COLUMN tests.end_time IS 'When the test was completed';
COMMENT ON COLUMN tests.total_time_seconds IS 'Total time spent on the test in seconds';
COMMENT ON COLUMN tests.status IS 'Current status of the test';
COMMENT ON COLUMN tests.created_at IS 'Timestamp when the test was created';
COMMENT ON COLUMN tests.updated_at IS 'Timestamp when the test was last updated';

-- Add column comments for test_questions
COMMENT ON COLUMN test_questions.id IS 'Unique identifier for the test question';
COMMENT ON COLUMN test_questions.user_id IS 'Reference to the user';
COMMENT ON COLUMN test_questions.test_id IS 'Reference to the test session';
COMMENT ON COLUMN test_questions.question_id IS 'Reference to the question';
COMMENT ON COLUMN test_questions.question_order IS 'Order of the question in the test';
COMMENT ON COLUMN test_questions.is_marked IS 'Indicates if the question is marked for review';
COMMENT ON COLUMN test_questions.is_skipped IS 'Indicates if the question was skipped';
COMMENT ON COLUMN test_questions.time_spent_seconds IS 'Time spent on this question';
COMMENT ON COLUMN test_questions.created_at IS 'Timestamp when the record was created';

-- Add column comments for test_answers
COMMENT ON COLUMN test_answers.id IS 'Unique identifier for the test answer';
COMMENT ON COLUMN test_answers.user_id IS 'Reference to the user';
COMMENT ON COLUMN test_answers.test_id IS 'Reference to the test session';
COMMENT ON COLUMN test_answers.question_id IS 'Reference to the question';
COMMENT ON COLUMN test_answers.selected_answers IS 'Array of selected answer indices';
COMMENT ON COLUMN test_answers.is_correct IS 'Indicates if the answer was fully correct';
COMMENT ON COLUMN test_answers.partial_score IS 'Partial credit score if applicable';
COMMENT ON COLUMN test_answers.nclex_score IS 'NCLEX scoring (0 or 1)';
COMMENT ON COLUMN test_answers.created_at IS 'Timestamp when the answer was recorded';

-- Add column comments for test_statistics
COMMENT ON COLUMN test_statistics.id IS 'Unique identifier for the test statistics';
COMMENT ON COLUMN test_statistics.user_id IS 'Reference to the user';
COMMENT ON COLUMN test_statistics.test_id IS 'Reference to the test session';
COMMENT ON COLUMN test_statistics.total_questions IS 'Total number of questions';
COMMENT ON COLUMN test_statistics.correct_answers IS 'Number of fully correct answers';
COMMENT ON COLUMN test_statistics.partially_correct IS 'Number of partially correct answers';
COMMENT ON COLUMN test_statistics.incorrect_answers IS 'Number of incorrect answers';
COMMENT ON COLUMN test_statistics.skipped_questions IS 'Number of skipped questions';
COMMENT ON COLUMN test_statistics.marked_questions IS 'Number of marked questions';
COMMENT ON COLUMN test_statistics.average_time_per_question IS 'Average time spent per question';
COMMENT ON COLUMN test_statistics.overall_score IS 'Overall test score percentage';
COMMENT ON COLUMN test_statistics.created_at IS 'Timestamp when the statistics were created';

-- Add column comments for topic_performance
COMMENT ON COLUMN topic_performance.id IS 'Unique identifier for the topic performance record';
COMMENT ON COLUMN topic_performance.user_id IS 'Reference to the user';
COMMENT ON COLUMN topic_performance.test_id IS 'Reference to the test session';
COMMENT ON COLUMN topic_performance.topic_id IS 'Reference to the topic';
COMMENT ON COLUMN topic_performance.subtopic_id IS 'Reference to the subtopic';
COMMENT ON COLUMN topic_performance.total_questions IS 'Total questions in this topic';
COMMENT ON COLUMN topic_performance.correct_answers IS 'Number of correct answers';
COMMENT ON COLUMN topic_performance.score_percentage IS 'Score percentage for this topic';
COMMENT ON COLUMN topic_performance.created_at IS 'Timestamp when the record was created';

-- Add column comments for user_progress
COMMENT ON COLUMN user_progress.id IS 'Unique identifier for the progress record';
COMMENT ON COLUMN user_progress.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_progress.total_tests_taken IS 'Total number of tests completed';
COMMENT ON COLUMN user_progress.total_questions_completed IS 'Total questions answered';
COMMENT ON COLUMN user_progress.total_study_time_minutes IS 'Total study time in minutes';
COMMENT ON COLUMN user_progress.current_streak_days IS 'Current study streak in days';
COMMENT ON COLUMN user_progress.last_activity_date IS 'Date of last activity';
COMMENT ON COLUMN user_progress.average_score IS 'Overall average score';
COMMENT ON COLUMN user_progress.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN user_progress.updated_at IS 'Timestamp when the record was last updated';

-- Add column comments for user_topic_mastery
COMMENT ON COLUMN user_topic_mastery.id IS 'Unique identifier for the mastery record';
COMMENT ON COLUMN user_topic_mastery.user_id IS 'Reference to the user';
COMMENT ON COLUMN user_topic_mastery.topic_id IS 'Reference to the topic';
COMMENT ON COLUMN user_topic_mastery.questions_attempted IS 'Number of questions attempted';
COMMENT ON COLUMN user_topic_mastery.questions_correct IS 'Number of questions answered correctly';
COMMENT ON COLUMN user_topic_mastery.mastery_level IS 'Current mastery level for the topic';
COMMENT ON COLUMN user_topic_mastery.last_attempt_date IS 'Date of last attempt';
COMMENT ON COLUMN user_topic_mastery.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN user_topic_mastery.updated_at IS 'Timestamp when the record was last updated';