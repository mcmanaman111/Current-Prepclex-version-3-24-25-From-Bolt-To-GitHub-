/*
  # Add table and column comments
  
  1. Changes
    - Add descriptive comments to all tables
    - Add descriptive comments to all columns
    - Preserve existing schema structure
    
  2. Documentation
    - Explains purpose of each table
    - Details meaning and usage of each column
    - Includes validation rules where applicable
*/

-- Add table comments
COMMENT ON TABLE topics IS 'Broad categories used to group questions into logical areas';
COMMENT ON TABLE subtopics IS 'Specific subcategories within broader topics for detailed categorization';
COMMENT ON TABLE case_studies IS 'Stores case study scenarios that group multiple related questions';
COMMENT ON TABLE questions IS 'Stores all question-related data, including content, difficulty, scoring, images, and audio files';
COMMENT ON TABLE answers IS 'Stores all answer options for questions with scoring information';
COMMENT ON TABLE matrix_questions IS 'Stores structured data for matrix/grid questions including row/column labels and correct answers';
COMMENT ON TABLE bowtie_questions IS 'Stores structured responses for bow-tie clinical reasoning questions including causes, actions, and effects';
COMMENT ON TABLE enhanced_hot_spot_questions IS 'Stores structured responses for enhanced hot spot (text-based) selection questions';

-- Add column comments for topics
COMMENT ON COLUMN topics.id IS 'Unique identifier for the topic';
COMMENT ON COLUMN topics.name IS 'Name of the topic';
COMMENT ON COLUMN topics.description IS 'Detailed description of the topic';
COMMENT ON COLUMN topics.created_at IS 'Timestamp when the topic was created';
COMMENT ON COLUMN topics.updated_at IS 'Timestamp when the topic was last updated';

-- Add column comments for subtopics
COMMENT ON COLUMN subtopics.id IS 'Unique identifier for the subtopic';
COMMENT ON COLUMN subtopics.topic_id IS 'Reference to the parent topic';
COMMENT ON COLUMN subtopics.name IS 'Name of the subtopic';
COMMENT ON COLUMN subtopics.description IS 'Detailed description of the subtopic';
COMMENT ON COLUMN subtopics.created_at IS 'Timestamp when the subtopic was created';
COMMENT ON COLUMN subtopics.updated_at IS 'Timestamp when the subtopic was last updated';

-- Add column comments for case_studies
COMMENT ON COLUMN case_studies.id IS 'Unique identifier for the case study';
COMMENT ON COLUMN case_studies.title IS 'Title of the case study';
COMMENT ON COLUMN case_studies.description IS 'Full case study scenario text';
COMMENT ON COLUMN case_studies.image_file IS 'Optional reference to an image file for the case study';
COMMENT ON COLUMN case_studies.created_at IS 'Timestamp when the case study was created';
COMMENT ON COLUMN case_studies.updated_at IS 'Timestamp when the case study was last updated';

-- Add column comments for questions
COMMENT ON COLUMN questions.id IS 'Unique identifier for the question';
COMMENT ON COLUMN questions.topic IS 'General category name for the question';
COMMENT ON COLUMN questions.sub_topic IS 'Specific subcategory name for the question';
COMMENT ON COLUMN questions.topic_id IS 'Reference to the topic table';
COMMENT ON COLUMN questions.sub_topic_id IS 'Reference to the subtopic table';
COMMENT ON COLUMN questions.case_study_id IS 'Optional reference to a case study if the question is part of one';
COMMENT ON COLUMN questions.question_format IS 'Format of the question presentation';
COMMENT ON COLUMN questions.question_type IS 'Type of question (multiple choice, SATA, etc.)';
COMMENT ON COLUMN questions.ngn IS 'Indicates if this is a Next Generation NCLEX question';
COMMENT ON COLUMN questions.difficulty IS 'Difficulty level (easy, medium, hard)';
COMMENT ON COLUMN questions.question_text IS 'The actual question text';
COMMENT ON COLUMN questions.explanation IS 'Explanation of the correct answer and rationale';
COMMENT ON COLUMN questions.ref_sources IS 'JSON array of reference sources';
COMMENT ON COLUMN questions.use_partial_scoring IS 'Indicates if partial credit is allowed';
COMMENT ON COLUMN questions.audio_file IS 'Reference to audio file for audio questions';
COMMENT ON COLUMN questions.image_file IS 'Reference to image file for visual questions';
COMMENT ON COLUMN questions.created_at IS 'Timestamp when the question was created';
COMMENT ON COLUMN questions.updated_at IS 'Timestamp when the question was last updated';

