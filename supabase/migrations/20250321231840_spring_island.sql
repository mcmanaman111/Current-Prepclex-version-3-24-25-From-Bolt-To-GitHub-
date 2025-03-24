/*
  # Update user references in test-related tables

  1. Changes
    - Modify foreign key references from auth.users to public.users
    - Update all test-related tables
    - Preserve existing data and constraints
    - Keep RLS policies intact

  2. Security
    - Maintain existing RLS settings
    - Ensure proper cascading behavior
    - Preserve data integrity
*/

-- Drop existing foreign key constraints
ALTER TABLE tests DROP CONSTRAINT IF EXISTS tests_user_id_fkey;
ALTER TABLE test_questions DROP CONSTRAINT IF EXISTS test_questions_user_id_fkey;
ALTER TABLE test_answers DROP CONSTRAINT IF EXISTS test_answers_user_id_fkey;
ALTER TABLE test_statistics DROP CONSTRAINT IF EXISTS test_statistics_user_id_fkey;
ALTER TABLE topic_performance DROP CONSTRAINT IF EXISTS topic_performance_user_id_fkey;
ALTER TABLE user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;
ALTER TABLE user_topic_mastery DROP CONSTRAINT IF EXISTS user_topic_mastery_user_id_fkey;

-- Add new foreign key constraints referencing public.users
ALTER TABLE tests
  ADD CONSTRAINT tests_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

ALTER TABLE test_questions
  ADD CONSTRAINT test_questions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

ALTER TABLE test_answers
  ADD CONSTRAINT test_answers_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

ALTER TABLE test_statistics
  ADD CONSTRAINT test_statistics_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

ALTER TABLE topic_performance
  ADD CONSTRAINT topic_performance_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

ALTER TABLE user_progress
  ADD CONSTRAINT user_progress_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

ALTER TABLE user_topic_mastery
  ADD CONSTRAINT user_topic_mastery_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;