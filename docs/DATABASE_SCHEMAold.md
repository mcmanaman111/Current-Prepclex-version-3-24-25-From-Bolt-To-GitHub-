# NCLEX Prep App Database Schema

## Overview
This document describes the database schema for the NCLEX Prep application. The schema is designed to support comprehensive test preparation, performance tracking, and user management features.

## Core Tables

### Users and Authentication

1. **users**
   - Core user information
   - Columns:
     - `id` (uuid, PK): References auth.users(id)
     - `email` (text, unique)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)
     - `last_login` (timestamptz)
     - `is_active` (boolean)

2. **profiles**
   - Extended user profile information
   - Columns:
     - `id` (uuid, PK): References users(id)
     - `full_name` (text)
     - `email` (text, unique)
     - `avatar_url` (text)
     - `role_id` (integer): References roles(id)
     - `subscription_active` (boolean)
     - `subscription_type` (integer): References subscriptions(id)
     - `subscription_ends_at` (timestamptz)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

3. **roles**
   - User role definitions
   - Columns:
     - `id` (serial, PK)
     - `name` (text, unique)
     - `description` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

4. **subscriptions**
   - Subscription plan definitions
   - Columns:
     - `id` (serial, PK)
     - `name` (text, unique)
     - `description` (text)
     - `duration_days` (integer)
     - `stripe_price_id` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

### Question Management

1. **topics**
   - Broad categories for questions
   - Columns:
     - `id` (serial, PK)
     - `name` (varchar)
     - `description` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

2. **subtopics**
   - Specific subcategories within topics
   - Columns:
     - `id` (serial, PK)
     - `topic_id` (integer): References topics(id)
     - `name` (varchar)
     - `description` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

3. **case_studies**
   - Case study scenarios
   - Columns:
     - `id` (serial, PK)
     - `title` (varchar)
     - `description` (text)
     - `image_file` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

4. **questions**
   - Main questions table
   - Columns:
     - `id` (serial, PK)
     - `topic` (varchar)
     - `sub_topic` (varchar)
     - `topic_id` (integer): References topics(id)
     - `sub_topic_id` (integer): References subtopics(id)
     - `case_study_id` (integer): References case_studies(id)
     - `question_format` (varchar)
     - `question_type` (varchar): multiple_choice/sata/hot_spot/etc
     - `ngn` (boolean): Next Generation NCLEX indicator
     - `difficulty` (varchar): easy/medium/hard
     - `question_text` (text)
     - `explanation` (text)
     - `ref_sources` (jsonb)
     - `use_partial_scoring` (boolean)
     - `audio_file` (text)
     - `image_file` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

5. **answers**
   - Answer options for questions
   - Columns:
     - `id` (serial, PK)
     - `question_id` (integer): References questions(id)
     - `option_number` (integer)
     - `answer_text` (text)
     - `is_correct` (boolean)
     - `partial_credit` (numeric)
     - `penalty_value` (numeric)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

### Special Question Types

1. **matrix_questions**
   - Matrix/grid question data
   - Columns:
     - `id` (serial, PK)
     - `question_id` (integer): References questions(id)
     - `row_labels` (jsonb)
     - `column_labels` (jsonb)
     - `correct_answers` (jsonb)
     - `created_at` (timestamptz)

2. **bowtie_questions**
   - Bow-tie clinical reasoning questions
   - Columns:
     - `id` (serial, PK)
     - `question_id` (integer): References questions(id)
     - `causes` (jsonb)
     - `actions` (jsonb)
     - `effects` (jsonb)
     - `correct_causes` (jsonb)
     - `correct_actions` (jsonb)
     - `correct_effects` (jsonb)
     - `created_at` (timestamptz)

3. **enhanced_hot_spot_questions**
   - Enhanced hot spot questions
   - Columns:
     - `id` (serial, PK)
     - `question_id` (integer): References questions(id)
     - `passage` (text)
     - `selectable_phrases` (jsonb)
     - `correct_phrases` (jsonb)
     - `created_at` (timestamptz)

### Test Management

1. **tests**
   - Test session information
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `test_type` (varchar): practice/quick_start/custom
     - `test_mode` (varchar): practice/simulation/review/custom
     - `total_questions` (integer)
     - `settings` (jsonb)
     - `start_time` (timestamptz)
     - `end_time` (timestamptz)
     - `total_time_seconds` (integer)
     - `test_duration_minutes` (integer)
     - `status` (varchar)
     - `completion_status` (varchar)
     - `test_template_id` (integer)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

2. **test_questions**
   - Links questions to test sessions
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `test_id` (integer): References tests(id)
     - `question_id` (integer): References questions(id)
     - `question_order` (integer)
     - `is_marked` (boolean)
     - `is_skipped` (boolean)
     - `time_spent_seconds` (integer)
     - `created_at` (timestamptz)

3. **test_answers**
   - Records user answers
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `test_id` (integer): References tests(id)
     - `question_id` (integer): References questions(id)
     - `selected_answers` (integer[])
     - `is_correct` (boolean)
     - `partial_score` (numeric)
     - `nclex_score` (integer)
     - `created_at` (timestamptz)

4. **test_results**
   - Comprehensive test results
   - Columns:
     - `id` (serial, PK)
     - `test_id` (integer): References tests(id)
     - `user_id` (uuid): References users(id)
     - `question_id` (integer): References questions(id)
     - `question_order` (integer)
     - `is_correct` (boolean)
     - `is_partially_correct` (boolean)
     - `is_skipped` (boolean)
     - `is_marked` (boolean)
     - `has_notes` (boolean)
     - `time_spent_seconds` (integer)
     - `score` (numeric)
     - `created_at` (timestamptz)

