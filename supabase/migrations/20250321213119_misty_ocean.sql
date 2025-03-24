/*
  # Add NCLEX Questions Schema

  1. New Tables
    - `topics`: Broad categories for questions
    - `subtopics`: Specific subcategories within topics
    - `case_studies`: Case study scenarios
    - `questions`: Main questions table with all question types
    - `answers`: Answer options for questions
    - `matrix_questions`: Matrix/grid question data
    - `bowtie_questions`: Bow-tie clinical reasoning questions
    - `enhanced_hot_spot_questions`: Enhanced hot spot questions

  2. Indexes
    - Added indexes for frequently queried columns
    - Optimized for common query patterns

  3. Security
    - Tables will inherit RLS from previous migrations
    - Foreign key constraints ensure data integrity
*/

-- TABLE: TOPICS
CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: SUBTOPICS
CREATE TABLE subtopics (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topics(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: CASE STUDIES
CREATE TABLE case_studies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: QUESTIONS
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(255) NOT NULL,
  sub_topic VARCHAR(255) NOT NULL,
  topic_id INTEGER REFERENCES topics(id),
  sub_topic_id INTEGER REFERENCES subtopics(id),
  case_study_id INTEGER REFERENCES case_studies(id) ON DELETE CASCADE,
  question_format VARCHAR(255) NOT NULL,
  question_type VARCHAR(255) CHECK (
    question_type IN (
      'multiple_choice', 'sata', 'hot_spot', 'fill_in_the_blank', 'drag_and_drop',
      'chart_or_graphic', 'graphic_answer', 'audio_question', 'extended_multiple_response',
      'extended_drag_and_drop', 'cloze_dropdown', 'matrix_grid', 'bow_tie', 'enhanced_hot_spot'
    )
  ) NOT NULL,
  ngn BOOLEAN DEFAULT FALSE,
  difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
  question_text TEXT NOT NULL,
  explanation TEXT,
  ref_sources JSONB,
  use_partial_scoring BOOLEAN DEFAULT FALSE,
  audio_file TEXT,
  image_file TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: ANSWERS
CREATE TABLE answers (
    id               SERIAL PRIMARY KEY,
    question_id      INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_number    INTEGER NOT NULL,
    answer_text      TEXT NOT NULL,
    is_correct       BOOLEAN NOT NULL DEFAULT FALSE,
    partial_credit   NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    penalty_value    NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: MATRIX QUESTIONS
CREATE TABLE matrix_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  row_labels JSONB NOT NULL,
  column_labels JSONB NOT NULL,
  correct_answers JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: BOW-TIE QUESTIONS
CREATE TABLE bowtie_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  causes JSONB NOT NULL,
  actions JSONB NOT NULL,
  effects JSONB NOT NULL,
  correct_causes JSONB NOT NULL,
  correct_actions JSONB NOT NULL,
  correct_effects JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE: ENHANCED HOT SPOT QUESTIONS
CREATE TABLE enhanced_hot_spot_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  passage TEXT NOT NULL,
  selectable_phrases JSONB NOT NULL,
  correct_phrases JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for frequently queried columns
CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_sub_topic_id ON questions(sub_topic_id);
CREATE INDEX idx_questions_case_study_id ON questions(case_study_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Enable RLS on all tables
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowtie_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_hot_spot_questions ENABLE ROW LEVEL SECURITY;

-- Add updated_at triggers
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtopics_updated_at
  BEFORE UPDATE ON subtopics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();