-- Add column comments for answers
COMMENT ON COLUMN answers.id IS 'Unique identifier for the answer';
COMMENT ON COLUMN answers.question_id IS 'Reference to the parent question';
COMMENT ON COLUMN answers.option_number IS 'Order number of the answer option';
COMMENT ON COLUMN answers.answer_text IS 'Text of the answer option';
COMMENT ON COLUMN answers.is_correct IS 'Indicates if this is a correct answer';
COMMENT ON COLUMN answers.partial_credit IS 'Amount of partial credit (0.00-1.00) if applicable';
COMMENT ON COLUMN answers.penalty_value IS 'Penalty value (0.00-1.00) for incorrect selection if applicable';
COMMENT ON COLUMN answers.created_at IS 'Timestamp when the answer was created';
COMMENT ON COLUMN answers.updated_at IS 'Timestamp when the answer was last updated';

-- Add column comments for matrix_questions
COMMENT ON COLUMN matrix_questions.id IS 'Unique identifier for the matrix question';
COMMENT ON COLUMN matrix_questions.question_id IS 'Reference to the parent question';
COMMENT ON COLUMN matrix_questions.row_labels IS 'JSON array of row labels';
COMMENT ON COLUMN matrix_questions.column_labels IS 'JSON array of column labels';
COMMENT ON COLUMN matrix_questions.correct_answers IS 'JSON object mapping correct row/column combinations';
COMMENT ON COLUMN matrix_questions.created_at IS 'Timestamp when the matrix question was created';

-- Add column comments for bowtie_questions
COMMENT ON COLUMN bowtie_questions.id IS 'Unique identifier for the bow-tie question';
COMMENT ON COLUMN bowtie_questions.question_id IS 'Reference to the parent question';
COMMENT ON COLUMN bowtie_questions.causes IS 'JSON array of possible causes';
COMMENT ON COLUMN bowtie_questions.actions IS 'JSON array of possible interventions/actions';
COMMENT ON COLUMN bowtie_questions.effects IS 'JSON array of possible outcomes/effects';
COMMENT ON COLUMN bowtie_questions.correct_causes IS 'JSON array of correct causes';
COMMENT ON COLUMN bowtie_questions.correct_actions IS 'JSON array of correct interventions';
COMMENT ON COLUMN bowtie_questions.correct_effects IS 'JSON array of correct outcomes';
COMMENT ON COLUMN bowtie_questions.created_at IS 'Timestamp when the bow-tie question was created';

-- Add column comments for enhanced_hot_spot_questions
COMMENT ON COLUMN enhanced_hot_spot_questions.id IS 'Unique identifier for the enhanced hot spot question';
COMMENT ON COLUMN enhanced_hot_spot_questions.question_id IS 'Reference to the parent question';
COMMENT ON COLUMN enhanced_hot_spot_questions.passage IS 'Text passage for highlighting';
COMMENT ON COLUMN enhanced_hot_spot_questions.selectable_phrases IS 'JSON array of phrases that can be selected';
COMMENT ON COLUMN enhanced_hot_spot_questions.correct_phrases IS 'JSON array of phrases that should be selected';
COMMENT ON COLUMN enhanced_hot_spot_questions.created_at IS 'Timestamp when the enhanced hot spot question was created';