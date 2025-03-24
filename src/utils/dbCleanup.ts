import { supabase } from '../lib/supabaseClient';

export const cleanupAnswersTable = async () => {
  try {
    // Delete all records from answers table
    const { error } = await supabase
      .from('answers')
      .delete()
      .neq('id', 0); // This will delete all records

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up answers table:', error);
    return { success: false, error };
  }
};

export const cleanupQuestionsTable = async () => {
  try {
    // Delete all records from questions table (this will cascade to answers)
    const { error } = await supabase
      .from('questions')
      .delete()
      .neq('id', 0); // This will delete all records

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up questions table:', error);
    return { success: false, error };
  }
};

export const cleanupAllTables = async () => {
  try {
    // Delete from questions first (will cascade to answers)
    const { error: questionsError } = await cleanupQuestionsTable();
    if (questionsError) throw questionsError;

    return { success: true };
  } catch (error) {
    console.error('Error cleaning up tables:', error);
    return { success: false, error };
  }
};