5. **test_statistics**
   - Test performance metrics
   - Columns:
     - `id` (serial, PK)
     - `test_id` (integer): References tests(id)
     - `user_id` (uuid): References users(id)
     - `total_questions` (integer)
     - `correct_answers` (integer)
     - `partially_correct` (integer)
     - `incorrect_answers` (integer)
     - `skipped_questions` (integer)
     - `marked_questions` (integer)
     - `total_marked_questions` (integer)
     - `total_notes` (integer)
     - `average_time_per_question` (numeric)
     - `overall_score` (numeric)
     - `question_type_distribution` (jsonb)
     - `created_at` (timestamptz)

### Performance Tracking

1. **topic_performance**
   - Performance by topic/subtopic
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `test_id` (integer): References tests(id)
     - `topic_id` (integer): References topics(id)
     - `subtopic_id` (integer): References subtopics(id)
     - `total_questions` (integer)
     - `correct_answers` (integer)
     - `incorrect_answers` (integer)
     - `score_percentage` (numeric)
     - `ngn_questions` (integer)
     - `question_type_breakdown` (jsonb)
     - `created_at` (timestamptz)

2. **user_progress**
   - Overall user progress
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `total_tests_taken` (integer)
     - `total_questions_completed` (integer)
     - `total_study_time_minutes` (integer)
     - `current_streak_days` (integer)
     - `longest_streak_days` (integer)
     - `streak_start_date` (date)
     - `last_activity_date` (date)
     - `last_study_date` (date)
     - `exam_date` (date)
     - `average_score` (numeric)
     - `performance_trend` (jsonb)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

3. **user_topic_mastery**
   - Topic mastery tracking
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `topic_id` (integer): References topics(id)
     - `questions_attempted` (integer)
     - `questions_correct` (integer)
     - `mastery_level` (varchar): not_started/learning/improving/proficient/mastered
     - `last_attempt_date` (timestamptz)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

### Question Status Tracking

1. **question_status**
   - Question status per user
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `question_id` (integer): References questions(id)
     - `status` (varchar): unused/correct/incorrect/marked/skipped
     - `last_attempt_at` (timestamptz)
     - `attempts_count` (integer)
     - `correct_count` (integer)
     - `notes` (text)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

2. **notes**
   - User notes for questions
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `content` (text)
     - `question_id` (text)
     - `test_id` (text)
     - `topic` (text)
     - `sub_topic` (text)
     - `created_at` (timestamptz)

### Feedback and Notifications

1. **question_feedback**
   - User feedback on questions
   - Columns:
     - `id` (serial, PK)
     - `user_id` (uuid): References users(id)
     - `question_id` (text)
     - `test_id` (text)
     - `message` (text): Feedback message
     - `rating` (integer): 1-5 star rating
     - `difficulty` (varchar): User-assessed difficulty
     - `status` (varchar): pending/responded
     - `admin_response` (text): Administrator response
     - `created_at` (timestamptz)
   - Triggers:
     - `on_new_feedback`: Creates admin notification
     - `on_feedback_response`: Creates user notification

2. **notifications**
   - System notifications
   - Columns:
     - `id` (serial, PK)
     - `user_id` (text): Target user
     - `type` (varchar): Notification type
     - `title` (text): Notification title
     - `message` (text): Notification content
     - `link` (text): Optional related link
     - `read` (boolean): Read status
     - `created_at` (timestamptz)

## Functions

### Performance Analysis

1. **calculate_user_readiness**
   - Calculates NCLEX readiness metrics
   - Parameters: user_uuid
   - Returns: readiness metrics including score, level, weak/strong areas

2. **get_test_performance**
   - Analyzes test performance
   - Parameters: test_uuid, user_uuid
   - Returns: detailed performance metrics

3. **get_test_statistics**
   - Retrieves test statistics
   - Parameters: test_uuid, user_uuid
   - Returns: comprehensive test metrics

4. **get_question_performance**
   - Analyzes question performance
   - Parameters: question_uuid, user_uuid
   - Returns: detailed question metrics

5. **get_learning_progress**
   - Tracks learning progress
   - Parameters: user_uuid
   - Returns: progress metrics over time

### Question Management

1. **get_available_questions**
   - Retrieves available questions
   - Parameters: user_uuid, filters
   - Returns: filtered question list

2. **update_question_status**
   - Updates question status
   - Parameters: user_uuid, question_id, status
   - Returns: updated status

### Test Management

1. **get_test_results**
   - Retrieves test results
   - Parameters: test_uuid, user_uuid
   - Returns: detailed test results

### Feedback Management

1. **handle_new_feedback**
   - Processes new question feedback
   - Creates admin notification
   - Updates feedback status
   - Triggered on: question_feedback INSERT

2. **handle_feedback_response**
   - Processes admin responses to feedback
   - Creates user notification
   - Updates feedback status
   - Triggered on: question_feedback UPDATE

## Views

1. **test_history_mv**
   - Materialized view
   - Comprehensive test history
   - Includes performance metrics

2. **test_summary_stats_view**
   - View
   - Aggregated test statistics
   - Performance trends

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure function execution
- Data integrity constraints

## Triggers

1. **User Management**
   - handle_new_user
   - update_updated_at_column

2. **Test Processing**
   - sync_test_results_status
   - update_question_type_distribution
   - refresh_test_history_mv

3. **Performance Tracking**
   - update_performance_trend
   - update_study_streak
   - refresh_user_progress

4. **Feedback Processing**
   - on_new_feedback
   - on_feedback_response

## Indexes

- Primary keys on all tables
- Foreign key indexes
- Performance-optimized indexes for common queries
- Unique constraints where appropriate

## Constraints

- Foreign key relationships
- Check constraints
- Unique constraints
- Not null constraints
- Custom validation rules